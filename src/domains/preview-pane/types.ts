export type PreviewTab = 
  | 'entities' 
  | 'dbcontext' 
  | 'dtos' 
  | 'controller' 
  | 'repository' 
  | 'services'
  | 'migration' 
  | 'migration-postgres'
  | 'migration-mysql'
  | 'migration-sqlite'
  | 'swagger';

export interface PreviewTabConfig {
  id: PreviewTab;
  label: string;
  language: string;
}

export const PREVIEW_TABS: PreviewTabConfig[] = [
  { id: 'entities', label: 'Entities', language: 'csharp' },
  { id: 'dbcontext', label: 'DbContext', language: 'csharp' },
  { id: 'dtos', label: 'DTOs', language: 'csharp' },
  { id: 'controller', label: 'Controllers', language: 'csharp' },
  { id: 'repository', label: 'Repository', language: 'csharp' },
  { id: 'services', label: 'Services', language: 'csharp' },
  { id: 'migration', label: 'SQL Server', language: 'sql' },
  { id: 'migration-postgres', label: 'PostgreSQL', language: 'sql' },
  { id: 'migration-mysql', label: 'MySQL', language: 'sql' },
  { id: 'migration-sqlite', label: 'SQLite', language: 'sql' },
  { id: 'swagger', label: 'OpenAPI', language: 'json' },
];
