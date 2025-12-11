# Database Integration Tool - Frontend

A web-based application for visually designing database models and automatically generating production-ready code artifacts including Entity Framework Core entities, DTOs, ASP.NET Core controllers, SQL migration scripts, and OpenAPI specifications.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Domain-Driven Design Implementation](#domain-driven-design-implementation)
6. [State Management](#state-management)
7. [Component Architecture](#component-architecture)
8. [Styling System](#styling-system)
9. [Code Generation Engine](#code-generation-engine)
10. [Data Schemas and Validation](#data-schemas-and-validation)
11. [Routing and Navigation](#routing-and-navigation)
12. [Development Setup](#development-setup)
13. [Build and Deployment](#build-and-deployment)
14. [File Reference](#file-reference)

---

## Project Overview

This application serves as a visual database model designer that enables users to:

- Create and manage multiple workspaces containing data models
- Design database entities with fields, constraints, and relationships using a drag-and-drop canvas interface
- Establish entity relationships with configurable cardinality (one-to-one, one-to-many, many-to-many)
- Generate production-ready code artifacts in real-time:
  - Entity Framework Core entity classes with data annotations
  - Data Transfer Objects (DTOs) for API contracts
  - ASP.NET Core Web API controllers with CRUD operations
  - SQL Server migration scripts with table and constraint definitions
  - OpenAPI 3.0 specifications in YAML format

The application operates entirely on the client side with local storage persistence, requiring no backend services for core functionality.

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI component library with concurrent rendering features |
| TypeScript | 5.9.3 | Static type checking with strict mode enabled |
| Vite | 7.2.4 | Build tool and development server with HMR support |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.9 | Lightweight state management with hook-based API |
| Immer | 11.0.1 | Immutable state updates via middleware |
| TanStack React Query | 5.90.12 | Server state management (configured for future API integration) |

### UI Component Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| Radix UI | Various | Unstyled, accessible component primitives |
| Tailwind CSS | 4.1.17 | Utility-first CSS framework |
| class-variance-authority | 0.7.1 | Type-safe component variant management |
| tailwind-merge | 3.4.0 | Intelligent Tailwind class deduplication |
| clsx | 2.1.1 | Conditional class name construction |
| lucide-react | 0.559.0 | Icon library with tree-shaking support |

### Visual Design Canvas

| Technology | Version | Purpose |
|------------|---------|---------|
| @xyflow/react | 12.10.0 | Node-based graph visualization (React Flow) |
| react-resizable-panels | 3.0.6 | Resizable panel layout system |

### Form Management and Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| react-hook-form | 7.68.0 | Performant form state management |
| @hookform/resolvers | 5.2.2 | Validation resolver integration |
| Zod | 4.1.13 | Schema declaration and validation |

### Code Display

| Technology | Version | Purpose |
|------------|---------|---------|
| @monaco-editor/react | 4.7.0 | Monaco Editor integration for code preview |

### Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| react-router-dom | 7.10.1 | Client-side routing with nested layouts |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| uuid | 13.0.0 | RFC4122 UUID generation |
| nanoid | 5.1.6 | Compact unique ID generation |

---

## Architecture

### High-Level Architecture Pattern

The application implements a Domain-Driven Design (DDD) architecture with clear separation of concerns across three primary domains:

```
src/
+-- domains/           # Feature-based domain modules
|   +-- dashboard/     # Workspace management domain
|   +-- model-designer/ # Visual entity modeling domain
|   +-- preview-pane/  # Code generation and preview domain
+-- shared/            # Cross-cutting concerns
|   +-- schemas/       # Zod validation schemas and type definitions
|   +-- stores/        # Zustand state stores
|   +-- ui/            # Reusable UI component library
|   +-- utils/         # Utility functions
+-- components/        # Application-level components (Layout, ErrorBoundary)
+-- pages/             # Route-level page components
```

### Design Principles Applied

1. Single Responsibility Principle (SRP): Each component, hook, and utility has a single, well-defined purpose.

2. Separation of Concerns: Business logic resides in hooks and stores; UI logic resides in components; validation logic resides in schemas.

3. Dependency Inversion: Components depend on abstractions (interfaces/types) rather than concrete implementations.

4. DRY (Don't Repeat Yourself): Common patterns extracted into reusable hooks, components, and utilities.

5. Composition over Inheritance: UI components composed from primitive building blocks rather than class inheritance hierarchies.

---

## Project Structure

### Root Configuration Files

```
/
+-- index.html              # HTML entry point with root mount element
+-- package.json            # Dependencies and npm scripts
+-- package-lock.json       # Dependency lock file
+-- vite.config.ts          # Vite bundler configuration
+-- tsconfig.json           # TypeScript project references
+-- tsconfig.app.json       # Application TypeScript configuration
+-- tsconfig.node.json      # Node.js TypeScript configuration
+-- eslint.config.js        # ESLint flat configuration
+-- .gitignore              # Git ignore patterns
```

### Source Directory Structure

```
src/
+-- main.tsx                # Application entry point
+-- App.tsx                 # Root component with providers and routing
+-- index.css               # Global styles and Tailwind theme
+-- assets/                 # Static assets (empty in current build)
+-- components/             # Application-level components
|   +-- index.ts            # Barrel export
|   +-- ErrorBoundary.tsx   # React error boundary component
|   +-- Layout/
|       +-- index.ts        # Barrel export
|       +-- Layout.tsx      # Main layout with sidebar and outlet
|       +-- Sidebar.tsx     # Navigation sidebar component
+-- pages/                  # Route page components
|   +-- index.ts            # Barrel export
|   +-- DashboardPage.tsx   # Workspace listing page
|   +-- DesignerPage.tsx    # Model designer page with panels
+-- domains/                # Feature domain modules
|   +-- dashboard/          # Workspace management
|   +-- model-designer/     # Visual modeling canvas
|   +-- preview-pane/       # Code generation preview
+-- shared/                 # Shared infrastructure
    +-- schemas/            # Zod schemas and types
    +-- stores/             # Zustand state stores
    +-- ui/                 # UI component library
    +-- utils/              # Utility functions
```

---

## Domain-Driven Design Implementation

### Dashboard Domain

Purpose: Workspace lifecycle management including creation, deletion, import, and export operations.

Directory Structure:
```
domains/dashboard/
+-- index.ts                          # Domain barrel export
+-- types.ts                          # Domain-specific type definitions
+-- utils.ts                          # Transformation and file utilities
+-- hooks/
|   +-- index.ts                      # Hook barrel export
|   +-- useWorkspaceActions.ts        # Workspace CRUD action hook
+-- components/
    +-- index.ts                      # Component barrel export
    +-- WorkspaceList/
    |   +-- index.ts
    |   +-- WorkspaceList.tsx         # View: List UI with grid/empty state
    |   +-- WorkspaceListContainer.tsx # Container: State and navigation
    +-- WorkspaceCard/
    |   +-- index.ts
    |   +-- WorkspaceCard.tsx         # View: Card with context menu
    |   +-- WorkspaceCardContainer.tsx # Container: Store selection
    +-- CreateWorkspaceDialog/
        +-- index.ts
        +-- CreateWorkspaceDialog.tsx  # View: Form dialog with validation
        +-- CreateWorkspaceDialogContainer.tsx # Container: Action wiring
```

Exported API:
- WorkspaceListContainer - Main component for workspace listing
- useWorkspaceActions - Hook providing workspace operations
- Types: WorkspaceListItem, CreateWorkspaceFormData, CreateModelFormData

Type Definitions (types.ts):
```typescript
interface WorkspaceListItem {
  id: string;
  name: string;
  modelsCount: number;
  updatedAt: string;
  createdAt: string;
}

interface CreateWorkspaceFormData {
  name: string;
}

interface CreateModelFormData {
  name: string;
  description?: string;
}
```

Utility Functions (utils.ts):
- formatWorkspaceForList(workspace) - Transforms Workspace to WorkspaceListItem
- downloadWorkspaceAsJson(workspace) - Triggers browser file download
- parseWorkspaceImport(content) - Parses and validates imported JSON

### Model Designer Domain

Purpose: Visual entity-relationship modeling with drag-and-drop canvas, real-time entity editing, and relationship management.

Directory Structure:
```
domains/model-designer/
+-- index.ts                          # Domain barrel export
+-- types.ts                          # React Flow node/edge types and constants
+-- utils.ts                          # Node conversion and styling utilities
+-- hooks/
|   +-- index.ts                      # Hook barrel export
|   +-- useCanvasActions.ts           # Canvas manipulation actions
|   +-- useHotkeys.ts                 # Keyboard shortcut handler
+-- components/
    +-- index.ts                      # Component barrel export
    +-- DesignCanvas/
    |   +-- index.ts
    |   +-- DesignCanvas.tsx          # View: React Flow configuration
    |   +-- DesignCanvasContainer.tsx # Container: Model-to-node conversion
    +-- EntityNode/
    |   +-- index.ts
    |   +-- EntityNode.tsx            # View: Entity card with fields
    |   +-- EntityNodeContainer.tsx   # Container: Action wiring
    +-- RelationEdge/
    |   +-- index.ts
    |   +-- RelationEdge.tsx          # View: Edge with cardinality label
    +-- InspectorPanel/
    |   +-- index.ts
    |   +-- InspectorPanel.tsx        # View: Entity/field editing form
    |   +-- InspectorPanelContainer.tsx # Container: Selection state
    +-- Toolbar/
    |   +-- index.ts
    |   +-- Toolbar.tsx               # View: Action bar UI
    |   +-- ToolbarContainer.tsx      # Container: Model state
    +-- CanvasContextMenu/
        +-- index.ts
        +-- CanvasContextMenu.tsx     # Context menu for canvas actions
```

Exported API:
- Components: DesignCanvasContainer, InspectorPanelContainer, ToolbarContainer
- Hooks: useCanvasActions, useHotkeys
- Types: EntityNodeData, RelationEdgeData, FieldTypeOption, EntityColorOption
- Constants: FIELD_TYPE_OPTIONS, ENTITY_COLOR_OPTIONS, CARDINALITY_OPTIONS

Type Definitions (types.ts):
```typescript
type EntityNodeData = {
  entity: Entity;
  isSelected: boolean;
  onAddField: () => void;
  onEditEntity: () => void;
  onDeleteEntity: () => void;
  onDuplicateEntity: () => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  [key: string]: unknown;  // React Flow compatibility
};

type RelationEdgeData = {
  relation: Relation;
  sourceEntityName: string;
  targetEntityName: string;
  [key: string]: unknown;
};

type EntityNode = Node<EntityNodeData, 'entity'>;
type RelationEdge = Edge<RelationEdgeData>;
```

Constants:
```typescript
const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { value: 'string', label: 'String', category: 'Text' },
  { value: 'int', label: 'Integer', category: 'Numeric' },
  { value: 'long', label: 'Long', category: 'Numeric' },
  { value: 'decimal', label: 'Decimal', category: 'Numeric' },
  { value: 'double', label: 'Double', category: 'Numeric' },
  { value: 'float', label: 'Float', category: 'Numeric' },
  { value: 'bool', label: 'Boolean', category: 'Primitive' },
  { value: 'DateTime', label: 'DateTime', category: 'DateTime' },
  { value: 'DateOnly', label: 'DateOnly', category: 'DateTime' },
  { value: 'TimeOnly', label: 'TimeOnly', category: 'DateTime' },
  { value: 'Guid', label: 'GUID', category: 'Special' },
  { value: 'byte[]', label: 'Binary', category: 'Special' },
  { value: 'json', label: 'JSON', category: 'Special' },
];

const ENTITY_COLOR_OPTIONS: EntityColorOption[] = [
  { value: 'blue', label: 'Blue', className: 'bg-entity-blue' },
  { value: 'purple', label: 'Purple', className: 'bg-entity-purple' },
  { value: 'green', label: 'Green', className: 'bg-entity-green' },
  { value: 'orange', label: 'Orange', className: 'bg-entity-orange' },
  { value: 'pink', label: 'Pink', className: 'bg-entity-pink' },
  { value: 'cyan', label: 'Cyan', className: 'bg-entity-cyan' },
];

const CARDINALITY_OPTIONS: CardinalityOption[] = [
  { value: 'one-to-one', label: '1:1', description: 'One to One' },
  { value: 'one-to-many', label: '1:N', description: 'One to Many' },
  { value: 'many-to-many', label: 'M:N', description: 'Many to Many' },
];
```

Keyboard Shortcuts (useHotkeys):

| Key | Action |
|-----|--------|
| N | Create new entity |
| F | Add field to selected entity |
| Ctrl+D / Cmd+D | Duplicate selected entity |
| Delete / Backspace | Delete selected entity |
| Escape | Clear selection |

### Preview Pane Domain

Purpose: Real-time code generation and display with syntax highlighting for multiple output formats.

Directory Structure:
```
domains/preview-pane/
+-- index.ts                          # Domain barrel export
+-- types.ts                          # Preview tab type definitions
+-- utils.ts                          # Code generation functions (526 lines)
+-- hooks/
|   +-- index.ts                      # Hook barrel export
|   +-- useCodePreview.ts             # Code generation hook
+-- components/
    +-- index.ts                      # Component barrel export
    +-- CodePreview/
        +-- index.ts
        +-- CodePreview.tsx           # View: Tabs and Monaco editor
        +-- CodePreviewContainer.tsx  # Container: Tab state management
```

Exported API:
- CodePreviewContainer - Main preview component
- useCodePreview - Code generation hook
- Types: PreviewTab, PreviewTabConfig
- Constants: PREVIEW_TABS

Preview Tab Configuration:
```typescript
const PREVIEW_TABS: PreviewTabConfig[] = [
  { id: 'entities', label: 'EF Core Entities', language: 'csharp' },
  { id: 'dtos', label: 'DTOs', language: 'csharp' },
  { id: 'controller', label: 'Controller', language: 'csharp' },
  { id: 'migration', label: 'SQL Migration', language: 'sql' },
  { id: 'swagger', label: 'OpenAPI', language: 'yaml' },
];
```

---

## State Management

### Store Architecture

The application uses Zustand for state management with three specialized stores, each handling a distinct concern:

### Model Store (model.store.ts)

Purpose: Manages the current data model being edited, including entities, fields, relations, indexes, and selection state.

State Shape:
```typescript
interface ModelState {
  model: DataModel | null;
  selectedEntityId: string | null;
  selectedFieldId: string | null;
  selectedRelationId: string | null;
  selectedIndexId: string | null;
  isDirty: boolean;
}
```

Middleware Stack:
1. immer - Enables mutable-style state updates that produce immutable results
2. persist - Automatically saves state to localStorage under key "model-store"

Actions by Category:

Model Lifecycle:
- createNewModel(name) - Initializes new model with metadata
- setModel(model) - Loads existing model
- clearModel() - Removes current model from state
- markClean() / markDirty() - Dirty state management
- getModelSnapshot() - Returns serializable model copy

Entity Operations:
- addEntity(entity) - Adds entity to model (auto-creates Id field with Guid type as primary key)
- updateEntity(entityId, updates) - Partial entity update
- deleteEntity(entityId) - Removes entity and associated relations
- duplicateEntity(entityId) - Creates copy with new ID and offset position

Field Operations:
- addField(entityId, field) - Adds field to entity
- updateField(entityId, fieldId, updates) - Partial field update
- deleteField(entityId, fieldId) - Removes field from entity
- reorderFields(entityId, fieldIds) - Reorders fields by ID array

Relation Operations:
- addRelation(relation) - Creates relationship between entities
- updateRelation(relationId, updates) - Partial relation update
- deleteRelation(relationId) - Removes relationship

Index Operations:
- addIndex(index) - Creates database index
- updateIndex(indexId, updates) - Partial index update
- deleteIndex(indexId) - Removes index

Selection Management:
- selectEntity(entityId) - Selects entity, clears field selection
- selectField(fieldId) - Selects field within current entity
- selectRelation(relationId) - Selects relation edge
- clearSelection() - Clears all selections

Position Management:
- updateEntityPosition(entityId, position) - Updates entity canvas position (does not mark dirty)

Selector Hooks (optimized with useShallow):
```typescript
const useSelectedEntity = () => useModelStore(state => /* find entity by selectedEntityId */);
const useSelectedField = () => useModelStore(state => /* find field in selected entity */);
const useSelectedRelation = () => useModelStore(state => /* find relation by selectedRelationId */);
const useEntities = () => useModelStore(useShallow(state => state.model?.entities ?? []));
const useRelations = () => useModelStore(useShallow(state => state.model?.relations ?? []));
const useIndexes = () => useModelStore(useShallow(state => state.model?.indexes ?? []));
```

### Workspace Store (workspace.store.ts)

Purpose: Manages workspace collection and active workspace state.

State Shape:
```typescript
interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
}
```

Middleware Stack:
1. immer - Immutable state updates
2. persist - localStorage persistence under key "workspace-store"

Actions:

Workspace CRUD:
- createWorkspace(name) - Creates workspace with timestamps, returns ID
- updateWorkspace(workspaceId, updates) - Partial workspace update
- deleteWorkspace(workspaceId) - Removes workspace
- setActiveWorkspace(workspaceId | null) - Sets active workspace

Model Management:
- addModelToWorkspace(workspaceId, model) - Adds model to workspace
- removeModelFromWorkspace(workspaceId, modelId) - Removes model
- setActiveModel(workspaceId, modelId | null) - Sets active model in workspace

Import/Export:
- importWorkspace(data) - Imports workspace with new UUIDs to avoid conflicts
- exportWorkspace(workspaceId) - Returns workspace data for export
- importModel(workspaceId, model) - Imports model into workspace

Getters:
- getActiveWorkspace() - Returns current workspace or null
- getWorkspaceById(workspaceId) - Finds workspace by ID

Selector Hooks:
```typescript
const useActiveWorkspace = () => useWorkspaceStore(state => /* find by activeWorkspaceId */);
const useWorkspaceModels = (workspaceId) => useWorkspaceStore(useShallow(state => /* workspace.models */));
```

### Activity Store (activity.store.ts)

Purpose: Manages application event log for user feedback and debugging.

State Shape:
```typescript
interface ActivityState {
  events: ActivityEvent[];
  maxEvents: number;  // Default: 100
}

interface ActivityEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'generation';
  message: string;
  details?: string;
  timestamp: string;  // ISO 8601 format
}
```

Middleware: immer only (no persistence)

Actions:
- addEvent(type, message, details?) - Adds event to front of array, auto-truncates to maxEvents
- clearEvents() - Removes all events
- removeEvent(eventId) - Removes specific event

Selector Hook:
```typescript
const useRecentEvents = (count = 10) => useActivityStore(useShallow(state => state.events.slice(0, count)));
```

### State Persistence Strategy

Both model-store and workspace-store use Zustand's persist middleware with localStorage:

```typescript
persist(
  immer((set, get) => ({ /* state and actions */ })),
  {
    name: 'store-key',
    partialize: (state) => ({ /* fields to persist */ }),
  }
)
```

The partialize option allows selective persistence:
- Model store persists only model field (not selection state)
- Workspace store persists all fields

---

## Component Architecture

### View-Container Pattern

The application implements a strict separation between presentational (View) and container components:

View Components:
- Receive all data and callbacks via props
- Contain no business logic or direct store access
- Focus on UI rendering and user interaction capture
- Named as ComponentName.tsx or ComponentNameView

Container Components:
- Connect to Zustand stores via hooks
- Orchestrate data flow and action handling
- Transform store data to view-compatible format
- Named as ComponentNameContainer.tsx

Example Pattern:
```typescript
// WorkspaceCard.tsx (View)
interface WorkspaceCardViewProps {
  workspace: WorkspaceListItem;
  isActive: boolean;
  onOpen: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function WorkspaceCardView({ workspace, isActive, ...handlers }: WorkspaceCardViewProps) {
  return (/* Pure UI rendering */);
}

// WorkspaceCardContainer.tsx (Container)
export function WorkspaceCardContainer({ workspaceId }: { workspaceId: string }) {
  const workspace = useWorkspaceStore(state => state.getWorkspaceById(workspaceId));
  const { handleOpenWorkspace, handleExportWorkspace, handleDeleteWorkspace } = useWorkspaceActions();
  
  if (!workspace) return null;
  
  return (
    <WorkspaceCardView
      workspace={formatWorkspaceForList(workspace)}
      isActive={workspace.id === activeId}
      onOpen={() => handleOpenWorkspace(workspace.id)}
      onExport={() => handleExportWorkspace(workspace.id)}
      onDelete={() => handleDeleteWorkspace(workspace.id)}
    />
  );
}
```

### Barrel Export Pattern

Each component directory includes an index.ts that re-exports public APIs:

```typescript
// components/WorkspaceCard/index.ts
export { WorkspaceCardView } from './WorkspaceCard';
export { WorkspaceCardContainer } from './WorkspaceCardContainer';
```

This enables clean imports:
```typescript
import { WorkspaceCardContainer } from '@/domains/dashboard/components/WorkspaceCard';
```

### UI Component Library

Located in src/shared/ui/, the component library provides reusable primitives built on Radix UI:

| Component | Radix Primitive | Purpose |
|-----------|-----------------|---------|
| Button | react-slot | Polymorphic button with variants |
| Input | Native | Styled text input |
| Card | None | Container with header/content/footer |
| Badge | None | Status/label indicator |
| Dialog | react-dialog | Modal dialog with overlay |
| Select | react-select | Dropdown selection |
| Tabs | react-tabs | Tab navigation |
| Tooltip | react-tooltip | Hover information display |
| ContextMenu | react-context-menu | Right-click menu |

Variant System (CVA):

Components use class-variance-authority for type-safe variant management:

```typescript
const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'variant-specific-classes',
        destructive: '...',
        outline: '...',
        secondary: '...',
        ghost: '...',
        link: '...',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

## Styling System

### Tailwind CSS v4 Configuration

The application uses Tailwind CSS v4 with the Vite plugin for automatic CSS processing:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### Custom Theme Definition

Theme colors are defined using Tailwind v4's @theme directive in index.css:

```css
@import "tailwindcss";

@theme {
  /* Semantic Colors */
  --color-background: #0a0a0b;
  --color-foreground: #fafafa;
  --color-card: #18181b;
  --color-card-foreground: #fafafa;
  --color-popover: #18181b;
  --color-popover-foreground: #fafafa;
  --color-primary: #6366f1;
  --color-primary-foreground: #fafafa;
  --color-secondary: #27272a;
  --color-secondary-foreground: #fafafa;
  --color-muted: #27272a;
  --color-muted-foreground: #a1a1aa;
  --color-accent: #27272a;
  --color-accent-foreground: #fafafa;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #fafafa;
  --color-success: #22c55e;
  --color-success-foreground: #fafafa;
  --color-warning: #f59e0b;
  --color-warning-foreground: #0a0a0b;
  --color-border: #27272a;
  --color-input: #27272a;
  --color-ring: #6366f1;

  /* Entity Node Colors */
  --color-entity-blue: #3b82f6;
  --color-entity-purple: #8b5cf6;
  --color-entity-green: #10b981;
  --color-entity-orange: #f97316;
  --color-entity-pink: #ec4899;
  --color-entity-cyan: #06b6d4;

  /* Border Radius Scale */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

### Base Layer Styles

```css
@layer base {
  * {
    border-color: var(--color-border);
  }

  html, body, #root {
    height: 100%;
  }

  body {
    margin: 0;
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}
```

### React Flow Theme Overrides

```css
.react-flow__background {
  background-color: var(--color-background) !important;
}

.react-flow__minimap {
  background-color: var(--color-card) !important;
}

.react-flow__controls {
  background-color: var(--color-card) !important;
  border-color: var(--color-border) !important;
}

.react-flow__controls-button {
  background-color: var(--color-card) !important;
  border-color: var(--color-border) !important;
  fill: var(--color-foreground) !important;
}
```

### Class Name Utility

The cn() utility function combines clsx for conditional classes with tailwind-merge for conflict resolution:

```typescript
// shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:
```typescript
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)} />
```

---

## Code Generation Engine

### Overview

The code generation engine (domains/preview-pane/utils.ts) transforms the visual data model into production-ready code artifacts. The engine produces five output formats:

### 1. Entity Framework Core Entities (generateEFCoreEntities)

Output: C# entity classes with data annotations

Features:
- Proper namespace declaration
- Required using statements
- Data annotation attributes:
  - [Key] for primary keys
  - [Required] for non-nullable fields
  - [MaxLength(n)] for string length constraints
  - [Column(TypeName = "...")] for specific SQL types
- Navigation properties for relationships
- Collection properties for one-to-many relations

Type Mapping:

| Field Type | C# Type | Nullable C# Type |
|------------|---------|------------------|
| string | string | string? |
| int | int | int? |
| long | long | long? |
| decimal | decimal | decimal? |
| double | double | double? |
| float | float | float? |
| bool | bool | bool? |
| DateTime | DateTime | DateTime? |
| DateOnly | DateOnly | DateOnly? |
| TimeOnly | TimeOnly | TimeOnly? |
| Guid | Guid | Guid? |
| byte[] | byte[] | byte[]? |
| json | string | string? |

### 2. Data Transfer Objects (generateDTOs)

Output: Create, Update, and Response DTO classes for each entity

Generated Classes:
- Create{Entity}Dto - Input for creation (excludes auto-generated fields)
- Update{Entity}Dto - Input for updates (all fields optional/nullable)
- {Entity}ResponseDto - Output representation (all fields)

### 3. ASP.NET Core Controller (generateController)

Output: Web API controller with CRUD endpoints

Endpoints Generated:

| HTTP Method | Route | Action |
|-------------|-------|--------|
| GET | /api/{entities} | GetAll |
| GET | /api/{entities}/{id} | GetById |
| POST | /api/{entities} | Create |
| PUT | /api/{entities}/{id} | Update |
| DELETE | /api/{entities}/{id} | Delete |

Features:
- [ApiController] attribute
- [Route("api/[controller]")] convention
- Constructor injection pattern
- CreatedAtAction responses for POST
- NoContent responses for DELETE

### 4. SQL Migration Script (generateSQLMigration)

Output: SQL Server compatible DDL script

Generated Statements:
- CREATE TABLE with column definitions
- PRIMARY KEY constraints
- NOT NULL constraints
- Foreign key constraints for relationships
- Proper SQL Server type mapping

Type Mapping:

| Field Type | SQL Server Type |
|------------|-----------------|
| string | NVARCHAR(MAX) or NVARCHAR(n) |
| int | INT |
| long | BIGINT |
| decimal | DECIMAL(18,2) |
| double | FLOAT |
| float | REAL |
| bool | BIT |
| DateTime | DATETIME2 |
| DateOnly | DATE |
| TimeOnly | TIME |
| Guid | UNIQUEIDENTIFIER |
| byte[] | VARBINARY(MAX) |
| json | NVARCHAR(MAX) |

### 5. OpenAPI Specification (generateSwaggerSpec)

Output: OpenAPI 3.0 specification in YAML format

Structure:
```yaml
openapi: '3.0.0'
info:
  title: Generated API
  version: '1.0.0'
paths:
  /api/{entities}:
    get: { ... }
    post: { ... }
  /api/{entities}/{id}:
    get: { ... }
    put: { ... }
    delete: { ... }
components:
  schemas:
    {Entity}: { ... }
```

Type Mapping to OpenAPI:

| Field Type | OpenAPI Type | Format |
|------------|--------------|--------|
| string | string | - |
| int | integer | int32 |
| long | integer | int64 |
| decimal, double, float | number | - |
| bool | boolean | - |
| DateTime | string | date-time |
| DateOnly | string | date |
| TimeOnly | string | time |
| Guid | string | uuid |
| byte[] | string | byte |
| json | object | - |

---

## Data Schemas and Validation

### Zod Schema Definitions

Located in shared/schemas/model.schema.ts, the schema file defines the complete type system for the application:

### Field Type Schema
```typescript
const fieldTypeSchema = z.enum([
  'string', 'int', 'long', 'decimal', 'double', 'float',
  'bool', 'DateTime', 'DateOnly', 'TimeOnly', 'Guid', 'byte[]', 'json'
]);

type FieldType = z.infer<typeof fieldTypeSchema>;
```

### Field Constraints Schema
```typescript
const fieldConstraintsSchema = z.object({
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
```

### Field Schema
```typescript
const fieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  type: fieldTypeSchema,
  constraints: fieldConstraintsSchema.default({
    isRequired: false,
    isUnique: false,
    isPrimaryKey: false,
    isAutoGenerated: false,
  }),
  description: z.string().optional(),
  order: z.number().default(0),
});
```

### Relation Schema
```typescript
const cardinalitySchema = z.enum(['one-to-one', 'one-to-many', 'many-to-many']);

const relationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Relation name is required'),
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  cardinality: cardinalitySchema,
  sourceFieldId: z.string().optional(),
  targetFieldId: z.string().optional(),
  foreignKeyField: z.string().optional(),
  onDelete: z.enum(['CASCADE', 'SET NULL', 'NO ACTION', 'RESTRICT']).default('NO ACTION'),
  onUpdate: z.enum(['CASCADE', 'SET NULL', 'NO ACTION', 'RESTRICT']).default('NO ACTION'),
});
```

### Entity Schema
```typescript
const entityColorSchema = z.enum(['blue', 'purple', 'green', 'orange', 'pink', 'cyan']);

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const entitySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Entity name is required'),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
  tableName: z.string().optional(),
  schema: z.string().optional(),
  color: entityColorSchema.default('blue'),
  position: positionSchema,
  isAbstract: z.boolean().default(false),
});
```

### Index Schema
```typescript
const indexSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Index name is required'),
  entityId: z.string(),
  fieldIds: z.array(z.string()),
  isUnique: z.boolean().default(false),
  isClustered: z.boolean().default(false),
});
```

### Data Model Schema
```typescript
const dataModelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Model name is required'),
  description: z.string().optional(),
  entities: z.array(entitySchema),
  relations: z.array(relationSchema),
  indexes: z.array(indexSchema),
  version: z.string().default('1.0.0'),
  createdAt: z.string(),
  updatedAt: z.string(),
  databaseType: z.enum(['sqlserver', 'postgresql', 'mysql', 'sqlite']).default('sqlserver'),
});
```

### Workspace Schema
```typescript
const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Workspace name is required'),
  models: z.array(dataModelSchema),
  activeModelId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

### Validation Helper Functions
```typescript
const validateEntity = (data: unknown) => entitySchema.safeParse(data);
const validateField = (data: unknown) => fieldSchema.safeParse(data);
const validateRelation = (data: unknown) => relationSchema.safeParse(data);
const validateDataModel = (data: unknown) => dataModelSchema.safeParse(data);
```

---

## Routing and Navigation

### Route Configuration

```typescript
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<DashboardPage />} />
      <Route path="designer/:workspaceId" element={<DesignerPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Route Definitions

| Path | Component | Description |
|------|-----------|-------------|
| / | DashboardPage | Workspace listing and management |
| /designer/:workspaceId | DesignerPage | Model designer for specific workspace |

### Layout Structure

```typescript
// Layout.tsx
function Layout() {
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

### Navigation Components

Sidebar (Sidebar.tsx):
- Fixed 64px width navigation rail
- Logo icon at top
- Navigation items with active state styling
- Uses useLocation for active route detection

### Designer Page Initialization

The DesignerPage component handles workspace/model initialization:

1. Extract workspaceId from URL params
2. Validate workspace exists (redirect to / if not)
3. Set active workspace in store
4. Load or create model:
   - Load active model if workspace.activeModelId exists
   - Load first model if workspace has models
   - Create new model if workspace is empty
5. Wrap content in ReactFlowProvider for canvas context

---

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone repository
git clone <repository-url>
cd db-entegration-tool-fe

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | vite | Start development server with HMR |
| build | tsc -b && vite build | Type-check and build for production |
| lint | eslint . | Run ESLint on all files |
| preview | vite preview | Preview production build locally |

### Development Server

The Vite development server runs on http://localhost:5173 by default with:
- Hot Module Replacement (HMR)
- TypeScript type checking
- Tailwind CSS JIT compilation

### Path Aliases

The project uses @/ as an alias for src/:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Build and Deployment

### Production Build

```bash
npm run build
```

This command:
1. Runs TypeScript compiler for type checking (tsc -b)
2. Bundles application with Vite
3. Outputs to dist/ directory

### Build Output Structure

```
dist/
+-- index.html              # Entry HTML with injected assets
+-- assets/
|   +-- index-[hash].js     # Bundled JavaScript
|   +-- index-[hash].css    # Bundled CSS
+-- vite.svg                # Favicon
```

### TypeScript Configuration

Strict Mode Settings (tsconfig.app.json):
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "verbatimModuleSyntax": true
  }
}
```

### ESLint Configuration

The project uses ESLint flat config (eslint.config.js) with:
- TypeScript ESLint rules
- React Hooks plugin
- React Refresh plugin

---

## File Reference

### Configuration Files

| File | Purpose |
|------|---------|
| vite.config.ts | Vite bundler configuration with React and Tailwind plugins |
| tsconfig.json | TypeScript project references |
| tsconfig.app.json | Application TypeScript configuration with strict mode |
| tsconfig.node.json | Node.js TypeScript configuration for Vite config |
| eslint.config.js | ESLint flat configuration |
| package.json | Project metadata, dependencies, and scripts |
| index.html | HTML entry point |
| .gitignore | Git ignore patterns |

### Entry Points

| File | Purpose |
|------|---------|
| src/main.tsx | React application bootstrap |
| src/App.tsx | Root component with providers and routing |
| src/index.css | Global styles and Tailwind theme |

### Shared Infrastructure

| Directory | Purpose |
|-----------|---------|
| src/shared/schemas/ | Zod validation schemas and TypeScript types |
| src/shared/stores/ | Zustand state management stores |
| src/shared/ui/ | Reusable UI component library |
| src/shared/utils/ | Utility functions (cn) |

### Domain Modules

| Directory | Purpose |
|-----------|---------|
| src/domains/dashboard/ | Workspace management domain |
| src/domains/model-designer/ | Visual modeling canvas domain |
| src/domains/preview-pane/ | Code generation and preview domain |

### Application Components

| Directory | Purpose |
|-----------|---------|
| src/components/Layout/ | Application layout with sidebar |
| src/components/ErrorBoundary.tsx | React error boundary |
| src/pages/ | Route-level page components |

---

## License

See LICENSE file for details.
