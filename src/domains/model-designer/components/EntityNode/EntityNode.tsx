import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus, Key, Hash, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button, Badge } from '@/shared/ui';
import type { Entity, Field } from '@/shared/schemas';
import { getEntityColorClass, getEntityBgClass, getFieldTypeIcon } from '../../utils';

interface EntityNodeViewProps {
  entity: Entity;
  isSelected: boolean;
  onAddField: () => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
}

function FieldRow({
  field,
  onSelect,
  onDelete,
}: {
  field: Field;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/50 cursor-pointer text-sm"
      onClick={onSelect}
    >
      {/* Field type icon */}
      <span className="text-xs font-mono text-muted-foreground w-6">
        {getFieldTypeIcon(field.type)}
      </span>
      
      {/* Field name */}
      <span className="flex-1 truncate">{field.name}</span>
      
      {/* Constraints badges */}
      <div className="flex items-center gap-1">
        {field.constraints.isPrimaryKey && (
          <Key className="h-3 w-3 text-warning" />
        )}
        {field.constraints.isRequired && !field.constraints.isPrimaryKey && (
          <span className="text-destructive text-xs">*</span>
        )}
        {field.constraints.isUnique && !field.constraints.isPrimaryKey && (
          <Hash className="h-3 w-3 text-primary" />
        )}
      </div>
      
      {/* Delete button (visible on hover) */}
      <button
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export const EntityNodeView = memo(function EntityNodeView({
  entity,
  isSelected,
  onAddField,
  onFieldSelect,
  onFieldDelete,
}: EntityNodeViewProps) {
  const colorClass = getEntityColorClass(entity.color);
  const bgClass = getEntityBgClass(entity.color);
  
  return (
    <div
      className={cn(
        'bg-card rounded-lg border-2 shadow-lg min-w-[200px] max-w-[280px]',
        colorClass,
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      {/* Header */}
      <div className={cn('px-3 py-2 border-b border-border rounded-t-lg', bgClass)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{entity.name}</h3>
          <Badge variant="outline" className="text-xs">
            {entity.fields.length} fields
          </Badge>
        </div>
        {entity.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {entity.description}
          </p>
        )}
      </div>
      
      {/* Fields list */}
      <div className="py-1 max-h-[200px] overflow-y-auto">
        {entity.fields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            onSelect={() => onFieldSelect(field.id)}
            onDelete={() => onFieldDelete(field.id)}
          />
        ))}
      </div>
      
      {/* Add field button */}
      <div className="px-2 py-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={onAddField}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Field
        </Button>
      </div>
    </div>
  );
});
