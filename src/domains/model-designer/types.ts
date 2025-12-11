import type { Entity, Relation, FieldType, EntityColor, Cardinality } from '@/shared/schemas';
import type { Node, Edge } from '@xyflow/react';

// React Flow node data types
export type EntityNodeData = {
  entity: Entity;
  isSelected: boolean;
  onAddField: () => void;
  onEditEntity: () => void;
  onDeleteEntity: () => void;
  onDuplicateEntity: () => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  [key: string]: unknown;
};

export type EntityNode = Node<EntityNodeData, 'entity'>;

// React Flow edge data types
export type RelationEdgeData = {
  relation: Relation;
  sourceEntityName: string;
  targetEntityName: string;
  [key: string]: unknown;
};

export type RelationEdge = Edge<RelationEdgeData>;

// Field type options for the type selector
export interface FieldTypeOption {
  value: FieldType;
  label: string;
  category: 'primitive' | 'datetime' | 'special';
}

export const FIELD_TYPE_OPTIONS: FieldTypeOption[] = [
  { value: 'string', label: 'String', category: 'primitive' },
  { value: 'int', label: 'Int', category: 'primitive' },
  { value: 'long', label: 'Long', category: 'primitive' },
  { value: 'decimal', label: 'Decimal', category: 'primitive' },
  { value: 'double', label: 'Double', category: 'primitive' },
  { value: 'float', label: 'Float', category: 'primitive' },
  { value: 'bool', label: 'Boolean', category: 'primitive' },
  { value: 'DateTime', label: 'DateTime', category: 'datetime' },
  { value: 'DateOnly', label: 'DateOnly', category: 'datetime' },
  { value: 'TimeOnly', label: 'TimeOnly', category: 'datetime' },
  { value: 'Guid', label: 'Guid', category: 'special' },
  { value: 'byte[]', label: 'Byte Array', category: 'special' },
  { value: 'json', label: 'JSON', category: 'special' },
];

// Entity color options
export interface EntityColorOption {
  value: EntityColor;
  label: string;
  className: string;
}

export const ENTITY_COLOR_OPTIONS: EntityColorOption[] = [
  { value: 'blue', label: 'Blue', className: 'bg-entity-blue' },
  { value: 'purple', label: 'Purple', className: 'bg-entity-purple' },
  { value: 'green', label: 'Green', className: 'bg-entity-green' },
  { value: 'orange', label: 'Orange', className: 'bg-entity-orange' },
  { value: 'pink', label: 'Pink', className: 'bg-entity-pink' },
  { value: 'cyan', label: 'Cyan', className: 'bg-entity-cyan' },
];

// Cardinality options
export interface CardinalityOption {
  value: Cardinality;
  label: string;
  description: string;
}

export const CARDINALITY_OPTIONS: CardinalityOption[] = [
  { value: 'one-to-one', label: '1:1', description: 'One-to-One' },
  { value: 'one-to-many', label: '1:N', description: 'One-to-Many' },
  { value: 'many-to-many', label: 'M:N', description: 'Many-to-Many' },
];

// Canvas context menu actions
export type CanvasAction = 'add-entity' | 'paste' | 'select-all';
export type EntityAction = 'edit' | 'duplicate' | 'delete' | 'add-field' | 'add-relation';
export type FieldAction = 'edit' | 'delete' | 'set-primary' | 'set-required';
