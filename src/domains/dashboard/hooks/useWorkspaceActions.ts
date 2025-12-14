import { useCallback } from 'react';
import { useWorkspaceStore, useActivityStore } from '@/shared/stores';
import { useApiClient, dataModelToBackendSchema } from '@/shared/api';
import { downloadWorkspaceAsJson, parseImportedFile, modelToWorkspace } from '../utils';
import type { DataModel } from '@/shared/schemas';

interface CreateWorkspaceOptions {
  description?: string;
  databaseType?: string;
  color?: string;
}

export function useWorkspaceActions() {
  const {
    createWorkspace,
    deleteWorkspace,
    importWorkspace,
    exportWorkspace,
    setActiveWorkspace,
    updateWorkspace,
  } = useWorkspaceStore();
  
  const addEvent = useActivityStore((state) => state.addEvent);
  const api = useApiClient();
  
  const handleCreateWorkspace = useCallback(
    async (name: string, options?: CreateWorkspaceOptions) => {
      try {
        // Create on backend first to get the ID
        const project = await api.projects.create({
          name,
          description: options?.description,
          databaseType: options?.databaseType as 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'mongodb' | 'other' | undefined,
          color: options?.color as 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'pink' | 'gray' | undefined,
        });
        
        // Create locally with backend ID
        const id = createWorkspace(name, project.id);
        addEvent('success', `Created project "${name}"`);
        
        return id;
      } catch (error) {
        // Fallback to local-only creation
        console.warn('Failed to create project on backend:', error);
        const id = createWorkspace(name);
        addEvent('warning', `Created project "${name}" (offline mode)`);
        return id;
      }
    },
    [createWorkspace, addEvent, api]
  );
  
  const handleDeleteWorkspace = useCallback(
    async (workspaceId: string, workspaceName: string) => {
      // Get workspace to check if it has a backend ID
      const workspace = useWorkspaceStore.getState().getWorkspaceById(workspaceId);
      
      // Delete locally
      deleteWorkspace(workspaceId);
      addEvent('info', `Deleted workspace "${workspaceName}"`);
      
      // Sync deletion to backend if it exists there
      const backendId = workspace?.backendProjectId ?? workspaceId;
      try {
        await api.projects.delete(backendId);
      } catch (error) {
        // Log but don't fail - local deletion is still valid
        console.warn('Failed to sync workspace deletion to backend:', error);
      }
    },
    [deleteWorkspace, addEvent, api]
  );
  
  const handleExportWorkspace = useCallback(
    (workspaceId: string) => {
      const workspace = exportWorkspace(workspaceId);
      if (workspace) {
        downloadWorkspaceAsJson(workspace);
        addEvent('success', `Exported workspace "${workspace.name}"`);
      }
    },
    [exportWorkspace, addEvent]
  );
  
  /**
   * Import a model to the backend and create schema
   */
  const importModelToBackend = useCallback(
    async (projectId: string, model: DataModel): Promise<string | null> => {
      try {
        const { schemaJson, uiMetadata } = dataModelToBackendSchema(model);
        const schema = await api.schemas.create(projectId, {
          name: model.name,
          schemaJson,
          uiMetadata,
        });
        return schema.id;
      } catch (error) {
        console.error('Failed to create schema on backend:', error);
        return null;
      }
    },
    [api]
  );

  const handleImportWorkspace = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const result = parseImportedFile(content);
        
        if (result.type === 'error') {
          addEvent('error', `Import failed: ${result.message}`);
          return;
        }
        
        // Convert model to workspace if needed
        const workspace = result.type === 'model' 
          ? modelToWorkspace(result.data)
          : result.data;
        
        try {
          // Create project on backend
          const project = await api.projects.create({ 
            name: workspace.name,
            description: `Imported from ${file.name}`,
          });
          
          // Create schemas for each model in the workspace
          let schemaId: string | null = null;
          for (const model of workspace.models) {
            const createdSchemaId = await importModelToBackend(project.id, model);
            if (!schemaId && createdSchemaId) {
              schemaId = createdSchemaId; // Store first schema ID as active
            }
          }
          
          // Import locally with backend IDs
          importWorkspace({
            ...workspace,
            backendProjectId: project.id,
            backendSchemaId: schemaId ?? undefined,
          } as typeof workspace);
          
          addEvent('success', `Imported "${workspace.name}" with ${workspace.models.length} model(s)`);
        } catch (error) {
          console.error('Backend import failed:', error);
          // Fallback to local-only import
          importWorkspace(workspace);
          addEvent('warning', `Imported "${workspace.name}" locally (server sync failed)`);
        }
      };
      
      reader.onerror = () => {
        addEvent('error', 'Failed to read file');
      };
      
      reader.readAsText(file);
    },
    [importWorkspace, addEvent, api, importModelToBackend]
  );
  
  const handleSelectWorkspace = useCallback(
    (workspaceId: string) => {
      setActiveWorkspace(workspaceId);
    },
    [setActiveWorkspace]
  );
  
  // Link a local workspace to a backend project
  const handleLinkToBackend = useCallback(
    async (workspaceId: string, name: string) => {
      try {
        const project = await api.projects.create({ name });
        updateWorkspace(workspaceId, { backendProjectId: project.id });
        addEvent('success', `Linked "${name}" to server`);
        return project.id;
      } catch (error) {
        addEvent('error', 'Failed to link workspace to server');
        return null;
      }
    },
    [api, updateWorkspace, addEvent]
  );
  
  return {
    handleCreateWorkspace,
    handleDeleteWorkspace,
    handleExportWorkspace,
    handleImportWorkspace,
    handleSelectWorkspace,
    handleLinkToBackend,
  };
}
