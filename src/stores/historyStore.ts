import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExecutionLog } from '../types';

export interface WorkflowExecutionHistory {
  id: string;
  workflowName: string;
  startedAt: number;
  completedAt?: number;
  status: 'success' | 'error' | 'cancelled';
  executionTime?: number;
  logs: ExecutionLog[];
  nodeCount: number;
  edgeCount: number;
}

interface HistoryState {
  histories: WorkflowExecutionHistory[];
  addHistory: (history: Omit<WorkflowExecutionHistory, 'id'>) => void;
  getHistory: (id: string) => WorkflowExecutionHistory | undefined;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  getRecentHistories: (limit?: number) => WorkflowExecutionHistory[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      histories: [],

      addHistory: (history) => {
        const id = `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newHistory: WorkflowExecutionHistory = {
          ...history,
          id,
        };

        set((state) => ({
          histories: [newHistory, ...state.histories].slice(0, 100), // 최대 100개만 저장
        }));

        return id;
      },

      getHistory: (id) => get().histories.find((h) => h.id === id),

      deleteHistory: (id) =>
        set((state) => ({
          histories: state.histories.filter((h) => h.id !== id),
        })),

      clearHistory: () => set({ histories: [] }),

      getRecentHistories: (limit = 10) =>
        get()
          .histories.sort((a, b) => b.startedAt - a.startedAt)
          .slice(0, limit),
    }),
    {
      name: 'execution-history-storage',
    }
  )
);


