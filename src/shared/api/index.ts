export { 
  createApiClient, 
  ApiError,
  type ApiClient,
  type ApiClientConfig,
  type ApiResponse,
  type ApiResult,
  type Project,
  type Schema,
  type SchemaVersion,
  type SchemaJson,
  type UiMetadata,
  type EntityNode,
  type EntityField,
  type Relationship,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateSchemaInput,
  type UpdateSchemaInput,
  type HealthStatus,
} from './api-client';

export { useApiClient } from './useApiClient';
export { useDataSync } from './useDataSync';
export { 
  backendSchemaToDataModel, 
  dataModelToBackendSchema,
  backendProjectToWorkspace,
  type SyncedWorkspace,
} from './sync';
