// 노드 타입 정의
export const NodeType = {
  START: 'start',
  LLM: 'llm',
  API: 'api',
  FUNCTION: 'function',
  CONDITION: 'condition',
  IMAGE: 'image',
  END: 'end',
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

// 노드 데이터 인터페이스
export interface BaseNodeData {
  label: string;
  [key: string]: any;
}

export interface LLMNodeData extends BaseNodeData {
  provider: 'openai' | 'anthropic' | 'gemini' | 'grok';
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface APINodeData extends BaseNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface FunctionNodeData extends BaseNodeData {
  code: string;
  language: 'javascript' | 'python';
}

export interface ConditionNodeData extends BaseNodeData {
  condition: string;
}

export interface ImageNodeData extends BaseNodeData {
  provider: 'dalle' | 'stable-diffusion' | 'flux' | 'stable-diffusion-xl' | 'grok';
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1536' | '1536x1024' | '1024x1792' | '1792x1024' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'standard' | 'hd' | 'auto'; // GPT Image: low/medium/high/auto, DALL-E 3: standard/hd
  n?: number; // 생성할 이미지 개수
  model?: string; // 모델 ID (gpt-image-1.5, gpt-image-1, gpt-image-1-mini, dall-e-3, dall-e-2 또는 Replicate 모델 ID)
  background?: 'transparent' | 'opaque' | 'auto'; // GPT Image 모델만 지원
  numOutputs?: number; // 생성할 이미지 개수 (Replicate용)
  guidanceScale?: number; // 가이던스 스케일 (0-20)
  numInferenceSteps?: number; // 추론 단계 수
}

// 워크플로우 실행 상태
export const ExecutionStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
  PAUSED: 'paused',
} as const;

export type ExecutionStatus = typeof ExecutionStatus[keyof typeof ExecutionStatus];

// 실행 로그
export interface ExecutionLog {
  id: string;
  nodeId: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

// 워크플로우 정의
export interface Workflow {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  createdAt: number;
  updatedAt: number;
}

