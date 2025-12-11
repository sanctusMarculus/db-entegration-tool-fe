import { useWorkspaceStore } from '@/shared/stores';
import { useWorkspaceActions } from '../../hooks';
import { formatWorkspaceForList } from '../../utils';
import { WorkspaceCardView } from './WorkspaceCard';

interface WorkspaceCardContainerProps {
  workspaceId: string;
}

export function WorkspaceCardContainer({ workspaceId }: WorkspaceCardContainerProps) {
  const workspace = useWorkspaceStore((state) =>
    state.workspaces.find((w) => w.id === workspaceId)
  );
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  
  const { handleSelectWorkspace, handleDeleteWorkspace, handleExportWorkspace } =
    useWorkspaceActions();
  
  if (!workspace) return null;
  
  const workspaceItem = formatWorkspaceForList(workspace);
  
  return (
    <WorkspaceCardView
      workspace={workspaceItem}
      isActive={activeWorkspaceId === workspaceId}
      onSelect={() => handleSelectWorkspace(workspaceId)}
      onDelete={() => handleDeleteWorkspace(workspaceId, workspace.name)}
      onExport={() => handleExportWorkspace(workspaceId)}
    />
  );
}
