import type { LLMModel } from '../utils/llmModels';

function toLLMModels(ids: string[], description: string): LLMModel[] {
  return ids
    .filter(Boolean)
    .map((id) => ({ id, name: id, description }));
}

export async function fetchOpenAIModels(apiKey: string): Promise<LLMModel[]> {
  if (!apiKey) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

  const res = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI 모델 목록 조회 실패: ${res.status}`);
  }

  const json = await res.json();
  const ids: string[] = Array.isArray(json?.data) ? json.data.map((m: any) => m?.id).filter(Boolean) : [];

  // 보통은 id가 짧고(= model ID) 우리가 넣는 값이지만, 혹시 몰라 정렬
  ids.sort((a, b) => a.localeCompare(b));

  return toLLMModels(ids, 'API에서 가져옴');
}

export async function fetchGrokModels(apiKey: string): Promise<LLMModel[]> {
  if (!apiKey) throw new Error('Grok API 키가 설정되지 않았습니다.');

  // xAI가 OpenAI 호환 엔드포인트를 제공하는 경우가 많아 동일한 형태를 시도합니다.
  const res = await fetch('https://api.x.ai/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Grok 모델 목록 조회 실패: ${res.status}`);
  }

  const json = await res.json();
  const ids: string[] = Array.isArray(json?.data) ? json.data.map((m: any) => m?.id).filter(Boolean) : [];
  ids.sort((a, b) => a.localeCompare(b));

  return toLLMModels(ids, 'API에서 가져옴');
}

export async function fetchGeminiModels(apiKey: string): Promise<LLMModel[]> {
  if (!apiKey) throw new Error('Gemini API 키가 설정되지 않았습니다.');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini 모델 목록 조회 실패: ${res.status}`);
  }

  const json = await res.json();
  const names: string[] = Array.isArray(json?.models) ? json.models.map((m: any) => m?.name).filter(Boolean) : [];
  const ids = names
    .map((name) => (typeof name === 'string' ? name.replace(/^models\//, '') : ''))
    .filter(Boolean);

  ids.sort((a, b) => a.localeCompare(b));
  return toLLMModels(ids, 'API에서 가져옴');
}

export async function fetchProviderModels(provider: string, apiKeys: {
  openaiApiKey?: string;
  geminiApiKey?: string;
  grokApiKey?: string;
}): Promise<LLMModel[]> {
  switch (provider) {
    case 'openai':
      return fetchOpenAIModels(apiKeys.openaiApiKey || '');
    case 'gemini':
      return fetchGeminiModels(apiKeys.geminiApiKey || '');
    case 'grok':
      return fetchGrokModels(apiKeys.grokApiKey || '');
    default:
      // Anthropic은 프론트에서 모델 리스트 조회 API를 기본 제공하지 않는 경우가 많아 일단 고정 목록만 사용
      return [];
  }
}


