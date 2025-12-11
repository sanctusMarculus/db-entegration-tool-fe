import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useModelStore, useWorkspaceStore, useActivityStore } from '@/shared/stores';
import {
  DesignCanvasContainer,
  InspectorPanelContainer,
  ToolbarContainer,
  useHotkeys,
} from '@/domains/model-designer';
import { CodePreviewContainer } from '@/domains/preview-pane';

function DesignerContent() {
  // Enable hotkeys
  useHotkeys();
  
  return (
    <div className="h-full flex flex-col">
      <ToolbarContainer />
      
      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Main Canvas */}
          <Panel defaultSize={60} minSize={40}>
            <DesignCanvasContainer />
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
          
          {/* Right Sidebar */}
          <Panel defaultSize={40} minSize={25}>
            <PanelGroup direction="vertical">
              {/* Inspector */}
              <Panel defaultSize={40} minSize={20}>
                <div className="h-full border-b border-border bg-card overflow-hidden">
                  <InspectorPanelContainer />
                </div>
              </Panel>
              
              <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />
              
              {/* Code Preview */}
              <Panel defaultSize={60} minSize={30}>
                <CodePreviewContainer />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export function DesignerPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  
  const getWorkspaceById = useWorkspaceStore((state) => state.getWorkspaceById);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const createNewModel = useModelStore((state) => state.createNewModel);
  const setModel = useModelStore((state) => state.setModel);
  const addEvent = useActivityStore((state) => state.addEvent);
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!workspaceId) {
      navigate('/');
      return;
    }
    
    const workspace = getWorkspaceById(workspaceId);
    
    if (!workspace) {
      addEvent('error', 'Workspace not found');
      navigate('/');
      return;
    }
    
    setActiveWorkspace(workspaceId);
    
    // Load or create model
    if (workspace.activeModelId) {
      const model = workspace.models.find((m) => m.id === workspace.activeModelId);
      if (model) {
        setModel(model);
      } else {
        createNewModel(`${workspace.name} Model`);
      }
    } else if (workspace.models.length > 0) {
      setModel(workspace.models[0]);
    } else {
      createNewModel(`${workspace.name} Model`);
    }
    
    setIsInitialized(true);
  }, [workspaceId, getWorkspaceById, setActiveWorkspace, createNewModel, setModel, addEvent, navigate]);
  
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return (
    <ReactFlowProvider>
      <DesignerContent />
    </ReactFlowProvider>
  );
}
