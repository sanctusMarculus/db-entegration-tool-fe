import { useCallback } from 'react';
import { useWorkspaceStore, useActivityStore } from '@/shared/stores';
import { downloadWorkspaceAsJson, parseImportedWorkspace } from '../utils';

export function useWorkspaceActions() {
  const {
    createWorkspace,
    deleteWorkspace,
    importWorkspace,
    exportWorkspace,
    setActiveWorkspace,
  } = useWorkspaceStore();
  
  const addEvent = useActivityStore((state) => state.addEvent);
  
  const handleCreateWorkspace = useCallback(
    (name: string) => {
      const id = createWorkspace(name);
      addEvent('success', `Created workspace "${name}"`);
      return id;
    },
    [createWorkspace, addEvent]
  );
  
  const handleDeleteWorkspace = useCallback(
    (workspaceId: string, workspaceName: string) => {
      deleteWorkspace(workspaceId);
      addEvent('info', `Deleted workspace "${workspaceName}"`);
    },
    [deleteWorkspace, addEvent]
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
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const workspace = parseImportedWorkspace(content);
        if (workspace) {
          importWorkspace(workspace);
          addEvent('success', `Imported workspace "${workspace.name}"`);
        } else {
          addEvent('error', 'Failed to import workspace: Invalid format');
        }
      };
      reader.onerror = () => {
        addEvent('error', 'Failed to read workspace file');
      };
      reader.readAsText(file);
    },
    [importWorkspace, addEvent]
  );
  
  const handleSelectWorkspace = useCallback(
    (workspaceId: string) => {
      setActiveWorkspace(workspaceId);
    },
    [setActiveWorkspace]
  );
  
  return {
    handleCreateWorkspace,
    handleDeleteWorkspace,
    handleExportWorkspace,
    handleImportWorkspace,
    handleSelectWorkspace,
  };
}
