# AI Agent Workflow Builder 사용 가이드

## 🚀 시작하기

### 1. 프로젝트 실행
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어주세요.

### 2. API 키 설정
1. 상단 툴바의 **설정 버튼(⚙️)** 클릭
2. 사용할 LLM 제공자의 API 키 입력
   - **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
   - **Gemini**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
3. 저장 완료 클릭

## 📋 기본 사용법

### 노드 추가하기
1. 왼쪽 **노드 팔레트**에서 원하는 노드를 드래그
2. 캔버스에 드롭하여 배치

### 노드 연결하기
1. 노드 하단의 **핸들(점)**을 클릭
2. 연결할 다른 노드의 상단 핸들로 드래그

### 노드 설정하기
1. 노드를 **클릭**하여 선택
2. 오른쪽 **설정 패널**에서 노드 설정 수정
3. 설정은 자동으로 저장됩니다

### 연결선 삭제하기
1. 삭제할 연결선을 **클릭**하여 선택
2. **Delete** 또는 **Backspace** 키를 누르기

### 워크플로우 실행하기
1. 상단 툴바의 **실행 버튼(▶️)** 클릭
2. 오른쪽 **로그 패널**에서 실행 과정 확인
3. 실행 중지하려면 **중지 버튼(■)** 클릭

## 💡 실용적인 워크플로우 예시

### 예시 1: 간단한 LLM 질문-답변

```
[Start] → [LLM] → [End]
```

**LLM 노드 설정:**
- Provider: OpenAI
- Model: gpt-4
- Prompt: "안녕하세요! 오늘 날씨에 대해 간단히 설명해주세요."

### 예시 2: 조건부 분기 처리

```
[Start] → [Function] → [Condition] → [LLM (True)] → [End]
                      ↘ [LLM (False)] → [End]
```

**Function 노드 설정:**
```javascript
// 입력 데이터 처리
const score = input || 0;
return { score, passed: score >= 60 };
```

**Condition 노드 설정:**
```
input.passed === true
```

**LLM 노드 (True 경로):**
- Prompt: "합격을 축하합니다! 다음 단계를 안내해드리겠습니다."

**LLM 노드 (False 경로):**
- Prompt: "아쉽게도 불합격입니다. 다시 도전해보세요!"

### 예시 3: API 데이터 처리 후 LLM 분석

```
[Start] → [API] → [Function] → [LLM] → [End]
```

**API 노드 설정:**
- Method: GET
- URL: `https://api.example.com/data`
- Headers: `{"Content-Type": "application/json"}`

**Function 노드 설정:**
```javascript
// API 응답 데이터 가공
const summary = {
  total: input.length,
  items: input.slice(0, 5)
};
return summary;
```

**LLM 노드 설정:**
- Prompt: "다음 데이터를 분석하고 요약해주세요: {{input}}"

### 예시 4: 다단계 LLM 체인

```
[Start] → [LLM 1] → [LLM 2] → [LLM 3] → [End]
```

**LLM 1 (요약):**
- Prompt: "다음 텍스트를 3줄로 요약해주세요: {{input}}"

**LLM 2 (번역):**
- Prompt: "다음 텍스트를 영어로 번역해주세요: {{input}}"

**LLM 3 (감정 분석):**
- Prompt: "다음 텍스트의 감정을 분석해주세요: {{input}}"

### 예시 5: 복잡한 조건부 워크플로우

```
[Start] → [API] → [Function] → [Condition] → [LLM (긍정)] → [End]
                      ↓                        ↘ [LLM (부정)] → [End]
                   [LLM (에러)]
```

**API 노드:**
- 외부 API 호출

**Function 노드:**
```javascript
// 에러 처리 및 데이터 검증
if (!input || input.error) {
  return { error: true, message: 'API 호출 실패' };
}

const sentiment = input.sentiment || 'neutral';
return { 
  sentiment,
  data: input,
  hasError: false
};
```

