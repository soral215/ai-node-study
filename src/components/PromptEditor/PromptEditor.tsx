import { useState, useRef } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useVariableStore } from '../../stores/variableStore';
import { useExecutionStore } from '../../stores/executionStore';
import { ChevronDown, Sparkles, X } from 'lucide-react';
import './PromptEditor.css';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  nodeId: string;
  placeholder?: string;
  rows?: number;
}

const PROMPT_TEMPLATES = [
  { name: '요약', template: '다음 텍스트를 간단히 요약해주세요:\n\n{{input}}' },
  { name: '번역', template: '다음 텍스트를 영어로 번역해주세요:\n\n{{input}}' },
  { name: '분석', template: '다음 데이터를 분석하고 주요 포인트를 정리해주세요:\n\n{{input}}' },
  { name: '생성', template: '다음 주제에 대한 내용을 생성해주세요:\n\n{{input}}' },
  { name: '개선', template: '다음 텍스트를 더 명확하고 읽기 쉽게 개선해주세요:\n\n{{input}}' },
  { name: '질문-답변', template: '다음 질문에 답변해주세요:\n\n{{input}}' },
];

export const PromptEditor = ({ value, onChange, nodeId, placeholder = '프롬프트를 입력하세요...', rows = 6 }: PromptEditorProps) => {
  const [showVariables, setShowVariables] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { nodes, edges } = useWorkflowStore();
  const { global, workflow } = useVariableStore();
  const { nodeStates } = useExecutionStore();

  // 현재 노드의 이전 노드 찾기
  const previousNodes = edges
    .filter(edge => edge.target === nodeId)
    .map(edge => nodes.find(n => n.id === edge.source))
    .filter((node): node is NonNullable<typeof node> => node !== undefined);

  // 사용 가능한 변수 목록
  const availableVariables = [
    { label: '이전 노드 출력', value: 'input', description: '이전 노드의 출력 값' },
    ...Object.entries(global || {}).map(([key, value]) => ({
      label: `전역: ${key}`,
      value: `global.${key}`,
      description: typeof value === 'object' ? JSON.stringify(value) : String(value),
    })),
    ...Object.entries(workflow || {}).map(([key, value]) => ({
      label: `워크플로우: ${key}`,
      value: `workflow.${key}`,
      description: typeof value === 'object' ? JSON.stringify(value) : String(value),
    })),
  ];

  // 변수 삽입
  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    const newValue = `${textBefore}{{${variable}}}${textAfter}`;

    onChange(newValue);
    setShowVariables(false);

    // 커서 위치 조정
    setTimeout(() => {
      const newCursorPos = start + variable.length + 4; // {{}} 포함
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // 템플릿 적용
  const applyTemplate = (template: string) => {
    onChange(template);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  // 이전 노드 출력 삽입
  const insertPreviousOutput = () => {
    insertVariable(`input`);
  };

  return (
    <div className="prompt-editor-container">
      <div className="prompt-editor-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => setShowTemplates(!showTemplates)}
          title="프롬프트 템플릿"
        >
          <Sparkles size={14} />
          템플릿
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => setShowVariables(!showVariables)}
          title="변수 삽입"
        >
          <ChevronDown size={14} />
          변수
        </button>
      </div>

      {showTemplates && (
        <div className="template-dropdown">
          <div className="dropdown-header">
            <span>프롬프트 템플릿</span>
            <button onClick={() => setShowTemplates(false)} className="close-dropdown">
              <X size={14} />
            </button>
          </div>
          <div className="template-list">
            {PROMPT_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                className="template-item"
                onClick={() => applyTemplate(tpl.template)}
              >
                <span className="template-name">{tpl.name}</span>
                <span className="template-preview">{tpl.template.substring(0, 50)}...</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showVariables && (
        <div className="variables-dropdown">
          <div className="dropdown-header">
            <span>변수 삽입</span>
            <button onClick={() => setShowVariables(false)} className="close-dropdown">
              <X size={14} />
            </button>
          </div>
          
          {previousNodes.length > 0 && (
            <div className="variables-section">
              <div className="section-title">이전 노드 출력</div>
              {previousNodes.map((node) => {
                const nodeState = nodeStates[node.id];
                const hasResult = nodeState?.result !== undefined;
                return (
                  <button
                    key={node.id}
                    className={`variable-item ${hasResult ? 'has-result' : ''}`}
                    onClick={() => insertPreviousOutput()}
                    title={hasResult ? '실행 결과 있음' : '아직 실행되지 않음'}
                  >
                    <span className="variable-label">{node.data?.label || node.type}</span>
                    {hasResult && nodeState && (
                      <span className="variable-preview">
                        {typeof nodeState.result === 'string'
                          ? nodeState.result.substring(0, 30) + '...'
                          : JSON.stringify(nodeState.result).substring(0, 30) + '...'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {availableVariables.length > 0 && (
            <div className="variables-section">
              <div className="section-title">사용 가능한 변수</div>
              {availableVariables.map((variable, idx) => (
                <button
                  key={idx}
                  className="variable-item"
                  onClick={() => insertVariable(variable.value)}
                  title={variable.description}
                >
                  <span className="variable-label">{variable.label}</span>
                  <code className="variable-code">{`{{${variable.value}}}`}</code>
                </button>
              ))}
            </div>
          )}

          {availableVariables.length === 0 && previousNodes.length === 0 && (
            <div className="variables-empty">사용 가능한 변수가 없습니다</div>
          )}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        rows={rows}
        className="prompt-textarea"
      />

      {value && (
        <div className="prompt-preview">
          <div className="preview-label">프리뷰 (변수 해석 전):</div>
          <div className="preview-content">{value}</div>
        </div>
      )}
    </div>
  );
};

