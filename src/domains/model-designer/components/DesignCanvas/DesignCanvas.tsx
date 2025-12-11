import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EntityNodeContainer } from '../EntityNode';
import { RelationEdgeView } from '../RelationEdge';
import type { EntityNode, RelationEdge, EntityNodeData, RelationEdgeData } from '../../types';

interface DesignCanvasViewProps {
  nodes: EntityNode[];
  edges: RelationEdge[];
  onNodesChange: OnNodesChange<Node<EntityNodeData>>;
  onEdgesChange: OnEdgesChange<Edge<RelationEdgeData>>;
  onConnect: (connection: Connection) => void;
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
  onPaneClick: () => void;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onPaneContextMenu: (event: React.MouseEvent, position: { x: number; y: number }) => void;
}

const nodeTypes: NodeTypes = {
  entity: EntityNodeContainer,
} as const;

const edgeTypes: EdgeTypes = {
  relation: RelationEdgeView,
} as const;

export function DesignCanvasView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDragStop,
  onPaneClick,
  onNodeClick,
  onEdgeClick,
  onPaneContextMenu,
}: DesignCanvasViewProps) {
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeDragStop(node.id, node.position);
    },
    [onNodeDragStop]
  );
  
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );
  
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      onEdgeClick(edge.id);
    },
    [onEdgeClick]
  );
  
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      onPaneContextMenu(event as React.MouseEvent, position);
    },
    [onPaneContextMenu]
  );
  
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={onPaneClick}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneContextMenu={handlePaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'relation',
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!bg-card !border-border" />
        <MiniMap
          className="!bg-card !border-border"
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              blue: '#3b82f6',
              purple: '#8b5cf6',
              green: '#10b981',
              orange: '#f97316',
              pink: '#ec4899',
              cyan: '#06b6d4',
            };
            return colors[(node.data as { entity: { color: string } }).entity.color] || colors.blue;
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
