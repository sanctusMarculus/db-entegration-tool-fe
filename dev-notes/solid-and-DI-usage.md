# SOLID Principles and Dependency Injection Analysis

## 1. Single Responsibility Principle (SRP)

**Definition**: A class/module should have only one reason to change.

---

### Example 1: Zustand Stores - Separated by Concern

Each store handles exactly one domain concern:

**model.store.ts** - Only manages data model state
```typescript
interface ModelState {
  model: DataModel | null;
  selectedEntityId: string | null;
  selectedFieldId: string | null;
  selectedRelationId: string | null;
  // Only model-related actions
  setModel: (model: DataModel | null) => void;
  addEntity: (name: string, position: Position, color?: EntityColor) => string;
  updateEntity: (entityId: string, updates: Partial<Omit<Entity, 'id' | 'fields'>>) => void;
  // ...
}
```

**workspace.store.ts** - Only manages workspace state
```typescript
interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  // Only workspace-related actions
  createWorkspace: (name: string) => string;
  deleteWorkspace: (workspaceId: string) => void;
  // ...
}
```

**activity.store.ts** - Only manages activity/event logging
```typescript
interface ActivityState {
  events: ActivityEvent[];
  maxEvents: number;
  // Only activity-related actions
  addEvent: (type: ActivityType, message: string, details?: string) => void;
  clearEvents: () => void;
  removeEvent: (eventId: string) => void;
}
```

---

### Example 2: View-Container Pattern Separation

**WorkspaceCard.tsx** - Only handles UI rendering
```typescript
interface WorkspaceCardProps {
  workspace: WorkspaceListItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function WorkspaceCard({
  workspace,
  isActive,
  onSelect,
  onDelete,
  onExport,
}: WorkspaceCardProps) {
  // ONLY rendering logic - no business logic, no store access
  return (
    <Card className={cn('cursor-pointer transition-all', isActive && 'ring-2 ring-primary')}>
      <CardHeader>
        <CardTitle>{workspace.name}</CardTitle>
        {/* Pure UI rendering */}
      </CardHeader>
    </Card>
  );
}
```

**WorkspaceCardContainer.tsx** - Only handles state and logic
```typescript
export function WorkspaceCardContainer({ workspaceId }: { workspaceId: string }) {
  // ONLY business logic - connects to stores, prepares data
  const workspace = useWorkspaceStore((state) => 
    state.workspaces.find((w) => w.id === workspaceId)
  );
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const { selectWorkspace, deleteWorkspace, exportWorkspace } = useWorkspaceActions();

  if (!workspace) return null;

  return (
    <WorkspaceCard
      workspace={formatWorkspaceForList(workspace)}
      isActive={workspace.id === activeWorkspaceId}
      onSelect={() => selectWorkspace(workspaceId)}
      onDelete={() => deleteWorkspace(workspaceId)}
      onExport={() => exportWorkspace(workspaceId)}
    />
  );
}
```

---

### Example 3: Utility Functions - Single Purpose

**cn.ts** - Only handles class name merging
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Single responsibility: merge and deduplicate Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**utils.ts** - Each function has one job
```typescript
// Only formats workspace for list display
export function formatWorkspaceForList(workspace: Workspace): WorkspaceListItem {
  return {
    id: workspace.id,
    name: workspace.name,
    modelsCount: workspace.models.length,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

// Only handles file download
export function downloadWorkspaceAsJson(workspace: Workspace): void {
  const json = JSON.stringify(workspace, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  // ...download logic
}

// Only handles import parsing
export function parseWorkspaceImport(content: string): Workspace | null {
  try {
    const parsed = JSON.parse(content);
    const result = workspaceSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
```

---

## 2. Open/Closed Principle (OCP)

**Definition**: Software entities should be open for extension but closed for modification.

---

### Example 1: CVA Button Variants

**Button.tsx**
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

