import { useState } from 'react';
import { useAPIKeyStore } from '../../stores/apiKeyStore';
import { Settings, Eye, EyeOff } from 'lucide-react';
import './APIKeySettings.css';

export const APIKeySettings = () => {
  const {
    openaiApiKey,
    anthropicApiKey,
    geminiApiKey,
    replicateApiKey,
    grokApiKey,
    setOpenAIApiKey,
    setAnthropicApiKey,
    setGeminiApiKey,
    setReplicateApiKey,
    setGrokApiKey,
  } = useAPIKeyStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    replicate: false,
    grok: false,
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

              <div className="api-key-group">
                <label>Replicate API Key</label>
                <div className="input-with-toggle">
                  <input
                    type={showKeys.replicate ? 'text' : 'password'}
                    value={replicateApiKey}
                    onChange={(e) => setReplicateApiKey(e.target.value)}
                    placeholder="r8_..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, replicate: !showKeys.replicate })}
                    className="toggle-visibility"
                  >
                    {showKeys.replicate ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  API 키 발급받기
                </a>
                <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Stable Diffusion, FLUX 등 이미지 생성 모델 사용 시 필요
                </small>
              </div>

              <div className="api-key-group">
                <label>Grok (xAI) API Key</label>
                <div className="input-with-toggle">
                  <input
                    type={showKeys.grok ? 'text' : 'password'}
                    value={grokApiKey}
                    onChange={(e) => setGrokApiKey(e.target.value)}
                    placeholder="xai-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, grok: !showKeys.grok })}
                    className="toggle-visibility"
                  >
                    {showKeys.grok ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <a
                  href="https://console.x.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-key-link"
                >
                  API 키 발급받기
                </a>
                <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  xAI의 Grok 모델 사용 시 필요 (LLM)
                </small>
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

