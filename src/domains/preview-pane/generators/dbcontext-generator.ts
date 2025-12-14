/**
 * DbContext Generator
 * 
 * Generates Entity Framework Core DbContext with:
 * - DbSet properties for all entities
 * - OnModelCreating with Fluent API
 * - Relationship configurations
 * - Index configurations
 * - Unique constraint configurations
 */

import type { DataModel, Entity, Index, Relation } from '@/shared/schemas';
import { DELETE_BEHAVIOR_MAP } from './types';
import {
  toPascalCase,
  toPlural,
  getNamespace,
  getTableName,
  getPrimaryKeyField,
  getEntityById,
  getEntityRelations,
  getForeignKeyName,
  joinLines,
} from './helpers';

/**
 * Generate entity configuration for OnModelCreating
 */
function generateEntityConfiguration(
  entity: Entity,
  relations: Relation[],
  allEntities: Entity[]
): string[] {
  const lines: string[] = [];
  const entityName = toPascalCase(entity.name);
  const tableName = getTableName(entity);
  const { outgoing } = getEntityRelations(entity, relations);
  
  lines.push(`        // ${entityName} configuration`);
  lines.push(`        modelBuilder.Entity<${entityName}>(entity =>`);
  lines.push('        {');
  
  // Table name
  lines.push(`            entity.ToTable("${tableName}");`);
  lines.push('');
  
  // Primary key
  const pkField = getPrimaryKeyField(entity);
  if (pkField) {
    lines.push(`            entity.HasKey(e => e.${toPascalCase(pkField.name)});`);
    lines.push('');
  }
  
  // Unique constraints on individual fields
  const uniqueFields = entity.fields.filter(f => 
    f.constraints.isUnique && !f.constraints.isPrimaryKey
  );
  
  if (uniqueFields.length > 0) {
    lines.push('            // Unique constraints');
    for (const field of uniqueFields) {
      lines.push(`            entity.HasIndex(e => e.${toPascalCase(field.name)})`);
      lines.push('                .IsUnique();');
    }
    lines.push('');
  }
  
  // Field-specific configurations (precision, etc.)
  const fieldsNeedingConfig = entity.fields.filter(f => 
    (f.type === 'decimal' && (f.constraints.precision || f.constraints.scale)) ||
    f.type === 'json'
  );
  
  if (fieldsNeedingConfig.length > 0) {
    lines.push('            // Property configurations');
    for (const field of fieldsNeedingConfig) {
      if (field.type === 'decimal') {
        const precision = field.constraints.precision ?? 18;
        const scale = field.constraints.scale ?? 2;
        lines.push(`            entity.Property(e => e.${toPascalCase(field.name)})`);
        lines.push(`                .HasPrecision(${precision}, ${scale});`);
      }
      if (field.type === 'json') {
        lines.push(`            entity.Property(e => e.${toPascalCase(field.name)})`);
        lines.push('                .HasColumnType("nvarchar(max)");');
      }
    }
    lines.push('');
  }
  
  // Relationship configurations
  if (outgoing.length > 0) {
    lines.push('            // Relationships');
    for (const rel of outgoing) {
      const targetEntity = getEntityById({ entities: allEntities } as DataModel, rel.targetEntityId);
      if (!targetEntity) continue;
      
      const targetName = toPascalCase(targetEntity.name);
      const fkName = getForeignKeyName(targetEntity);
      const deleteBehavior = DELETE_BEHAVIOR_MAP[rel.onDelete] || 'NoAction';
      
      if (rel.cardinality === 'one-to-many') {
        lines.push(`            entity.HasOne(e => e.${targetName})`);
        lines.push(`                .WithMany(t => t.${toPlural(entityName)})`);
        lines.push(`                .HasForeignKey(e => e.${fkName})`);
        lines.push(`                .OnDelete(DeleteBehavior.${deleteBehavior});`);
      } else if (rel.cardinality === 'one-to-one') {
        lines.push(`            entity.HasOne(e => e.${targetName})`);
        lines.push(`                .WithOne(t => t.${entityName})`);
        lines.push(`                .HasForeignKey<${entityName}>(e => e.${fkName})`);
        lines.push(`                .OnDelete(DeleteBehavior.${deleteBehavior});`);
      } else if (rel.cardinality === 'many-to-many') {
        const joinTableName = `${entityName}${targetName}`;
        lines.push(`            entity.HasMany(e => e.${toPlural(targetName)})`);
        lines.push(`                .WithMany(t => t.${toPlural(entityName)})`);
        lines.push(`                .UsingEntity(j => j.ToTable("${joinTableName}"));`);
      }
      lines.push('');
    }
  }
  
  lines.push('        });');
  
  return lines;
}

