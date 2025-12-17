import { useState } from 'react';
import { useVariableStore } from '../../stores/variableStore';
import { Hash, X, Plus, Trash2 } from 'lucide-react';
import './VariablePanel.css';

export const VariablePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    global,
    workflow,
    setGlobal,
    setWorkflow,
    deleteGlobal,
    deleteWorkflow,
    clearGlobal,
    clearWorkflow,
  } = useVariableStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="variable-panel-btn"
        title="변수 관리"
      >
        <Hash size={16} />
        변수
      </button>

      {isOpen && (
        <div className="variable-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="variable-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>변수 관리</h2>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-content">
              <VariableSection
                title="전역 변수"
                variables={global}
                onSet={setGlobal}
                onDelete={deleteGlobal}
                onClear={clearGlobal}
                scope="global"
              />
              <VariableSection
                title="워크플로우 변수"
                variables={workflow}
                onSet={setWorkflow}
                onDelete={deleteWorkflow}
                onClear={clearWorkflow}
                scope="workflow"
              />
              <div className="variable-help">
                <h4>사용 방법</h4>
                <p>노드 설정에서 <code>{'{{global.변수명}}'}</code> 또는 <code>{'{{workflow.변수명}}'}</code> 형식으로 사용하세요.</p>
                <p>예시:</p>
                <ul>
                  <li><code>{'{{global.apiUrl}}'}</code> - 전역 변수</li>
                  <li><code>{'{{workflow.userId}}'}</code> - 워크플로우 변수</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface VariableSectionProps {
  title: string;
  variables: Record<string, any>;
  onSet: (key: string, value: any) => void;
  onDelete: (key: string) => void;
  onClear: () => void;
  scope: 'global' | 'workflow';
}

const VariableSection = ({
  title,
  variables,
  onSet,
  onDelete,
  onClear,
}: VariableSectionProps) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey.trim()) return;

    try {
      // JSON으로 파싱 시도, 실패하면 문자열로 저장
      let value: any = newValue;
      try {
        value = JSON.parse(newValue);
      } catch {
        // JSON이 아니면 문자열로 저장
      }

      onSet(newKey.trim(), value);
      setNewKey('');
      setNewValue('');
    } catch (error) {
      alert('값을 저장할 수 없습니다.');
    }
  };

  const handleEdit = (key: string, currentValue: any) => {
    const newValue = prompt('새 값을 입력하세요:', JSON.stringify(currentValue));
    if (newValue !== null) {
      try {
        const parsed = JSON.parse(newValue);
        onSet(key, parsed);
      } catch {
        onSet(key, newValue);
      }
    }
  };

  return (
    <div className="variable-section">
      <div className="variable-section-header">
        <h3>{title}</h3>
        <button onClick={onClear} className="clear-btn" disabled={Object.keys(variables).length === 0}>
          모두 지우기
        </button>
      </div>
      <div className="variable-list">
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className="variable-item">
            <div className="variable-key-value">
              <span className="variable-key">{key}</span>
              <span className="variable-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
            <div className="variable-actions">
              <button onClick={() => handleEdit(key, value)} className="edit-btn">
                수정
              </button>
              <button onClick={() => onDelete(key)} className="delete-btn">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {Object.keys(variables).length === 0 && (
          <div className="variable-empty">변수가 없습니다.</div>
        )}
      </div>
      <div className="variable-add">
        <input
          type="text"
          placeholder="변수 이름"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="text"
          placeholder="값 (JSON 또는 문자열)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="add-btn">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

