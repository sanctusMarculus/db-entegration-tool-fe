import { useCallback, useMemo, useState } from 'react';
import {
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { useModelStore } from '@/shared/stores';
import { useCanvasActions } from '../../hooks';
import { entityToNode, relationToEdge } from '../../utils';
import { DesignCanvasView } from './DesignCanvas';
import { CanvasContextMenu } from '../CanvasContextMenu';
import type { EntityNode, RelationEdge } from '../../types';

export function DesignCanvasContainer() {
  const model = useModelStore((state) => state.model);
  const selectedEntityId = useModelStore((state) => state.selectedEntityId);
  const selectedRelationId = useModelStore((state) => state.selectedRelationId);
  
  const {
    handleAddEntity,
    handleAddRelation,
    handleNodeDragStop,
    handleSelectEntity,
    handleSelectRelation,
    handleClearSelection,
  } = useCanvasActions();
  
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    canvasPosition: { x: number; y: number };
  } | null>(null);
  
  // Convert model entities to React Flow nodes
  const nodes: EntityNode[] = useMemo(() => {
    if (!model) return [];
    return model.entities.map((entity) =>
      entityToNode(entity, entity.id === selectedEntityId)
    );
  }, [model, selectedEntityId]);
  
  // Convert model relations to React Flow edges
  const edges: RelationEdge[] = useMemo(() => {
    if (!model) return [];
    return model.relations
      .map((relation) => relationToEdge(relation, model.entities))
      .filter((edge): edge is RelationEdge => edge !== null)
      .map((edge) => ({
        ...edge,
        selected: edge.id === selectedRelationId,
      }));
  }, [model, selectedRelationId]);
  
  // Handle node changes (position, selection)
  const onNodesChange = useCallback(
    (_changes: NodeChange[]) => {
      // Node changes are handled through the store
      // Position updates are handled in onNodeDragStop
    },
    []
  );
  
  // Handle edge changes
  const onEdgesChange = useCallback(
    (_changes: EdgeChange[]) => {
      // Edge changes are handled through the store
    },
    []
  );
  
  // Handle new connections (creating relations)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target && connection.source !== connection.target) {
        handleAddRelation(connection.source, connection.target);
      }
    },
    [handleAddRelation]
  );
  
  const handlePaneClick = useCallback(() => {
    handleClearSelection();
    setContextMenu(null);
  }, [handleClearSelection]);
  
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      handleSelectEntity(nodeId);
      setContextMenu(null);
    },
    [handleSelectEntity]
  );
  
  const handleEdgeClick = useCallback(
    (edgeId: string) => {
      handleSelectRelation(edgeId);
      setContextMenu(null);
    },
    [handleSelectRelation]
  );
  
  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent, position: { x: number; y: number }) => {
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        canvasPosition: position,
      });
    },
    []
  );
  
  const handleContextMenuAction = useCallback(
    (action: string) => {
      if (action === 'add-entity' && contextMenu) {
        handleAddEntity(contextMenu.canvasPosition);
      }
      setContextMenu(null);
    },
    [contextMenu, handleAddEntity]
  );
  
  return (
    <>
      <DesignCanvasView
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneContextMenu={handlePaneContextMenu}
      />
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAction={handleContextMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
