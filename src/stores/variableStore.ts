import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VariableStore {
  global: Record<string, any>;
  workflow: Record<string, any>;
  setGlobal: (key: string, value: any) => void;
  getGlobal: (key: string) => any;
  setWorkflow: (key: string, value: any) => void;
  getWorkflow: (key: string) => any;
  deleteGlobal: (key: string) => void;
  deleteWorkflow: (key: string) => void;
  clearGlobal: () => void;
  clearWorkflow: () => void;
  resolveVariable: (path: string) => any;
}

export const useVariableStore = create<VariableStore>()(
  persist(
    (set, get) => ({
      global: {},
      workflow: {},

      setGlobal: (key, value) =>
        set((state) => ({
          global: { ...state.global, [key]: value },
        })),

      getGlobal: (key) => get().global[key],

      setWorkflow: (key, value) =>
        set((state) => ({
          workflow: { ...state.workflow, [key]: value },
        })),

      getWorkflow: (key) => get().workflow[key],

      deleteGlobal: (key) =>
        set((state) => {
          const newGlobal = { ...state.global };
          delete newGlobal[key];
          return { global: newGlobal };
        }),

      deleteWorkflow: (key) =>
        set((state) => {
          const newWorkflow = { ...state.workflow };
          delete newWorkflow[key];
          return { workflow: newWorkflow };
        }),

      clearGlobal: () => set({ global: {} }),

      clearWorkflow: () => set({ workflow: {} }),

      resolveVariable: (path: string) => {
        const [scope, ...keyParts] = path.split('.');
        const key = keyParts.join('.');

        if (scope === 'global') {
          const value = get().global[key];
          if (keyParts.length > 1) {
            // 중첩된 속성 접근 (예: global.user.name)
            return keyParts.reduce((obj: any, k: string) => obj?.[k], get().global);
          }
          return value;
        }

        if (scope === 'workflow') {
          const value = get().workflow[key];
          if (keyParts.length > 1) {
            return keyParts.reduce((obj: any, k: string) => obj?.[k], get().workflow);
          }
          return value;
        }

        return undefined;
      },
    }),
    {
      name: 'variable-storage',
    }
  )
);

