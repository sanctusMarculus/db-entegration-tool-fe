/**
 * OpenAPI Generator
 * 
 * Generates OpenAPI 3.0 specification for the data model with:
 * - Full schema definitions for all entities and DTOs
 * - CRUD endpoints for all entities
 * - Request/Response bodies
 * - Parameter definitions
 * - Response types and status codes
 */

import type { DataModel, Entity, Field } from '@/shared/schemas';
import {
  toPascalCase,
  toCamelCase,
  toPlural,
  getPrimaryKeyField,
  getEntityById,
  getForeignKeyName,
} from './helpers';
import { OPENAPI_TYPE_MAP } from './types';

interface OpenAPIDocument {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  components: OpenAPIComponents;
}

interface OpenAPIInfo {
  title: string;
  description: string;
  version: string;
}

interface OpenAPIServer {
  url: string;
  description: string;
}

interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  delete?: OpenAPIOperation;
}

interface OpenAPIOperation {
  tags: string[];
  summary: string;
  operationId: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
}

interface OpenAPIParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  description?: string;
  schema: OpenAPISchema;
}

interface OpenAPIRequestBody {
  required: boolean;
  content: Record<string, { schema: OpenAPISchemaRef }>;
}

interface OpenAPIResponse {
  description: string;
  content?: Record<string, { schema: OpenAPISchemaRef | OpenAPIArraySchema }>;
}

interface OpenAPISchemaRef {
  $ref: string;
}

interface OpenAPIArraySchema {
  type: 'array';
  items: OpenAPISchemaRef;
}

interface OpenAPISchema {
  type: string;
  format?: string;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  description?: string;
  enum?: string[];
  default?: unknown;
}

interface OpenAPIComponents {
  schemas: Record<string, OpenAPIObjectSchema>;
}

interface OpenAPIObjectSchema {
  type: 'object';
  required?: string[];
  properties: Record<string, OpenAPISchema | OpenAPISchemaRef | OpenAPIArraySchema>;
}

/**
 * Get OpenAPI type info for a field
 */
function getOpenAPIType(field: Field): OpenAPISchema {
  const typeInfo = OPENAPI_TYPE_MAP[field.type] || { type: 'string' };
  
  const schema: OpenAPISchema = {
    type: typeInfo.type,
  };
  
  if (typeInfo.format) {
    schema.format = typeInfo.format;
  }
  
  if (!field.constraints.isRequired) {
    schema.nullable = true;
  }
  
  if (field.constraints.minLength !== undefined && field.constraints.minLength !== null) {
    schema.minLength = field.constraints.minLength;
  }
  
  if (field.constraints.maxLength !== undefined && field.constraints.maxLength !== null) {
    schema.maxLength = field.constraints.maxLength;
  }
  
  if (field.constraints.regex) {
    schema.pattern = field.constraints.regex;
  }
  
  if (field.constraints.defaultValue !== undefined && field.constraints.defaultValue !== null && field.constraints.defaultValue !== '') {
    schema.default = field.constraints.defaultValue;
  }
  
  return schema;
}

/**
 * Get OpenAPI type for primary key
 */
function getPkOpenAPIType(field: Field | undefined): OpenAPISchema {
  if (!field) {
    return { type: 'string', format: 'uuid' };
  }
  
  const typeInfo = OPENAPI_TYPE_MAP[field.type];
  return {
    type: typeInfo?.type || 'string',
    format: typeInfo?.format,
  };
}

/**
 * Generate entity schema (for response)
 */