// Open for extension: Add new variants without modifying existing code
const buttonVariants = cva(
  // Base classes - closed for modification
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // Extensible: Add new variants here without changing component logic
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // To add a new variant, simply add here - no other changes needed
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        // Extensible: Add new sizes here
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Component is closed - doesn't need modification for new variants
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

### Example 2: Zod Schema Extensions

**model.schema.ts**
```typescript
// Base field type - closed for modification
export const fieldTypeSchema = z.enum([
  'string', 'int', 'long', 'decimal', 'double', 'float',
  'bool', 'DateTime', 'DateOnly', 'TimeOnly', 'Guid', 'byte[]', 'json',
]);

// Constraints schema - open for extension via .extend()
export const fieldConstraintsSchema = z.object({
  isRequired: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  isPrimaryKey: z.boolean().default(false),
  isAutoGenerated: z.boolean().default(false),
  maxLength: z.number().optional(),
  minLength: z.number().optional(),
  precision: z.number().optional(),
  scale: z.number().optional(),
  defaultValue: z.string().optional(),
  regex: z.string().optional(),
});

// Extension example - can extend without modifying original
// const extendedConstraints = fieldConstraintsSchema.extend({
//   customValidation: z.string().optional(),
// });

// Entity schema - composable and extensible
export const entitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Entity name is required'),
  tableName: z.string().optional(),
  fields: z.array(fieldSchema).default([]),
  position: positionSchema,
  color: entityColorSchema.default('blue'),
  description: z.string().optional(),
  isAbstract: z.boolean().default(false),
  baseEntityId: z.string().optional(),
});
```

---

### Example 3: React Flow Custom Nodes/Edges

**DesignCanvasContainer.tsx**
```typescript
// Node types are extensible - add new types without modifying ReactFlow
const nodeTypes = {
  entity: EntityNodeContainer,
  // Open for extension: Add new node types
  // relationship: RelationshipNode,
  // enum: EnumNode,
};

const edgeTypes = {
  relation: RelationEdge,
  // Open for extension: Add new edge types
  // inheritance: InheritanceEdge,
};

export function DesignCanvasContainer() {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}  // Extensible without modifying ReactFlow
      edgeTypes={edgeTypes}  // Extensible without modifying ReactFlow
      // ...
    />
  );
}
```

---

### Example 4: Preview Tab System

**types.ts**
```typescript
// Tab configuration - open for extension
export interface PreviewTabConfig {
  id: string;
  label: string;
  language: string;
}

// Extensible tab list - add new tabs without modifying component
export const PREVIEW_TABS: PreviewTabConfig[] = [
  { id: 'entities', label: 'EF Core Entities', language: 'csharp' },
  { id: 'dtos', label: 'DTOs', language: 'csharp' },
  { id: 'controller', label: 'Controller', language: 'csharp' },
  { id: 'migration', label: 'SQL Migration', language: 'sql' },
  { id: 'swagger', label: 'OpenAPI', language: 'yaml' },
  // Extension: Add new preview types here
  // { id: 'graphql', label: 'GraphQL Schema', language: 'graphql' },
];
```

**CodePreview.tsx**
```typescript
// Component is closed - iterates over tabs without knowing specifics
export function CodePreview({ tabs, activeTab, code, onTabChange }: CodePreviewProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        {/* Dynamically renders any tabs - closed for modification */}
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* ... */}
    </Tabs>
  );
}
```

---

## 3. Liskov Substitution Principle (LSP)

**Definition**: Objects of a superclass should be replaceable with objects of subclasses without affecting correctness.

---

### Example 1: Radix UI Slot Pattern (Polymorphic Components)

**Button.tsx**
```typescript
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;  // Enables substitution
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // LSP: Slot allows any child component to substitute button behavior
    // The child must accept the same props interface
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Usage demonstrating substitution:**
```typescript
// Default button - works as expected
<Button>Click me</Button>

// Link substituted for button - works identically via LSP
<Button asChild>
  <Link to="/dashboard">Navigate</Link>
</Button>

// Custom component substituted - same contract
<Button asChild>
  <CustomTrigger onClick={handleClick}>Custom</CustomTrigger>
</Button>
```

---

### Example 2: React Flow Node Type Contracts

**types.ts**
```typescript
import type { Node, Edge, NodeProps, EdgeProps } from '@xyflow/react';

// Base data type with index signature for React Flow compatibility
export type EntityNodeData = {
  entity: Entity;
  isSelected: boolean;
  onAddField: () => void;
  onEditEntity: () => void;
  onDeleteEntity: () => void;
  onDuplicateEntity: () => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  [key: string]: unknown;  // LSP: Allows additional properties
};

// Any node implementing this contract can substitute for EntityNode
export type EntityNode = Node<EntityNodeData, 'entity'>;
```

**EntityNode.tsx**
```typescript
// Implements the NodeProps contract from React Flow
// Any component with same props signature can substitute
export function EntityNode({ data, selected }: NodeProps<EntityNode>) {
  const { entity, onAddField, onEditEntity, onDeleteEntity } = data;
  
  return (
    <div className={cn('entity-node', selected && 'ring-2 ring-primary')}>
      {/* Renders entity following the contract */}
    </div>
  );
}
```

---

### Example 3: Workspace/DataModel Schema Substitution

**model.schema.ts**
```typescript
// Base model schema
export const dataModelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  entities: z.array(entitySchema).default([]),
  relations: z.array(relationSchema).default([]),
  indexes: z.array(indexSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().default(1),
});

