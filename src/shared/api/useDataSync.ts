import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApiClient } from './useApiClient';
import { useWorkspaceStore, useActivityStore } from '@/shared/stores';
import { 
  backendSchemaToDataModel, 
  dataModelToBackendSchema,
  backendProjectToWorkspace,
  type SyncedWorkspace,
} from './sync';
import type { DataModel } from '@/shared/schemas';

interface SyncState {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
  lastSyncAt: string | null;
}

interface UseDataSyncReturn extends SyncState {
  syncFromBackend: () => Promise<void>;
  saveModel: (projectId: string, model: DataModel, schemaId?: string) => Promise<string | null>;
  loadProjectSchemas: (projectId: string) => Promise<DataModel[]>;
}

/**
 * Hook for synchronizing data between frontend localStorage and backend
 * 
 * On mount (when user is authenticated), fetches all projects from backend
 * and updates the workspace store with the synced data.
 */
export function useDataSync(): UseDataSyncReturn {
  const { isSignedIn } = useAuth();
  const api = useApiClient();
  const addEvent = useActivityStore((state) => state.addEvent);
  
  // Get workspace store actions
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setLoading = useWorkspaceStore((state) => state.setLoading);
  
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    isSynced: false,
    error: null,
    lastSyncAt: null,
  });
  
  /**
   * Fetch all projects and their schemas from backend
   * Merges with existing local workspaces
   */
  const syncFromBackend = useCallback(async () => {
    if (!isSignedIn) return;
    
    setSyncState(prev => ({ ...prev, isLoading: true, error: null }));
    setLoading(true);
    
    try {
      // Fetch all projects
      const projects = await api.projects.list();
      
      // For each project, fetch its schemas
      const syncedWorkspaces: SyncedWorkspace[] = await Promise.all(
        projects.map(async (project) => {
          const schemas = await api.schemas.listByProject(project.id);
          return backendProjectToWorkspace(project, schemas);
        })
      );
      
      // Replace all workspaces with backend data
      // We don't preserve local-only workspaces because:
      // 1. They might belong to a different user (localStorage persists across sessions)
      // 2. The backend is the source of truth
      // If user wants to keep local work, they should create it on the server
      const mergedWorkspaces = syncedWorkspaces.map(sw => ({
        id: sw.id,
        name: sw.name,
        models: sw.models,
        activeModelId: sw.activeModelId,
        createdAt: sw.createdAt,
        updatedAt: sw.updatedAt,
        backendProjectId: sw.backendProjectId,
      }));
      
      setWorkspaces(mergedWorkspaces);
      
      setSyncState({
        isLoading: false,
        isSynced: true,
        error: null,
        lastSyncAt: new Date().toISOString(),
      });
      
      if (syncedWorkspaces.length > 0) {
        addEvent('success', `Synced ${syncedWorkspaces.length} project(s) from server`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync data';
      setSyncState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: message 
      }));
      addEvent('error', `Sync failed: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, api, setWorkspaces, setLoading, addEvent]);
  
  /**
   * Load schemas for a specific project from backend
   */
  const loadProjectSchemas = useCallback(async (projectId: string): Promise<DataModel[]> => {
    try {
      const schemas = await api.schemas.listByProject(projectId);
      return schemas.map(backendSchemaToDataModel);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load schemas';
      addEvent('error', message);
      return [];
    }
  }, [api, addEvent]);
  
  /**
   * Save a model to backend
   * Creates new schema or updates existing one
   */
  const saveModel = useCallback(async (
    projectId: string, 
    model: DataModel,
    schemaId?: string
  ): Promise<string | null> => {
    try {
      const { schemaJson, uiMetadata } = dataModelToBackendSchema(model);
      
      if (schemaId) {
        // Update existing schema
        await api.schemas.update(schemaId, {
          name: model.name,
          schemaJson,
          uiMetadata,
          changelog: `Updated at ${new Date().toISOString()}`,
        });
        addEvent('success', `Saved "${model.name}" to server`);
        return schemaId;
      } else {
        // Create new schema
        const schema = await api.schemas.create(projectId, {
          name: model.name,
          schemaJson,
          uiMetadata,
        });
        addEvent('success', `Created "${model.name}" on server`);
        return schema.id;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save model';
      addEvent('error', message);
      return null;
    }
  }, [api, addEvent]);
  
  // Auto-sync on mount when authenticated
  useEffect(() => {
    if (isSignedIn && !syncState.isSynced && !syncState.isLoading) {
      syncFromBackend();
    }
  }, [isSignedIn, syncState.isSynced, syncState.isLoading, syncFromBackend]);
  
  return {
    ...syncState,
    syncFromBackend,
    saveModel,
    loadProjectSchemas,
  };
}
