import { useMemo } from 'react';
import { useModelStore } from '@/shared/stores';
import type { PreviewTab } from '../types';
import {
  generateEntitiesCode,
  generateDbContextCode,
  generateDtosCode,
  generateControllerCode,
  generateRepositoryCode,
  generateServiceCode,
  generateMigrationCode,
  generatePostgresMigrationCode,
  generateMySQLMigrationCode,
  generateSQLiteMigrationCode,
  generateSwaggerCode,
} from '../utils';

export function useCodePreview(tab: PreviewTab): string {
  const model = useModelStore((state) => state.model);
  
  return useMemo(() => {
    if (!model) {
      return '// No model loaded';
    }
    
    switch (tab) {
      case 'entities':
        return generateEntitiesCode(model);
      case 'dbcontext':
        return generateDbContextCode(model);
      case 'dtos':
        return generateDtosCode(model);
      case 'controller':
        return generateControllerCode(model);
      case 'repository':
        return generateRepositoryCode(model);
      case 'services':
        return generateServiceCode(model);
      case 'migration':
        return generateMigrationCode(model);
      case 'migration-postgres':
        return generatePostgresMigrationCode(model);
      case 'migration-mysql':
        return generateMySQLMigrationCode(model);
      case 'migration-sqlite':
        return generateSQLiteMigrationCode(model);
      case 'swagger':
        return generateSwaggerCode(model);
      default:
        return '// Unknown preview type';
    }
  }, [model, tab]);
}
