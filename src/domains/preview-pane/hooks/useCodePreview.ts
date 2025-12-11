import { useMemo } from 'react';
import { useModelStore } from '@/shared/stores';
import type { PreviewTab } from '../types';
import {
  generateEntitiesCode,
  generateDtosCode,
  generateControllerCode,
  generateMigrationCode,
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
      case 'dtos':
        return generateDtosCode(model);
      case 'controller':
        return generateControllerCode(model);
      case 'migration':
        return generateMigrationCode(model);
      case 'swagger':
        return generateSwaggerCode(model);
      default:
        return '// Unknown preview type';
    }
  }, [model, tab]);
}
