import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { v4 as uuidv4 } from 'uuid';
import type { Workspace, DataModel } from '@/shared/schemas';

// Extended workspace type with backend linking
export interface WorkspaceWithBackend extends Workspace {
  backendProjectId?: string;
  backendSchemaId?: string; // ID of the active schema in backend
}

interface WorkspaceState {
  // Workspace data
  workspaces: WorkspaceWithBackend[];
  activeWorkspaceId: string | null;
  
  // UI State
  isLoading: boolean;
  
  // Workspace actions
  createWorkspace: (name: string, backendProjectId?: string) => string;
  updateWorkspace: (workspaceId: string, updates: Partial<Omit<WorkspaceWithBackend, 'id' | 'models'>>) => void;
  deleteWorkspace: (workspaceId: string) => void;
  setActiveWorkspace: (workspaceId: string | null) => void;
  setWorkspaces: (workspaces: WorkspaceWithBackend[]) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Model within workspace actions
  addModelToWorkspace: (workspaceId: string, model: DataModel) => void;
  updateModelInWorkspace: (workspaceId: string, modelId: string, model: DataModel) => void;
  removeModelFromWorkspace: (workspaceId: string, modelId: string) => void;
  setActiveModel: (workspaceId: string, modelId: string | null) => void;
  
  // Import/Export
  importWorkspace: (data: Workspace) => void;
  exportWorkspace: (workspaceId: string) => Workspace | null;
  importModel: (workspaceId: string, model: DataModel) => void;
  
  // Getters
  getActiveWorkspace: () => WorkspaceWithBackend | null;
  getWorkspaceById: (workspaceId: string) => WorkspaceWithBackend | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      
      createWorkspace: (name, backendProjectId) => {
        const workspaceId = backendProjectId ?? uuidv4();
        const now = new Date().toISOString();
        
        set((state) => {
          const newWorkspace: WorkspaceWithBackend = {
            id: workspaceId,
            name,
            models: [],
            createdAt: now,
            updatedAt: now,
            backendProjectId,
          };
          state.workspaces.push(newWorkspace);
          state.activeWorkspaceId = workspaceId;
        });
        
        return workspaceId;
      },
      
      updateWorkspace: (workspaceId, updates) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            Object.assign(workspace, updates);
            workspace.updatedAt = new Date().toISOString();
          }
        }),
      
      deleteWorkspace: (workspaceId) =>
        set((state) => {
          state.workspaces = state.workspaces.filter((w) => w.id !== workspaceId);
          if (state.activeWorkspaceId === workspaceId) {
            state.activeWorkspaceId = state.workspaces[0]?.id ?? null;
          }
        }),
      
      setActiveWorkspace: (workspaceId) =>
        set((state) => {
          state.activeWorkspaceId = workspaceId;
        }),
      
      setWorkspaces: (workspaces) =>
        set((state) => {
          state.workspaces = workspaces;
        }),
      
      setLoading: (isLoading) =>
        set((state) => {
          state.isLoading = isLoading;
        }),
      
      addModelToWorkspace: (workspaceId, model) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            workspace.models.push(model);
            workspace.activeModelId = model.id;
            workspace.updatedAt = new Date().toISOString();
          }
        }),
      
      updateModelInWorkspace: (workspaceId, modelId, model) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            const index = workspace.models.findIndex((m) => m.id === modelId);
            if (index !== -1) {
              workspace.models[index] = model;
            }
            workspace.updatedAt = new Date().toISOString();
          }
        }),
      
      removeModelFromWorkspace: (workspaceId, modelId) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            workspace.models = workspace.models.filter((m) => m.id !== modelId);
            if (workspace.activeModelId === modelId) {
              workspace.activeModelId = workspace.models[0]?.id;
            }
            workspace.updatedAt = new Date().toISOString();
          }
        }),
      
      setActiveModel: (workspaceId, modelId) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            workspace.activeModelId = modelId ?? undefined;
          }
        }),
      
      importWorkspace: (data) =>
        set((state) => {
          // Assign new ID to avoid conflicts
          const importedWorkspace: Workspace = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          state.workspaces.push(importedWorkspace);
          state.activeWorkspaceId = importedWorkspace.id;
        }),
      
      exportWorkspace: (workspaceId) => {
        const { workspaces } = get();
        const workspace = workspaces.find((w) => w.id === workspaceId);
        return workspace ? JSON.parse(JSON.stringify(workspace)) : null;
      },
      
      importModel: (workspaceId, model) =>
        set((state) => {
          const workspace = state.workspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            // Assign new ID to avoid conflicts
            const importedModel: DataModel = {
              ...model,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            workspace.models.push(importedModel);
            workspace.activeModelId = importedModel.id;
            workspace.updatedAt = new Date().toISOString();
          }
        }),
      
      getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find((w) => w.id === activeWorkspaceId) ?? null;
      },
      
      getWorkspaceById: (workspaceId) => {
        const { workspaces } = get();
        return workspaces.find((w) => w.id === workspaceId);
      },
    })),
    {
      name: 'workspace-store',
    }
  )
);

// Selectors
export const useActiveWorkspace = () =>
  useWorkspaceStore((state) => {
    if (!state.activeWorkspaceId) return null;
    return state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? null;
  });

export const useWorkspaceModels = (workspaceId: string | null) =>
  useWorkspaceStore(useShallow((state) => {
    if (!workspaceId) return [];
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    return workspace?.models ?? [];
  }));
