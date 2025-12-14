import type { DataModel } from '@/shared/schemas';

// Import new modular generators
import { generateEFCoreEntities } from './generators/ef-core-generator';
import { generateDbContext } from './generators/dbcontext-generator';
import { generateDTOs } from './generators/dto-generator';
import { generateControllers } from './generators/controller-generator';
import { generateRepositories, generateServices } from './generators/repository-generator';
import { 
  generateSqlServerSQL, 
  generatePostgresSQL, 
  generateMySQLSQL, 
  generateSQLiteSQL 
} from './generators/sql-generator';
import { generateOpenAPI } from './generators/openapi-generator';

/**
 * ============================================
 * Public API - Backward compatible exports
 * ============================================
 * These functions maintain the same signature as before
 * but now use the new modular generators internally.
 */

// Generate EF Core entity classes
export function generateEntitiesCode(model: DataModel): string {
  return generateEFCoreEntities(model);
}

// Generate DbContext (NEW!)
export function generateDbContextCode(model: DataModel): string {
  return generateDbContext(model);
}

// Generate DTO classes
export function generateDtosCode(model: DataModel): string {
  return generateDTOs(model);
}

// Generate Controller code (now for ALL entities)
export function generateControllerCode(model: DataModel): string {
  return generateControllers(model);
}

// Generate Repository layer (NEW!)
export function generateRepositoryCode(model: DataModel): string {
  return generateRepositories(model);
}

// Generate Service layer (NEW!)
export function generateServiceCode(model: DataModel): string {
  return generateServices(model);
}

// Generate Migration SQL (default: SQL Server)
export function generateMigrationCode(model: DataModel): string {
  return generateSqlServerSQL(model, true);
}

// Generate SQL for specific databases (NEW!)
export function generatePostgresMigrationCode(model: DataModel): string {
  return generatePostgresSQL(model, true);
}

export function generateMySQLMigrationCode(model: DataModel): string {
  return generateMySQLSQL(model, true);
}

export function generateSQLiteMigrationCode(model: DataModel): string {
  return generateSQLiteSQL(model, true);
}

// Generate Swagger/OpenAPI spec (now JSON format)
export function generateSwaggerCode(model: DataModel): string {
  return generateOpenAPI(model);
}

// Re-export generators for direct access
export {
  generateEFCoreEntities,
  generateDbContext,
  generateDTOs,
  generateControllers,
  generateRepositories,
  generateServices,
  generateSqlServerSQL,
  generatePostgresSQL,
  generateMySQLSQL,
  generateSQLiteSQL,
  generateOpenAPI,
};

// Export type maps and helpers for advanced usage
export * from './generators/types';
export * from './generators/helpers';
