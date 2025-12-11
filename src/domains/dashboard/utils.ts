import type { Workspace } from '@/shared/stores';
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

export function parseImportedWorkspace(content: string): Workspace | null {
  try {
    const data = JSON.parse(content);
    // Basic validation
    if (data && typeof data.name === 'string' && Array.isArray(data.models)) {
      return data as Workspace;
    }
    return null;
  } catch {
    return null;
  }
}
