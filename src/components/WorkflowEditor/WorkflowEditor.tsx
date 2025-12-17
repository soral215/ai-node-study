import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../stores/workflowStore';
import { StartNode } from '../NodeTypes/StartNode';
import { LLMNode } from '../NodeTypes/LLMNode';
import { APINode } from '../NodeTypes/APINode';
import { FunctionNode } from '../NodeTypes/FunctionNode';
import { ConditionNode } from '../NodeTypes/ConditionNode';
import { EndNode } from '../NodeTypes/EndNode';

const nodeTypes: NodeTypes = {
  start: StartNode,
  llm: LLMNode,
  api: APINode,
  function: FunctionNode,
  condition: ConditionNode,
  end: EndNode,
};

export const WorkflowEditor = () => {
  const { nodes, edges, setNodes, setEdges, addEdge: addStoreEdge, setSelectedNodeId, selectedNodeId } = useWorkflowStore();
  
  // 선택된 노드에 selected 클래스 추가
  const nodesWithSelection = nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }));

  // 노드 변경 핸들러
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  // 엣지 변경 핸들러
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      
      // 삭제된 엣지가 있으면 스토어에서도 제거
      changes.forEach((change) => {
        if (change.type === 'remove' && change.id) {
          const { deleteEdge } = useWorkflowStore.getState();
          deleteEdge(change.id);
        }
      });
    },
    [edges, setEdges]
  );

  // 노드 클릭 핸들러
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // 패널 클릭 시 선택 해제
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // 연결 생성
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      const lastEdge = newEdges[newEdges.length - 1];
      if (lastEdge) {
        addStoreEdge(lastEdge);
      }
    },
    [edges, setEdges, addStoreEdge]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

