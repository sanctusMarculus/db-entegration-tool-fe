import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useModelStore, useWorkspaceStore, useActivityStore } from '@/shared/stores';
import { useApiClient, dataModelToBackendSchema } from '@/shared/api';
import { useCanvasActions } from '../../hooks';
import { ToolbarView } from './Toolbar';

export function ToolbarContainer() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const api = useApiClient();
  
  const model = useModelStore((state) => state.model);
  const isDirty = useModelStore((state) => state.isDirty);
  const markClean = useModelStore((state) => state.markClean);
  
  const getWorkspaceById = useWorkspaceStore((state) => state.getWorkspaceById);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const updateModelInWorkspace = useWorkspaceStore((state) => state.updateModelInWorkspace);
  
  const addEvent = useActivityStore((state) => state.addEvent);
  
  const [isSaving, setIsSaving] = useState(false);
  
  const { handleAddEntity } = useCanvasActions();
  
  const handleAddEntityClick = useCallback(() => {
    const position = { x: 100, y: 100 };
    handleAddEntity(position);
  }, [handleAddEntity]);
  
  const handleSave = useCallback(async () => {
    if (!model || !workspaceId || isSaving) return;
    
    const workspace = getWorkspaceById(workspaceId);
    if (!workspace?.backendProjectId) {
      // No backend link, just save locally
      updateModelInWorkspace(workspaceId, model.id, model);
      markClean();
      addEvent('success', 'Model saved locally');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { schemaJson, uiMetadata } = dataModelToBackendSchema(model);
      
      if (workspace.backendSchemaId) {
        // Update existing schema
        await api.schemas.update(workspace.backendSchemaId, {
          name: model.name,
          schemaJson,
          uiMetadata,
          changelog: `Manual save at ${new Date().toISOString()}`,
        });
      } else {
        // Create new schema
        const schema = await api.schemas.create(workspace.backendProjectId, {
          name: model.name,
          schemaJson,
          uiMetadata,
        });
        // Store the schema ID
        updateWorkspace(workspaceId, { backendSchemaId: schema.id });
      }
      
      // Also update local model
      updateModelInWorkspace(workspaceId, model.id, model);
      markClean();
      addEvent('success', 'Model saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
      addEvent('error', 'Failed to save model');
      // Still save locally
      updateModelInWorkspace(workspaceId, model.id, model);
      markClean();
    } finally {
      setIsSaving(false);
    }
  }, [model, workspaceId, isSaving, getWorkspaceById, api, updateWorkspace, updateModelInWorkspace, markClean, addEvent]);
  
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
      isSaving={isSaving}
      entitiesCount={model.entities.length}
      relationsCount={model.relations.length}
      onAddEntity={handleAddEntityClick}
      onSave={handleSave}
      onExport={handleExport}
    />
  );
}
