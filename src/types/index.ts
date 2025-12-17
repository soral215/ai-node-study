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
  provider: 'openai' | 'anthropic' | 'gemini';
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
  provider: 'dalle' | 'stable-diffusion';
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  n?: number; // 생성할 이미지 개수
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

