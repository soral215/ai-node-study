import type { LLMNodeData } from '../types';
import { useAPIKeyStore } from '../stores/apiKeyStore';

interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  refusal?: string | null;
  finishReason?: string;
  model?: string;
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

    // 최신 모델들(GPT-4o, GPT-5 등)은 max_completion_tokens를 사용해야 함
    // 이전 모델들(GPT-4, GPT-3.5)은 max_tokens를 사용
    const useMaxCompletionTokens = model.includes('gpt-4o') || 
                                    model.includes('gpt-5') || 
                                    model.includes('o1') ||
                                    model.includes('o3');

    const requestBody: any = {
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
    };

    // 모델에 따라 적절한 파라미터 사용
    if (useMaxCompletionTokens) {
      requestBody.max_completion_tokens = maxTokens;
    } else {
      requestBody.max_tokens = maxTokens;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `OpenAI API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    const choice = result.choices?.[0];
    const message = choice?.message;
    
    return {
      content: message?.content || '',
      usage: result.usage,
      refusal: message?.refusal || null,
      finishReason: choice?.finish_reason,
      model: result.model,
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

  async callGrok(data: LLMNodeData, prompt: string): Promise<LLMResponse> {
    const apiKey = useAPIKeyStore.getState().grokApiKey;
    
    if (!apiKey) {
      throw new Error('Grok API 키가 설정되지 않았습니다.');
    }

    const model = data.model || 'grok-beta';
    const temperature = data.temperature ?? 0.7;
    const maxTokens = data.maxTokens || 1000;

    // xAI Grok API는 max_tokens 대신 max_completion_tokens를 사용
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
        max_completion_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Grok API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    const choice = result.choices?.[0];
    const message = choice?.message;
    
    return {
      content: message?.content || '',
      usage: result.usage,
      refusal: message?.refusal || null,
      finishReason: choice?.finish_reason,
      model: result.model,
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
      case 'grok':
        return this.callGrok(data, prompt);
      default:
        throw new Error(`지원하지 않는 LLM 제공자: ${data.provider}`);
    }
  }
}

export const llmService = new LLMService();

