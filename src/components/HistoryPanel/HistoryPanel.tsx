import { useState } from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { History, X, Trash2, Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import './HistoryPanel.css';

export const HistoryPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { histories, deleteHistory, clearHistory, getRecentHistories } = useHistoryStore();
  const recentHistories = getRecentHistories(20);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={14} className="status-icon success" />;
      case 'error':
        return <XCircle size={14} className="status-icon error" />;
      case 'cancelled':
        return <Ban size={14} className="status-icon cancelled" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="history-panel-btn"
        title="실행 히스토리"
      >
        <History size={16} />
        히스토리
      </button>

      {isOpen && (
        <div className="history-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>실행 히스토리</h2>
              <div className="header-actions">
                {histories.length > 0 && (
                  <button onClick={clearHistory} className="clear-btn" title="모두 지우기">
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="close-btn">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="modal-content">
              {recentHistories.length === 0 ? (
                <div className="history-empty">
                  <History size={48} />
                  <p>실행 히스토리가 없습니다.</p>
                  <p className="empty-hint">워크플로우를 실행하면 히스토리가 저장됩니다.</p>
                </div>
              ) : (
                <div className="history-list">
                  {recentHistories.map((history) => (
                    <div key={history.id} className="history-item">
                      <div className="history-item-header">
                        <div className="history-title">
                          {getStatusIcon(history.status)}
                          <span className="workflow-name">{history.workflowName}</span>
                        </div>
                        <button
                          onClick={() => deleteHistory(history.id)}
                          className="delete-history-btn"
                          title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="history-item-content">
                        <div className="history-meta">
                          <div className="meta-item">
                            <Clock size={12} />
                            <span>{formatTime(history.startedAt)}</span>
                          </div>
                          {history.executionTime && (
                            <div className="meta-item">
                              <span>실행 시간: {formatDuration(history.executionTime)}</span>
                            </div>
                          )}
                          <div className="meta-item">
                            <span>{history.nodeCount}개 노드</span>
                            <span>•</span>
                            <span>{history.edgeCount}개 연결</span>
                          </div>
                        </div>
                        {history.logs.length > 0 && (
                          <div className="history-logs-preview">
                            <div className="logs-count">
                              {history.logs.length}개 로그
                            </div>
                            <div className="logs-summary">
                              {history.logs.slice(0, 3).map((log, idx) => (
                                <div key={idx} className={`log-preview log-${log.level}`}>
                                  <span className="log-level">{log.level}</span>
                                  <span className="log-message">{log.message}</span>
                                </div>
                              ))}
                              {history.logs.length > 3 && (
                                <div className="logs-more">
                                  +{history.logs.length - 3}개 더...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

