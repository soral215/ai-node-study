import { useExecutionStore } from '../../stores/executionStore';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import './NodeResultViewer.css';

interface NodeResultViewerProps {
  nodeId: string;
  onClose: () => void;
}

export const NodeResultViewer = ({ nodeId, onClose }: NodeResultViewerProps) => {
  const nodeState = useExecutionStore((state) => state.getNodeState(nodeId));
  const [copied, setCopied] = useState(false);

  if (!nodeState || !nodeState.result) {
    return null;
  }

  const result = nodeState.result;
  let resultString: string;
  
  if (typeof result === 'string') {
    resultString = result;
  } else if (typeof result === 'object' && result !== null) {
    resultString = JSON.stringify(result, null, 2);
  } else {
    resultString = String(result);
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const modalContent = (
    <div className="node-result-viewer-overlay" onClick={onClose}>
      <div className="node-result-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="result-viewer-header">
          <h3>실행 결과</h3>
          <div className="header-actions">
            <button onClick={handleCopy} className="copy-btn" title="복사">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button onClick={onClose} className="close-btn">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="result-viewer-content">
          {result.images && Array.isArray(result.images) ? (
            <div className="result-images">
              {result.images.map((imageUrl: string, index: number) => (
                <div key={index} className="image-item">
                  <img src={imageUrl} alt={`Generated image ${index + 1}`} className="generated-image" />
                  <div className="image-actions">
                    <a href={imageUrl} download={`image-${index + 1}.png`} className="download-btn">
                      다운로드
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(imageUrl);
                        alert('이미지 URL이 클립보드에 복사되었습니다.');
                      }}
                      className="copy-url-btn"
                    >
                      URL 복사
                    </button>
                  </div>
                </div>
              ))}
              {result.revisedPrompt && (
                <div className="revised-prompt">
                  <strong>수정된 프롬프트:</strong>
                  <p>{result.revisedPrompt}</p>
                </div>
              )}
            </div>
          ) : typeof result === 'string' ? (
            <div className="result-text">{result}</div>
          ) : (
            <pre className="result-json">{resultString}</pre>
          )}
        </div>
        {nodeState.executionTime && (
          <div className="result-viewer-footer">
            <span>실행 시간: {nodeState.executionTime}ms</span>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

