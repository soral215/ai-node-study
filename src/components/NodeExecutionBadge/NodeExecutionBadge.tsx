import { useExecutionStore } from '../../stores/executionStore';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import './NodeExecutionBadge.css';

interface NodeExecutionBadgeProps {
  nodeId: string;
}

export const NodeExecutionBadge = ({ nodeId }: NodeExecutionBadgeProps) => {
  const nodeState = useExecutionStore((state) => state.getNodeState(nodeId));

  if (!nodeState || nodeState.status === 'idle') {
    return null;
  }

  const getStatusIcon = () => {
    switch (nodeState.status) {
      case 'running':
        return <Loader2 size={12} className="spinning" />;
      case 'success':
        return <CheckCircle2 size={12} />;
      case 'error':
        return <XCircle size={12} />;
      default:
        return null;
    }
  };

  const getStatusClass = () => {
    return `execution-badge execution-badge-${nodeState.status}`;
  };

  return (
    <div className={getStatusClass()}>
      {getStatusIcon()}
      {nodeState.executionTime && (
        <span className="execution-time">
          <Clock size={10} />
          {nodeState.executionTime}ms
        </span>
      )}
    </div>
  );
};


