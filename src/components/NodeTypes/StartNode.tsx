import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { NodeExecutionBadge } from '../NodeExecutionBadge/NodeExecutionBadge';

export const StartNode = memo(({ data, id }: NodeProps) => {
  return (
    <div className="start-node" style={{ position: 'relative' }}>
      <NodeExecutionBadge nodeId={id} />
      <div className="node-header">
        <Play size={16} />
        <span>{data.label || '시작'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

StartNode.displayName = 'StartNode';