// Workspace contains models - LSP: any valid DataModel works
export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  models: z.array(dataModelSchema).default([]),  // Substitutable
  activeModelId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

**workspace.store.ts**
```typescript
// Functions accept DataModel interface - any conforming object works
addModelToWorkspace: (workspaceId: string, model: DataModel) =>
  set((state) => {
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      // LSP: Any DataModel-conforming object can be substituted
      workspace.models.push(model);
      workspace.activeModelId = model.id;
    }
  }),

importModel: (workspaceId: string, model: DataModel) =>
  set((state) => {
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      // Imported model conforms to same interface - substitutable
      const importedModel: DataModel = {
        ...model,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      workspace.models.push(importedModel);
    }
  }),
```

---

## 4. Interface Segregation Principle (ISP)

**Definition**: Clients should not be forced to depend on interfaces they don't use.

---

### Example 1: Segregated Store Selectors

**model.store.ts**
```typescript
// Instead of one monolithic selector, multiple focused selectors
// Components only subscribe to what they need

// For components that only need the selected entity
export const useSelectedEntity = () =>
  useModelStore((state) => {
    if (!state.selectedEntityId || !state.model) return null;
    return state.model.entities.find((e) => e.id === state.selectedEntityId) ?? null;
  });

// For components that only need the selected field
export const useSelectedField = () =>
  useModelStore((state) => {
    if (!state.selectedEntityId || !state.selectedFieldId || !state.model) return null;
    const entity = state.model.entities.find((e) => e.id === state.selectedEntityId);
    return entity?.fields.find((f) => f.id === state.selectedFieldId) ?? null;
  });

// For components that only need entities list
export const useEntities = () =>
  useModelStore(useShallow((state) => state.model?.entities ?? []));

// For components that only need relations list
export const useRelations = () =>
  useModelStore(useShallow((state) => state.model?.relations ?? []));

// For components that only need indexes list
export const useIndexes = () =>
  useModelStore(useShallow((state) => state.model?.indexes ?? []));
```

**Usage - components only depend on what they need:**
```typescript
// InspectorPanel only needs selected entity and field
function InspectorPanelContainer() {
  const selectedEntity = useSelectedEntity();  // Focused interface
  const selectedField = useSelectedField();    // Focused interface
  // Doesn't subscribe to relations, indexes, etc.
}

// DesignCanvas only needs entities and relations
function DesignCanvasContainer() {
  const entities = useEntities();   // Focused interface
  const relations = useRelations(); // Focused interface
  // Doesn't subscribe to selection state
}
```

---

### Example 2: Segregated Component Props

**EntityNode.tsx**
```typescript
// Props are segregated - only what EntityNode needs
interface EntityNodeViewProps {
  entity: Entity;
  isSelected: boolean;
  onAddField: () => void;
  onEditEntity: () => void;
  onDeleteEntity: () => void;
  onDuplicateEntity: () => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
}

// EntityNode doesn't receive canvas state, other entities, relations, etc.
export function EntityNode({
  entity,
  isSelected,
  onAddField,
  onEditEntity,
  // Only the callbacks it needs
}: EntityNodeViewProps) {
  // ...
}
```

