import { useWorkspaceActions } from '../../hooks';
import { CreateWorkspaceDialogView, type CreateWorkspaceFormData } from './CreateWorkspaceDialog';

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
  
  const handleSubmit = async (data: CreateWorkspaceFormData) => {
    const workspaceId = await handleCreateWorkspace(data.name, {
      description: data.description,
      databaseType: data.databaseType,
      color: data.color,
    });
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
