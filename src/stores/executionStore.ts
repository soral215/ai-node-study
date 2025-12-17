import { create } from 'zustand';

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface NodeExecutionState {
  status: NodeExecutionStatus;
  result?: any;
  executionTime?: number;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

interface ExecutionState {
  nodeStates: Record<string, NodeExecutionState>;
  setNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void;
  setNodeStatus: (nodeId: string, status: NodeExecutionStatus) => void;
  setNodeResult: (nodeId: string, result: any, executionTime?: number) => void;
  setNodeError: (nodeId: string, error: string) => void;
  clearNodeState: (nodeId: string) => void;
  clearAllStates: () => void;
  getNodeState: (nodeId: string) => NodeExecutionState | undefined;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  nodeStates: {},

  setNodeState: (nodeId, state) =>
    set((prev) => ({
      nodeStates: {
        ...prev.nodeStates,
        [nodeId]: {
          ...prev.nodeStates[nodeId],
          ...state,
        },
      },
    })),

  setNodeStatus: (nodeId, status) => {
    const now = Date.now();
    set((prev) => {
      const currentState = prev.nodeStates[nodeId] || {};
      const newState: NodeExecutionState = {
        ...currentState,
        status,
      };

      if (status === 'running') {
        newState.startedAt = now;
        newState.completedAt = undefined;
        newState.error = undefined;
      } else if (status === 'success' || status === 'error') {
        newState.completedAt = now;
        if (currentState.startedAt) {
          newState.executionTime = now - currentState.startedAt;
        }
      }

      return {
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: newState,
        },
      };
    });
  },

  setNodeResult: (nodeId, result, executionTime) =>
    set((prev) => ({
      nodeStates: {
        ...prev.nodeStates,
        [nodeId]: {
          ...prev.nodeStates[nodeId],
          status: 'success',
          result,
          executionTime,
          completedAt: Date.now(),
        },
      },
    })),

  setNodeError: (nodeId, error) =>
    set((prev) => {
      const currentState = prev.nodeStates[nodeId] || {};
      const now = Date.now();
      return {
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: {
            ...currentState,
            status: 'error',
            error,
            completedAt: now,
            executionTime: currentState.startedAt
              ? now - currentState.startedAt
              : undefined,
          },
        },
      };
    }),

  clearNodeState: (nodeId) =>
    set((prev) => {
      const newStates = { ...prev.nodeStates };
      delete newStates[nodeId];
      return { nodeStates: newStates };
    }),

  clearAllStates: () => set({ nodeStates: {} }),

  getNodeState: (nodeId) => get().nodeStates[nodeId],
}));

