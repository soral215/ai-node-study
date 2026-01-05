export interface LLMModel {
  id: string;
  name: string;
  description?: string;
}

export const LLM_MODELS: Record<string, LLMModel[]> = {
  openai: [
    // NOTE: OpenAI 모델 라인업은 빠르게 변합니다. 가장 정확한 최신 목록은 "모델 새로고침"으로 API(/v1/models)에서 가져오세요.
    { id: 'gpt-4o', name: 'GPT-4o', description: '멀티모달 (권장)' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '저비용/고속' },
    { id: 'gpt-4o-2024-11-20', name: 'GPT-4o (2024-11-20)', description: '스냅샷' },
    { id: 'gpt-4o-mini-2024-07-18', name: 'GPT-4o Mini (2024-07-18)', description: '스냅샷' },
    // 아래는 조직/플랜/엔드포인트에 따라 지원 여부가 달라질 수 있어 새로고침을 권장합니다.
    { id: 'gpt-5', name: 'GPT-5', description: '최신 계열 (지원 여부는 새로고침으로 확인)' },
    { id: 'gpt-5.1', name: 'GPT-5.1', description: '최신 계열 (지원 여부는 새로고침으로 확인)' },
    { id: 'gpt-5.1-chat-latest', name: 'GPT-5.1 Chat Latest', description: 'alias (지원 여부는 새로고침으로 확인)' },
    { id: 'o1-preview', name: 'o1-preview', description: '추론 모델 (preview)' },
    { id: 'o1-mini', name: 'o1-mini', description: '추론 모델 (mini)' },
    { id: 'gpt-4-turbo-2024-04-09', name: 'GPT-4 Turbo (2024-04-09)', description: '최신 Turbo 모델' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '고성능 모델' },
    { id: 'gpt-4-0125-preview', name: 'GPT-4 (2024-01-25)', description: 'GPT-4 최신 버전' },
    { id: 'gpt-4', name: 'GPT-4', description: '표준 모델' },
    { id: 'gpt-3.5-turbo-0125', name: 'GPT-3.5 Turbo (2024-01-25)', description: '최신 3.5 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '빠른 응답' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (2024-10-22)', description: '최신 Sonnet 모델' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (2024-10-22)', description: '고속/저비용' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (2024-06-20)', description: '이전 Sonnet 버전' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '최고 성능 모델' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: '균형잡힌 성능' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '빠른 응답' },
  ],
  gemini: [
    // Gemini도 프로젝트/리전/버전에 따라 사용 가능 모델이 달라질 수 있어 새로고침(Models API)을 권장합니다.
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Exp)', description: '실험 모델' },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)', description: '최신 Pro 모델' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '고성능 모델' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)', description: '최신 Flash 모델' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: '빠른 응답' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: '표준 모델' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: '이미지 지원' },
  ],
  grok: [
    // Grok도 계정/플랜에 따라 사용 가능 모델이 달라질 수 있어 새로고침(/v1/models)을 권장합니다.
    { id: 'grok-2-latest', name: 'Grok-2 Latest', description: 'alias (지원 여부는 새로고침으로 확인)' },
    { id: 'grok-2-vision-latest', name: 'Grok-2 Vision Latest', description: 'alias (지원 여부는 새로고침으로 확인)' },
    { id: 'grok-2-1212', name: 'Grok-2-1212', description: '최신 Grok 2 모델' },
    { id: 'grok-2-vision-1212', name: 'Grok-2-Vision-1212', description: 'Grok 2 Vision 모델' },
    { id: 'grok-beta', name: 'Grok Beta', description: '베타 버전' },
  ],
};

export function getDefaultModel(provider: string): string {
  const models = LLM_MODELS[provider];
  return models && models.length > 0 ? models[0].id : '';
}

export function getModelsForProvider(provider: string): LLMModel[] {
  return LLM_MODELS[provider] || [];
}

