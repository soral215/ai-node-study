import { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useExecutionStore } from '../../stores/executionStore';
import { X, Trash2, Eye } from 'lucide-react';
import type { LLMNodeData, APINodeData, FunctionNodeData, ConditionNodeData, ImageNodeData } from '../../types';
import { PromptEditor } from '../PromptEditor/PromptEditor';
import './NodeSettingsPanel.css';

export const NodeSettingsPanel = () => {
  const { selectedNodeId, nodes, setSelectedNodeId, deleteNode } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return null;
  }

  const handleDelete = () => {
    if (selectedNodeId && window.confirm('이 노드를 삭제하시겠습니까?')) {
      deleteNode(selectedNodeId);
      setSelectedNodeId(null);
    }
  };

  return (
    <div className="node-settings-panel">
      <div className="settings-panel-header">
        <h3>노드 설정</h3>
        <div className="header-actions">
          {selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
            <button onClick={handleDelete} className="delete-btn" title="노드 삭제">
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={() => setSelectedNodeId(null)} className="close-btn" title="닫기">
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="settings-panel-content">
        {selectedNode.type === 'llm' && <LLMSettings node={selectedNode} />}
        {selectedNode.type === 'api' && <APISettings node={selectedNode} />}
        {selectedNode.type === 'function' && <FunctionSettings node={selectedNode} />}
        {selectedNode.type === 'condition' && <ConditionSettings node={selectedNode} />}
        {selectedNode.type === 'image' && <ImageSettings node={selectedNode} />}
        {(selectedNode.type === 'start' || selectedNode.type === 'end') && (
          <BasicSettings node={selectedNode} />
        )}
      </div>
    </div>
  );
};

const BasicSettings = ({ node }: { node: any }) => {
  const { updateNode } = useWorkflowStore();
  const [label, setLabel] = useState(node.data.label || '');

  useEffect(() => {
    setLabel(node.data.label || '');
  }, [node.id, node.data.label]);

  const handleSave = () => {
    updateNode(node.id, { label });
  };

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>레이블</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
          placeholder="노드 이름"
        />
      </div>
    </div>
  );
};

