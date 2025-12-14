/**
 * EF Core Entity Generator
 * 
 * Generates Entity Framework Core entity classes with:
 * - Full data annotations
 * - Navigation properties for relationships
 * - Foreign key properties
 * - Proper nullability
 */

import type { DataModel, Entity, Relation } from '@/shared/schemas';
import {
  toPascalCase,
  toPlural,
  getNamespace,
  getTableName,
  getCSharpType,
  getPrimaryKeyField,
  getEntityById,
  getEntityRelations,
  getDefaultValueExpression,
  generateFieldAttributes,
  getForeignKeyName,
  joinLines,
} from './helpers';

/**
 * Generate a single entity class
 */
function generateEntityClass(
  entity: Entity,
  relations: Relation[],
  allEntities: Entity[]
): string[] {
  const lines: string[] = [];
  const tableName = getTableName(entity);
  const { outgoing, incoming } = getEntityRelations(entity, relations);
  
  // Table attribute if custom name
  if (entity.tableName && entity.tableName !== toPlural(entity.name)) {
    lines.push(`[Table("${tableName}")]`);
  }
  
  // Class declaration
  lines.push(`public class ${toPascalCase(entity.name)}`);
  lines.push('{');
  
  // === FIELD PROPERTIES ===
  if (entity.fields.length > 0) {
    lines.push('    // Properties');
  }
  
  for (const field of entity.fields) {
    // Generate attributes
    const attrs = generateFieldAttributes(field);
    for (const attr of attrs) {
      lines.push(`    ${attr}`);
    }
    
    // Generate property
    const csharpType = getCSharpType(field);
    const defaultValue = getDefaultValueExpression(field);
    lines.push(`    public ${csharpType} ${toPascalCase(field.name)} { get; set; }${defaultValue}`);
    lines.push('');
  }
  
  // === FOREIGN KEY PROPERTIES ===
  // For outgoing relations where this entity is the "many" or "dependent" side
  const fkProps: string[] = [];
  
  for (const rel of outgoing) {
    const targetEntity = getEntityById({ entities: allEntities } as DataModel, rel.targetEntityId);
    if (!targetEntity) continue;
    
    // One-to-many: source has FK to target (source is the "many" side)
    // One-to-one: source has FK to target
    if (rel.cardinality === 'one-to-many' || rel.cardinality === 'one-to-one') {
      const fkName = getForeignKeyName(targetEntity);
      const pkField = getPrimaryKeyField(targetEntity);
      const fkType = pkField ? getCSharpType({ ...pkField, constraints: { ...pkField.constraints, isRequired: false } }) : 'Guid?';
      
      // Check if FK field already exists in entity fields
      const existingFk = entity.fields.find(f => 
        toPascalCase(f.name) === fkName || f.name === fkName
      );
      
      if (!existingFk) {
        fkProps.push(`    // Foreign Key to ${targetEntity.name}`);
        fkProps.push(`    public ${fkType} ${fkName} { get; set; }`);
        fkProps.push('');
      }
    }
  }
  
  if (fkProps.length > 0) {
    lines.push('    // Foreign Keys');
    lines.push(...fkProps);
  }
  
  // === NAVIGATION PROPERTIES ===
  const navProps: string[] = [];
  
  // Outgoing relations (this entity references another)
  for (const rel of outgoing) {
    const targetEntity = getEntityById({ entities: allEntities } as DataModel, rel.targetEntityId);
    if (!targetEntity) continue;
    
    const targetName = toPascalCase(targetEntity.name);
    const fkName = getForeignKeyName(targetEntity);
    
    if (rel.cardinality === 'many-to-many') {
      // Collection navigation for M:N
      navProps.push(`    public virtual ICollection<${targetName}> ${toPlural(targetName)} { get; set; } = new List<${targetName}>();`);
    } else {
      // Reference navigation for 1:1 or M:1
      navProps.push(`    [ForeignKey("${fkName}")]`);
      navProps.push(`    public virtual ${targetName}? ${targetName} { get; set; }`);
    }
    navProps.push('');
  }
  
  // Incoming relations (another entity references this)
  for (const rel of incoming) {
    const sourceEntity = getEntityById({ entities: allEntities } as DataModel, rel.sourceEntityId);
    if (!sourceEntity) continue;
    
    const sourceName = toPascalCase(sourceEntity.name);
    
    if (rel.cardinality === 'one-to-many') {
      // This entity is the "one" side, so it has a collection
      navProps.push(`    public virtual ICollection<${sourceName}> ${toPlural(sourceName)} { get; set; } = new List<${sourceName}>();`);
    } else if (rel.cardinality === 'one-to-one') {
      // Reference navigation for 1:1
      navProps.push(`    public virtual ${sourceName}? ${sourceName} { get; set; }`);
    }
    // M:N: handled in outgoing from the other side
    navProps.push('');
  }
  
  if (navProps.length > 0) {
    lines.push('    // Navigation Properties');
    lines.push(...navProps);
  }
  
  lines.push('}');
  
  return lines;
}

/**
 * Generate all entity classes with using statements and namespace
 */
export function generateEFCoreEntities(model: DataModel): string {
  const namespace = getNamespace(model.name);
  
  const lines: string[] = [];
  
  // Using statements
  lines.push('using System;');
  lines.push('using System.Collections.Generic;');
  lines.push('using System.ComponentModel.DataAnnotations;');
  lines.push('using System.ComponentModel.DataAnnotations.Schema;');
  lines.push('using Microsoft.EntityFrameworkCore;');
  lines.push('');
  lines.push(`namespace ${namespace}.Entities;`);
  lines.push('');
  
  // Generate each entity
  for (let i = 0; i < model.entities.length; i++) {
    const entity = model.entities[i];
    const entityLines = generateEntityClass(entity, model.relations, model.entities);
    lines.push(...entityLines);
    
    // Add blank line between entities
    if (i < model.entities.length - 1) {
      lines.push('');
    }
  }
  
  return joinLines(lines);
}
