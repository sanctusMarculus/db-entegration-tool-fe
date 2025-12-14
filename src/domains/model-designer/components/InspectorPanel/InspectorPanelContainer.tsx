import { useCallback } from 'react';
import { useModelStore, useSelectedEntity, useSelectedField } from '@/shared/stores';
import { useCanvasActions } from '../../hooks';
import { InspectorPanelView } from './InspectorPanel';
import type { EntityColor, FieldType } from '@/shared/schemas';

export function InspectorPanelContainer() {
  const selectedEntity = useSelectedEntity();
  const selectedField = useSelectedField();
  const selectedEntityId = useModelStore((state) => state.selectedEntityId);
  const selectedFieldId = useModelStore((state) => state.selectedFieldId);
  
  const {
    handleUpdateEntity,
    handleDeleteEntity,
    handleUpdateField,
    handleDeleteField,
  } = useCanvasActions();
  
  const handleEntityUpdate = useCallback(
    (updates: { name?: string; description?: string; color?: string }) => {
      if (selectedEntityId) {
        handleUpdateEntity(selectedEntityId, {
          ...updates,
          color: updates.color as EntityColor,
        });
      }
    },
    [selectedEntityId, handleUpdateEntity]
  );
  
  const handleEntityDelete = useCallback(() => {
    if (selectedEntityId) {
      handleDeleteEntity(selectedEntityId);
    }
  }, [selectedEntityId, handleDeleteEntity]);
  
  const handleFieldUpdate = useCallback(
    (updates: { name?: string; type?: string }) => {
      if (selectedEntityId && selectedFieldId) {
        // Only include defined properties to avoid overwriting with undefined
        const fieldUpdates: Partial<{ name: string; type: FieldType }> = {};
        if (updates.name !== undefined) {
          fieldUpdates.name = updates.name;
        }
        if (updates.type !== undefined) {
          fieldUpdates.type = updates.type as FieldType;
        }
        handleUpdateField(selectedEntityId, selectedFieldId, fieldUpdates);
      }
    },
    [selectedEntityId, selectedFieldId, handleUpdateField]
  );
  
  const handleFieldDelete = useCallback(() => {
    if (selectedEntityId && selectedFieldId) {
      handleDeleteField(selectedEntityId, selectedFieldId);
    }
  }, [selectedEntityId, selectedFieldId, handleDeleteField]);
  
  const handleFieldConstraintToggle = useCallback(
    (constraint: string, value: boolean | number | undefined) => {
      if (selectedEntityId && selectedFieldId && selectedField) {
        const newConstraints = {
          ...selectedField.constraints,
          [constraint]: value,
        };
        handleUpdateField(selectedEntityId, selectedFieldId, {
          constraints: newConstraints,
        });
      }
    },
    [selectedEntityId, selectedFieldId, selectedField, handleUpdateField]
  );
  
  return (
    <InspectorPanelView
      entity={selectedEntity}
      selectedField={selectedField}
      onEntityUpdate={handleEntityUpdate}
      onEntityDelete={handleEntityDelete}
      onFieldUpdate={handleFieldUpdate}
      onFieldDelete={handleFieldDelete}
      onFieldConstraintToggle={handleFieldConstraintToggle}
    />
  );
}
