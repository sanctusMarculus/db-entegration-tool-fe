import { useCallback } from 'react';
import { useModelStore, useActivityStore } from '@/shared/stores';
import type { Position, EntityColor, FieldType, Cardinality, FieldConstraints } from '@/shared/schemas';
import { generateDefaultEntityName, generateDefaultFieldName } from '../utils';

export function useCanvasActions() {
  const {
    model,
    addEntity,
    updateEntity,
    deleteEntity,
    duplicateEntity,
    addField,
    updateField,
    deleteField,
    addRelation,
    deleteRelation,
    selectEntity,
    selectField,
    selectEntityAndField,
    selectRelation,
    clearSelection,
    updateEntityPosition,
    selectedEntityId,
  } = useModelStore();
  
  const addEvent = useActivityStore((state) => state.addEvent);
  
  const handleAddEntity = useCallback(
    (position: Position, color: EntityColor = 'blue') => {
      if (!model) return;
      const existingNames = model.entities.map((e) => e.name);
      const name = generateDefaultEntityName(existingNames);
      const entityId = addEntity(name, position, color);
      addEvent('info', `Created entity "${name}"`);
      return entityId;
    },
    [model, addEntity, addEvent]
  );
  
  const handleUpdateEntity = useCallback(
    (entityId: string, updates: { name?: string; color?: EntityColor; description?: string }) => {
      updateEntity(entityId, updates);
    },
    [updateEntity]
  );
  
  const handleDeleteEntity = useCallback(
    (entityId: string) => {
      const entity = model?.entities.find((e) => e.id === entityId);
      if (entity) {
        deleteEntity(entityId);
        addEvent('info', `Deleted entity "${entity.name}"`);
      }
    },
    [model, deleteEntity, addEvent]
  );
  
  const handleDuplicateEntity = useCallback(
    (entityId: string) => {
      const newId = duplicateEntity(entityId);
      if (newId) {
        addEvent('info', 'Entity duplicated');
      }
      return newId;
    },
    [duplicateEntity, addEvent]
  );
  
  const handleAddField = useCallback(
    (entityId: string, type: FieldType = 'string') => {
      const entity = model?.entities.find((e) => e.id === entityId);
      if (!entity) return;
      
      const existingNames = entity.fields.map((f) => f.name);
      const name = generateDefaultFieldName(existingNames);
      const fieldId = addField(entityId, name, type);
      return fieldId;
    },
    [model, addField]
  );
  
  const handleUpdateField = useCallback(
    (
      entityId: string,
      fieldId: string,
      updates: Partial<{ name: string; type: FieldType; constraints: FieldConstraints }>
    ) => {
      updateField(entityId, fieldId, updates as Parameters<typeof updateField>[2]);
    },
    [updateField]
  );
  
  const handleDeleteField = useCallback(
    (entityId: string, fieldId: string) => {
      deleteField(entityId, fieldId);
    },
    [deleteField]
  );
  
  const handleAddRelation = useCallback(
    (sourceEntityId: string, targetEntityId: string, cardinality: Cardinality = 'one-to-many') => {
      const relationId = addRelation(sourceEntityId, targetEntityId, cardinality);
      addEvent('info', 'Relation created');
      return relationId;
    },
    [addRelation, addEvent]
  );
  
  const handleDeleteRelation = useCallback(
    (relationId: string) => {
      deleteRelation(relationId);
      addEvent('info', 'Relation deleted');
    },
    [deleteRelation, addEvent]
  );
  
  const handleNodeDragStop = useCallback(
    (entityId: string, position: Position) => {
      updateEntityPosition(entityId, position);
    },
    [updateEntityPosition]
  );
  
  const handleSelectEntity = useCallback(
    (entityId: string | null) => {
      selectEntity(entityId);
    },
    [selectEntity]
  );
  
  const handleSelectField = useCallback(
    (fieldId: string | null) => {
      selectField(fieldId);
    },
    [selectField]
  );
  
  const handleSelectEntityAndField = useCallback(
    (entityId: string, fieldId: string) => {
      selectEntityAndField(entityId, fieldId);
    },
    [selectEntityAndField]
  );
  
  const handleSelectRelation = useCallback(
    (relationId: string | null) => {
      selectRelation(relationId);
    },
    [selectRelation]
  );
  
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);
  
  return {
    // Entity actions
    handleAddEntity,
    handleUpdateEntity,
    handleDeleteEntity,
    handleDuplicateEntity,
    
    // Field actions
    handleAddField,
    handleUpdateField,
    handleDeleteField,
    
    // Relation actions
    handleAddRelation,
    handleDeleteRelation,
    
    // Selection & position
    handleNodeDragStop,
    handleSelectEntity,
    handleSelectField,
    handleSelectEntityAndField,
    handleSelectRelation,
    handleClearSelection,
    
    // Current selection
    selectedEntityId,
  };
}
