import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Globe, Eye } from 'lucide-react';
import type { APINodeData } from '../../types';
import { NodeExecutionBadge } from '../NodeExecutionBadge/NodeExecutionBadge';
import { NodeResultViewer } from '../NodeResultViewer/NodeResultViewer';
import { useExecutionStore } from '../../stores/executionStore';

export const APINode = memo(({ data, id }: NodeProps<APINodeData>) => {
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
        className="api-node" 
        style={{ position: 'relative' }}
      >
        <NodeExecutionBadge nodeId={id} />
        <div className="node-header">
          <Globe size={16} />
          <span>{data.label || 'API'}</span>
        </div>
      <div className="node-content">
        {data.method && (
          <div className="node-info">
            <span className="node-badge method">{data.method}</span>
          </div>
        )}
        {data.url && (
          <div className="node-info">
            <span className="node-url">{data.url}</span>
          </div>
        )}
        {hasResult && (
          <div className="node-result-preview">
            <div className="result-preview-label">결과 미리보기:</div>
            <div className="result-preview-text">{getResultPreview()}</div>
          </div>
        )}
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
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      </div>
      {showResult && (
        <NodeResultViewer nodeId={id} onClose={() => setShowResult(false)} />
      )}
    </>
  );
});

APINode.displayName = 'APINode';

