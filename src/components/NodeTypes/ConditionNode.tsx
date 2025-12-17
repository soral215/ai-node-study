import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { GitBranch, Eye } from 'lucide-react';
import type { ConditionNodeData } from '../../types';
import { NodeExecutionBadge } from '../NodeExecutionBadge/NodeExecutionBadge';
import { NodeResultViewer } from '../NodeResultViewer/NodeResultViewer';
import { useExecutionStore } from '../../stores/executionStore';

export const ConditionNode = memo(({ data, id }: NodeProps<ConditionNodeData>) => {
  const [showResult, setShowResult] = useState(false);
  const nodeState = useExecutionStore((state) => state.getNodeState(id));
  const hasResult = nodeState?.result !== undefined;

  const getResultPreview = () => {
    if (!nodeState?.result) return null;
    const result = nodeState.result;
    if (typeof result === 'object' && result.condition !== undefined) {
      return result.condition ? 'True' : 'False';
    }
    return String(result);
  };

  return (
    <>
      <div 
        className="condition-node"
        style={{ position: 'relative' }}
      >
        <NodeExecutionBadge nodeId={id} />
        <div className="node-header">
          <GitBranch size={16} />
          <span>{data.label || '조건'}</span>
        </div>
        <div className="node-content">
          {data.condition && (
            <div className="node-info">
              <span className="node-condition">{data.condition}</span>
            </div>
          )}
          {hasResult && (
            <div className="node-result-preview">
              <div className="result-preview-label">결과:</div>
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
        <div className="condition-handles">
          <div className="condition-handle-wrapper">
            <Handle type="source" position={Position.Bottom} id="true" />
            <span className="handle-label">True</span>
          </div>
          <div className="condition-handle-wrapper">
            <Handle type="source" position={Position.Right} id="false" />
            <span className="handle-label">False</span>
          </div>
        </div>
      </div>
      {showResult && (
        <NodeResultViewer nodeId={id} onClose={() => setShowResult(false)} />
      )}
    </>
  );
});

ConditionNode.displayName = 'ConditionNode';

