// Dashboard domain types
export interface WorkspaceListItem {
  id: string;
  name: string;
  modelsCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface CreateWorkspaceFormData {
  name: string;
}

export interface CreateModelFormData {
  name: string;
  description?: string;
}