function generateEntitySchema(entity: Entity, model: DataModel): OpenAPIObjectSchema {
  const properties: Record<string, OpenAPISchema | OpenAPISchemaRef | OpenAPIArraySchema> = {};
  const required: string[] = [];
  
  // Add all fields
  for (const field of entity.fields) {
    const fieldName = toCamelCase(field.name);
    properties[fieldName] = getOpenAPIType(field);
    
    if (field.constraints.isRequired || field.constraints.isPrimaryKey) {
      required.push(fieldName);
    }
  }
  
  // Add FK fields for relations where this entity is the source side
  const relationsFrom = model.relations.filter(r => r.sourceEntityId === entity.id);
  for (const relation of relationsFrom) {
    if (relation.cardinality === 'one-to-many' || relation.cardinality === 'one-to-one') {
      const targetEntity = getEntityById(model, relation.targetEntityId);
      if (targetEntity) {
        const targetPk = getPrimaryKeyField(targetEntity);
        const fkName = toCamelCase(getForeignKeyName(targetEntity));
        const fkSchema = getPkOpenAPIType(targetPk);
        fkSchema.nullable = true; // FK is optional by default
        properties[fkName] = fkSchema;
      }
    }
  }
  
  return {
    type: 'object',
    required: required.length > 0 ? required : undefined,
    properties,
  };
}

/**
 * Generate CreateDto schema
 */
function generateCreateDtoSchema(entity: Entity, model: DataModel): OpenAPIObjectSchema {
  const properties: Record<string, OpenAPISchema | OpenAPISchemaRef | OpenAPIArraySchema> = {};
  const required: string[] = [];
  
  // Add fields (excluding primary key)
  for (const field of entity.fields) {
    if (field.constraints.isPrimaryKey) continue;
    
    const fieldName = toCamelCase(field.name);
    properties[fieldName] = getOpenAPIType(field);
    
    if (field.constraints.isRequired) {
      required.push(fieldName);
    }
  }
  
  // Add FK fields for relations
  const relationsFrom = model.relations.filter(r => r.sourceEntityId === entity.id);
  for (const relation of relationsFrom) {
    if (relation.cardinality === 'one-to-many' || relation.cardinality === 'one-to-one') {
      const targetEntity = getEntityById(model, relation.targetEntityId);
      if (targetEntity) {
        const targetPk = getPrimaryKeyField(targetEntity);
        const fkName = toCamelCase(getForeignKeyName(targetEntity));
        const fkSchema = getPkOpenAPIType(targetPk);
        fkSchema.nullable = true;
        
        properties[fkName] = fkSchema;
      }
    }
  }
  
  return {
    type: 'object',
    required: required.length > 0 ? required : undefined,
    properties,
  };
}

/**
 * Generate UpdateDto schema
 */
function generateUpdateDtoSchema(entity: Entity, model: DataModel): OpenAPIObjectSchema {
  const properties: Record<string, OpenAPISchema | OpenAPISchemaRef | OpenAPIArraySchema> = {};
  
  // Add all fields as optional (excluding primary key)
  for (const field of entity.fields) {
    if (field.constraints.isPrimaryKey) continue;
    
    const fieldName = toCamelCase(field.name);
    const schema = getOpenAPIType(field);
    schema.nullable = true;
    properties[fieldName] = schema;
  }
  
  // Add FK fields
  const relationsFrom = model.relations.filter(r => r.sourceEntityId === entity.id);
  for (const relation of relationsFrom) {
    if (relation.cardinality === 'one-to-many' || relation.cardinality === 'one-to-one') {
      const targetEntity = getEntityById(model, relation.targetEntityId);
      if (targetEntity) {
        const targetPk = getPrimaryKeyField(targetEntity);
        const fkName = toCamelCase(getForeignKeyName(targetEntity));
        const fkSchema = getPkOpenAPIType(targetPk);
        fkSchema.nullable = true;
        properties[fkName] = fkSchema;
      }
    }
  }
  
  return {
    type: 'object',
    properties,
  };
}

/**
 * Generate paths for an entity
 */
