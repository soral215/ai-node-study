import type { ImageNodeData } from '../types';
import { useAPIKeyStore } from '../stores/apiKeyStore';

export interface ImageGenerationResponse {
  images: string[]; // 이미지 URL 배열
  revisedPrompt?: string; // DALL-E 3의 경우 수정된 프롬프트
}

export class ImageService {
  async generateDALLE(data: ImageNodeData, prompt: string): Promise<ImageGenerationResponse> {
    const apiKey = useAPIKeyStore.getState().openaiApiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const model = 'dall-e-3';
    const size = data.size || '1024x1024';
    const quality = data.quality || 'standard';
    const n = data.n || 1;

    // DALL-E 3는 한 번에 1개만 생성 가능
    const actualN = Math.min(n, 1);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: actualN,
        size,
        quality,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `DALL-E API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    const images = result.data.map((item: any) => item.url);
    const revisedPrompt = result.data[0]?.revised_prompt;

    return {
      images,
      revisedPrompt,
    };
  }

  async generateStableDiffusion(data: ImageNodeData, prompt: string): Promise<ImageGenerationResponse> {
    // Stable Diffusion은 Replicate API를 통해 사용 가능
    // 여기서는 기본 구조만 제공하고, 실제 구현은 Replicate API 키가 필요
    throw new Error('Stable Diffusion은 아직 구현되지 않았습니다. Replicate API 키가 필요합니다.');
  }

  async generateImage(data: ImageNodeData, inputPrompt?: string): Promise<ImageGenerationResponse> {
    const prompt = inputPrompt !== undefined ? inputPrompt : (data.prompt || '');
    
    if (!prompt) {
      throw new Error('프롬프트가 설정되지 않았습니다.');
    }

    switch (data.provider) {
      case 'dalle':
        return this.generateDALLE(data, prompt);
      case 'stable-diffusion':
        return this.generateStableDiffusion(data, prompt);
      default:
        throw new Error(`지원하지 않는 이미지 생성 제공자: ${data.provider}`);
    }
  }
}

export const imageService = new ImageService();

