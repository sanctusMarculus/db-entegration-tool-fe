import { useCallback } from 'react';
import { useModelStore, useActivityStore } from '@/shared/stores';
import { useCanvasActions } from '../../hooks';
import { ToolbarView } from './Toolbar';

export function ToolbarContainer() {
  const model = useModelStore((state) => state.model);
  const isDirty = useModelStore((state) => state.isDirty);
  const markClean = useModelStore((state) => state.markClean);
  const addEvent = useActivityStore((state) => state.addEvent);
  
  const { handleAddEntity } = useCanvasActions();
  
  const handleAddEntityClick = useCallback(() => {
    const position = { x: 100, y: 100 };
    handleAddEntity(position);
  }, [handleAddEntity]);
  
  const handleSave = useCallback(() => {
    // In a real app, this would persist to a backend
    markClean();
    addEvent('success', 'Model saved successfully');
  }, [markClean, addEvent]);
  
  const handleExport = useCallback(() => {
    if (!model) return;
    
    const data = JSON.stringify(model, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.name.toLowerCase().replace(/\s+/g, '-')}-model.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addEvent('success', 'Model exported');
  }, [model, addEvent]);
  
  if (!model) return null;
  
  return (
    <ToolbarView
      modelName={model.name}
      isDirty={isDirty}
      entitiesCount={model.entities.length}
      relationsCount={model.relations.length}
      onAddEntity={handleAddEntityClick}
      onSave={handleSave}
      onExport={handleExport}
    />
  );
}
