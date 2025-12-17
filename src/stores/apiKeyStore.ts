import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface APIKeyState {
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  setOpenAIApiKey: (key: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
}

export const useAPIKeyStore = create<APIKeyState>()(
  persist(
    (set) => ({
      openaiApiKey: '',
      anthropicApiKey: '',
      geminiApiKey: '',
      setOpenAIApiKey: (key) => set({ openaiApiKey: key }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
    }),
    {
      name: 'api-keys-storage',
    }
  )
);