**Condition 노드:**
```
input.hasError === false && input.sentiment === 'positive'
```

## 🎯 활용 시나리오

### 1. 콘텐츠 생성 자동화
- 블로그 포스트 초안 작성
- 소셜 미디어 게시물 생성
- 이메일 템플릿 생성

### 2. 데이터 분석 및 요약
- API 데이터 수집 → 분석 → 리포트 생성
- 뉴스 기사 요약
- 고객 피드백 분석

### 3. 의사결정 지원 시스템
- 조건에 따른 자동 응답
- 점수 기반 분류
- 상태에 따른 다른 처리

### 4. 다국어 처리 파이프라인
- 텍스트 번역
- 언어 감지
- 문화적 적응

### 5. 고객 서비스 자동화
- 문의 분류
- 응답 생성
- 에스컬레이션 처리

## 🔧 고급 기능

### 노드 간 데이터 전달
- 이전 노드의 출력은 자동으로 다음 노드의 `input` 변수로 전달됩니다
- 객체를 반환하면 속성들을 직접 사용할 수 있습니다

**예시:**
```javascript
// Function 노드에서
return { name: 'John', age: 30, status: 'active' };

// 다음 Condition 노드에서
input.status === 'active'  // true
input.age > 25  // true
```

### 조건 노드 활용
- JavaScript 표현식 사용 가능
- 이전 노드의 모든 데이터 접근 가능
- 복잡한 조건식 작성 가능

**예시 조건식:**
```javascript
input.length > 10
input.status === 'success' && input.code === 200
typeof input === 'string' && input.includes('error')
```

### Function 노드 활용
- 데이터 변환 및 가공
- 계산 및 로직 처리
- 여러 노드의 출력 결합 (향후 기능)

**예시 코드:**
```javascript
// 배열 필터링
const filtered = input.filter(item => item.active);

// 데이터 변환
const result = {
  count: input.length,
  total: input.reduce((sum, item) => sum + item.value, 0),
  average: input.reduce((sum, item) => sum + item.value, 0) / input.length
};

return result;
```

## 💾 워크플로우 저장 및 불러오기

### 저장하기
1. 상단 툴바의 **저장 버튼(💾)** 클릭
2. JSON 파일로 다운로드됩니다

### 불러오기
1. 상단 툴바의 **불러오기 버튼(📁)** 클릭
2. 저장된 JSON 파일 선택

## 🐛 문제 해결

### LLM 호출이 실패하는 경우
- API 키가 올바르게 설정되었는지 확인
- API 키에 충분한 크레딧이 있는지 확인
- 네트워크 연결 확인

### 조건 노드가 작동하지 않는 경우
- 조건식 문법 확인
- 이전 노드의 출력 형식 확인
- 로그 패널에서 에러 메시지 확인

### Function 노드 실행 오류
- JavaScript 문법 확인
- `return` 문이 있는지 확인
- `input` 변수 사용 확인

## 📚 학습 리소스

### React Flow 공식 문서
- [reactflow.dev](https://reactflow.dev)

### LLM API 문서
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com)
- [Google Gemini API](https://ai.google.dev/docs)

## 🚀 다음 단계

1. **템플릿 라이브러리**: 자주 사용하는 워크플로우를 템플릿으로 저장
2. **변수 시스템**: 전역 변수 및 환경 변수 지원
3. **에러 핸들링**: 재시도 로직 및 에러 복구
4. **성능 최적화**: 대용량 데이터 처리
5. **협업 기능**: 워크플로우 공유 및 버전 관리

## 💡 팁

- 복잡한 워크플로우는 작은 단위로 나누어 테스트하세요
- 로그 패널을 활용하여 각 노드의 출력을 확인하세요
- 조건 노드와 Function 노드를 활용하여 유연한 로직을 만들 수 있습니다
- 워크플로우를 정기적으로 저장하여 작업을 보호하세요