**Toolbar.tsx**
```typescript
// Toolbar has its own focused interface
interface ToolbarProps {
  modelName: string;
  onAddEntity: () => void;
  onSave: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

// Doesn't need entity details, field data, relations, etc.
export function Toolbar({ modelName, onAddEntity, onSave, onExport }: ToolbarProps) {
  // ...
}
```

---

### Example 3: Segregated Hook Return Types

**useWorkspaceActions.ts**
```typescript
// Returns only workspace-related actions
export function useWorkspaceActions() {
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const exportWorkspace = useWorkspaceStore((state) => state.exportWorkspace);
  const importWorkspace = useWorkspaceStore((state) => state.importWorkspace);
  const navigate = useNavigate();
  const addEvent = useActivityStore((state) => state.addEvent);

  return {
    // Only workspace actions - not model actions, not activity actions
    handleCreateWorkspace: (name: string) => { /* ... */ },
    handleDeleteWorkspace: (id: string) => { /* ... */ },
    handleSelectWorkspace: (id: string) => { /* ... */ },
    handleExportWorkspace: (id: string) => { /* ... */ },
    handleImportWorkspace: (file: File) => { /* ... */ },
  };
}
```

**useCanvasActions.ts**
```typescript
// Returns only canvas-related actions
export function useCanvasActions() {
  const addEntity = useModelStore((state) => state.addEntity);
  const deleteEntity = useModelStore((state) => state.deleteEntity);
  const updateEntityPosition = useModelStore((state) => state.updateEntityPosition);
  const addRelation = useModelStore((state) => state.addRelation);

  return {
    // Only canvas actions - segregated from workspace, activity, etc.
    handleAddEntity: (position: Position) => { /* ... */ },
    handleDeleteEntity: (entityId: string) => { /* ... */ },
    handleNodeDragStop: (entityId: string, position: Position) => { /* ... */ },
    handleConnect: (source: string, target: string) => { /* ... */ },
  };
}
```

---

### Example 4: Radix UI Compound Components

**Dialog.tsx**
```typescript
// Each export is a focused interface - use only what you need
export {
  Dialog,           // Root provider
  DialogPortal,     // Portal wrapper (optional)
  DialogOverlay,    // Backdrop (optional)
  DialogTrigger,    // Trigger element
  DialogClose,      // Close button
  DialogContent,    // Content wrapper
  DialogHeader,     // Header section (optional)
  DialogFooter,     // Footer section (optional)
  DialogTitle,      // Title (required for a11y)
  DialogDescription, // Description (optional)
};

// Usage - only import what's needed
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/shared/ui';

function SimpleDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Simple</DialogTitle>
        {/* No DialogHeader, DialogFooter, DialogDescription - not needed */}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5. Dependency Inversion Principle (DIP)

**Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

---

### Example 1: Store Actions as Abstractions

**WorkspaceCardContainer.tsx**
```typescript
export function WorkspaceCardContainer({ workspaceId }: { workspaceId: string }) {
  // Container depends on ABSTRACTION (hook interface), not implementation
  const { handleSelectWorkspace, handleDeleteWorkspace, handleExportWorkspace } = 
    useWorkspaceActions();
  
  // Doesn't know HOW these actions work internally
  // Could be Zustand, Redux, API calls - container doesn't care
  return (
    <WorkspaceCard
      onSelect={() => handleSelectWorkspace(workspaceId)}
      onDelete={() => handleDeleteWorkspace(workspaceId)}
      onExport={() => handleExportWorkspace(workspaceId)}
    />
  );
}
```

**useWorkspaceActions.ts** - The abstraction
```typescript
// Hook provides abstract interface to workspace operations
// Implementation details (Zustand, navigation, logging) are hidden
export function useWorkspaceActions() {
  // Low-level dependencies are internal
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const navigate = useNavigate();
  const addEvent = useActivityStore((state) => state.addEvent);

  // Returns abstract interface
  return {
    handleCreateWorkspace: async (name: string) => {
      const id = createWorkspace(name);
      addEvent('success', `Created workspace: ${name}`);
      navigate(`/designer/${id}`);
    },
    // ...
  };
}
```

---

### Example 2: Code Preview Depends on Generator Abstraction

**useCodePreview.ts**
```typescript
import { 
  generateEFCoreEntities,
  generateDTOs,
  generateController,
  generateSQLMigration,
  generateSwaggerSpec,
} from '../utils';

