import { useEffect, useRef, useCallback } from 'react';
import { useModelStore, useWorkspaceStore, useActivityStore } from '@/shared/stores';
import { useApiClient, dataModelToBackendSchema } from '@/shared/api';
import type { DataModel } from '@/shared/schemas';

interface AutoSaveOptions {
  workspaceId: string;
  /** Minimum time between saves in ms (default: 500ms to prevent API spam during drags) */
  throttleMs?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
}

/**
 * Hook that automatically saves the model to the backend on every change.
 * Uses a minimal throttle to prevent excessive API calls during rapid interactions.
 */
export function useAutoSave({ workspaceId, throttleMs = 500, enabled = true }: AutoSaveOptions) {
  const api = useApiClient();
  
  const getWorkspaceById = useWorkspaceStore((state) => state.getWorkspaceById);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const updateModelInWorkspace = useWorkspaceStore((state) => state.updateModelInWorkspace);
  
  const markClean = useModelStore((state) => state.markClean);
  const addEvent = useActivityStore((state) => state.addEvent);
  
  // Track save state
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<DataModel | null>(null);
  const lastSaveTimeRef = useRef(0);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Save function
  const saveModel = useCallback(async (model: DataModel) => {
    if (!workspaceId || isSavingRef.current) {
      // Queue this save for later
      pendingSaveRef.current = model;
      return;
    }
    
    const workspace = getWorkspaceById(workspaceId);
    if (!workspace?.backendProjectId) {
      // No backend link, just save locally
      updateModelInWorkspace(workspaceId, model.id, model);
      markClean();
      return;
    }
    
    isSavingRef.current = true;
    
    try {
      const { schemaJson, uiMetadata } = dataModelToBackendSchema(model);
      
      if (workspace.backendSchemaId) {
        // Update existing schema
        await api.schemas.update(workspace.backendSchemaId, {
          name: model.name,
          schemaJson,
          uiMetadata,
          changelog: `Auto-saved at ${new Date().toISOString()}`,
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
      lastSaveTimeRef.current = Date.now();
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      addEvent('error', 'Auto-save failed');
      // Still save locally
      updateModelInWorkspace(workspaceId, model.id, model);
      markClean();
    } finally {
      isSavingRef.current = false;
      
      // Process pending save if any
      if (pendingSaveRef.current) {
        const pendingModel = pendingSaveRef.current;
        pendingSaveRef.current = null;
        // Schedule the pending save
        setTimeout(() => saveModel(pendingModel), 100);
      }
    }
  }, [workspaceId, getWorkspaceById, api, updateWorkspace, updateModelInWorkspace, markClean, addEvent]);
  
  // Throttled save trigger
  const triggerSave = useCallback((model: DataModel) => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    
    if (timeSinceLastSave >= throttleMs) {
      // Can save immediately
      saveModel(model);
    } else {
      // Schedule save for later
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      throttleTimerRef.current = setTimeout(() => {
        saveModel(model);
      }, throttleMs - timeSinceLastSave);
    }
  }, [throttleMs, saveModel]);
  
  // Subscribe to model store changes
  useEffect(() => {
    if (!enabled || !workspaceId) return;
    
    const unsubscribe = useModelStore.subscribe(
      (state, prevState) => {
        // Only save if model actually changed (not just selection)
        if (
          state.model &&
          state.isDirty &&
          state.model !== prevState.model &&
          state.model.updatedAt !== prevState.model?.updatedAt
        ) {
          triggerSave(state.model);
        }
      }
    );
    
    return () => {
      unsubscribe();
      // Clear any pending timer on unmount
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [enabled, workspaceId, triggerSave]);
  
  // Manual save function for immediate saves
  const saveNow = useCallback(async () => {
    const model = useModelStore.getState().model;
    if (model) {
      // Clear throttle timer and save immediately
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      lastSaveTimeRef.current = 0; // Reset to allow immediate save
      await saveModel(model);
    }
  }, [saveModel]);
  
  return {
    saveNow,
    isSaving: isSavingRef.current,
  };
}
