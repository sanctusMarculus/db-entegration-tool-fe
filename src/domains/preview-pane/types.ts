export type PreviewTab = 'entities' | 'dtos' | 'controller' | 'migration' | 'swagger';

export interface PreviewTabConfig {
  id: PreviewTab;
  label: string;
  language: string;
}

export const PREVIEW_TABS: PreviewTabConfig[] = [
  { id: 'entities', label: 'EF Core Entities', language: 'csharp' },
  { id: 'dtos', label: 'DTOs', language: 'csharp' },
  { id: 'controller', label: 'Controller', language: 'csharp' },
  { id: 'migration', label: 'Migration', language: 'sql' },
  { id: 'swagger', label: 'Swagger', language: 'yaml' },
];
