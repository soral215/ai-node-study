import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionStatus, type ExecutionLog, type Workflow } from '../types';

interface WorkflowState {
  // 워크플로우 데이터
  nodes: Node[];
  edges: Edge[];
  workflowName: string;
  selectedNodeId: string | null;
  
  // 실행 상태
  executionStatus: ExecutionStatus;
  logs: ExecutionLog[];
  
  // 액션
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Partial<Node['data']>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
  setWorkflowName: (name: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  
  // 실행 관련
  setExecutionStatus: (status: ExecutionStatus) => void;
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // 워크플로우 관리
  saveWorkflow: () => Workflow;
  loadWorkflow: (workflow: Workflow) => void;
  resetWorkflow: () => void;
}

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 100 },
    data: { label: '시작' },
  },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: [],
  workflowName: '새 워크플로우',
  selectedNodeId: null,
  executionStatus: ExecutionStatus.IDLE,
  logs: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  
  updateNode: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    })),
  
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    })),
  
  addEdge: (edge) =>
    set((state) => {
      // 중복 엣지 체크
      const isDuplicate = state.edges.some(
        (e) => e.source === edge.source && e.target === edge.target
      );
      if (isDuplicate) return state;
      return { edges: [...state.edges, edge] };
    }),
  
  deleteEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    })),
  
  setWorkflowName: (name) => set({ workflowName: name }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  
  setExecutionStatus: (status) => set({ executionStatus: status }),
  
  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...log,
          id: uuidv4(),
          timestamp: Date.now(),
        },
      ],
    })),
  
  clearLogs: () => set({ logs: [] }),
  
  saveWorkflow: () => {
    const state = get();
    return {
      id: uuidv4(),
      name: state.workflowName,
      nodes: state.nodes,
      edges: state.edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
  
  loadWorkflow: (workflow) =>
    set({
      nodes: workflow.nodes,
      edges: workflow.edges,
      workflowName: workflow.name,
    }),
  
  resetWorkflow: () =>
    set({
      nodes: initialNodes,
      edges: [],
      workflowName: '새 워크플로우',
      executionStatus: ExecutionStatus.IDLE,
      logs: [],
    }),
}));