// Hook depends on generator function SIGNATURES (abstractions)
// Not on how they generate code internally
export function useCodePreview() {
  const model = useModelStore((state) => state.model);

  // Generators are injected as dependencies
  // Could swap SQL Server for PostgreSQL generator without changing hook
  const generatedCode = useMemo(() => {
    if (!model) return {};
    
    return {
      entities: generateEFCoreEntities(model),    // Abstract: takes model, returns string
      dtos: generateDTOs(model),                  // Abstract: takes model, returns string
      controller: generateController(model),      // Abstract: takes model, returns string
      migration: generateSQLMigration(model),     // Abstract: takes model, returns string
      swagger: generateSwaggerSpec(model),        // Abstract: takes model, returns string
    };
  }, [model]);

  return generatedCode;
}
```

**utils.ts** - Low-level implementation
```typescript
// High-level consumers depend on this SIGNATURE, not implementation
export function generateEFCoreEntities(model: DataModel): string {
  // Implementation details hidden
  let code = '// Auto-generated EF Core Entities\n\n';
  code += 'using System.ComponentModel.DataAnnotations;\n\n';
  // ... complex generation logic
  return code;
}

// Could create alternative implementation with same signature
export function generateEFCoreEntitiesForPostgres(model: DataModel): string {
  // Different implementation, same interface
  // ...
}
```

---

### Example 3: App Shell Depends on Auth Abstraction

**App.tsx**
```typescript
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AppShell } from '@/shell';

// App depends on ABSTRACT concepts: "signed in" and "signed out"
// Doesn't know Clerk implementation details
function App() {
  return (
    <>
      <SignedIn>
        <AppShell />  {/* Renders when authenticated */}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />  {/* Redirects when not authenticated */}
      </SignedOut>
    </>
  );
}
```

**useIdentity.ts** - Abstracts Clerk details
```typescript
import { useUser, useAuth } from '@clerk/clerk-react';

// Abstraction layer over Clerk
// Components depend on this interface, not Clerk directly
export function useIdentity() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();

  return {
    // Abstract interface - could swap Clerk for Auth0, Firebase, etc.
    isLoaded: isUserLoaded && isAuthLoaded,
    userId: user?.id ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    fullName: user?.fullName ?? null,
    imageUrl: user?.imageUrl ?? null,
    
    // Token abstraction for future API calls
    getToken: async () => {
      return getToken();
    },
  };
}
```

---

### Example 4: React Flow Provider as Dependency Container

**DesignerPage.tsx**
```typescript
import { ReactFlowProvider } from '@xyflow/react';

export function DesignerPage() {
  // ...initialization logic

  return (
    // ReactFlowProvider injects dependencies (context) to all children
    // Children depend on abstract context, not direct imports
    <ReactFlowProvider>
      <DesignerContent />
    </ReactFlowProvider>
  );
}
```

**DesignCanvasContainer.tsx**
```typescript
import { useReactFlow } from '@xyflow/react';

export function DesignCanvasContainer() {
  // Consumes injected dependency via hook (not direct import)
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  
  // Depends on abstract ReactFlow interface
  // Actual implementation injected by provider
  // ...
}
```

---

## 6. Dependency Injection Patterns

### Pattern 1: React Context Provider Injection

**main.tsx**
```typescript
import { ClerkProvider } from '@clerk/clerk-react';

