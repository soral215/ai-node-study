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

    // 모델 선택 (기본값: gpt-image-1.5 - 최신 모델)
    // 공식 문서: https://platform.openai.com/docs/guides/image-generation
    // GPT Image: gpt-image-1.5 (최신), gpt-image-1, gpt-image-1-mini
    // DALL-E: dall-e-2, dall-e-3 (deprecated, 2026-05-12까지 지원)
    const model = data.model || 'gpt-image-1.5';
    const size = data.size || '1024x1024';
    const quality = data.quality;
    const n = data.n || 1;
    const background = data.background || undefined;

    // 공식 API 엔드포인트: POST https://api.openai.com/v1/images/generations
    const endpoint = 'https://api.openai.com/v1/images/generations';

    // 모델별 생성 개수 제한
    const isGPTImage = model.startsWith('gpt-image');
    const isDALLE3 = model === 'dall-e-3';
    const actualN = isDALLE3 ? Math.min(n, 1) : Math.min(n, 10);

    // 공식 문서에 따른 요청 파라미터
    const requestBody: any = {
      model,
      prompt,
      n: actualN,
      size,
    };

    // GPT Image 모델 파라미터
    if (isGPTImage) {
      // GPT Image는 response_format을 지원하지 않음 (항상 base64 반환)
      // quality: low, medium, high, auto (기본값: auto)
      // 'standard'나 'hd'는 GPT Image에서 지원하지 않으므로 변환 필요
      if (quality) {
        if (quality === 'standard' || quality === 'hd') {
          // DALL-E quality를 GPT Image quality로 변환
          requestBody.quality = quality === 'hd' ? 'high' : 'medium';
        } else if (quality !== 'auto') {
          requestBody.quality = quality;
        }
        // 'auto'는 파라미터를 생략 (기본값)
      }
      // background: transparent, opaque, auto (GPT Image만 지원)
      if (background && background !== 'auto') {
        requestBody.background = background;
      }
    } else {
      // DALL-E 모델은 response_format 지원
      requestBody.response_format = 'url'; // 'url' 또는 'b64_json'
      
      if (isDALLE3) {
        // DALL-E 3: quality는 standard 또는 hd만 지원
        if (quality === 'hd' || quality === 'standard') {
          requestBody.quality = quality;
        } else if (quality) {
          // GPT Image quality를 DALL-E quality로 변환
          requestBody.quality = (quality === 'high') ? 'hd' : 'standard';
        } else {
          requestBody.quality = 'standard';
        }
      }
      // DALL-E 2는 quality 파라미터를 지원하지 않음
    }

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError: any) {
      // 네트워크 오류 처리
      throw new Error(`네트워크 오류: ${fetchError.message || 'API 요청 실패'}. API 키와 네트워크 연결을 확인해주세요.`);
    }

    if (!response.ok) {
      let errorMessage = `OpenAI 이미지 생성 API 오류: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    let result: any;
    try {
      result = await response.json();
    } catch (parseError: any) {
      throw new Error(`응답 파싱 오류: ${parseError.message || '서버 응답을 읽을 수 없습니다.'}`);
    }
    
    // 응답 형식 처리: GPT Image는 항상 b64_json, DALL-E는 url 또는 b64_json
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error('이미지 생성 응답에 데이터가 없습니다. API 응답 형식을 확인해주세요.');
    }

    const images = result.data.map((item: any) => {
      // GPT Image는 항상 b64_json 반환
      if (item.b64_json) {
        return `data:image/png;base64,${item.b64_json}`;
      }
      // DALL-E는 url 또는 b64_json 반환
      if (item.url) {
        return item.url;
      }
      return null;
    }).filter(Boolean) as string[];
    
    if (images.length === 0) {
      throw new Error('생성된 이미지 데이터를 찾을 수 없습니다.');
    }
    
    const revisedPrompt = result.data[0]?.revised_prompt;

    return {
      images,
      revisedPrompt,
    };
  }

  async generateStableDiffusion(data: ImageNodeData, prompt: string): Promise<ImageGenerationResponse> {
    // Stable Diffusion 1.5
    return this.generateReplicate(data, prompt, 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf');
  }

  async generateFLUX(data: ImageNodeData, prompt: string): Promise<ImageGenerationResponse> {
    // FLUX.1-dev
    return this.generateReplicate(data, prompt, 'black-forest-labs/flux-dev');
  }

  async generateStableDiffusionXL(data: ImageNodeData, prompt: string): Promise<ImageGenerationResponse> {
    // Stable Diffusion XL
    return this.generateReplicate(data, prompt, '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b');
  }

  async generateReplicate(data: ImageNodeData, prompt: string, defaultVersion: string): Promise<ImageGenerationResponse> {
    const apiKey = useAPIKeyStore.getState().replicateApiKey;
    
    if (!apiKey) {
      throw new Error('Replicate API 키가 설정되지 않았습니다.');
    }

    // 모델이 지정되어 있으면 사용, 없으면 기본값 사용
    // Replicate는 version ID를 사용 (예: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b')
    // 또는 model owner/name을 사용 (예: 'black-forest-labs/flux-dev')
    const modelOrVersion = data.model || defaultVersion;
    const numOutputs = data.numOutputs || data.n || 1;
    const size = this.parseSize(data.size || '1024x1024');
    const width = size.width;
    const height = size.height;
    const guidanceScale = data.guidanceScale || 7.5;
    const numInferenceSteps = data.numInferenceSteps || 50;

    // version ID인지 model owner/name인지 확인
    const isVersionId = /^[a-f0-9]{64}$/.test(modelOrVersion);
    
    const requestBody: any = {
      input: {
        prompt,
        num_outputs: Math.min(numOutputs, 4), // 최대 4개
        width,
        height,
        guidance_scale: guidanceScale,
        num_inference_steps: numInferenceSteps,
      },
    };

    // version ID면 version 사용, model owner/name이면 model 사용
    if (isVersionId) {
      requestBody.version = modelOrVersion;
    } else {
      requestBody.model = modelOrVersion;
    }

    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `Replicate API 오류: ${predictionResponse.status}`);
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    if (!predictionId) {
      throw new Error('예측 ID를 받지 못했습니다.');
    }

    // 예측 완료까지 대기 (폴링)
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 120; // 최대 120초 대기 (이미지 생성은 시간이 걸릴 수 있음)

    while (result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Replicate API 상태 확인 실패: ${statusResponse.status}`);
      }

      result = await statusResponse.json();
      attempts++;
    }

    if (result.status === 'failed') {
      const errorMsg = result.error || '이미지 생성 실패';
      throw new Error(`이미지 생성 실패: ${errorMsg}`);
    }

    if (result.status === 'canceled') {
      throw new Error('이미지 생성이 취소되었습니다.');
    }

    if (result.status !== 'succeeded') {
      throw new Error(`이미지 생성 시간 초과 (상태: ${result.status})`);
    }

    // 출력 처리
    let images: string[] = [];
    if (Array.isArray(result.output)) {
      images = result.output.filter((url: any) => url && typeof url === 'string');
    } else if (result.output && typeof result.output === 'string') {
      images = [result.output];
    }
    
    if (images.length === 0) {
      throw new Error('생성된 이미지가 없습니다.');
    }
    
    return {
      images,
    };
  }

  async generateGrok(data: ImageNodeData, prompt: string): Promise<ImageGenerationResponse> {
    const apiKey = useAPIKeyStore.getState().grokApiKey;
    
    if (!apiKey) {
      throw new Error('Grok API 키가 설정되지 않았습니다.');
    }

    // Grok API는 프롬프트 길이를 1024자로 제한합니다
    const MAX_PROMPT_LENGTH = 1024;
    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(`프롬프트가 너무 깁니다. 최대 ${MAX_PROMPT_LENGTH}자까지 입력 가능합니다. (현재: ${prompt.length}자)`);
    }

    const model = data.model || 'grok-2-image-1212';
    const numImages = Math.min(data.n || data.numOutputs || 1, 10); // 최대 10개

    // xAI 이미지 생성 API는 size, quality, style 파라미터를 지원하지 않습니다
    // 지원되는 파라미터: model, prompt, n, response_format
    const requestBody: any = {
      model,
      prompt: prompt.substring(0, MAX_PROMPT_LENGTH), // 안전을 위해 자르기
      n: numImages,
      response_format: 'url',
    };

    // 여러 이미지를 생성하는 경우 batch 엔드포인트 사용
    const endpoint = numImages > 1 
      ? 'https://api.x.ai/v1/images/generations/batch'
      : 'https://api.x.ai/v1/images/generations';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Grok 이미지 생성 API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    // xAI API 응답 형식에 따라 처리
    // 단일 이미지: { url: "..." } 또는 { data: [{ url: "..." }] }
    // 배치 이미지: [{ url: "..." }, ...] 또는 { images: [{ url: "..." }] }
    let images: string[] = [];
    
    if (Array.isArray(result)) {
      // 배치 응답: 배열 형태
      images = result.map((item: any) => item.url || item).filter(Boolean);
    } else if (result.data && Array.isArray(result.data)) {
      // data 배열 형태
      images = result.data.map((item: any) => item.url || item.b64_json || item).filter(Boolean);
    } else if (Array.isArray(result.images)) {
      // images 배열 형태
      images = result.images.map((item: any) => item.url || item).filter(Boolean);
    } else if (result.url) {
      // 단일 이미지 URL
      images = [result.url];
    }

    if (images.length === 0) {
      throw new Error('생성된 이미지가 없습니다.');
    }

    return {
      images,
    };
  }

  private parseSize(size: string): { width: number; height: number } {
    const [width, height] = size.split('x').map(Number);
    return { width: width || 1024, height: height || 1024 };
  }

  async generateImage(data: ImageNodeData, inputPrompt?: string): Promise<ImageGenerationResponse> {
    const prompt = inputPrompt !== undefined ? inputPrompt : (data.prompt || '');
    
    if (!prompt) {
      throw new Error('프롬프트가 설정되지 않았습니다.');
    }

    switch (data.provider) {
      case 'dalle':
        return this.generateDALLE(data, prompt);
      case 'grok':
        return this.generateGrok(data, prompt);
      case 'stable-diffusion':
        return this.generateStableDiffusion(data, prompt);
      case 'stable-diffusion-xl':
        return this.generateStableDiffusionXL(data, prompt);
      case 'flux':
        return this.generateFLUX(data, prompt);
      default:
        throw new Error(`지원하지 않는 이미지 생성 제공자: ${data.provider}`);
    }
  }
}

export const imageService = new ImageService();

