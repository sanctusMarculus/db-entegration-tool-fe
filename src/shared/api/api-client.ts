/**
 * Database Integration Tool - API Client
 * 
 * A fully typed API client for the backend service.
 * Use this in the frontend to communicate with the backend.
 */

// ============================================================================
// Types
// ============================================================================

export interface EntityField {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  defaultValue?: string;
  maxLength?: number;
  description?: string;
}

export interface EntityNode {
  id: string;
  name: string;
  tableName: string;
  fields: EntityField[];
  description?: string;
}

export interface Relationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceField: string;
  targetField: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  onDelete?: 'cascade' | 'restrict' | 'set-null' | 'no-action';
}

export interface SchemaJson {
  entities: EntityNode[];
  relationships: Relationship[];
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface UiMetadata {
  nodePositions: Record<string, NodePosition>;
  zoom?: number;
  pan?: { x: number; y: number };
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Schema {
  id: string;
  projectId: string;
  name: string;
  schemaJson: SchemaJson;
  uiMetadata: UiMetadata | null;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchemaVersion {
  id: string;
  schemaId: string;
  version: number;
  schemaJson: SchemaJson;
  uiMetadata: UiMetadata | null;
  changelog: string | null;
  createdAt: string;
  createdBy: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface CreateSchemaInput {
  name: string;
  schemaJson: SchemaJson;
  uiMetadata?: UiMetadata;
}

export interface UpdateSchemaInput {
  name?: string;
  schemaJson?: SchemaJson;
  uiMetadata?: UiMetadata;
  changelog?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  checks?: Record<string, { status: string; latency?: number; error?: string }>;
}

// ============================================================================
// API Client
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}

export class ApiError extends Error {
  statusCode: number;
  code: string | undefined;
  errors: Record<string, string[]> | undefined;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

interface RawApiResponse {
  data?: unknown;
  error?: {
    message?: string;
    code?: string;
    errors?: Record<string, string[]>;
  };
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getToken } = config;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json() as RawApiResponse;

    if (!response.ok) {
      throw new ApiError(
        data.error?.message ?? 'Request failed',
        response.status,
        data.error?.code,
        data.error?.errors
      );
    }

    return data.data as T;
  }

  return {
    // ========================================================================
    // Health
    // ========================================================================
    health: {
      check: () => request<HealthStatus>('GET', '/health'),
      detailed: () => request<HealthStatus>('GET', '/health/detailed'),
    },

    // ========================================================================
    // Projects
    // ========================================================================
    projects: {
      list: () => request<Project[]>('GET', '/projects'),
      
      get: (id: string) => request<Project>('GET', `/projects/${id}`),
      
      create: (input: CreateProjectInput) => 
        request<Project>('POST', '/projects', input),
      
      update: (id: string, input: UpdateProjectInput) => 
        request<Project>('PATCH', `/projects/${id}`, input),
      
      delete: (id: string) => 
        request<void>('DELETE', `/projects/${id}`),
    },

    // ========================================================================
    // Schemas
    // ========================================================================
    schemas: {
      listByProject: (projectId: string) => 
        request<Schema[]>('GET', `/projects/${projectId}/schemas`),
      
      get: (id: string) => 
        request<Schema>('GET', `/schemas/${id}`),
      
      create: (projectId: string, input: CreateSchemaInput) => 
        request<Schema>('POST', `/projects/${projectId}/schemas`, input),
      
      update: (id: string, input: UpdateSchemaInput) => 
        request<Schema>('PATCH', `/schemas/${id}`, input),
      
      delete: (id: string) => 
        request<void>('DELETE', `/schemas/${id}`),
    },

    // ========================================================================
    // Schema Versions
    // ========================================================================
    versions: {
      list: (schemaId: string) => 
        request<SchemaVersion[]>('GET', `/schemas/${schemaId}/versions`),
      
      get: (schemaId: string, version: number) => 
        request<SchemaVersion>('GET', `/schemas/${schemaId}/versions/${version}`),
      
      restore: (schemaId: string, version: number) => 
        request<Schema>('POST', `/schemas/${schemaId}/versions/${version}/restore`),
    },
  };
}

// ============================================================================
// React Hooks (Optional - if using React)
// ============================================================================

/**
 * Example usage with React and Clerk:
 * 
 * ```tsx
 * import { useAuth } from '@clerk/clerk-react';
 * import { createApiClient } from './api-client';
 * 
 * const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
 * 
 * export function useApiClient() {
 *   const { getToken } = useAuth();
 *   
 *   const client = useMemo(() => createApiClient({
 *     baseUrl: API_URL,
 *     getToken: () => getToken(),
 *   }), [getToken]);
 *   
 *   return client;
 * }
 * ```
 */

export type ApiClient = ReturnType<typeof createApiClient>;
