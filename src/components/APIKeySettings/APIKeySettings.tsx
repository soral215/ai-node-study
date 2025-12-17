import { useState } from 'react';
import { useAPIKeyStore } from '../../stores/apiKeyStore';
import { Settings, Eye, EyeOff } from 'lucide-react';
import './APIKeySettings.css';

export const APIKeySettings = () => {
  const {
    openaiApiKey,
    anthropicApiKey,
    geminiApiKey,
    setOpenAIApiKey,
    setAnthropicApiKey,
    setGeminiApiKey,
  } = useAPIKeyStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
  });

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="api-key-settings-btn" title="API 키 설정">
        <Settings size={16} />
      </button>

      {isOpen && (
        <div className="api-key-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="api-key-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>API 키 설정</h2>
              <button onClick={() => setIsOpen(false)} className="close-btn">
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="api-key-group">
                <label>OpenAI API Key</label>
                <div className="input-with-toggle">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={openaiApiKey}
                    onChange={(e) => setOpenAIApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                    className="toggle-visibility"
                  >
                    {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  API 키 발급받기
                </a>
              </div>

              <div className="api-key-group">
                <label>Anthropic API Key</label>
                <div className="input-with-toggle">
                  <input
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={anthropicApiKey}
                    onChange={(e) => setAnthropicApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, anthropic: !showKeys.anthropic })}
                    className="toggle-visibility"
                  >
                    {showKeys.anthropic ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  API 키 발급받기
                </a>
              </div>

              <div className="api-key-group">
                <label>Google Gemini API Key</label>
                <div className="input-with-toggle">
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIza..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                    className="toggle-visibility"
                  >
                    {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  API 키 발급받기
                </a>
              </div>

              <div className="modal-footer">
                <button onClick={() => setIsOpen(false)} className="save-btn">
                  저장 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