/**
 * Generate index configurations
 */
function generateIndexConfigurations(indexes: Index[], entities: Entity[]): string[] {
  const lines: string[] = [];
  
  if (indexes.length === 0) return lines;
  
  lines.push('        // Index configurations');
  
  for (const index of indexes) {
    const entity = entities.find(e => e.id === index.entityId);
    if (!entity) continue;
    
    const entityName = toPascalCase(entity.name);
    
    // Get field names for the index
    const fieldNames = index.fieldIds
      .map(fieldId => entity.fields.find(f => f.id === fieldId)?.name)
      .filter(Boolean)
      .map(name => `e.${toPascalCase(name!)}`);
    
    if (fieldNames.length === 0) continue;
    
    const indexExpr = fieldNames.length === 1 
      ? fieldNames[0] 
      : `new { ${fieldNames.join(', ')} }`;
    
    lines.push(`        modelBuilder.Entity<${entityName}>()`);
    lines.push(`            .HasIndex(e => ${indexExpr})`);
    
    if (index.isUnique) {
      lines.push('            .IsUnique()');
    }
    
    if (index.isClustered) {
      lines.push('            .IsClustered()');
    }
    
    lines.push(`            .HasDatabaseName("${index.name}");`);
    lines.push('');
  }
  
  return lines;
}

/**
 * Generate complete DbContext class
 */
export function generateDbContext(model: DataModel): string {
  const namespace = getNamespace(model.name);
  const contextName = `${namespace}DbContext`;
  
  const lines: string[] = [];
  
  // Using statements
  lines.push('using Microsoft.EntityFrameworkCore;');
  lines.push(`using ${namespace}.Entities;`);
  lines.push('');
  lines.push(`namespace ${namespace}.Data;`);
  lines.push('');
  
  // Class declaration
  lines.push(`public class ${contextName} : DbContext`);
  lines.push('{');
  
  // Constructor
  lines.push(`    public ${contextName}(DbContextOptions<${contextName}> options) : base(options)`);
  lines.push('    {');
  lines.push('    }');
  lines.push('');
  
  // DbSet properties
  lines.push('    // DbSet properties');
  for (const entity of model.entities) {
    const entityName = toPascalCase(entity.name);
    const tableName = toPlural(entityName);
    lines.push(`    public DbSet<${entityName}> ${tableName} { get; set; } = null!;`);
  }
  lines.push('');
  
  // OnModelCreating
  lines.push('    protected override void OnModelCreating(ModelBuilder modelBuilder)');
  lines.push('    {');
  lines.push('        base.OnModelCreating(modelBuilder);');
  lines.push('');
  
  // Entity configurations
  for (const entity of model.entities) {
    const configLines = generateEntityConfiguration(
      entity,
      model.relations,
      model.entities
    );
    lines.push(...configLines);
    lines.push('');
  }
  
  // Index configurations
  const indexLines = generateIndexConfigurations(model.indexes, model.entities);
  if (indexLines.length > 0) {
    lines.push(...indexLines);
  }
  
  lines.push('    }');
  lines.push('}');
  
  return joinLines(lines);
}
