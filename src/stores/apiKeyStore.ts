import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface APIKeyState {
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  replicateApiKey: string;
  grokApiKey: string;
  setOpenAIApiKey: (key: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setReplicateApiKey: (key: string) => void;
  setGrokApiKey: (key: string) => void;
}

export const useAPIKeyStore = create<APIKeyState>()(
  persist(
      (set) => ({
        openaiApiKey: '',
        anthropicApiKey: '',
        geminiApiKey: '',
        replicateApiKey: '',
        grokApiKey: '',
        setOpenAIApiKey: (key) => set({ openaiApiKey: key }),
        setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
        setGeminiApiKey: (key) => set({ geminiApiKey: key }),
        setReplicateApiKey: (key) => set({ replicateApiKey: key }),
        setGrokApiKey: (key) => set({ grokApiKey: key }),
      }),
    {
      name: 'api-keys-storage',
    }
  )
);