const LLMSettings = ({ node }: { node: any }) => {
  const { updateNode } = useWorkflowStore();
  const [data, setData] = useState<LLMNodeData>(node.data as LLMNodeData);

  useEffect(() => {
    setData(node.data as LLMNodeData);
  }, [node.id, node.data]);

  const handleChange = (field: keyof LLMNodeData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    updateNode(node.id, newData);
  };

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>레이블</label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="노드 이름"
        />
      </div>
      <div className="form-group">
        <label>Provider</label>
        <select
          value={data.provider || 'openai'}
          onChange={(e) => handleChange('provider', e.target.value)}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
      <div className="form-group">
        <label>Model</label>
        <input
          type="text"
          value={data.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          placeholder="gpt-4"
        />
      </div>
      <div className="form-group">
        <label>Prompt</label>
        <PromptEditor
          value={data.prompt || ''}
          onChange={(value) => handleChange('prompt', value)}
          nodeId={node.id}
          placeholder="프롬프트를 입력하세요..."
          rows={6}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Temperature</label>
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={data.temperature ?? 0.7}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Max Tokens</label>
          <input
            type="number"
            min="1"
            value={data.maxTokens || 1000}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

const APISettings = ({ node }: { node: any }) => {
  const { updateNode } = useWorkflowStore();
  const [data, setData] = useState<APINodeData>(node.data as APINodeData);

  useEffect(() => {
    setData(node.data as APINodeData);
  }, [node.id, node.data]);

  const handleChange = (field: keyof APINodeData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    updateNode(node.id, newData);
  };

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>레이블</label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="노드 이름"
        />
      </div>
      <div className="form-group">
        <label>Method</label>
        <select
          value={data.method || 'GET'}
          onChange={(e) => handleChange('method', e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div className="form-group">
        <label>URL</label>
        <div className="input-with-variables">
          <input
            type="text"
            value={data.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder="https://api.example.com/endpoint 또는 {{global.apiUrl}}/users"
          />
          <button
            type="button"
            className="variable-insert-btn"
            onClick={() => {
              const currentUrl = data.url || '';
              const newUrl = currentUrl + '{{input}}';
              handleChange('url', newUrl);
            }}
            title="이전 노드 출력 삽입"
          >
            {`{{}}`}
          </button>
        </div>
        <div className="form-hint" style={{ marginTop: '4px' }}>
          <small>변수 사용 예: <code>{`{{global.apiBaseUrl}}/users/{{input.id}}`}</code></small>
        </div>
      </div>
      <div className="form-group">
        <label>Headers (JSON)</label>
        <textarea
          value={data.headers ? JSON.stringify(data.headers, null, 2) : '{}'}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value);
              handleChange('headers', headers);
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder='{"Content-Type": "application/json"}'
          rows={4}
        />
      </div>
      {data.method !== 'GET' && (
        <div className="form-group">
          <label>Body (JSON)</label>
          <textarea
            value={data.body ? JSON.stringify(data.body, null, 2) : '{}'}
            onChange={(e) => {
              try {
                const body = JSON.parse(e.target.value);
                handleChange('body', body);
              } catch {
                // Invalid JSON, ignore
              }
            }}
            placeholder='{"key": "value"}'
            rows={4}
          />
        </div>
      )}
    </div>
  );
};

const FunctionSettings = ({ node }: { node: any }) => {
  const { updateNode } = useWorkflowStore();
  const [data, setData] = useState<FunctionNodeData>(node.data as FunctionNodeData);

  useEffect(() => {
    setData(node.data as FunctionNodeData);
  }, [node.id, node.data]);

  const handleChange = (field: keyof FunctionNodeData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    updateNode(node.id, newData);
  };

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>레이블</label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="노드 이름"
        />
      </div>
      <div className="form-group">
        <label>Language</label>
        <select
          value={data.language || 'javascript'}
          onChange={(e) => handleChange('language', e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      <div className="form-group">
        <label>Code</label>
        <InputOutputPreview nodeId={node.id} />
        <textarea
          value={data.code || ''}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder="함수 코드를 입력하세요..."
          rows={12}
          className="code-editor"
        />
        <div className="form-hint">
          <strong>사용 가능한 변수:</strong>
          <ul>
            <li><code>input</code> - 이전 노드의 출력</li>
            <li><code>console.log()</code> - 로그 출력</li>
            <li>표준 JavaScript 객체들 (JSON, Math, Date 등)</li>
          </ul>
          <strong>예시:</strong>
          <pre>{`// 입력 데이터 처리
const result = input * 2;
return { value: result, message: '처리 완료' };`}</pre>
        </div>
      </div>
    </div>
  );
};

const InputOutputPreview = ({ nodeId }: { nodeId: string }) => {
  const { nodes, edges } = useWorkflowStore();
  const { nodeStates } = useExecutionStore();
  const [showPreview, setShowPreview] = useState(false);

  const previousNode = edges
    .filter(edge => edge.target === nodeId)
    .map(edge => nodes.find(n => n.id === edge.source))[0];

  if (!previousNode) {
    return null;
  }

  const nodeState = nodeStates[previousNode.id];
  const hasResult = nodeState?.result !== undefined;

  if (!hasResult) {
    return (
      <div className="io-preview">
        <div className="io-preview-header">
          <span className="io-preview-label">이전 노드: {previousNode.data.label || previousNode.type}</span>
          <span className="io-preview-status">실행 결과 없음</span>
        </div>
      </div>
    );
  }

  const resultPreview = typeof nodeState.result === 'string'
    ? nodeState.result.substring(0, 100) + (nodeState.result.length > 100 ? '...' : '')
    : JSON.stringify(nodeState.result, null, 2).substring(0, 200) + '...';

  return (
    <div className="io-preview">
      <div className="io-preview-header">
        <span className="io-preview-label">이전 노드 출력: {previousNode.data.label || previousNode.type}</span>
        <button
          className="io-preview-toggle"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? '접기' : '펼치기'}
        >
          <Eye size={12} />
          {showPreview ? '접기' : '보기'}
        </button>
      </div>
      {showPreview && (
        <div className="io-preview-content">
          <pre>{resultPreview}</pre>
        </div>
      )}
    </div>
  );
};

const ImageSettings = ({ node }: { node: any }) => {
  const { updateNode } = useWorkflowStore();
  const [data, setData] = useState<ImageNodeData>(node.data as ImageNodeData);

  useEffect(() => {
    setData(node.data as ImageNodeData);
  }, [node.id, node.data]);

  const handleChange = (field: keyof ImageNodeData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    updateNode(node.id, newData);
  };

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>레이블</label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="노드 이름"
        />
      </div>
      <div className="form-group">
        <label>Provider</label>
        <select
          value={data.provider || 'dalle'}
          onChange={(e) => handleChange('provider', e.target.value)}
        >
          <option value="dalle">DALL-E (OpenAI)</option>
          <option value="stable-diffusion">Stable Diffusion</option>
        </select>
      </div>
      <div className="form-group">
        <label>Prompt</label>
        <PromptEditor
          value={data.prompt || ''}
          onChange={(value) => handleChange('prompt', value)}
          nodeId={node.id}
          placeholder="이미지를 생성할 프롬프트를 입력하세요..."
          rows={6}
        />
      </div>
      {data.provider === 'dalle' && (
        <>
          <div className="form-group">
            <label>Size</label>
            <select
              value={data.size || '1024x1024'}
              onChange={(e) => handleChange('size', e.target.value)}
            >
              <option value="1024x1024">1024x1024 (정사각형)</option>
              <option value="1024x1792">1024x1792 (세로)</option>
              <option value="1792x1024">1792x1024 (가로)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quality</label>
            <select
              value={data.quality || 'standard'}
              onChange={(e) => handleChange('quality', e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="hd">HD (고화질)</option>
            </select>
          </div>
        </>
      )}
      <div className="form-hint">
        <strong>사용 방법:</strong>
        <ul>
          <li>프롬프트에 <code>{'{{input}}'}</code>를 사용하여 이전 노드의 출력을 참조할 수 있습니다.</li>
          <li>DALL-E 3는 한 번에 1개의 이미지만 생성합니다.</li>
          <li>이미지 생성에는 시간이 걸릴 수 있습니다 (10-30초).</li>
        </ul>
      </div>
    </div>
  );
};

const ConditionSettings = ({ node }: { node: any }) => {
  const { updateNode } = useWorkflowStore();
  const [data, setData] = useState<ConditionNodeData>(node.data as ConditionNodeData);

  useEffect(() => {
    setData(node.data as ConditionNodeData);
  }, [node.id, node.data]);

  const handleChange = (field: keyof ConditionNodeData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    updateNode(node.id, newData);
  };

  return (
    <div className="settings-form">
      <div className="form-group">
        <label>레이블</label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
          placeholder="노드 이름"
        />
      </div>
      <div className="form-group">
        <label>조건식</label>
        <InputOutputPreview nodeId={node.id} />
        <textarea
          value={data.condition || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          placeholder="예: input > 10 || input.value === 'success'"
          rows={6}
          className="code-editor"
        />
        <div className="form-hint">
          <strong>사용 가능한 변수:</strong>
          <ul>
            <li><code>input</code> - 이전 노드의 출력</li>
            <li>이전 노드가 객체를 반환한 경우, 객체의 속성들을 직접 사용 가능</li>
          </ul>
          <strong>예시:</strong>
          <ul>
            <li><code>input &gt; 10</code></li>
            <li><code>input.status === 'success'</code></li>
            <li><code>input.length &gt; 0</code></li>
            <li><code>typeof input === 'string'</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

