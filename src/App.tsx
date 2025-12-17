import { useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowEditor } from './components/WorkflowEditor/WorkflowEditor';
import { NodePalette } from './components/NodePalette/NodePalette';
import { Toolbar } from './components/Toolbar/Toolbar';
import { LogPanel } from './components/LogPanel/LogPanel';
import { NodeSettingsPanel } from './components/NodeSettingsPanel/NodeSettingsPanel';
import { useWorkflowStore } from './stores/workflowStore';
import './App.css';

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { addNode } = useWorkflowStore();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');

      if (!data || !reactFlowBounds) {
        return;
      }

      const { type, data: nodeData } = JSON.parse(data);
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      addNode(newNode as any);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="app">
      <Toolbar />
      <div className="app-content">
        <NodePalette />
        <div className="editor-container" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlowProvider>
            <WorkflowEditor />
          </ReactFlowProvider>
        </div>
        <LogPanel />
        <NodeSettingsPanel />
      </div>
    </div>
  );
}

export default App;
