import { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useExecutionStore } from '../../stores/executionStore';
import { X, Trash2, Eye } from 'lucide-react';
import type { LLMNodeData, APINodeData, FunctionNodeData, ConditionNodeData, ImageNodeData } from '../../types';
import { PromptEditor } from '../PromptEditor/PromptEditor';
import { getModelsForProvider, getDefaultModel } from '../../utils/llmModels';
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
  const [customModel, setCustomModel] = useState(false);

  useEffect(() => {
    setData(node.data as LLMNodeData);
    // 현재 모델이 목록에 없으면 커스텀 모드
    const models = getModelsForProvider(data.provider || 'openai');
    const hasModel = models.some(m => m.id === data.model);
    setCustomModel(!hasModel && !!data.model);
  }, [node.id, node.data]);

  const handleChange = (field: keyof LLMNodeData, value: any) => {
    const newData = { ...data, [field]: value };
    
    // Provider가 변경되면 기본 모델로 변경
    if (field === 'provider') {
      const defaultModel = getDefaultModel(value);
      newData.model = defaultModel;
      setCustomModel(false);
    }
    
    setData(newData);
    updateNode(node.id, newData);
  };

  const handleModelChange = (value: string) => {
    if (value === '__custom__') {
      setCustomModel(true);
      // 기존 모델 값 유지
    } else {
      setCustomModel(false);
      handleChange('model', value);
    }
  };

  const availableModels = getModelsForProvider(data.provider || 'openai');
  const currentModel = data.model || '';

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
          <option value="grok">Grok (xAI)</option>
        </select>
      </div>
      <div className="form-group">
        <label>Model</label>
        {!customModel ? (
          <select
            value={availableModels.some(m => m.id === currentModel) ? currentModel : ''}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <option value="">모델 선택...</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.description ? `(${model.description})` : ''}
              </option>
            ))}
            <option value="__custom__">+ 커스텀 모델 입력</option>
          </select>
        ) : (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={data.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="모델 ID 입력..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => {
                setCustomModel(false);
                const defaultModel = getDefaultModel(data.provider || 'openai');
                handleChange('model', defaultModel);
              }}
              style={{
                padding: '6px 12px',
                background: '#3a3a3a',
                border: '1px solid #4a4a4a',
                color: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                whiteSpace: 'nowrap',
              }}
              title="드롭다운으로 전환"
            >
              드롭다운
            </button>
          </div>
        )}
        {!customModel && availableModels.some(m => m.id === currentModel) && (
          <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            {availableModels.find(m => m.id === currentModel)?.description}
          </small>
        )}
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
          <option value="dalle">DALL-E 3 (OpenAI)</option>
          {/* <option value="grok">Grok Imagine (xAI)</option> - 일시적으로 사용 정지 */}
          <option value="stable-diffusion">Stable Diffusion (Replicate)</option>
          <option value="stable-diffusion-xl">Stable Diffusion XL (Replicate)</option>
          <option value="flux">FLUX (Replicate)</option>
        </select>
      </div>
      <div className="form-group">
        <label>
          Prompt
          {data.provider === 'grok' && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#888', fontWeight: 'normal' }}>
              ({data.prompt?.length || 0}/1024자)
              {data.prompt && data.prompt.length > 1024 && (
                <span style={{ color: '#ff4444', marginLeft: '4px' }}>⚠️ 초과</span>
              )}
            </span>
          )}
        </label>
        <PromptEditor
          value={data.prompt || ''}
          onChange={(value) => handleChange('prompt', value)}
          nodeId={node.id}
          placeholder="이미지를 생성할 프롬프트를 입력하세요..."
          rows={6}
        />
        {data.provider === 'grok' && data.prompt && data.prompt.length > 1024 && (
          <small style={{ color: '#ff4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            ⚠️ Grok API는 프롬프트를 최대 1024자까지 지원합니다. 프롬프트가 자동으로 잘립니다.
          </small>
        )}
      </div>
      {data.provider === 'dalle' && (
        <>
          <div className="form-group">
            <label>Model</label>
            <select
              value={data.model || 'gpt-image-1.5'}
              onChange={(e) => handleChange('model', e.target.value)}
            >
              <optgroup label="GPT Image (권장)">
                <option value="gpt-image-1.5">GPT Image 1.5 (최신)</option>
                <option value="gpt-image-1">GPT Image 1</option>
                <option value="gpt-image-1-mini">GPT Image 1 Mini</option>
              </optgroup>
              <optgroup label="DALL-E (Deprecated)">
                <option value="dall-e-3">DALL-E 3 (2026-05-12까지 지원)</option>
                <option value="dall-e-2">DALL-E 2 (2026-05-12까지 지원)</option>
              </optgroup>
            </select>
            <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              공식 문서: <a href="https://platform.openai.com/docs/guides/image-generation" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>이미지 생성 가이드</a>
            </small>
          </div>
          <div className="form-group">
            <label>Size</label>
            <select
              value={data.size || '1024x1024'}
              onChange={(e) => handleChange('size', e.target.value)}
            >
              {data.model?.startsWith('gpt-image') ? (
                <>
                  <option value="auto">Auto (자동 선택)</option>
                  <option value="1024x1024">1024x1024 (정사각형)</option>
                  <option value="1024x1536">1024x1536 (세로)</option>
                  <option value="1536x1024">1536x1024 (가로)</option>
                </>
              ) : (!data.model || data.model === 'dall-e-3') ? (
                <>
                  <option value="1024x1024">1024x1024 (정사각형)</option>
                  <option value="1024x1792">1024x1792 (세로)</option>
                  <option value="1792x1024">1792x1024 (가로)</option>
                </>
              ) : (
                <>
                  <option value="256x256">256x256</option>
                  <option value="512x512">512x512</option>
                  <option value="1024x1024">1024x1024</option>
                </>
              )}
            </select>
          </div>
          {data.model?.startsWith('gpt-image') ? (
            <>
              <div className="form-group">
                <label>Quality</label>
                <select
                  value={data.quality || 'auto'}
                  onChange={(e) => handleChange('quality', e.target.value)}
                >
                  <option value="auto">Auto (자동 선택)</option>
                  <option value="low">Low (빠름)</option>
                  <option value="medium">Medium (균형)</option>
                  <option value="high">High (고품질)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Background</label>
                <select
                  value={data.background || 'auto'}
                  onChange={(e) => handleChange('background', e.target.value || undefined)}
                >
                  <option value="auto">Auto (자동 선택)</option>
                  <option value="opaque">Opaque (불투명)</option>
                  <option value="transparent">Transparent (투명)</option>
                </select>
                <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  투명 배경은 PNG/WebP 형식에서만 지원됩니다
                </small>
              </div>
              <div className="form-group">
                <label>생성 개수</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={data.n || 1}
                  onChange={(e) => handleChange('n', parseInt(e.target.value))}
                />
                <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  최대 10개까지 생성 가능
                </small>
              </div>
            </>
          ) : (!data.model || data.model === 'dall-e-3') ? (
            <>
              <div className="form-group">
                <label>Quality</label>
                <select
                  value={data.quality || 'standard'}
                  onChange={(e) => handleChange('quality', e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD (고화질)</option>
                </select>
                <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  DALL-E 3는 한 번에 1개만 생성 가능
                </small>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>생성 개수</label>
              <input
                type="number"
                min="1"
                max="10"
                value={data.n || 1}
                onChange={(e) => handleChange('n', parseInt(e.target.value))}
              />
              <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                DALL-E 2는 최대 10개까지 생성 가능
              </small>
            </div>
          )}
        </>
      )}
      {data.provider === 'grok' && (
        <>
          <div className="form-group">
            <label>생성 개수</label>
            <input
              type="number"
              min="1"
              max="10"
              value={data.n || data.numOutputs || 1}
              onChange={(e) => handleChange('n', parseInt(e.target.value))}
            />
            <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              최대 10개까지 생성 가능 (Grok API는 size 파라미터를 지원하지 않습니다)
            </small>
          </div>
        </>
      )}
      {(data.provider === 'stable-diffusion' || data.provider === 'stable-diffusion-xl' || data.provider === 'flux') && (
        <>
          <div className="form-group">
            <label>Size</label>
            <select
              value={data.size || '1024x1024'}
              onChange={(e) => handleChange('size', e.target.value)}
            >
              <option value="512x512">512x512</option>
              <option value="768x768">768x768</option>
              <option value="1024x1024">1024x1024</option>
              <option value="1024x1792">1024x1792 (세로)</option>
              <option value="1792x1024">1792x1024 (가로)</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>생성 개수</label>
              <input
                type="number"
                min="1"
                max="4"
                value={data.numOutputs || data.n || 1}
                onChange={(e) => handleChange('numOutputs', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>추론 단계</label>
              <input
                type="number"
                min="10"
                max="100"
                value={data.numInferenceSteps || 50}
                onChange={(e) => handleChange('numInferenceSteps', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Guidance Scale</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={data.guidanceScale || 7.5}
              onChange={(e) => handleChange('guidanceScale', parseFloat(e.target.value))}
            />
            <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              값이 높을수록 프롬프트를 더 정확히 따릅니다 (권장: 7.5)
            </small>
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

