import { v4 as uuidv4 } from 'uuid';
import type { Workspace } from '@/shared/stores';
import type { DataModel } from '@/shared/schemas';
import type { WorkspaceListItem } from './types';

export function formatWorkspaceForList(workspace: Workspace): WorkspaceListItem {
  return {
    id: workspace.id,
    name: workspace.name,
    modelsCount: workspace.models.length,
    updatedAt: workspace.updatedAt,
    createdAt: workspace.createdAt,
  };
}

export function downloadWorkspaceAsJson(workspace: Workspace) {
  const data = JSON.stringify(workspace, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workspace.name.toLowerCase().replace(/\s+/g, '-')}-workspace.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Type guard to check if data is a DataModel (exported from designer)
 */
function isDataModel(data: unknown): data is DataModel {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'entities' in data &&
    Array.isArray((data as DataModel).entities) &&
    'relations' in data &&
    Array.isArray((data as DataModel).relations) &&
    !('models' in data) // Workspace has models array, DataModel doesn't
  );
}

/**
 * Type guard to check if data is a Workspace
 */
function isWorkspace(data: unknown): data is Workspace {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'models' in data &&
    Array.isArray((data as Workspace).models)
  );
}

export type ImportResult = 
  | { type: 'workspace'; data: Workspace }
  | { type: 'model'; data: DataModel }
  | { type: 'error'; message: string };

/**
 * Parse imported file content and determine if it's a Workspace or DataModel
 */
export function parseImportedFile(content: string): ImportResult {
  try {
    const data = JSON.parse(content);
    
    if (isWorkspace(data)) {
      // It's a full workspace export
      return { type: 'workspace', data: data as Workspace };
    }
    
    if (isDataModel(data)) {
      // It's a single model export (from the designer toolbar)
      return { type: 'model', data: data as DataModel };
    }
    
    return { type: 'error', message: 'Unrecognized file format. Expected a workspace or model export.' };
  } catch (e) {
    return { type: 'error', message: 'Invalid JSON file' };
  }
}

/**
 * Convert a DataModel to a Workspace
 * Used when importing a single model export
 */
export function modelToWorkspace(model: DataModel): Workspace {
  const now = new Date().toISOString();
  const workspaceId = uuidv4();
  const modelId = uuidv4();
  
  // Create a new model with fresh ID
  const importedModel: DataModel = {
    ...model,
    id: modelId,
    createdAt: now,
    updatedAt: now,
  };
  
  return {
    id: workspaceId,
    name: model.name.replace(/ Model$/, ''), // Remove " Model" suffix if present
    models: [importedModel],
    activeModelId: modelId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * @deprecated Use parseImportedFile instead
 */
export function parseImportedWorkspace(content: string): Workspace | null {
  const result = parseImportedFile(content);
  
  if (result.type === 'workspace') {
    return result.data;
  }
  
  if (result.type === 'model') {
    return modelToWorkspace(result.data);
  }
  
  return null;
}
