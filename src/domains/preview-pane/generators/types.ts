/**
 * Type definitions for code generation
 */

import type { FieldType } from '@/shared/schemas';

// Database type for multi-DB support
export type DatabaseType = 'sqlserver' | 'postgresql' | 'mysql' | 'sqlite';

// C# type mappings
export const CSHARP_TYPE_MAP: Record<FieldType, string> = {
  string: 'string',
  int: 'int',
  long: 'long',
  decimal: 'decimal',
  double: 'double',
  float: 'float',
  bool: 'bool',
  DateTime: 'DateTime',
  DateOnly: 'DateOnly',
  TimeOnly: 'TimeOnly',
  Guid: 'Guid',
  'byte[]': 'byte[]',
  json: 'string',
};

// SQL Server type mappings
export const SQL_SERVER_TYPE_MAP: Record<FieldType, string> = {
  string: 'NVARCHAR',
  int: 'INT',
  long: 'BIGINT',
  decimal: 'DECIMAL',
  double: 'FLOAT',
  float: 'REAL',
  bool: 'BIT',
  DateTime: 'DATETIME2',
  DateOnly: 'DATE',
  TimeOnly: 'TIME',
  Guid: 'UNIQUEIDENTIFIER',
  'byte[]': 'VARBINARY(MAX)',
  json: 'NVARCHAR(MAX)',
};

// PostgreSQL type mappings
export const POSTGRES_TYPE_MAP: Record<FieldType, string> = {
  string: 'VARCHAR',
  int: 'INTEGER',
  long: 'BIGINT',
  decimal: 'NUMERIC',
  double: 'DOUBLE PRECISION',
  float: 'REAL',
  bool: 'BOOLEAN',
  DateTime: 'TIMESTAMP',
  DateOnly: 'DATE',
  TimeOnly: 'TIME',
  Guid: 'UUID',
  'byte[]': 'BYTEA',
  json: 'JSONB',
};

// MySQL type mappings
export const MYSQL_TYPE_MAP: Record<FieldType, string> = {
  string: 'VARCHAR',
  int: 'INT',
  long: 'BIGINT',
  decimal: 'DECIMAL',
  double: 'DOUBLE',
  float: 'FLOAT',
  bool: 'TINYINT(1)',
  DateTime: 'DATETIME',
  DateOnly: 'DATE',
  TimeOnly: 'TIME',
  Guid: 'CHAR(36)',
  'byte[]': 'LONGBLOB',
  json: 'JSON',
};

// SQLite type mappings
export const SQLITE_TYPE_MAP: Record<FieldType, string> = {
  string: 'TEXT',
  int: 'INTEGER',
  long: 'INTEGER',
  decimal: 'REAL',
  double: 'REAL',
  float: 'REAL',
  bool: 'INTEGER',
  DateTime: 'TEXT',
  DateOnly: 'TEXT',
  TimeOnly: 'TEXT',
  Guid: 'TEXT',
  'byte[]': 'BLOB',
  json: 'TEXT',
};

// OpenAPI type mappings
export const OPENAPI_TYPE_MAP: Record<FieldType, { type: string; format?: string }> = {
  string: { type: 'string' },
  int: { type: 'integer', format: 'int32' },
  long: { type: 'integer', format: 'int64' },
  decimal: { type: 'number', format: 'decimal' },
  double: { type: 'number', format: 'double' },
  float: { type: 'number', format: 'float' },
  bool: { type: 'boolean' },
  DateTime: { type: 'string', format: 'date-time' },
  DateOnly: { type: 'string', format: 'date' },
  TimeOnly: { type: 'string', format: 'time' },
  Guid: { type: 'string', format: 'uuid' },
  'byte[]': { type: 'string', format: 'byte' },
  json: { type: 'object' },
};

// Delete behavior mapping
export const DELETE_BEHAVIOR_MAP: Record<string, string> = {
  cascade: 'Cascade',
  restrict: 'Restrict',
  setNull: 'SetNull',
  noAction: 'NoAction',
  CASCADE: 'Cascade',
  RESTRICT: 'Restrict',
  'SET NULL': 'SetNull',
  'NO ACTION': 'NoAction',
};

// Get SQL type map for database type
export function getSqlTypeMap(dbType: DatabaseType): Record<FieldType, string> {
  switch (dbType) {
    case 'postgresql':
      return POSTGRES_TYPE_MAP;
    case 'mysql':
      return MYSQL_TYPE_MAP;
    case 'sqlite':
      return SQLITE_TYPE_MAP;
    default:
      return SQL_SERVER_TYPE_MAP;
  }
}
