# 프로젝트 확장 아이디어 상세

## 🎯 즉시 구현 가능한 기능 (High Impact, Low Effort)

### 1. 노드 실행 상태 시각화
**구현 난이도: ⭐⭐**
**영향도: ⭐⭐⭐⭐⭐**

각 노드에 실행 상태를 시각적으로 표시:
- 🟡 대기 중 (idle)
- 🔵 실행 중 (running) - 스피너 애니메이션
- 🟢 성공 (success) - 체크마크
- 🔴 실패 (error) - X 표시

**구현 위치:**
- `src/components/NodeTypes/` 각 노드 컴포넌트
- `src/stores/executionStore.ts` (새로 생성)

### 2. 변수 시스템
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐⭐⭐**

전역 변수와 워크플로우 변수 관리:
- 툴바에 변수 관리 패널 추가
- 노드에서 변수 참조: `{{global.apiUrl}}`, `{{workflow.userId}}`
- Function 노드에서 변수 사용 가능

**구현 위치:**
- `src/stores/variableStore.ts`
- `src/components/VariablePanel/`
- `src/utils/variableResolver.ts`

### 3. 워크플로우 실행 히스토리
**구현 난이도: ⭐⭐**
**영향도: ⭐⭐⭐⭐**

실행 기록 저장 및 조회:
- 로컬 스토리지에 실행 기록 저장
- 히스토리 패널에서 이전 실행 결과 확인
- 실행 시간, 성공/실패 여부 표시

**구현 위치:**
- `src/stores/historyStore.ts`
- `src/components/HistoryPanel/`

## 🚀 중간 난이도 기능

### 4. 노드 실행 결과 미리보기
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐⭐**

노드 클릭 시 실행 결과 표시:
- JSON 데이터 트리 뷰
- 문자열 데이터 미리보기
- 이미지/파일 미리보기

**라이브러리:**
- `react-json-view` - JSON 시각화
- `react-syntax-highlighter` - 코드 하이라이팅

### 5. 에러 처리 및 재시도
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐⭐**

노드별 재시도 설정:
- 재시도 횟수 설정
- 재시도 간격 설정
- 지수 백오프 지원

**구현 위치:**
- `src/engine/workflowEngine.ts` 수정
- 노드 설정에 재시도 옵션 추가

### 6. 병렬 실행 지원
**구현 난이도: ⭐⭐⭐⭐**
**영향도: ⭐⭐⭐⭐⭐**

의존성이 없는 노드들을 병렬로 실행:
- 의존성 그래프 분석
- Topological Sort로 실행 순서 결정
- Promise.all로 병렬 실행

**구현 위치:**
- `src/engine/parallelExecutor.ts` (새로 생성)
- `src/utils/dependencyGraph.ts` (새로 생성)

## 🌟 고급 기능

### 7. 백엔드 통합
**구현 난이도: ⭐⭐⭐⭐⭐**
**영향도: ⭐⭐⭐⭐⭐**

**기술 스택 제안:**
```typescript
// Backend: Node.js + Express
// Database: PostgreSQL
// Auth: JWT
// API: RESTful 또는 GraphQL
```

**주요 기능:**
- 사용자 인증 및 권한 관리
- 워크플로우 클라우드 저장
- 팀 협업 (워크플로우 공유)
- 실행 히스토리 클라우드 저장

**구현 위치:**
- `src/services/api.ts` - API 클라이언트
- `src/stores/authStore.ts` - 인증 상태
- `src/components/Auth/` - 로그인/회원가입

### 8. 실시간 협업
**구현 난이도: ⭐⭐⭐⭐⭐**
**영향도: ⭐⭐⭐⭐⭐**

여러 사용자가 동시에 워크플로우 편집:
- WebSocket 연결
- Operational Transform 또는 CRDT
- 실시간 커서 표시

**기술:**
- Socket.io 또는 WebSocket
- Yjs (CRDT 라이브러리)

### 9. 스케줄링 및 자동화
**구현 난이도: ⭐⭐⭐⭐**
**영향도: ⭐⭐⭐⭐⭐**

워크플로우 자동 실행:
- Cron 표현식 지원
- 웹훅 트리거
- 이벤트 기반 실행

**구현 위치:**
- `src/services/scheduler.ts`
- `src/components/SchedulerPanel/`

## 💡 포트폴리오 강화 아이디어

### 10. 테스트 커버리지
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐⭐**