// ClerkProvider injects auth dependencies into component tree
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
);
```

**AppShell.tsx**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/shared/ui';

const queryClient = new QueryClient();

export function AppShell() {
  return (
    // Multiple providers inject different dependencies
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

---

### Pattern 2: Props as Dependency Injection

**EntityNode.tsx**
```typescript
// Dependencies injected via props
interface EntityNodeProps {
  entity: Entity;                           // Data dependency
  isSelected: boolean;                      // State dependency
  onAddField: () => void;                   // Behavior dependency
  onEditEntity: () => void;                 // Behavior dependency
  onDeleteEntity: () => void;               // Behavior dependency
  onDuplicateEntity: () => void;            // Behavior dependency
  onFieldSelect: (fieldId: string) => void; // Behavior dependency
  onFieldDelete: (fieldId: string) => void; // Behavior dependency
}

// Component receives all dependencies - doesn't create them
export function EntityNode({
  entity,
  isSelected,
  onAddField,
  onEditEntity,
  onDeleteEntity,
  onDuplicateEntity,
  onFieldSelect,
  onFieldDelete,
}: EntityNodeProps) {
  // Pure render - all logic injected
  return (
    <div onClick={onEditEntity}>
      <button onClick={onAddField}>Add Field</button>
      <button onClick={onDeleteEntity}>Delete</button>
      {/* ... */}
    </div>
  );
}
```

---

### Pattern 3: Hook-Based Dependency Injection

**useHotkeys.ts**
```typescript
export function useHotkeys() {
  // Dependencies injected via other hooks
  const addEntity = useModelStore((state) => state.addEntity);
  const deleteEntity = useModelStore((state) => state.deleteEntity);
  const duplicateEntity = useModelStore((state) => state.duplicateEntity);
  const addField = useModelStore((state) => state.addField);
  const selectedEntityId = useModelStore((state) => state.selectedEntityId);
  const clearSelection = useModelStore((state) => state.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Uses injected dependencies
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        addEntity('NewEntity', { x: 100, y: 100 });
      }
      if (e.key === 'f' && selectedEntityId) {
        addField(selectedEntityId, 'newField', 'string');
      }
      // ...
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addEntity, deleteEntity, duplicateEntity, addField, selectedEntityId, clearSelection]);
}
```

---

### Pattern 4: Zustand Store as Service Locator

**index.ts**
```typescript
// Centralized export of all stores - acts as service registry
export { 
  useModelStore, 
  useSelectedEntity, 
  useSelectedField, 
  useSelectedRelation, 
  useEntities, 
  useRelations, 
  useIndexes 
} from './model.store';

export { 
  useWorkspaceStore, 
  useActiveWorkspace, 
  useWorkspaceModels 
} from './workspace.store';

export { 
  useActivityStore, 
  useRecentEvents 
} from './activity.store';
```

**Usage - components request dependencies from registry:**
```typescript
import { useModelStore, useWorkspaceStore, useActivityStore } from '@/shared/stores';

function SomeComponent() {
  // Request specific dependencies from the registry
  const model = useModelStore((state) => state.model);
  const workspace = useWorkspaceStore((state) => state.getActiveWorkspace());
  const addEvent = useActivityStore((state) => state.addEvent);
  
  // ...
}
```

---

## Summary Table

| Principle | File Examples | Key Implementation |
|-----------|---------------|-------------------|
| **SRP** | model.store.ts, workspace.store.ts, `WorkspaceCard.tsx` / `WorkspaceCardContainer.tsx` | Separate stores per domain; View-Container split |
| **OCP** | `Button.tsx` (CVA), model.schema.ts (Zod), `types.ts` (PREVIEW_TABS) | Variant system; Schema extension; Configurable tabs |
| **LSP** | `Button.tsx` (asChild/Slot), `EntityNode.tsx` (NodeProps) | Polymorphic components; React Flow contracts |
| **ISP** | model.store.ts (selectors), `useWorkspaceActions.ts`, Dialog exports | Focused selectors; Segregated hooks; Compound components |
| **DIP** | `WorkspaceCardContainer.tsx`, `useCodePreview.ts`, `useIdentity.ts` | Hook abstractions; Generator interfaces; Auth abstraction |
| **DI** | main.tsx (providers), `EntityNode.tsx` (props), `useHotkeys.ts` (hooks) | Context providers; Props injection; Hook composition |

Similar code found with 1 license type