import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Square } from 'lucide-react';
import { NodeExecutionBadge } from '../NodeExecutionBadge/NodeExecutionBadge';

export const EndNode = memo(({ data, id }: NodeProps) => {
  return (
    <div className="end-node" style={{ position: 'relative' }}>
      <NodeExecutionBadge nodeId={id} />
      <div className="node-header">
        <Square size={16} />
        <span>{data.label || '종료'}</span>
      </div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
});

EndNode.displayName = 'EndNode';

