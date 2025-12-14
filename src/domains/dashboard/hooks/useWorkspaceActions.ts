import { useCallback } from 'react';
import { useWorkspaceStore, useActivityStore } from '@/shared/stores';
import { useApiClient } from '@/shared/api';
import { downloadWorkspaceAsJson, parseImportedWorkspace } from '../utils';

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
    async (name: string) => {
      try {
        // Create on backend first to get the ID
        const project = await api.projects.create({ name });
        
        // Create locally with backend ID
        const id = createWorkspace(name, project.id);
        addEvent('success', `Created workspace "${name}"`);
        
        return id;
      } catch (error) {
        // Fallback to local-only creation
        console.warn('Failed to create workspace on backend:', error);
        const id = createWorkspace(name);
        addEvent('warning', `Created workspace "${name}" (offline mode)`);
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
  
  const handleImportWorkspace = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const workspace = parseImportedWorkspace(content);
        if (workspace) {
          // Create on backend
          try {
            const project = await api.projects.create({ name: workspace.name });
            // Import locally with backend ID
            importWorkspace({ ...workspace, backendProjectId: project.id } as typeof workspace);
            addEvent('success', `Imported workspace "${workspace.name}"`);
          } catch {
            // Fallback to local-only import
            importWorkspace(workspace);
            addEvent('warning', `Imported workspace "${workspace.name}" (offline mode)`);
          }
        } else {
          addEvent('error', 'Failed to import workspace: Invalid format');
        }
      };
      reader.onerror = () => {
        addEvent('error', 'Failed to read workspace file');
      };
      reader.readAsText(file);
    },
    [importWorkspace, addEvent, api]
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
