import { Plus, Download, Save } from 'lucide-react';
import { Button, Badge } from '@/shared/ui';

interface ToolbarViewProps {
  modelName: string;
  isDirty: boolean;
  entitiesCount: number;
  relationsCount: number;
  onAddEntity: () => void;
  onSave: () => void;
  onExport: () => void;
}

export function ToolbarView({
  modelName,
  isDirty,
  entitiesCount,
  relationsCount,
  onAddEntity,
  onSave,
  onExport,
}: ToolbarViewProps) {
  return (
    <div className="h-12 border-b border-border bg-card px-4 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{modelName}</h2>
          {isDirty && (
            <Badge variant="secondary" className="text-xs">
              Unsaved
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{entitiesCount} entities</span>
          <span>•</span>
          <span>{relationsCount} relations</span>
        </div>
      </div>
      
      {/* Center section - Quick actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onAddEntity}>
          <Plus className="h-4 w-4 mr-1" />
          Entity
        </Button>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
}
