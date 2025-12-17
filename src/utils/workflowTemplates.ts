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
  {
    name: '날씨 기반 활동 추천',
    description: '날씨 정보를 가져와서 그에 맞는 활동을 추천하는 워크플로우',
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
          label: '위치 설정',
          language: 'javascript',
          code: `// 기본 위치 설정 (실제로는 사용자 입력 받을 수 있음)
return {
  city: 'Seoul',
  country: 'KR',
  coordinates: { lat: 37.5665, lon: 126.9780 }
};`,
        },
      },
      {
        id: 'api-1',
        type: 'api',
        position: { x: 250, y: 300 },
        data: {
          label: '날씨 조회',
          method: 'GET',
          url: 'https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=demo&units=metric',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
      {
        id: 'function-2',
        type: 'function',
        position: { x: 250, y: 450 },
        data: {
          label: '날씨 분석',
          language: 'javascript',
          code: `// 날씨 데이터 분석
const weather = input.weather?.[0]?.main || 'Clear';
const temp = input.main?.temp || 20;
const description = input.weather?.[0]?.description || '맑음';

let activityType = 'outdoor';
if (weather === 'Rain' || weather === 'Snow') {
  activityType = 'indoor';
} else if (temp < 5) {
  activityType = 'indoor';
} else if (temp > 30) {
  activityType = 'water';
}

return {
  weather,
  temp: Math.round(temp),
  description,
  activityType,
  summary: \`현재 날씨: \${description}, 온도: \${Math.round(temp)}°C\`
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 600 },
        data: {
          label: '활동 추천',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 날씨 정보를 바탕으로 오늘 하루 추천할 활동 5가지를 제안해주세요:\n\n날씨: {{input.summary}}\n활동 유형: {{input.activityType}}\n\n각 활동에 대해 간단한 설명도 포함해주세요.',
          temperature: 0.8,
          maxTokens: 800,
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
        target: 'api-1',
      },
      {
        id: 'e3',
        source: 'api-1',
        target: 'function-2',
      },
      {
        id: 'e4',
        source: 'function-2',
        target: 'llm-1',
      },
      {
        id: 'e5',
        source: 'llm-1',
        target: 'end-1',
      },
    ],
  },
  {
    name: '레시피 생성기',
    description: '재료를 입력받아 레시피를 생성하고 요리 팁을 제공하는 워크플로우',
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
          label: '재료 목록',
          language: 'javascript',
          code: `// 사용 가능한 재료 목록
return {
  ingredients: ['닭고기', '양파', '마늘', '고추장', '설탕'],
  cuisine: '한식',
  difficulty: '중급'
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '레시피 생성',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 재료들을 사용하여 맛있는 레시피를 만들어주세요:\n\n재료: {{input.ingredients.join(", ")}}\n요리 유형: {{input.cuisine}}\n난이도: {{input.difficulty}}\n\n재료 준비, 조리 과정, 조리 시간, 팁을 포함해서 자세히 설명해주세요.',
          temperature: 0.7,
          maxTokens: 1500,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '영양 정보',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 레시피의 대략적인 영양 정보를 제공해주세요:\n\n{{input}}\n\n칼로리, 주요 영양소, 건강 팁을 포함해주세요.',
          temperature: 0.6,
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
        target: 'end-1',
      },
    ],
  },
  {
    name: '코드 리뷰 자동화',
    description: '코드 스니펫을 분석하고 개선점을 제안하는 워크플로우',
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
          label: '코드 입력',
          language: 'javascript',
          code: `// 리뷰할 코드 예시
const code = \`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}\`;

return {
  code,
  language: 'javascript',
  context: '쇼핑몰 장바구니 총액 계산 함수'
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '코드 분석',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 코드를 리뷰하고 개선점을 제안해주세요:\n\n코드:\n```javascript\n{{input.code}}\n```\n\n컨텍스트: {{input.context}}\n\n코드의 장단점, 버그 가능성, 성능 개선점, 가독성 개선 방안을 분석해주세요.',
          temperature: 0.5,
          maxTokens: 1000,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '개선된 코드',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 코드 리뷰를 바탕으로 개선된 코드를 작성해주세요:\n\n원본 코드:\n{{input.code}}\n\n리뷰:\n{{input}}\n\n개선된 코드와 변경 사항 설명을 제공해주세요.',
          temperature: 0.3,
          maxTokens: 800,
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
        target: 'end-1',
      },
    ],
  },
  {
    name: '번역 + 감정 분석',
    description: '텍스트를 번역하고 감정을 분석하는 워크플로우',
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
          label: '텍스트 입력',
          language: 'javascript',
          code: `// 분석할 텍스트
return {
  text: '오늘 정말 좋은 하루였어요! 친구들과 즐거운 시간을 보냈고, 맛있는 음식도 먹었습니다.',
  sourceLang: 'ko',
  targetLang: 'en'
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '영어 번역',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 한국어 텍스트를 자연스러운 영어로 번역해주세요:\n\n{{input.text}}',
          temperature: 0.5,
          maxTokens: 500,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '감정 분석',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 텍스트의 감정을 분석해주세요:\n\n원문: {{input.text}}\n번역: {{input}}\n\n감정 유형(긍정/부정/중립), 감정 강도(1-10), 주요 감정 키워드를 분석해주세요.',
          temperature: 0.3,
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
        target: 'end-1',
      },
    ],
  },
  {
    name: '할 일 목록 생성기',
    description: '목표를 받아서 구체적인 할 일 목록을 생성하는 워크플로우',
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
          label: '목표 설정',
          language: 'javascript',
          code: `// 사용자 목표
return {
  goal: '웹 개발자 되기',
  deadline: '6개월',
  currentLevel: '초보자',
  availableTime: '주 20시간'
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '할 일 목록 생성',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 목표를 달성하기 위한 구체적인 할 일 목록을 만들어주세요:\n\n목표: {{input.goal}}\n기간: {{input.deadline}}\n현재 수준: {{input.currentLevel}}\n가용 시간: {{input.availableTime}}\n\n단계별로 나누어서 각 단계의 구체적인 작업, 예상 소요 시간, 우선순위를 포함해주세요.',
          temperature: 0.7,
          maxTokens: 1500,
        },
      },
      {
        id: 'function-2',
        type: 'function',
        position: { x: 250, y: 450 },
        data: {
          label: '일정 생성',
          language: 'javascript',
          code: `// 할 일 목록을 기반으로 일정 생성
const tasks = input.match(/\\d+\\.\\s*([^\\n]+)/g) || [];
const schedule = tasks.map((task, index) => ({
  id: index + 1,
  task: task.replace(/^\\d+\\.\\s*/, ''),
  week: Math.floor(index / 3) + 1,
  priority: index < 5 ? 'high' : 'medium'
}));

return {
  totalTasks: schedule.length,
  schedule,
  estimatedWeeks: Math.ceil(schedule.length / 3)
};`,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 600 },
        data: {
          label: '동기부여 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 일정을 바탕으로 동기부여 메시지를 작성해주세요:\n\n총 작업 수: {{input.totalTasks}}\n예상 기간: {{input.estimatedWeeks}}주\n\n격려와 조언을 포함한 메시지를 작성해주세요.',
          temperature: 0.8,
          maxTokens: 300,
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
        target: 'function-2',
      },
      {
        id: 'e4',
        source: 'function-2',
        target: 'llm-2',
      },
      {
        id: 'e5',
        source: 'llm-2',
        target: 'end-1',
      },
    ],
  },
  {
    name: '시 생성기',
    description: '주제를 받아서 시를 생성하고 분석하는 워크플로우',
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
          label: '주제 설정',
          language: 'javascript',
          code: `// 시의 주제
return {
  theme: '봄',
  style: '자유시',
  mood: '희망적',
  length: '중간'
};`,
        },
      },
      {
        id: 'llm-1',
        type: 'llm',
        position: { x: 250, y: 300 },
        data: {
          label: '시 생성',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 주제로 시를 작성해주세요:\n\n주제: {{input.theme}}\n스타일: {{input.style}}\n분위기: {{input.mood}}\n길이: {{input.length}}\n\n감성적이고 아름다운 시를 작성해주세요.',
          temperature: 0.9,
          maxTokens: 800,
        },
      },
      {
        id: 'llm-2',
        type: 'llm',
        position: { x: 250, y: 450 },
        data: {
          label: '시 분석',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 시를 분석해주세요:\n\n{{input}}\n\n주요 이미지, 감정, 표현 기법, 시적 장치를 분석해주세요.',
          temperature: 0.6,
          maxTokens: 600,
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
        target: 'end-1',
      },
    ],
  },
  {
    name: '게임 점수 계산기',
    description: '게임 결과를 처리하고 승자를 결정하는 워크플로우',
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
          label: '게임 결과',
          language: 'javascript',
          code: `// 게임 점수 데이터
const players = [
  { name: 'Alice', score: 85, time: 120 },
  { name: 'Bob', score: 92, time: 95 },
  { name: 'Charlie', score: 78, time: 150 }
];

// 점수 계산 (점수 - 시간 페널티)
const results = players.map(p => ({
  ...p,
  finalScore: p.score - (p.time * 0.1),
  rank: 0
}));

// 순위 결정
results.sort((a, b) => b.finalScore - a.finalScore);
results.forEach((r, i) => { r.rank = i + 1; });

return { results, winner: results[0] };`,
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 300 },
        data: {
          label: '승자 확인',
          condition: 'input.winner.finalScore > 80',
        },
      },
      {
        id: 'llm-winner',
        type: 'llm',
        position: { x: 100, y: 450 },
        data: {
          label: '승자 축하',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '다음 게임 결과를 바탕으로 승자를 축하하는 메시지를 작성해주세요:\n\n승자: {{input.winner.name}}\n최종 점수: {{input.winner.finalScore.toFixed(1)}}\n\n격려와 축하 메시지를 포함해주세요.',
          temperature: 0.8,
          maxTokens: 300,
        },
      },
      {
        id: 'llm-encourage',
        type: 'llm',
        position: { x: 400, y: 450 },
        data: {
          label: '격려 메시지',
          provider: 'openai',
          model: 'gpt-4',
          prompt: '게임 점수가 낮습니다. 다음 게임을 위해 격려 메시지를 작성해주세요.',
          temperature: 0.8,
          maxTokens: 300,
        },
      },
      {
        id: 'function-2',
        type: 'function',
        position: { x: 250, y: 600 },
        data: {
          label: '순위표 생성',
          language: 'javascript',
          code: `// 순위표 포맷팅
const leaderboard = input.results.map(r => 
  \`\${r.rank}위: \${r.name} (점수: \${r.finalScore.toFixed(1)})\`
).join('\\n');

return {
  leaderboard,
  message: input,
  summary: \`총 \${input.results.length}명이 참가했습니다.\`
};`,
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
        target: 'condition-1',
      },
      {
        id: 'e3',
        source: 'condition-1',
        target: 'llm-winner',
        sourceHandle: 'true',
      },
      {
        id: 'e4',
        source: 'condition-1',
        target: 'llm-encourage',
        sourceHandle: 'false',
      },
      {
        id: 'e5',
        source: 'llm-winner',
        target: 'function-2',
      },
      {
        id: 'e6',
        source: 'llm-encourage',
        target: 'function-2',
      },
      {
        id: 'e7',
        source: 'function-2',
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

