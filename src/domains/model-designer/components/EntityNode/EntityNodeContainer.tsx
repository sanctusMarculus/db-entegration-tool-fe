import { useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useCanvasActions } from '../../hooks';
import { EntityNodeView } from './EntityNode';
import type { EntityNodeData } from '../../types';

type EntityNodeProps = NodeProps & { data: EntityNodeData };

export function EntityNodeContainer({ data, selected }: EntityNodeProps) {
  const {
    handleAddField,
    handleDeleteField,
    handleSelectEntity,
    handleSelectField,
  } = useCanvasActions();
  
  const handleAddFieldClick = useCallback(() => {
    handleAddField(data.entity.id);
  }, [data.entity.id, handleAddField]);
  
  const handleFieldSelect = useCallback(
    (fieldId: string) => {
      handleSelectEntity(data.entity.id);
      handleSelectField(fieldId);
    },
    [data.entity.id, handleSelectEntity, handleSelectField]
  );
  
  const handleFieldDelete = useCallback(
    (fieldId: string) => {
      handleDeleteField(data.entity.id, fieldId);
    },
    [data.entity.id, handleDeleteField]
  );
  
  return (
    <EntityNodeView
      entity={data.entity}
      isSelected={selected || data.isSelected}
      onAddField={handleAddFieldClick}
      onFieldSelect={handleFieldSelect}
      onFieldDelete={handleFieldDelete}
    />
  );
}
