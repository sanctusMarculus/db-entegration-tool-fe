import type { Entity, Relation } from '@/shared/schemas';
import type { EntityNode, RelationEdge } from './types';

export function entityToNode(entity: Entity, isSelected: boolean): EntityNode {
  return {
    id: entity.id,
    type: 'entity',
    position: entity.position,
    data: {
      entity,
      isSelected,
      onAddField: () => {},
      onEditEntity: () => {},
      onDeleteEntity: () => {},
      onDuplicateEntity: () => {},
      onFieldSelect: () => {},
      onFieldDelete: () => {},
    },
  };
}

export function relationToEdge(
  relation: Relation,
  entities: Entity[]
): RelationEdge | null {
  const sourceEntity = entities.find((e) => e.id === relation.sourceEntityId);
  const targetEntity = entities.find((e) => e.id === relation.targetEntityId);
  
  if (!sourceEntity || !targetEntity) return null;
  
  return {
    id: relation.id,
    source: relation.sourceEntityId,
    target: relation.targetEntityId,
    type: 'relation',
    data: {
      relation,
      sourceEntityName: sourceEntity.name,
      targetEntityName: targetEntity.name,
    },
    animated: true,
    style: { strokeWidth: 2 },
  };
}

export function getEntityColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    blue: 'border-entity-blue',
    purple: 'border-entity-purple',
    green: 'border-entity-green',
    orange: 'border-entity-orange',
    pink: 'border-entity-pink',
    cyan: 'border-entity-cyan',
  };
  return colorMap[color] || colorMap.blue;
}

export function getEntityBgClass(color: string): string {
  const colorMap: Record<string, string> = {
    blue: 'bg-entity-blue/10',
    purple: 'bg-entity-purple/10',
    green: 'bg-entity-green/10',
    orange: 'bg-entity-orange/10',
    pink: 'bg-entity-pink/10',
    cyan: 'bg-entity-cyan/10',
  };
  return colorMap[color] || colorMap.blue;
}

export function getFieldTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    string: 'Aa',
    int: '#',
    long: '#L',
    decimal: '.00',
    double: '.0',
    float: '.f',
    bool: '⊤⊥',
    DateTime: '📅',
    DateOnly: '📆',
    TimeOnly: '🕐',
    Guid: '🔑',
    'byte[]': '[]',
    json: '{}',
  };
  return iconMap[type] || '?';
}

export function generateDefaultEntityName(existingNames: string[]): string {
  let index = 1;
  let name = `Entity${index}`;
  while (existingNames.includes(name)) {
    index++;
    name = `Entity${index}`;
  }
  return name;
}

export function generateDefaultFieldName(existingNames: string[]): string {
  let index = 1;
  let name = `Field${index}`;
  while (existingNames.includes(name)) {
    index++;
    name = `Field${index}`;
  }
  return name;
}