```bash
# Jest + React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**테스트 작성:**
- 컴포넌트 단위 테스트
- 유틸리티 함수 테스트
- 통합 테스트

### 11. Storybook
**구현 난이도: ⭐⭐**
**영향도: ⭐⭐⭐**

컴포넌트 문서화:
```bash
npx storybook@latest init
```

### 12. 성능 최적화
**구현 난이도: ⭐⭐⭐⭐**
**영향도: ⭐⭐⭐⭐**

- React.memo 최적화
- 가상 스크롤링 (대용량 노드)
- 코드 스플리팅
- 번들 크기 최적화

### 13. PWA 지원
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐**

오프라인 모드 지원:
- Service Worker
- 오프라인 캐싱
- 설치 가능한 앱

## 🎨 UI/UX 개선

### 14. 다크/라이트 모드
**구현 난이도: ⭐⭐**
**영향도: ⭐⭐⭐**

CSS 변수 활용:
```css
:root[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #000000;
}
```

### 15. 키보드 단축키
**구현 난이도: ⭐⭐**
**영향도: ⭐⭐⭐**

- `Ctrl/Cmd + S`: 저장
- `Ctrl/Cmd + Z`: 실행
- `Delete`: 선택된 노드/엣지 삭제
- `Ctrl/Cmd + D`: 노드 복제

**라이브러리:** `react-hotkeys-hook`

### 16. 애니메이션
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐**

- 노드 추가/삭제 애니메이션
- 실행 중 시각적 피드백
- 부드러운 전환 효과

**라이브러리:** `framer-motion`

## 📊 데이터 및 분석

### 17. 워크플로우 분석
**구현 난이도: ⭐⭐⭐⭐**
**영향도: ⭐⭐⭐**

- 실행 패턴 분석
- 병목 지점 식별
- 최적화 제안

### 18. 사용 통계
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐**

- 노드 사용 빈도
- 인기 템플릿
- 에러 발생률

## 🔧 기술적 개선

### 19. TypeScript Strict Mode
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐⭐**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 20. ESLint 규칙 강화
**구현 난이도: ⭐⭐**
**영향도: ⭐⭐⭐**

더 엄격한 린팅 규칙 적용

### 21. CI/CD 파이프라인
**구현 난이도: ⭐⭐⭐**
**영향도: ⭐⭐⭐⭐**

GitHub Actions 설정:
- 자동 테스트
- 자동 빌드
- 자동 배포

## 🎯 추천 구현 순서

### Phase 1: 포트폴리오 강화 (1-2주)
1. ✅ 노드 실행 상태 시각화
2. ✅ 변수 시스템
3. ✅ 테스트 커버리지
4. ✅ Storybook

### Phase 2: 실용성 향상 (2-4주)
1. ✅ 워크플로우 실행 히스토리
2. ✅ 에러 처리 및 재시도
3. ✅ 노드 실행 결과 미리보기
4. ✅ 스케줄링 및 자동화

### Phase 3: 확장성 (1-2개월)
1. ✅ 백엔드 통합
2. ✅ 병렬 실행 지원
3. ✅ 실시간 협업 (선택적)

## 💻 빠른 시작 가이드

### 노드 실행 상태 시각화 구현 예시

```typescript
// 1. 실행 상태 스토어 생성
// src/stores/executionStore.ts
import { create } from 'zustand';

interface ExecutionState {
  nodeStates: Record<string, {
    status: 'idle' | 'running' | 'success' | 'error';
    result?: any;
    executionTime?: number;
  }>;
  setNodeState: (nodeId: string, state: any) => void;
  clearStates: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  nodeStates: {},
  setNodeState: (nodeId, state) => set((prev) => ({
    nodeStates: { ...prev.nodeStates, [nodeId]: state }
  })),
  clearStates: () => set({ nodeStates: {} }),
}));

// 2. 노드 컴포넌트에 상태 표시 추가
// src/components/NodeTypes/LLMNode.tsx
import { useExecutionStore } from '../../stores/executionStore';

export const LLMNode = memo(({ data, id }: NodeProps<LLMNodeData>) => {
  const nodeState = useExecutionStore((state) => state.nodeStates[id]);
  
  return (
    <div className="llm-node">
      {/* 기존 코드 */}
      {nodeState && (
        <div className={`node-status ${nodeState.status}`}>
          {nodeState.status === 'running' && <Spinner />}
          {nodeState.status === 'success' && <CheckCircle />}
          {nodeState.status === 'error' && <XCircle />}
        </div>
      )}
    </div>
  );
});
```

### 변수 시스템 구현 예시

```typescript
// src/stores/variableStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VariableStore {
  global: Record<string, any>;
  workflow: Record<string, any>;
  setGlobal: (key: string, value: any) => void;
  getGlobal: (key: string) => any;
  setWorkflow: (key: string, value: any) => void;
  getWorkflow: (key: string) => any;
  resolveVariable: (path: string) => any;
}

export const useVariableStore = create<VariableStore>()(
  persist(
    (set, get) => ({
      global: {},
      workflow: {},
      setGlobal: (key, value) => set((state) => ({
        global: { ...state.global, [key]: value }
      })),
      getGlobal: (key) => get().global[key],
      setWorkflow: (key, value) => set((state) => ({
        workflow: { ...state.workflow, [key]: value }
      })),
      getWorkflow: (key) => get().workflow[key],
      resolveVariable: (path) => {
        const [scope, key] = path.split('.');
        if (scope === 'global') return get().global[key];
        if (scope === 'workflow') return get().workflow[key];
        return undefined;
      },
    }),
    { name: 'variable-storage' }
  )
);
```

## 📝 체크리스트

### 즉시 시작 가능
- [ ] 노드 실행 상태 시각화
- [ ] 변수 시스템
- [ ] 워크플로우 실행 히스토리
- [ ] 테스트 작성

### 다음 단계
- [ ] 에러 처리 및 재시도
- [ ] 노드 실행 결과 미리보기
- [ ] 병렬 실행 지원
- [ ] 스케줄링 및 자동화

### 장기 목표
- [ ] 백엔드 통합
- [ ] 실시간 협업
- [ ] 확장 가능한 노드 시스템


