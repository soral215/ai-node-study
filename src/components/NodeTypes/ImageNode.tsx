import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Image as ImageIcon, Eye } from 'lucide-react';
import type { ImageNodeData } from '../../types';
import { NodeExecutionBadge } from '../NodeExecutionBadge/NodeExecutionBadge';
import { NodeResultViewer } from '../NodeResultViewer/NodeResultViewer';
import { useExecutionStore } from '../../stores/executionStore';
import './ImageNode.css';

export const ImageNode = memo(({ data, id }: NodeProps<ImageNodeData>) => {
  const [showResult, setShowResult] = useState(false);
  const nodeState = useExecutionStore((state) => state.getNodeState(id));
  const hasResult = nodeState?.result !== undefined;

  const getResultPreview = () => {
    if (!nodeState?.result) return null;
    const result = nodeState.result;
    if (result.images && result.images.length > 0) {
      return `${result.images.length}개의 이미지 생성됨`;
    }
    return '이미지 생성 완료';
  };

  return (
    <>
      <div 
        className="image-node" 
        style={{ position: 'relative' }}
      >
        <NodeExecutionBadge nodeId={id} />
        <div className="node-header">
          <ImageIcon size={16} />
          <span>{data.label || 'Image'}</span>
        </div>
        <div className="node-content">
          {data.provider && (
            <div className="node-info">
              <span className="node-label">Provider:</span>
              <span>{data.provider === 'dalle' ? 'DALL-E' : 'Stable Diffusion'}</span>
            </div>
          )}
          {data.size && (
            <div className="node-info">
              <span className="node-label">Size:</span>
              <span>{data.size}</span>
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
        <Handle type="source" position={Position.Bottom} />
      </div>
      {showResult && (
        <NodeResultViewer nodeId={id} onClose={() => setShowResult(false)} />
      )}
    </>
  );
});

ImageNode.displayName = 'ImageNode';