function generateEntityPaths(entity: Entity): Record<string, OpenAPIPathItem> {
  const entityName = toPascalCase(entity.name);
  const entityNamePlural = toPlural(entityName);
  const entityNameLower = toCamelCase(entityNamePlural);
  const pkField = getPrimaryKeyField(entity);
  const pkSchema = getPkOpenAPIType(pkField);
  
  const paths: Record<string, OpenAPIPathItem> = {};
  
  // Collection path: /api/{entities}
  const collectionPath = `/api/${entityNameLower}`;
  paths[collectionPath] = {
    get: {
      tags: [entityNamePlural],
      summary: `Get all ${entityNamePlural}`,
      operationId: `getAll${entityNamePlural}`,
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page number',
          schema: { type: 'integer', default: 1 } as OpenAPISchema,
        },
        {
          name: 'pageSize',
          in: 'query',
          required: false,
          description: 'Page size',
          schema: { type: 'integer', default: 20 } as OpenAPISchema,
        },
      ],
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: `#/components/schemas/${entityName}ResponseDto` },
              },
            },
          },
        },
      },
    },
    post: {
      tags: [entityNamePlural],
      summary: `Create a new ${entityName}`,
      operationId: `create${entityName}`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/Create${entityName}Dto` },
          },
        },
      },
      responses: {
        '201': {
          description: 'Created',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${entityName}ResponseDto` },
            },
          },
        },
        '400': {
          description: 'Bad Request',
        },
      },
    },
  };
  
  // Item path: /api/{entities}/{id}
  const itemPath = `${collectionPath}/{id}`;
  paths[itemPath] = {
    get: {
      tags: [entityNamePlural],
      summary: `Get ${entityName} by ID`,
      operationId: `get${entityName}ById`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: `${entityName} ID`,
          schema: pkSchema,
        },
      ],
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${entityName}ResponseDto` },
            },
          },
        },
        '404': {
          description: 'Not Found',
        },
      },
    },
    put: {
      tags: [entityNamePlural],
      summary: `Update ${entityName}`,
      operationId: `update${entityName}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: `${entityName} ID`,
          schema: pkSchema,
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: `#/components/schemas/Update${entityName}Dto` },
          },
        },
      },
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${entityName}ResponseDto` },
            },
          },
        },
        '400': {
          description: 'Bad Request',
        },
        '404': {
          description: 'Not Found',
        },
      },
    },
    delete: {
      tags: [entityNamePlural],
      summary: `Delete ${entityName}`,
      operationId: `delete${entityName}`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: `${entityName} ID`,
          schema: pkSchema,
        },
      ],
      responses: {
        '204': {
          description: 'No Content',
        },
        '404': {
          description: 'Not Found',
        },
      },
    },
  };
  
  return paths;
}

/**
 * Generate complete OpenAPI specification
 */
export function generateOpenAPI(model: DataModel): string {
  if (model.entities.length === 0) {
    return JSON.stringify({
      openapi: '3.0.3',
      info: {
        title: `${model.name} API`,
        description: 'No entities defined',
        version: '1.0.0',
      },
      paths: {},
      components: { schemas: {} },
    }, null, 2);
  }
  
  const schemas: Record<string, OpenAPIObjectSchema> = {};
  let paths: Record<string, OpenAPIPathItem> = {};
  
  // Generate schemas and paths for each entity
  for (const entity of model.entities) {
    const entityName = toPascalCase(entity.name);
    
    // Entity response DTO schema
    schemas[`${entityName}ResponseDto`] = generateEntitySchema(entity, model);
    
    // Create DTO schema
    schemas[`Create${entityName}Dto`] = generateCreateDtoSchema(entity, model);
    
    // Update DTO schema
    schemas[`Update${entityName}Dto`] = generateUpdateDtoSchema(entity, model);
    
    // Generate paths
    const entityPaths = generateEntityPaths(entity);
    paths = { ...paths, ...entityPaths };
  }
  
  const openAPIDoc: OpenAPIDocument = {
    openapi: '3.0.3',
    info: {
      title: `${model.name} API`,
      description: `API for ${model.name} data model`,
      version: '1.0.0',
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Production server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    paths,
    components: {
      schemas,
    },
  };
  
  return JSON.stringify(openAPIDoc, null, 2);
}
