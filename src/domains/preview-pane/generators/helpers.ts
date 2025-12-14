/**
 * Helper functions for code generation
 */

import type { Entity, Field, Relation, DataModel } from '@/shared/schemas';
import { CSHARP_TYPE_MAP, getSqlTypeMap, type DatabaseType } from './types';

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to plural form (simple English rules)
 */
export function toPlural(str: string): string {
  if (str.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(v => str.endsWith(v))) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
    return str + 'es';
  }
  if (str.endsWith('f')) {
    return str.slice(0, -1) + 'ves';
  }
  if (str.endsWith('fe')) {
    return str.slice(0, -2) + 'ves';
  }
  return str + 's';
}

/**
 * Sanitize name for use in code (remove spaces, special chars)
 */
export function sanitizeName(str: string): string {
  return str.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Get namespace name from model name
 */
export function getNamespace(modelName: string): string {
  return toPascalCase(sanitizeName(modelName));
}

// ============================================================================
// Entity/Field Helpers
// ============================================================================

/**
 * Get table name for an entity (uses custom tableName or pluralized entity name)
 */
export function getTableName(entity: Entity): string {
  return entity.tableName || toPlural(entity.name);
}

/**
 * Get C# type for a field
 */
export function getCSharpType(field: Field): string {
  const baseType = CSHARP_TYPE_MAP[field.type] || 'object';
  const isNullable = !field.constraints.isRequired && !field.constraints.isPrimaryKey;
  
  // Reference types (string, byte[]) use ? for nullable in C# 8+
  if (baseType === 'string' || baseType === 'byte[]') {
    return isNullable ? `${baseType}?` : baseType;
  }
  
  // Value types use ? for nullable
  return isNullable ? `${baseType}?` : baseType;
}

/**
 * Get SQL type for a field based on database type
 */
export function getSqlType(field: Field, dbType: DatabaseType = 'sqlserver'): string {
  const typeMap = getSqlTypeMap(dbType);
  let sqlType = typeMap[field.type] || 'VARCHAR(255)';
  
  // Handle string length
  if (field.type === 'string') {
    if (field.constraints.maxLength) {
      sqlType = dbType === 'sqlserver' 
        ? `NVARCHAR(${field.constraints.maxLength})`
        : dbType === 'sqlite'
        ? 'TEXT'
        : `VARCHAR(${field.constraints.maxLength})`;
    } else {
      sqlType = dbType === 'sqlserver' ? 'NVARCHAR(MAX)' 
        : dbType === 'postgresql' ? 'TEXT'
        : dbType === 'sqlite' ? 'TEXT'
        : 'TEXT';
    }
  }
  
  // Handle decimal precision
  if (field.type === 'decimal') {
    const precision = field.constraints.precision ?? 18;
    const scale = field.constraints.scale ?? 2;
    sqlType = dbType === 'sqlite' ? 'REAL' : `DECIMAL(${precision}, ${scale})`;
  }
  
  return sqlType;
}

/**
 * Get primary key field for an entity
 */
export function getPrimaryKeyField(entity: Entity): Field | undefined {
  return entity.fields.find(f => f.constraints.isPrimaryKey);
}

/**
 * Get entity by ID from model
 */
export function getEntityById(model: DataModel, entityId: string): Entity | undefined {
  return model.entities.find(e => e.id === entityId);
}

/**
 * Get relations for an entity (both outgoing and incoming)
 */
export function getEntityRelations(entity: Entity, relations: Relation[]) {
  const outgoing = relations.filter(r => r.sourceEntityId === entity.id);
  const incoming = relations.filter(r => r.targetEntityId === entity.id);
  return { outgoing, incoming };
}

// ============================================================================
// C# Code Generation Helpers
// ============================================================================

/**
 * Get default value expression for a field in C#
 */
export function getDefaultValueExpression(field: Field): string {
  if (field.constraints.defaultValue) {
    const defaultVal = field.constraints.defaultValue;
    
    switch (field.type) {
      case 'string':
        return ` = "${defaultVal}";`;
      case 'bool':
        return ` = ${defaultVal.toLowerCase()};`;
      case 'Guid':
        if (defaultVal.toLowerCase() === 'newguid' || defaultVal.toLowerCase() === 'newid') {
          return ' = Guid.NewGuid();';
        }
        return ` = Guid.Parse("${defaultVal}");`;
      case 'DateTime':
        if (defaultVal.toLowerCase() === 'now' || defaultVal.toLowerCase() === 'getdate') {
          return ' = DateTime.Now;';
        }
        if (defaultVal.toLowerCase() === 'utcnow' || defaultVal.toLowerCase() === 'getutcdate') {
          return ' = DateTime.UtcNow;';
        }
        return '';
      default:
        return ` = ${defaultVal};`;
    }
  }
  
  // Required strings need initialization
  if (field.type === 'string' && field.constraints.isRequired) {
    return ' = string.Empty;';
  }
  
  return '';
}

/**
 * Generate C# data annotations for a field
 */
export function generateFieldAttributes(field: Field): string[] {
  const attrs: string[] = [];
  
  // Primary Key
  if (field.constraints.isPrimaryKey) {
    attrs.push('[Key]');
    if (field.constraints.isAutoGenerated) {
      if (field.type === 'int' || field.type === 'long') {
        attrs.push('[DatabaseGenerated(DatabaseGeneratedOption.Identity)]');
      } else if (field.type === 'Guid') {
        attrs.push('[DatabaseGenerated(DatabaseGeneratedOption.Identity)]');
      }
    }
  }
  
  // Required (for reference types only - value types are required by default)
  if (field.constraints.isRequired && !field.constraints.isPrimaryKey && field.type === 'string') {
    attrs.push('[Required]');
  }
  
  // String length validations
  if (field.type === 'string') {
    if (field.constraints.maxLength && field.constraints.minLength) {
      attrs.push(`[StringLength(${field.constraints.maxLength}, MinimumLength = ${field.constraints.minLength})]`);
    } else if (field.constraints.maxLength) {
      attrs.push(`[MaxLength(${field.constraints.maxLength})]`);
    } else if (field.constraints.minLength) {
      attrs.push(`[MinLength(${field.constraints.minLength})]`);
    }
  }
  
  // Regex validation
  if (field.constraints.regex) {
    // Escape backslashes for C# verbatim string
    const escapedRegex = field.constraints.regex.replace(/\\/g, '\\\\');
    attrs.push(`[RegularExpression(@"${escapedRegex}")]`);
  }
  
  // Precision for decimal
  if (field.type === 'decimal' && (field.constraints.precision || field.constraints.scale)) {
    const precision = field.constraints.precision ?? 18;
    const scale = field.constraints.scale ?? 2;
    attrs.push(`[Precision(${precision}, ${scale})]`);
  }
  
  // Column type for JSON
  if (field.type === 'json') {
    attrs.push('[Column(TypeName = "nvarchar(max)")]');
  }
  
  return attrs;
}

/**
 * Get foreign key name for a relationship
 */
export function getForeignKeyName(targetEntity: Entity): string {
  return `${toPascalCase(targetEntity.name)}Id`;
}

/**
 * Get navigation property name (singular or plural based on cardinality)
 */
export function getNavigationPropertyName(entity: Entity, isCollection: boolean): string {
  return isCollection ? toPlural(toPascalCase(entity.name)) : toPascalCase(entity.name);
}

// ============================================================================
// SQL Generation Helpers
// ============================================================================

/**
 * Get SQL column definition
 */
export function getSqlColumnDefinition(
  field: Field, 
  dbType: DatabaseType = 'sqlserver'
): string {
  const sqlType = getSqlType(field, dbType);
  const nullable = field.constraints.isRequired || field.constraints.isPrimaryKey ? 'NOT NULL' : 'NULL';
  
  let definition = `${sqlType} ${nullable}`;
  
  // Primary key
  if (field.constraints.isPrimaryKey) {
    if (dbType === 'sqlserver') {
      definition += ' PRIMARY KEY';
    } else if (dbType === 'postgresql') {
      definition += ' PRIMARY KEY';
    } else if (dbType === 'mysql') {
      definition += ' PRIMARY KEY';
    } else if (dbType === 'sqlite') {
      definition += ' PRIMARY KEY';
    }
  }
  
  // Auto-increment
  if (field.constraints.isAutoGenerated) {
    if (field.type === 'int' || field.type === 'long') {
      if (dbType === 'sqlserver') {
        definition = definition.replace(sqlType, `${sqlType} IDENTITY(1,1)`);
      } else if (dbType === 'postgresql') {
        definition = definition.replace(sqlType, 'SERIAL');
        if (field.type === 'long') {
          definition = definition.replace('SERIAL', 'BIGSERIAL');
        }
      } else if (dbType === 'mysql') {
        definition += ' AUTO_INCREMENT';
      } else if (dbType === 'sqlite') {
        // SQLite AUTOINCREMENT only works with INTEGER PRIMARY KEY
        if (field.constraints.isPrimaryKey) {
          definition = 'INTEGER PRIMARY KEY AUTOINCREMENT';
        }
      }
    } else if (field.type === 'Guid') {
      if (dbType === 'sqlserver') {
        definition += ' DEFAULT NEWID()';
      } else if (dbType === 'postgresql') {
        definition += ' DEFAULT gen_random_uuid()';
      } else if (dbType === 'mysql') {
        definition += ' DEFAULT (UUID())';
      }
    }
  }
  
  // Default value
  if (field.constraints.defaultValue && !field.constraints.isAutoGenerated) {
    const defaultVal = field.constraints.defaultValue;
    
    if (field.type === 'string') {
      definition += ` DEFAULT '${defaultVal}'`;
    } else if (field.type === 'bool') {
      const boolVal = defaultVal.toLowerCase() === 'true' ? '1' : '0';
      definition += ` DEFAULT ${boolVal}`;
    } else if (field.type === 'DateTime') {
      if (defaultVal.toLowerCase() === 'now' || defaultVal.toLowerCase() === 'getdate') {
        if (dbType === 'sqlserver') {
          definition += ' DEFAULT GETDATE()';
        } else if (dbType === 'postgresql') {
          definition += ' DEFAULT CURRENT_TIMESTAMP';
        } else if (dbType === 'mysql') {
          definition += ' DEFAULT CURRENT_TIMESTAMP';
        } else if (dbType === 'sqlite') {
          definition += " DEFAULT (datetime('now'))";
        }
      }
    } else {
      definition += ` DEFAULT ${defaultVal}`;
    }
  }
  
  return definition;
}

/**
 * Get column name with proper quoting for database type
 */
export function quoteIdentifier(name: string, dbType: DatabaseType = 'sqlserver'): string {
  switch (dbType) {
    case 'sqlserver':
      return `[${name}]`;
    case 'postgresql':
      return `"${name}"`;
    case 'mysql':
      return `\`${name}\``;
    case 'sqlite':
      return `"${name}"`;
    default:
      return `[${name}]`;
  }
}

// ============================================================================
// Line/Indentation Helpers
// ============================================================================

/**
 * Indent lines by a specified number of spaces
 */
export function indent(lines: string[], spaces: number = 4): string[] {
  const padding = ' '.repeat(spaces);
  return lines.map(line => line.length > 0 ? `${padding}${line}` : line);
}

/**
 * Join lines with proper line endings
 */
export function joinLines(lines: string[]): string {
  return lines.join('\n');
}
