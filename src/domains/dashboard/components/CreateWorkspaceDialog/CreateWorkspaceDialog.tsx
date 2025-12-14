import { useForm, Controller } from 'react-hook-form';
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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

// Project configuration options
export const DATABASE_TYPES = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'other', label: 'Other' },
] as const;

export const PROJECT_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
] as const;

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  databaseType: z.enum(['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb', 'other']).optional(),
  color: z.enum(['blue', 'green', 'yellow', 'red', 'purple', 'orange', 'pink', 'gray']).optional(),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

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
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { 
      name: '',
      description: '',
      databaseType: 'postgresql',
      color: 'blue',
    },
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new database project with your preferred configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Project Name */}
            <div>
              <label className="text-sm font-medium" htmlFor="workspace-name">
                Project Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="workspace-name"
                placeholder="My E-commerce Database"
                className="mt-1.5"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="text-sm font-medium" htmlFor="workspace-description">
                Description
              </label>
              <Textarea
                id="workspace-description"
                placeholder="Describe your database project, its purpose, and key entities..."
                className="mt-1.5"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            
            {/* Database Type & Color Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Database Type */}
              <div>
                <label className="text-sm font-medium">Database Type</label>
                <Controller
                  control={control}
                  name="databaseType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select database" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATABASE_TYPES.map((db) => (
                          <SelectItem key={db.value} value={db.value}>
                            {db.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              {/* Project Color */}
              <div>
                <label className="text-sm font-medium">Project Color</label>
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${color.class}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
