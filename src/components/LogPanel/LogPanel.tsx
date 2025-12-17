import { useWorkflowStore } from '../../stores/workflowStore';
import type { ExecutionLog } from '../../types';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const getLogIcon = (level: ExecutionLog['level']) => {
  switch (level) {
    case 'error':
      return <AlertCircle size={14} className="log-icon error" />;
    case 'success':
      return <CheckCircle size={14} className="log-icon success" />;
    case 'warning':
      return <AlertTriangle size={14} className="log-icon warning" />;
    default:
      return <Info size={14} className="log-icon info" />;
  }
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR');
};

export const LogPanel = () => {
  const { logs, clearLogs } = useWorkflowStore();

  return (
    <div className="log-panel">
      <div className="log-panel-header">
        <h3>실행 로그</h3>
        <button onClick={clearLogs} className="clear-logs-btn">
          지우기
        </button>
      </div>
      <div className="log-list">
        {logs.length === 0 ? (
          <div className="log-empty">로그가 없습니다.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-item log-${log.level}`}>
              <div className="log-icon-wrapper">{getLogIcon(log.level)}</div>
              <div className="log-content">
                <div className="log-header">
                  <span className="log-time">{formatTime(log.timestamp)}</span>
                  <span className="log-node-id">[{log.nodeId}]</span>
                </div>
                <div className="log-message">{log.message}</div>
                {log.data && (
                  <div className="log-data">
                    <pre>{JSON.stringify(log.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

