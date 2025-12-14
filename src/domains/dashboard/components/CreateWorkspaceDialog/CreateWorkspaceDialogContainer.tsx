import { useWorkspaceActions } from '../../hooks';
import { CreateWorkspaceDialogView } from './CreateWorkspaceDialog';

interface CreateWorkspaceDialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (workspaceId: string) => void;
}

export function CreateWorkspaceDialogContainer({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkspaceDialogContainerProps) {
  const { handleCreateWorkspace } = useWorkspaceActions();
  
  const handleSubmit = async (data: { name: string }) => {
    const workspaceId = await handleCreateWorkspace(data.name);
    onCreated?.(workspaceId);
  };
  
  return (
    <CreateWorkspaceDialogView
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
