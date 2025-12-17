import type { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowTemplate {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    name: '간단한 LLM 질문-답변',
    description: 'LLM에 질문하고 답변을 받는 기본 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 100 },
        data: { label: '시작' },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 250 },
        data: {
          label: 'LLM 질문',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '안녕하세요! 오늘 날씨에 대해 간단히 설명해주세요.',
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 400 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'llm-1',
      },
      {
        id: 'e2',
        source: 'llm-1',
        target: 'end-1',
      },
    ],
  },
  {
    name: '조건부 분기 처리',
    description: 'Function 노드로 데이터를 처리하고 조건에 따라 분기하는 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'function-1',
        type: 'function',
        position: { x: 250, y: 150 },
        data: {
          label: '점수 계산',
          language: 'javascript',
          code: `// 입력 데이터 처리
const score = input || Math.floor(Math.random() * 100);
return { score, passed: score >= 60 };`,
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 300 },
        data: {
          label: '합격 여부',
          condition: 'input.passed === true',
        },
      },
      {
        id: 'llm-true',
        type: 'llm',
        position: { x: 100, y: 450 },
        data: {
          label: '합격 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '합격을 축하합니다! 다음 단계를 안내해드리겠습니다.',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-false',
        type: 'llm',
        position: { x: 400, y: 450 },
        data: {
          label: '불합격 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '아쉽게도 불합격입니다. 다시 도전해보세요!',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 600 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'function-1',
      },
      {
        id: 'e2',
        source: 'function-1',
        target: 'condition-1',
      },
      {
        id: 'e3',
        source: 'condition-1',
        target: 'llm-true',
        sourceHandle: 'true',
      },
      {
        id: 'e4',
        source: 'condition-1',
        target: 'llm-false',
        sourceHandle: 'false',
      },
      {
        id: 'e5',
        source: 'llm-true',
        target: 'end-1',
      },
      {
        id: 'e6',
        source: 'llm-false',
        target: 'end-1',
      },
    ],
  },
  {
    name: 'API 데이터 처리 후 LLM 분석',
    description: '외부 API에서 데이터를 가져와 처리한 후 LLM으로 분석하는 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 150 },
        data: {
          label: '데이터 가져오기',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
      {
        id: 'function-1',
        type: 'function',
        position: { x: 250, y: 300 },
        data: {
          label: '데이터 가공',
          language: 'javascript',
          code: `// API 응답 데이터 가공
const summary = {
  title: input.title || '제목 없음',
  body: input.body || '',
  wordCount: (input.body || '').split(' ').length,
  excerpt: (input.body || '').substring(0, 100) + '...'
};
return summary;`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: 'LLM 분석',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 데이터를 분석하고 요약해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 600 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'api-1',
      },
      {
        id: 'e2',
        source: 'api-1',
        target: 'function-1',
      },
      {
        id: 'e3',
        source: 'function-1',
        target: 'llm-1',
      },
      {
        id: 'e4',
        source: 'llm-1',
        target: 'end-1',
      },
    ],
  },
  {
    name: '다단계 LLM 체인',
    description: '여러 LLM 노드를 연결하여 순차적으로 처리하는 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 150 },
        data: {
          label: '요약',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 텍스트를 3줄로 요약해주세요: "AI는 미래의 기술입니다. 많은 산업에서 활용되고 있으며, 우리의 삶을 변화시키고 있습니다."',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '번역',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 텍스트를 영어로 번역해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-3',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '감정 분석',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 텍스트의 감정을 분석해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 600 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'llm-1',
      },
      {
        id: 'e2',
        source: 'llm-1',
        target: 'llm-2',
      },
      {
        id: 'e3',
        source: 'llm-2',
        target: 'llm-3',
      },
      {
        id: 'e4',
        source: 'llm-3',
        target: 'end-1',
      },
    ],
  },
  {
    name: '텍스트 변환 파이프라인',
    description: '텍스트를 요약, 번역, 개선하는 순차적 처리 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 150 },
        data: {
          label: '텍스트 요약',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 텍스트를 2-3문장으로 요약해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 300,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '영어 번역',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 한국어 텍스트를 자연스러운 영어로 번역해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-3',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '문체 개선',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 영어 텍스트를 더 전문적이고 명확하게 개선해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 600 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'llm-1',
      },
      {
        id: 'e2',
        source: 'llm-1',
        target: 'llm-2',
      },
      {
        id: 'e3',
        source: 'llm-2',
        target: 'llm-3',
      },
      {
        id: 'e4',
        source: 'llm-3',
        target: 'end-1',
      },
    ],
  },
  {
    name: '데이터 검증 및 처리',
    description: 'API 데이터를 검증하고 조건에 따라 다른 처리를 하는 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 150 },
        data: {
          label: '사용자 데이터 조회',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/users/1',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
      {
        id: 'function-1',
        type: 'function',
        position: { x: 250, y: 300 },
        data: {
          label: '데이터 검증',
          language: 'javascript',
          code: `// 사용자 데이터 검증
if (!input || !input.id) {
  return { valid: false, error: '사용자 데이터가 없습니다.' };
}

const user = {
  id: input.id,
  name: input.name || '이름 없음',
  email: input.email || '',
  hasEmail: !!input.email,
  isActive: input.id > 0
};

return { valid: true, user };`,
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 450 },
        data: {
          label: '유효성 검사',
          condition: 'input.valid === true',
        },
      },
      {
        id: 'llm-valid',
        type: 'llm',
        position: { x: 100, y: 600 },
        data: {
          label: '환영 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 사용자에게 환영 메시지를 작성해주세요:\n\n이름: {{input.user.name}}\n이메일: {{input.user.email}}',
          temperature: 0.7,
          maxTokens: 300,
        },
      },
      {
        id: 'llm-invalid',
        type: 'llm',
        position: { x: 400, y: 600 },
        data: {
          label: '에러 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 에러에 대한 사용자 친화적인 메시지를 작성해주세요:\n\n{{input.error}}',
          temperature: 0.7,
          maxTokens: 200,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 750 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'api-1',
      },
      {
        id: 'e2',
        source: 'api-1',
        target: 'function-1',
      },
      {
        id: 'e3',
        source: 'function-1',
        target: 'condition-1',
      },
      {
        id: 'e4',
        source: 'condition-1',
        target: 'llm-valid',
        sourceHandle: 'true',
      },
      {
        id: 'e5',
        source: 'condition-1',
        target: 'llm-invalid',
        sourceHandle: 'false',
      },
      {
        id: 'e6',
        source: 'llm-valid',
        target: 'end-1',
      },
      {
        id: 'e7',
        source: 'llm-invalid',
        target: 'end-1',
      },
    ],
  },
  {
    name: '콘텐츠 생성 자동화',
    description: '주제를 받아 블로그 포스트 초안을 생성하는 워크플로우',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'function-1',
        type: 'function',
        position: { x: 250, y: 150 },
        data: {
          label: '주제 준비',
          language: 'javascript',
          code: `// 주제 데이터 준비
// Start 노드에서 시작하므로 기본 주제 사용
const topic = 'AI의 미래와 미래 전망';

return {
  topic: topic,
  keywords: topic.split(' '),
  timestamp: new Date().toISOString()
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '개요 생성',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 주제에 대한 블로그 포스트 개요를 작성해주세요:\n\n주제: {{input.topic}}\n\n개요는 3-5개의 섹션으로 구성해주세요. 각 섹션은 간단한 제목과 설명을 포함해주세요.',
          temperature: 0.8,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '본문 작성',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 개요를 바탕으로 블로그 포스트 본문을 작성해주세요:\n\n{{input}}\n\n각 섹션을 자세히 설명하고, 읽기 쉽고 흥미롭게 작성해주세요.',
          temperature: 0.7,
          maxTokens: 2000,
        },
      },
      {
        id: 'llm-3',
        type: 'llm',
        position: { x: 250, y: 600 },
        data: {
          label: '제목 생성',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 블로그 포스트 내용을 바탕으로 매력적인 제목 3개를 제안해주세요:\n\n{{input}}',
          temperature: 0.9,
          maxTokens: 200,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 750 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'function-1',
      },
      {
        id: 'e2',
        source: 'function-1',
        target: 'llm-1',
      },
      {
        id: 'e3',
        source: 'llm-1',
        target: 'llm-2',
      },
      {
        id: 'e4',
        source: 'llm-2',
        target: 'llm-3',
      },
      {
        id: 'e5',
        source: 'llm-3',
        target: 'end-1',
      },
    ],
  },
  {
    name: '에러 처리 워크플로우',
    description: 'API 호출 실패 시 대체 처리 및 에러 리포트 생성',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 150 },
        data: {
          label: '메인 API 호출',
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/999',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
      {
        id: 'function-1',
        type: 'function',
        position: { x: 250, y: 300 },
        data: {
          label: '응답 검증',
          language: 'javascript',
          code: `// API 응답 검증
if (!input || input.error) {
  return { 
    success: false, 
    error: input?.error || '알 수 없는 오류',
    hasError: true 
  };
}

return { 
  success: true, 
  data: input,
  hasError: false 
};`,
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 450 },
        data: {
          label: '성공 여부',
          condition: 'input.success === true',
        },
      },
      {
        id: 'llm-success',
        type: 'llm',
        position: { x: 100, y: 600 },
        data: {
          label: '성공 리포트',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 데이터를 요약한 성공 리포트를 작성해주세요:\n\n{{input.data}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-error',
        type: 'llm',
        position: { x: 400, y: 600 },
        data: {
          label: '에러 리포트',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 에러를 분석하고 해결 방안을 제시하는 리포트를 작성해주세요:\n\n에러: {{input.error}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 750 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'api-1',
      },
      {
        id: 'e2',
        source: 'api-1',
        target: 'function-1',
      },
      {
        id: 'e3',
        source: 'function-1',
        target: 'condition-1',
      },
      {
        id: 'e4',
        source: 'condition-1',
        target: 'llm-success',
        sourceHandle: 'true',
      },
      {
        id: 'e5',
        source: 'condition-1',
        target: 'llm-error',
        sourceHandle: 'false',
      },
      {
        id: 'e6',
        source: 'llm-success',
        target: 'end-1',
      },
      {
        id: 'e7',
        source: 'llm-error',
        target: 'end-1',
      },
    ],
  },
  {
    name: '변수 활용 예시',
    description: '전역 변수를 사용하여 동적 API 호출 및 LLM 프롬프트 생성',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: '시작' },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 150 },
        data: {
          label: '동적 API 호출',
          method: 'GET',
          url: '{{global.apiBaseUrl}}/users/{{global.userId}}',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {{global.apiToken}}',
          },
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '개인화 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '안녕하세요 {{global.userName}}님! 다음 정보를 바탕으로 개인화된 메시지를 작성해주세요:\n\n{{input}}',
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 250, y: 450 },
        data: { label: '종료' },
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'start-1',
        target: 'api-1',
      },
      {
        id: 'e2',
        source: 'api-1',
        target: 'llm-1',
      },
      {
        id: 'e3',
        source: 'llm-1',
        target: 'end-1',
      },
    ],
  },
];

/**
 * 템플릿을 로드하여 고유 ID를 부여
 */
export function loadTemplate(template: WorkflowTemplate): { nodes: Node[]; edges: Edge[] } {
  const nodeIdMap = new Map<string, string>();
  
  // 노드에 고유 ID 부여
  const nodes = template.nodes.map((node) => {
    const newId = `${node.type}-${uuidv4()}`;
    nodeIdMap.set(node.id, newId);
    return {
      ...node,
      id: newId,
    };
  });

  // 엣지에 고유 ID 부여 및 노드 ID 매핑
  const edges = template.edges.map((edge) => ({
    ...edge,
    id: `e-${uuidv4()}`,
    source: nodeIdMap.get(edge.source) || edge.source,
    target: nodeIdMap.get(edge.target) || edge.target,
  }));

  return { nodes, edges };
}

