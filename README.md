# Database Integration Tool - Frontend

A web-based application for visually designing database models and automatically generating production-ready code artifacts including Entity Framework Core entities, DbContext classes, DTOs, ASP.NET Core controllers, Repository/Service layers, SQL migration scripts for multiple databases (SQL Server, PostgreSQL, MySQL, SQLite), and OpenAPI 3.0 specifications.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Authentication & Identity](#authentication--identity)
6. [Domain-Driven Design Implementation](#domain-driven-design-implementation)
7. [State Management](#state-management)
8. [API Integration & Data Sync](#api-integration--data-sync)
9. [Component Architecture](#component-architecture)
10. [Styling System](#styling-system)
11. [Code Generation Engine](#code-generation-engine)
12. [Data Schemas and Validation](#data-schemas-and-validation)
13. [Routing and Navigation](#routing-and-navigation)
14. [Environment Configuration](#environment-configuration)
15. [Development Setup](#development-setup)
16. [Build and Deployment](#build-and-deployment)
17. [File Reference](#file-reference)

---

## Project Overview

This application serves as a visual database model designer that enables users to:

- **Authentication**: Secure user authentication via Clerk with automatic session management and multi-user support
- **Workspace Management**: Create and manage multiple workspaces (projects) containing data models with backend synchronization
- **Visual Entity Design**: Design database entities with fields, constraints, and relationships using a drag-and-drop canvas interface powered by React Flow
- **Relationship Modeling**: Establish entity relationships with configurable cardinality (one-to-one, one-to-many, many-to-many) and cascade behaviors
- **Real-time Code Generation**: Generate production-ready code artifacts instantly as you design:
  - **EF Core Entities**: Entity classes with full data annotations and navigation properties
  - **DbContext**: Complete DbContext with Fluent API configurations in OnModelCreating
  - **DTOs**: CreateDto, UpdateDto, and ResponseDto for each entity with validation attributes
  - **Controllers**: ASP.NET Core Web API controllers with full CRUD operations for ALL entities
  - **Repository Pattern**: Generic IRepository<T> interface, base Repository<T> implementation, and entity-specific repositories
  - **Service Layer**: Service interfaces and implementations with AutoMapper integration
  - **Multi-Database SQL**: DDL scripts for SQL Server, PostgreSQL, MySQL, and SQLite
  - **OpenAPI 3.0**: Complete JSON specification with schemas, paths, and request/response definitions
- **Analytics Dashboard**: Track project statistics, database distribution, activity history
- **Auto-Save**: Automatic synchronization with backend API on every model change

The application supports both offline-first operation with localStorage persistence and real-time backend synchronization when connected.

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI component library with concurrent rendering features |
| TypeScript | 5.9.3 | Static type checking with strict mode enabled |
| Vite | 7.2.4 | Build tool and development server with HMR support |

### Authentication

| Technology | Version | Purpose |
|------------|---------|---------|
| @clerk/clerk-react | 5.58.1 | Authentication provider with SignedIn/SignedOut components |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.9 | Lightweight state management with hook-based API |
| Immer | 11.0.1 | Immutable state updates via middleware |
| zustand/middleware/persist | - | localStorage persistence for offline support |
| TanStack React Query | 5.90.12 | Server state management and caching |

### UI Component Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| Radix UI Primitives | Various | Unstyled, accessible component primitives |
| @radix-ui/react-dialog | 1.1.15 | Modal dialogs |
| @radix-ui/react-select | 2.2.6 | Dropdown selection |
| @radix-ui/react-tabs | 1.1.13 | Tab navigation |
| @radix-ui/react-tooltip | 1.2.8 | Hover tooltips |
| @radix-ui/react-context-menu | 2.2.16 | Right-click menus |
| @radix-ui/react-dropdown-menu | 2.1.16 | Dropdown menus |
| @radix-ui/react-popover | 1.1.15 | Popovers |
| @radix-ui/react-slot | 1.2.4 | Polymorphic component composition |
| Tailwind CSS | 4.1.17 | Utility-first CSS framework with v4 @theme directive |
| class-variance-authority | 0.7.1 | Type-safe component variant management |
| tailwind-merge | 3.4.0 | Intelligent Tailwind class deduplication |
| clsx | 2.1.1 | Conditional class name construction |
| lucide-react | 0.559.0 | Icon library with tree-shaking support |

### Visual Design Canvas

| Technology | Version | Purpose |
|------------|---------|---------|
| @xyflow/react | 12.10.0 | Node-based graph visualization (React Flow) for entity diagrams |
| react-resizable-panels | 3.0.6 | Resizable panel layout system for IDE-like interface |

### Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| recharts | 3.5.1 | Charting library for analytics dashboard |

### Form Management and Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| react-hook-form | 7.68.0 | Performant form state management |
| @hookform/resolvers | 5.2.2 | Validation resolver integration |
| Zod | 4.1.13 | Schema declaration and runtime validation |

### Code Display

| Technology | Version | Purpose |
|------------|---------|---------|
| @monaco-editor/react | 4.7.0 | Monaco Editor (VS Code editor) for syntax-highlighted code preview |

### Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| react-router-dom | 7.10.1 | Client-side routing with nested layouts |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| uuid | 13.0.0 | RFC4122 UUID generation for entity/field IDs |
| nanoid | 5.1.6 | Compact unique ID generation |
| date-fns | 4.1.0 | Date formatting and manipulation |

---

## Architecture

### High-Level Architecture Pattern

The application implements a Domain-Driven Design (DDD) architecture with clear separation of concerns across four primary domains:

```
src/
├── domains/              # Feature-based domain modules
│   ├── analytics/        # Statistics and activity tracking domain
│   ├── dashboard/        # Workspace management domain
│   ├── model-designer/   # Visual entity modeling domain
│   └── preview-pane/     # Code generation and preview domain
├── shared/               # Cross-cutting concerns
│   ├── api/              # API client and data synchronization
│   ├── hooks/            # Shared React hooks
│   ├── identity/         # Clerk identity utilities
│   ├── schemas/          # Zod validation schemas and type definitions
│   ├── stores/           # Zustand state stores
│   ├── ui/               # Reusable UI component library (shadcn/ui pattern)
│   └── utils/            # Utility functions
├── components/           # Application-level components (Layout, ErrorBoundary)
├── pages/                # Route-level page components
└── shell/                # Application shell with providers
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
├── main.tsx                # Application entry point with ClerkProvider
├── App.tsx                 # Root component with auth boundary (SignedIn/SignedOut)
├── index.css               # Global styles and Tailwind v4 @theme configuration
├── assets/                 # Static assets
├── shell/                  # Application shell
│   ├── index.ts            # Barrel export
│   └── AppShell.tsx        # Authenticated app shell with providers
├── components/             # Application-level components
│   ├── index.ts            # Barrel export
│   ├── ErrorBoundary.tsx   # React error boundary component
│   └── Layout/
│       ├── index.ts        # Barrel export
│       ├── Layout.tsx      # Main layout with sidebar and outlet
│       └── Sidebar.tsx     # Navigation sidebar component
├── pages/                  # Route page components
│   ├── index.ts            # Barrel export
│   ├── DashboardPage.tsx   # Workspace listing page
│   ├── DesignerPage.tsx    # Model designer page with resizable panels
│   └── AnalyticsPage.tsx   # Statistics and activity dashboard
├── domains/                # Feature domain modules
│   ├── analytics/          # Analytics and statistics
│   ├── dashboard/          # Workspace management
│   ├── model-designer/     # Visual modeling canvas
│   └── preview-pane/       # Code generation preview
└── shared/                 # Shared infrastructure
    ├── api/                # API client, sync utilities, hooks
    ├── hooks/              # useAutoSave, useUserSession
    ├── identity/           # useIdentity hook for Clerk user data
    ├── schemas/            # Zod schemas and TypeScript types
    ├── stores/             # Zustand state stores (model, workspace, activity)
    ├── ui/                 # UI component library
    └── utils/              # Utility functions (cn)
```

---

## Authentication & Identity

### Clerk Integration

The application uses Clerk for authentication, configured at the application entry point:

**Entry Point (main.tsx):**
```typescript
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
);
```

**Auth Boundary (App.tsx):**
```typescript
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

function App() {
  return (
    <>
      <SignedIn>
        <AppShell />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

### Identity Hook (useIdentity)

Located in `src/shared/identity/useIdentity.ts`, provides type-safe access to user data:

```typescript
const { clerkUserId, email, fullName, firstName, lastName, imageUrl, isLoaded } = useIdentity();
```

### User Session Management (useUserSession)

Located in `src/shared/hooks/useUserSession.ts`, handles multi-user data isolation:

- Detects user logout and clears localStorage data
- Detects user account switching and clears previous user's data
- Prevents data leakage between different user sessions
- Stores current user ID to detect changes

**Storage Keys Managed:**
- `workspace-store` - Zustand workspace persistence
- `model-store` - Zustand model persistence
- `activity-store` - Activity event log
- `current-user-id` - Session tracking

---

## Domain-Driven Design Implementation

### Dashboard Domain

Purpose: Workspace lifecycle management including creation, deletion, import, export, and backend synchronization.

Directory Structure:
```
domains/dashboard/
├── index.ts                          # Domain barrel export
├── types.ts                          # Domain-specific type definitions
├── utils.ts                          # Transformation and file utilities
├── hooks/
│   ├── index.ts                      # Hook barrel export
│   └── useWorkspaceActions.ts        # Workspace CRUD action hook
└── components/
    ├── index.ts                      # Component barrel export
    ├── WorkspaceList/
    │   ├── index.ts
    │   ├── WorkspaceList.tsx         # View: List UI with grid/empty state
    │   └── WorkspaceListContainer.tsx # Container: State and navigation
    ├── WorkspaceCard/
    │   ├── index.ts
    │   ├── WorkspaceCard.tsx         # View: Card with context menu
    │   └── WorkspaceCardContainer.tsx # Container: Store selection
    └── CreateWorkspaceDialog/
        ├── index.ts
        ├── CreateWorkspaceDialog.tsx  # View: Form dialog with validation
        └── CreateWorkspaceDialogContainer.tsx # Container: Action wiring
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
├── index.ts                          # Domain barrel export
├── types.ts                          # React Flow node/edge types and constants
├── utils.ts                          # Node conversion and styling utilities
├── hooks/
│   ├── index.ts                      # Hook barrel export
│   ├── useCanvasActions.ts           # Canvas manipulation actions
│   └── useHotkeys.ts                 # Keyboard shortcut handler
└── components/
    ├── index.ts                      # Component barrel export
    ├── DesignCanvas/
    │   ├── index.ts
    │   ├── DesignCanvas.tsx          # View: React Flow configuration
    │   └── DesignCanvasContainer.tsx # Container: Model-to-node conversion
    ├── EntityNode/
    │   ├── index.ts
    │   ├── EntityNode.tsx            # View: Entity card with fields
    │   └── EntityNodeContainer.tsx   # Container: Action wiring
    ├── RelationEdge/
    │   ├── index.ts
    │   └── RelationEdge.tsx          # View: Edge with cardinality label
    ├── InspectorPanel/
    │   ├── index.ts
    │   ├── InspectorPanel.tsx        # View: Entity/field editing form
    │   └── InspectorPanelContainer.tsx # Container: Selection state
    ├── Toolbar/
    │   ├── index.ts
    │   ├── Toolbar.tsx               # View: Action bar UI
    │   └── ToolbarContainer.tsx      # Container: Model state
    └── CanvasContextMenu/
        ├── index.ts
        └── CanvasContextMenu.tsx     # Context menu for canvas actions
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

Purpose: Real-time code generation and display with syntax highlighting for multiple output formats across 11 preview tabs.

Directory Structure:
```
domains/preview-pane/
├── index.ts                          # Domain barrel export
├── types.ts                          # Preview tab type definitions
├── utils.ts                          # Code generation wrapper functions
├── generators/                       # Modular code generation engine
│   ├── index.ts                      # Generator exports
│   ├── types.ts                      # Type mappings for C#, SQL, OpenAPI
│   ├── helpers.ts                    # Shared utility functions (~380 lines)
│   ├── ef-core-generator.ts          # EF Core entity class generator
│   ├── dbcontext-generator.ts        # DbContext with Fluent API generator
│   ├── dto-generator.ts              # DTO class generator
│   ├── controller-generator.ts       # ASP.NET Core controller generator
│   ├── repository-generator.ts       # Repository + Service layer generator
│   ├── sql-generator.ts              # Multi-database SQL DDL generator
│   └── openapi-generator.ts          # OpenAPI 3.0 specification generator
├── hooks/
│   ├── index.ts                      # Hook barrel export
│   └── useCodePreview.ts             # Code generation hook with tab switching
└── components/
    ├── index.ts                      # Component barrel export
    └── CodePreview/
        ├── index.ts
        ├── CodePreview.tsx           # View: Tabs and Monaco editor
        └── CodePreviewContainer.tsx  # Container: Tab state management
```

Exported API:
- CodePreviewContainer - Main preview component
- useCodePreview - Code generation hook
- Types: PreviewTab, PreviewTabConfig
- Constants: PREVIEW_TABS
- All generator functions for direct access

Preview Tab Configuration:
```typescript
type PreviewTab = 
  | 'entities'          // EF Core entity classes
  | 'dbcontext'         // DbContext with Fluent API
  | 'dtos'              // Create/Update/Response DTOs
  | 'controller'        // ASP.NET Core controllers
  | 'repository'        // Repository pattern implementation
  | 'services'          // Service layer with AutoMapper
  | 'migration'         // SQL Server DDL
  | 'migration-postgres'// PostgreSQL DDL
  | 'migration-mysql'   // MySQL DDL
  | 'migration-sqlite'  // SQLite DDL
  | 'swagger';          // OpenAPI 3.0 JSON

const PREVIEW_TABS: PreviewTabConfig[] = [
  { id: 'entities', label: 'Entities', language: 'csharp' },
  { id: 'dbcontext', label: 'DbContext', language: 'csharp' },
  { id: 'dtos', label: 'DTOs', language: 'csharp' },
  { id: 'controller', label: 'Controllers', language: 'csharp' },
  { id: 'repository', label: 'Repository', language: 'csharp' },
  { id: 'services', label: 'Services', language: 'csharp' },
  { id: 'migration', label: 'SQL Server', language: 'sql' },
  { id: 'migration-postgres', label: 'PostgreSQL', language: 'sql' },
  { id: 'migration-mysql', label: 'MySQL', language: 'sql' },
  { id: 'migration-sqlite', label: 'SQLite', language: 'sql' },
  { id: 'swagger', label: 'OpenAPI', language: 'json' },
];
```

### Analytics Domain

Purpose: Display project statistics, database type distribution, project status breakdown, and recent activity tracking.

Directory Structure:
```
domains/analytics/
├── index.ts                          # Domain barrel export
├── hooks/
│   ├── index.ts                      # Hook barrel export
│   └── useStats.ts                   # Statistics fetching hook
└── components/
    ├── index.ts                      # Component barrel export
    ├── StatCard/                     # Individual stat display card
    ├── DatabaseChart/                # Pie/bar chart for DB type distribution
    ├── StatusChart/                  # Project status breakdown chart
    └── RecentActivity/               # Activity timeline component
```

Exported API:
- StatCard - Displays single metric with icon
- DatabaseChart - Database type distribution (recharts)
- StatusChart - Project status breakdown (recharts)
- RecentActivity - Timeline of recent user actions
- useStats - Hook for fetching UserStats from API

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
  isLoading: boolean;
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

Purpose: Manages workspace collection, active workspace state, and backend synchronization links.

State Shape:
```typescript
interface WorkspaceWithBackend extends Workspace {
  backendProjectId?: string;    // Links to backend Project
  backendSchemaId?: string;     // Links to backend Schema
}

interface WorkspaceState {
  workspaces: WorkspaceWithBackend[];
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

## API Integration & Data Sync

### API Client (api-client.ts)

A fully typed API client for backend communication located in `src/shared/api/`:

**Type Definitions:**
```typescript
interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'draft';
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'pink' | 'gray';
  databaseType: 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'mongodb' | 'other';
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Schema {
  id: string;
  projectId: string;
  name: string;
  schemaJson: SchemaJson;         // Backend schema format
  uiMetadata: UiMetadata | null;  // Canvas positions, zoom, pan
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

interface SchemaJson {
  entities: EntityNode[];
  relationships: Relationship[];
}

interface UiMetadata {
  nodePositions: Record<string, { x: number; y: number }>;
  zoom?: number;
  pan?: { x: number; y: number };
}

interface UserStats {
  totalProjects: number;
  totalSchemas: number;
  totalEntities: number;
  totalRelationships: number;
  activeProjects: number;
  archivedProjects: number;
  favoriteProjects: number;
  recentActivity: ActivityItem[];
  projectsByStatus: StatusCount[];
  projectsByDatabaseType: DatabaseTypeCount[];
  schemasPerProject: SchemaPerProject[];
}
```

**API Endpoints:**
```typescript
const api = useApiClient();

// Projects
await api.projects.list();
await api.projects.get(projectId);
await api.projects.create({ name, description?, databaseType?, color?, tags? });
await api.projects.update(projectId, updates);
await api.projects.delete(projectId);

// Schemas
await api.schemas.listByProject(projectId);
await api.schemas.get(schemaId);
await api.schemas.create(projectId, { name, schemaJson, uiMetadata? });
await api.schemas.update(schemaId, { name?, schemaJson?, uiMetadata?, changelog? });
await api.schemas.delete(schemaId);

// Statistics
await api.stats.get();
await api.stats.getSummary();

// Health
await api.health.check();
```

### Data Synchronization (sync.ts)

Converts between frontend DataModel format and backend SchemaJson format:

**Frontend → Backend:**
```typescript
const { schemaJson, uiMetadata } = dataModelToBackendSchema(model);
```

**Backend → Frontend:**
```typescript
const dataModel = backendSchemaToDataModel(schema);
```

**Key Transformations:**
- Frontend `Field.constraints` → Backend individual boolean fields
- Frontend `Relation.cardinality` → Backend `Relationship.type`
- Frontend `Entity.position` → Backend `UiMetadata.nodePositions[entityId]`
- Frontend `onDelete: 'noAction'` → Backend `onDelete: 'no-action'`

### Data Sync Hook (useDataSync)

Located in `src/shared/api/useDataSync.ts`, synchronizes data on app load:

```typescript
const { isLoading, isSynced, error, lastSyncAt, syncFromBackend, saveModel, loadProjectSchemas } = useDataSync();
```

**Sync Flow:**
1. On mount (when authenticated), fetches all projects from backend
2. For each project, fetches associated schemas
3. Converts backend data to frontend format
4. Replaces workspace store with synced data
5. Handles errors gracefully (falls back to local data)

### Auto-Save Hook (useAutoSave)

Located in `src/shared/hooks/useAutoSave.ts`, automatically saves model changes:

```typescript
useAutoSave({
  workspaceId: 'workspace-123',
  throttleMs: 500,        // Minimum time between saves (prevents API spam during drags)
  enabled: true,          // Enable/disable auto-save
});
```

**Behavior:**
- Watches model store for changes
- Throttles saves to prevent excessive API calls
- Updates existing schema if `backendSchemaId` exists
- Creates new schema if no backend link
- Always saves to localStorage as fallback
- Queues saves if one is in progress

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

The code generation engine is a modular system located in `domains/preview-pane/generators/`. It transforms visual data models into production-ready code artifacts across 9 specialized generator modules.

### Generator Module Architecture

```
generators/
├── types.ts              # Type mappings for all target platforms
├── helpers.ts            # ~380 lines of shared utility functions
├── ef-core-generator.ts  # Entity classes with data annotations
├── dbcontext-generator.ts# DbContext with Fluent API configurations
├── dto-generator.ts      # CreateDto, UpdateDto, ResponseDto classes
├── controller-generator.ts # ASP.NET Core controllers for ALL entities
├── repository-generator.ts # Generic + entity-specific repositories & services
├── sql-generator.ts      # Multi-database DDL (4 databases)
├── openapi-generator.ts  # OpenAPI 3.0 JSON specification
└── index.ts              # Module exports
```

### Type Mappings (types.ts)

**C# Type Map:**
```typescript
const CSHARP_TYPE_MAP: Record<FieldType, string> = {
  string: 'string',
  int: 'int',
  long: 'long',
  decimal: 'decimal',
  double: 'double',
  float: 'float',
  bool: 'bool',
  DateTime: 'DateTime',
  DateOnly: 'DateOnly',
  TimeOnly: 'TimeOnly',
  Guid: 'Guid',
  'byte[]': 'byte[]',
  json: 'string',
};
```

**SQL Server Type Map:**
```typescript
const SQL_SERVER_TYPE_MAP: Record<FieldType, string> = {
  string: 'NVARCHAR',
  int: 'INT',
  long: 'BIGINT',
  decimal: 'DECIMAL',
  double: 'FLOAT',
  float: 'REAL',
  bool: 'BIT',
  DateTime: 'DATETIME2',
  DateOnly: 'DATE',
  TimeOnly: 'TIME',
  Guid: 'UNIQUEIDENTIFIER',
  'byte[]': 'VARBINARY(MAX)',
  json: 'NVARCHAR(MAX)',
};
```

**PostgreSQL Type Map:**
```typescript
const POSTGRES_TYPE_MAP: Record<FieldType, string> = {
  string: 'VARCHAR',
  int: 'INTEGER',
  long: 'BIGINT',
  decimal: 'NUMERIC',
  double: 'DOUBLE PRECISION',
  float: 'REAL',
  bool: 'BOOLEAN',
  DateTime: 'TIMESTAMP',
  DateOnly: 'DATE',
  TimeOnly: 'TIME',
  Guid: 'UUID',
  'byte[]': 'BYTEA',
  json: 'JSONB',
};
```

**MySQL Type Map:**
```typescript
const MYSQL_TYPE_MAP: Record<FieldType, string> = {
  string: 'VARCHAR',
  int: 'INT',
  long: 'BIGINT',
  decimal: 'DECIMAL',
  double: 'DOUBLE',
  float: 'FLOAT',
  bool: 'TINYINT(1)',
  DateTime: 'DATETIME',
  DateOnly: 'DATE',
  TimeOnly: 'TIME',
  Guid: 'CHAR(36)',
  'byte[]': 'LONGBLOB',
  json: 'JSON',
};
```

**SQLite Type Map:**
```typescript
const SQLITE_TYPE_MAP: Record<FieldType, string> = {
  string: 'TEXT',
  int: 'INTEGER',
  long: 'INTEGER',
  decimal: 'REAL',
  double: 'REAL',
  float: 'REAL',
  bool: 'INTEGER',
  DateTime: 'TEXT',
  DateOnly: 'TEXT',
  TimeOnly: 'TEXT',
  Guid: 'TEXT',
  'byte[]': 'BLOB',
  json: 'TEXT',
};
```

**OpenAPI Type Map:**
```typescript
const OPENAPI_TYPE_MAP: Record<FieldType, { type: string; format?: string }> = {
  string: { type: 'string' },
  int: { type: 'integer', format: 'int32' },
  long: { type: 'integer', format: 'int64' },
  decimal: { type: 'number', format: 'decimal' },
  double: { type: 'number', format: 'double' },
  float: { type: 'number', format: 'float' },
  bool: { type: 'boolean' },
  DateTime: { type: 'string', format: 'date-time' },
  DateOnly: { type: 'string', format: 'date' },
  TimeOnly: { type: 'string', format: 'time' },
  Guid: { type: 'string', format: 'uuid' },
  'byte[]': { type: 'string', format: 'byte' },
  json: { type: 'object' },
};
```

### Helper Functions (helpers.ts)

**String Utilities:**
- `toPascalCase(str)` - Convert to PascalCase
- `toCamelCase(str)` - Convert to camelCase
- `toPlural(str)` - Simple English pluralization
- `sanitizeName(str)` - Remove invalid code characters
- `getNamespace(modelName)` - Generate namespace from model name

**Entity/Field Helpers:**
- `getTableName(entity)` - Get SQL table name (custom or pluralized)
- `getCSharpType(field)` - Get C# type with nullability
- `getSqlType(field, dbType)` - Get SQL type for database
- `getPrimaryKeyField(entity)` - Find PK field
- `getEntityById(model, entityId)` - Lookup entity
- `getEntityRelations(entity, relations)` - Get outgoing/incoming relations

**C# Code Generation:**
- `getDefaultValueExpression(field)` - Generate C# default value
- `generateFieldAttributes(field)` - Generate data annotations
- `getForeignKeyName(targetEntity)` - Generate FK property name
- `getNavigationPropertyName(entity, isCollection)` - Generate nav property name

**SQL Generation:**
- `getSqlColumnDefinition(field, dbType)` - Full column DDL
- `quoteIdentifier(name, dbType)` - Database-specific quoting ([name], "name", \`name\`)

### 1. EF Core Entity Generator (ef-core-generator.ts)

**Function:** `generateEFCoreEntities(model: DataModel): string`

**Output Features:**
- Namespace and using statements
- [Table] attribute for custom table names
- [Key] attribute for primary keys
- [DatabaseGenerated] for auto-generated fields
- [Required], [MaxLength], [MinLength], [StringLength] validation
- [RegularExpression] for regex patterns
- [Precision] for decimal fields
- [Column(TypeName)] for JSON fields
- Foreign key properties with type inference
- Navigation properties (reference and collection)
- [ForeignKey] attributes linking nav properties to FKs
- Proper nullability (string? vs string)
- Default value initializers

**Example Output:**
```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MyProject.Entities;

[Table("Users")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string? Email { get; set; }
    
    // Foreign Keys
    public Guid? DepartmentId { get; set; }
    
    // Navigation Properties
    [ForeignKey("DepartmentId")]
    public virtual Department? Department { get; set; }
    
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
```

### 2. DbContext Generator (dbcontext-generator.ts)

**Function:** `generateDbContext(model: DataModel): string`

**Output Features:**
- DbContext class extending DbContext
- Constructor with DbContextOptions<T>
- DbSet<T> properties for all entities
- OnModelCreating override with Fluent API:
  - `entity.ToTable()` for table mapping
  - `entity.HasKey()` for primary keys
  - `entity.HasIndex().IsUnique()` for unique constraints
  - `entity.Property().HasPrecision()` for decimals
  - `entity.Property().HasColumnType()` for JSON
  - `entity.HasOne().WithMany().HasForeignKey().OnDelete()` for relationships
  - `entity.HasMany().WithMany().UsingEntity()` for M:N
- Index configurations with `HasDatabaseName()`

**Example Output:**
```csharp
using Microsoft.EntityFrameworkCore;
using MyProject.Entities;

namespace MyProject.Data;

public class MyProjectDbContext : DbContext
{
    public MyProjectDbContext(DbContextOptions<MyProjectDbContext> options) : base(options)
    {
    }

    // DbSet properties
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            
            entity.HasKey(e => e.Id);
            
            // Unique constraints
            entity.HasIndex(e => e.Email)
                .IsUnique();
            
            // Relationships
            entity.HasOne(e => e.Department)
                .WithMany(t => t.Users)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
```

### 3. DTO Generator (dto-generator.ts)

**Function:** `generateDTOs(model: DataModel): string`

**Output Features:**
- `Create{Entity}Dto` - For creating entities (excludes auto-generated fields)
- `Update{Entity}Dto` - For updating entities (all fields nullable/optional)
- `{Entity}ResponseDto` - For API responses (all fields)
- XML documentation comments
- [Required], [MaxLength], [RegularExpression] validation attributes
- Foreign key properties for relationships
- Collection IDs for M:N relationships

### 4. Controller Generator (controller-generator.ts)

**Function:** `generateControllers(model: DataModel): string`

**Output Features:**
- Controller for EVERY entity in the model
- [ApiController], [Route], [Produces] attributes
- Constructor injection of service and logger
- Full CRUD operations:
  - `GET /api/{entities}` - GetAll with pagination
  - `GET /api/{entities}/{id}` - GetById
  - `POST /api/{entities}` - Create
  - `PUT /api/{entities}/{id}` - Update
  - `DELETE /api/{entities}/{id}` - Delete
- [HttpGet], [HttpPost], [HttpPut], [HttpDelete] attributes
- [ProducesResponseType] for Swagger documentation
- [FromQuery], [FromBody] parameter binding
- ModelState validation
- Proper HTTP status codes (200, 201, 204, 400, 404)
- Structured logging with ILogger

### 5. Repository Generator (repository-generator.ts)

**Functions:**
- `generateRepositories(model: DataModel): string` - Repository layer
- `generateServices(model: DataModel): string` - Service layer

**Repository Output:**
- `IRepository<T>` generic interface with:
  - GetByIdAsync, GetAllAsync, GetPagedAsync
  - FindAsync, FirstOrDefaultAsync, AnyAsync
  - CountAsync (with/without predicate)
  - AddAsync, AddRangeAsync
  - UpdateAsync, DeleteAsync, DeleteRangeAsync
- `Repository<T>` base implementation using DbSet<T>
- `I{Entity}Repository` entity-specific interfaces
- `{Entity}Repository` entity-specific implementations

**Service Output:**
- `I{Entity}Service` interface for each entity
- `{Entity}Service` implementation with:
  - AutoMapper integration (IMapper)
  - CRUD methods mapping to DTOs
  - Repository pattern usage

### 6. SQL Generator (sql-generator.ts)

**Functions:**
- `generateSqlServerSQL(model, includeDrops?)` - SQL Server DDL
- `generatePostgresSQL(model, includeDrops?)` - PostgreSQL DDL
- `generateMySQLSQL(model, includeDrops?)` - MySQL DDL
- `generateSQLiteSQL(model, includeDrops?)` - SQLite DDL

**Output Features:**
- Header with model name, database type, generation timestamp
- DROP TABLE IF EXISTS statements (optional)
- CREATE TABLE with:
  - Column definitions with proper types per database
  - NOT NULL / NULL constraints
  - PRIMARY KEY constraints
  - IDENTITY/SERIAL/AUTO_INCREMENT for auto-increment
  - DEFAULT values (including GETDATE(), NOW(), UUID functions)
- ALTER TABLE for foreign key constraints
- ON DELETE behaviors (CASCADE, RESTRICT, SET NULL, NO ACTION)
- CREATE INDEX statements (unique and non-unique)
- Database-specific identifier quoting:
  - SQL Server: `[name]`
  - PostgreSQL: `"name"`
  - MySQL: `` `name` ``
  - SQLite: `"name"`

### 7. OpenAPI Generator (openapi-generator.ts)

**Function:** `generateOpenAPI(model: DataModel): string`

**Output Features:**
- OpenAPI 3.0 specification in JSON format
- Info section with title, description, version
- Server configuration
- Paths for all entities:
  - GET collection with pagination parameters
  - GET by ID
  - POST create
  - PUT update
  - DELETE
- Components/Schemas:
  - Entity schema (for responses)
  - Create{Entity}Dto schema
  - Update{Entity}Dto schema
- Proper type mappings with formats (uuid, date-time, etc.)
- Required field arrays
- Nullable field markers
- $ref references between schemas

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

The application shell (`AppShell.tsx`) configures routing with providers:

```typescript
// AppShell.tsx
<QueryClientProvider client={queryClient}>
  <TooltipProvider delayDuration={0}>
    <BrowserRouter>
      <UserSessionGuard>
        <DataSyncProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="designer/:workspaceId" element={<DesignerPage />} />
            </Route>
          </Routes>
        </DataSyncProvider>
      </UserSessionGuard>
    </BrowserRouter>
  </TooltipProvider>
</QueryClientProvider>
```

### Route Definitions

| Path | Component | Description |
|------|-----------|-------------|
| / | DashboardPage | Workspace listing and management |
| /analytics | AnalyticsPage | Project statistics and activity dashboard |
| /designer/:workspaceId | DesignerPage | Model designer for specific workspace |

### Provider Hierarchy

1. **QueryClientProvider** - TanStack Query for server state
2. **TooltipProvider** - Radix tooltip context
3. **BrowserRouter** - React Router context
4. **UserSessionGuard** - Waits for user session verification, clears stale data
5. **DataSyncProvider** - Syncs data from backend on load, shows loading state

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
5. Enable auto-save with throttling (500ms)
6. Wrap content in ReactFlowProvider for canvas context
7. Register beforeunload handler for unsaved changes

### Designer Page Layout

```typescript
<PanelGroup direction="horizontal">
  {/* Main Canvas - 60% default */}
  <Panel defaultSize={60} minSize={40}>
    <DesignCanvasContainer />
  </Panel>
  
  <PanelResizeHandle />
  
  {/* Right Sidebar - 40% default */}
  <Panel defaultSize={40} minSize={25}>
    <PanelGroup direction="vertical">
      {/* Inspector - 40% of sidebar */}
      <Panel defaultSize={40} minSize={20}>
        <InspectorPanelContainer />
      </Panel>
      
      <PanelResizeHandle />
      
      {/* Code Preview - 60% of sidebar */}
      <Panel defaultSize={60} minSize={30}>
        <CodePreviewContainer />
      </Panel>
    </PanelGroup>
  </Panel>
</PanelGroup>
```

---

## Environment Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```dotenv
# Clerk Authentication
# Get your publishable key from https://dashboard.clerk.com
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Backend API URL
VITE_API_URL=http://localhost:4000/api/v1
```

### Required Variables

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_CLERK_PUBLISHABLE_KEY | Yes | Clerk authentication publishable key |
| VITE_API_URL | Yes | Backend API base URL |

### Accessing Environment Variables

Environment variables prefixed with `VITE_` are exposed to the client:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
```

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
| vite.config.ts | Vite bundler configuration with React and Tailwind v4 plugins, path aliases |
| tsconfig.json | TypeScript project references (app + node configs) |
| tsconfig.app.json | Application TypeScript configuration with strict mode, path aliases |
| tsconfig.node.json | Node.js TypeScript configuration for Vite config |
| eslint.config.js | ESLint flat configuration with TypeScript, React Hooks, React Refresh |
| package.json | Project metadata, dependencies (40+), and npm scripts |
| index.html | HTML entry point with dark theme classes |
| .env.example | Environment variable template |
| .gitignore | Git ignore patterns |

### Entry Points

| File | Purpose |
|------|---------|
| src/main.tsx | React application bootstrap with ClerkProvider |
| src/App.tsx | Root component with auth boundary (SignedIn/SignedOut) |
| src/shell/AppShell.tsx | Authenticated app shell with QueryClient, Router, providers |
| src/index.css | Global styles, Tailwind v4 @theme, custom properties, React Flow overrides |

### Shared Infrastructure

| Directory | Files | Purpose |
|-----------|-------|---------|
| src/shared/api/ | api-client.ts, sync.ts, useApiClient.ts, useDataSync.ts, index.ts | Backend API integration |
| src/shared/hooks/ | useAutoSave.ts, useUserSession.ts, index.ts | Shared React hooks |
| src/shared/identity/ | useIdentity.ts, index.ts | Clerk identity utilities |
| src/shared/schemas/ | model.schema.ts, index.ts | Zod schemas and TypeScript types |
| src/shared/stores/ | model.store.ts, workspace.store.ts, activity.store.ts, index.ts | Zustand state management |
| src/shared/ui/ | Button/, Card/, Dialog/, Input/, Select/, Tabs/, Tooltip/, etc. | shadcn/ui component library |
| src/shared/utils/ | cn.ts, index.ts | Utility functions |

### Domain Modules

| Directory | Key Files | Purpose |
|-----------|-----------|---------|
| src/domains/analytics/ | hooks/useStats.ts, components/StatCard/, DatabaseChart/, StatusChart/, RecentActivity/ | Analytics dashboard |
| src/domains/dashboard/ | hooks/useWorkspaceActions.ts, components/WorkspaceList/, WorkspaceCard/, CreateWorkspaceDialog/ | Workspace management |
| src/domains/model-designer/ | hooks/useCanvasActions.ts, useHotkeys.ts, components/DesignCanvas/, EntityNode/, InspectorPanel/, RelationEdge/, Toolbar/, CanvasContextMenu/ | Visual modeling canvas |
| src/domains/preview-pane/ | generators/*, hooks/useCodePreview.ts, components/CodePreview/ | Code generation engine |

### Code Generators

| File | Function | Output |
|------|----------|--------|
| ef-core-generator.ts | generateEFCoreEntities() | C# entity classes with data annotations |
| dbcontext-generator.ts | generateDbContext() | DbContext with Fluent API |
| dto-generator.ts | generateDTOs() | Create/Update/Response DTOs |
| controller-generator.ts | generateControllers() | ASP.NET Core API controllers |
| repository-generator.ts | generateRepositories(), generateServices() | Repository pattern + services |
| sql-generator.ts | generateSqlServerSQL(), generatePostgresSQL(), generateMySQLSQL(), generateSQLiteSQL() | Multi-database DDL |
| openapi-generator.ts | generateOpenAPI() | OpenAPI 3.0 JSON spec |
| helpers.ts | toPascalCase(), getCSharpType(), getSqlType(), etc. | ~380 lines of utilities |
| types.ts | CSHARP_TYPE_MAP, SQL_*_TYPE_MAP, OPENAPI_TYPE_MAP | Type mappings |

### Application Components

| Directory | Purpose |
|-----------|---------|
| src/components/Layout/ | Application layout with sidebar navigation |
| src/components/ErrorBoundary.tsx | React error boundary with error display |
| src/pages/DashboardPage.tsx | Workspace listing page |
| src/pages/DesignerPage.tsx | Model designer with resizable panels |
| src/pages/AnalyticsPage.tsx | Statistics dashboard with charts |

---

## License

See LICENSE file for details.
