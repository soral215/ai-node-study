import type { LLMNodeData } from '../types';
import { useAPIKeyStore } from '../stores/apiKeyStore';

interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMService {
  async callOpenAI(data: LLMNodeData, prompt: string): Promise<LLMResponse> {
    const apiKey = useAPIKeyStore.getState().openaiApiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const model = data.model || 'gpt-4';
    const temperature = data.temperature ?? 0.7;
    const maxTokens = data.maxTokens || 1000;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `OpenAI API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      content: result.choices[0]?.message?.content || '',
      usage: result.usage,
    };
  }

  async callAnthropic(data: LLMNodeData, prompt: string): Promise<LLMResponse> {
    const apiKey = useAPIKeyStore.getState().anthropicApiKey;
    
    if (!apiKey) {
      throw new Error('Anthropic API 키가 설정되지 않았습니다.');
    }

    const model = data.model || 'claude-3-opus-20240229';
    const maxTokens = data.maxTokens || 1000;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Anthropic API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      content: result.content[0]?.text || '',
      usage: result.usage,
    };
  }

  async callGemini(data: LLMNodeData, prompt: string): Promise<LLMResponse> {
    const apiKey = useAPIKeyStore.getState().geminiApiKey;
    
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const model = data.model || 'gemini-pro';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Gemini API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      content: result.candidates[0]?.content?.parts[0]?.text || '',
    };
  }

  async callLLM(data: LLMNodeData, inputPrompt?: string): Promise<LLMResponse> {
    // inputPrompt가 제공되면 우선 사용, 없으면 data.prompt 사용
    const prompt = inputPrompt !== undefined ? inputPrompt : (data.prompt || '');
    
    if (!prompt) {
      throw new Error('프롬프트가 설정되지 않았습니다.');
    }

    switch (data.provider) {
      case 'openai':
        return this.callOpenAI(data, prompt);
      case 'anthropic':
        return this.callAnthropic(data, prompt);
      case 'gemini':
        return this.callGemini(data, prompt);
      default:
        throw new Error(`지원하지 않는 LLM 제공자: ${data.provider}`);
    }
  }
}

export const llmService = new LLMService();

