import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/shared/stores';
import { useWorkspaceActions } from '../../hooks';
import { WorkspaceListView } from './WorkspaceList';
import { CreateWorkspaceDialogContainer } from '../CreateWorkspaceDialog';

export function WorkspaceListContainer() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Select the workspaces array directly, then derive IDs in useMemo
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const workspaceIds = useMemo(() => workspaces.map((w) => w.id), [workspaces]);
  
  const { handleImportWorkspace } = useWorkspaceActions();
  
  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleWorkspaceCreated = (workspaceId: string) => {
    navigate(`/designer/${workspaceId}`);
  };
  
  return (
    <>
      <WorkspaceListView
        workspaceIds={workspaceIds}
        onCreateClick={handleCreateClick}
        onImportClick={handleImportWorkspace}
      />
      <CreateWorkspaceDialogContainer
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreated={handleWorkspaceCreated}
      />
    </>
  );
}
