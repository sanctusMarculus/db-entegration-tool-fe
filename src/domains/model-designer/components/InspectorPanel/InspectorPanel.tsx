import { z } from 'zod';
import { Trash2 } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import type { Entity, Field } from '@/shared/schemas';
import { FIELD_TYPE_OPTIONS, ENTITY_COLOR_OPTIONS } from '../../types';

const entityFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string(),
});

type EntityFormData = z.infer<typeof entityFormSchema>;

interface InspectorPanelViewProps {
  entity: Entity | null;
  selectedField: Field | null;
  onEntityUpdate: (updates: Partial<EntityFormData>) => void;
  onEntityDelete: () => void;
  onFieldUpdate: (updates: { name?: string; type?: string }) => void;
  onFieldDelete: () => void;
  onFieldConstraintToggle: (constraint: string, value: boolean | number | undefined) => void;
}

export function InspectorPanelView({
  entity,
  selectedField,
  onEntityUpdate,
  onEntityDelete,
  onFieldUpdate,
  onFieldDelete,
  onFieldConstraintToggle,
}: InspectorPanelViewProps) {
  if (!entity) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        <p>Select an entity to inspect</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Entity Inspector */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Entity</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onEntityDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input
              value={entity.name}
              onChange={(e) => onEntityUpdate({ name: e.target.value })}
              className="mt-1 h-8"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input
              value={entity.description || ''}
              onChange={(e) => onEntityUpdate({ description: e.target.value })}
              placeholder="Optional description"
              className="mt-1 h-8"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground">Color</label>
            <Select
              value={entity.color}
              onValueChange={(value) => onEntityUpdate({ color: value })}
            >
              <SelectTrigger className="mt-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${option.className}`}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Field Inspector */}
      {selectedField && (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Field</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onFieldDelete}
              disabled={selectedField.constraints.isPrimaryKey}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input
                value={selectedField.name}
                onChange={(e) => onFieldUpdate({ name: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <Select
                value={selectedField.type}
                onValueChange={(value) => onFieldUpdate({ type: value })}
              >
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Constraints</label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedField.constraints.isRequired}
                  onChange={(e) => onFieldConstraintToggle('isRequired', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Required</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedField.constraints.isUnique}
                  onChange={(e) => onFieldConstraintToggle('isUnique', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Unique</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedField.constraints.isPrimaryKey}
                  onChange={(e) => onFieldConstraintToggle('isPrimaryKey', e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Primary Key</span>
              </label>
              
              {selectedField.type === 'string' && (
                <div className="pt-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Max Length
                  </label>
                  <Input
                    type="number"
                    value={selectedField.constraints.maxLength || ''}
                    onChange={(e) =>
                      onFieldConstraintToggle(
                        'maxLength',
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                    placeholder="No limit"
                    className="mt-1 h-8"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
