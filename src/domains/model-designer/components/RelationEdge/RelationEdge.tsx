import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react';
import { Badge } from '@/shared/ui';
import type { RelationEdgeData } from '../../types';
import { CARDINALITY_OPTIONS } from '../../types';

type RelationEdgeProps = EdgeProps & { data?: RelationEdgeData };

export const RelationEdgeView = memo(function RelationEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: RelationEdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  
  const cardinalityLabel =
    CARDINALITY_OPTIONS.find((c) => c.value === data?.relation.cardinality)?.label || '?';
  
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
          strokeWidth: selected ? 3 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <Badge
            variant={selected ? 'default' : 'secondary'}
            className="text-xs cursor-pointer"
          >
            {cardinalityLabel}
          </Badge>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
