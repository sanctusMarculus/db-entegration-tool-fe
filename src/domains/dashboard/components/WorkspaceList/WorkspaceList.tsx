import { useRef } from 'react';
import { Plus, Upload, FolderOpen } from 'lucide-react';
import { Button, Card, CardContent } from '@/shared/ui';
import { WorkspaceCardContainer } from '../WorkspaceCard';

interface WorkspaceListViewProps {
  workspaceIds: string[];
  onCreateClick: () => void;
  onImportClick: (file: File) => void;
}

export function WorkspaceListView({
  workspaceIds,
  onCreateClick,
  onImportClick,
}: WorkspaceListViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportClick(file);
      e.target.value = ''; // Reset input
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">
            Manage your database models and projects
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" onClick={handleImportButtonClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </div>
      </div>
      
      {/* Workspace Grid */}
      {workspaceIds.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workspaceIds.map((id) => (
            <WorkspaceCardContainer key={id} workspaceId={id} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No workspaces yet</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
              Create a new workspace to start designing your database models and generating code.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={handleImportButtonClick}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button onClick={onCreateClick}>
                <Plus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
