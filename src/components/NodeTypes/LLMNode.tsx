import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Brain, Eye } from 'lucide-react';
import type { LLMNodeData } from '../../types';
import { NodeExecutionBadge } from '../NodeExecutionBadge/NodeExecutionBadge';
import { NodeResultViewer } from '../NodeResultViewer/NodeResultViewer';
import { useExecutionStore } from '../../stores/executionStore';

export const LLMNode = memo(({ data, id }: NodeProps<LLMNodeData>) => {
  const [showResult, setShowResult] = useState(false);
  const nodeState = useExecutionStore((state) => state.getNodeState(id));
  const hasResult = nodeState?.result !== undefined;

  const getResultPreview = () => {
    if (!nodeState?.result) return null;
    const result = nodeState.result;
    if (typeof result === 'string') {
      return result.length > 100 ? result.substring(0, 100) + '...' : result;
    }
    return JSON.stringify(result).substring(0, 100) + '...';
  };

  return (
    <>
      <div 
        className="llm-node" 
        style={{ position: 'relative' }}
      >
        <NodeExecutionBadge nodeId={id} />
        <div className="node-header">
          <Brain size={16} />
          <span>{data.label || 'LLM'}</span>
        </div>
        <div className="node-content">
          {data.provider && (
            <div className="node-info">
              <span className="node-label">Provider:</span>
              <span>{data.provider}</span>
            </div>
          )}
          {data.model && (
            <div className="node-info">
              <span className="node-label">Model:</span>
              <span>{data.model}</span>
            </div>
          )}
          {hasResult && (
            <div className="node-result-preview">
              <div className="result-preview-label">결과 미리보기:</div>
              <div className="result-preview-text">{getResultPreview()}</div>
            </div>
          )}
        </div>
        {hasResult && (
          <button 
            className="view-result-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowResult(true);
            }}
            title="결과 상세 보기"
          >
            <Eye size={14} />
            <span>결과 보기</span>
          </button>
        )}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
      {showResult && (
        <NodeResultViewer nodeId={id} onClose={() => setShowResult(false)} />
      )}
    </>
  );
});

LLMNode.displayName = 'LLMNode';

