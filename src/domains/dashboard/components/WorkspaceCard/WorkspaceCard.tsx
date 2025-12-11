import { FolderOpen, Download, Trash2, Database } from 'lucide-react';
import { cn } from '@/shared/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui';
import type { WorkspaceListItem } from '../../types';

interface WorkspaceCardViewProps {
  workspace: WorkspaceListItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function WorkspaceCardView({
  workspace,
  isActive,
  onSelect,
  onDelete,
  onExport,
}: WorkspaceCardViewProps) {
  const formattedDate = new Date(workspace.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card
          className={cn(
            'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
            isActive && 'border-primary ring-2 ring-primary/20'
          )}
          onClick={onSelect}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{workspace.name}</CardTitle>
                  <CardDescription className="text-xs">
                    Updated {formattedDate}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              <span>{workspace.modelsCount} model{workspace.modelsCount !== 1 ? 's' : ''}</span>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onSelect}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Open Workspace
        </ContextMenuItem>
        <ContextMenuItem onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
