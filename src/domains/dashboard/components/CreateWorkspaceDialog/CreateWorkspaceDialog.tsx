import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/shared/ui';

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(50, 'Name too long'),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceDialogViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkspaceFormData) => void;
}

export function CreateWorkspaceDialogView({
  isOpen,
  onClose,
  onSubmit,
}: CreateWorkspaceDialogViewProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '' },
  });
  
  const handleFormSubmit = (data: CreateWorkspaceFormData) => {
    onSubmit(data);
    reset();
    onClose();
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              A workspace contains your data models and configurations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium" htmlFor="workspace-name">
              Workspace Name
            </label>
            <Input
              id="workspace-name"
              placeholder="My Database Project"
              className="mt-1.5"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
