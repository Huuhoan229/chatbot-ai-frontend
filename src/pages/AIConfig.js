import React, { useState, useEffect } from 'react';
import { Cpu, Save, Check } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

export default function AIConfig() {
  const [models, setModels] = useState([]);
  const [config, setConfig] = useState({ provider: 'openai', model: 'gpt-4o-mini', apiKeys: {} });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/ai-config/models'), api.get('/ai-config')]).then(([mRes, cRes]) => {
      setModels(mRes.data.models);
      setConfig(cRes.data.config || { provider: 'openai', model: 'gpt-4o-mini', apiKeys: {} });
    }).catch(handleError);
  }, []);

  const handleModelSelect = (model) => {
    setConfig({ ...config, provider: model.provider, model: model.model });
    setApiKeyInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/ai-config', { ...config, apiKey: apiKeyInput || undefined });
      toast.success('Đã lưu cấu hình AI!');
    } catch (err) { handleError(err); }
    finally { setSaving(false); }
  };

  const providerColors = { openai: '#10a37f', gemini: '#4285f4', groq: '#f55036', deepseek: '#1e40af' };
  const selectedModel = models.find(m => m.model === config.model);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Kết nối AI</h1><p>Chọn model AI và nhập API key</p></div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Cpu size={18} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Chọn Model AI</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {models.map(m => (
                  <div
                    key={m.model}
                    onClick={() => handleModelSelect(m)}
                    style={{
                      padding: '14px 16px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                      border: config.model === m.model ? `2px solid var(--primary)` : '2px solid var(--gray-200)',
                      background: config.model === m.model ? 'var(--primary-light)' : 'white',
                      position: 'relative',
                    }}
                  >
                    {config.model === m.model && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--primary)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} color="white" />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: providerColors[m.provider] || '#666' }} />
                      <span style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>{m.provider}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                      ${m.costPer1M}/1M token
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                      ≈ {Math.round(m.costPer1M * 25000).toLocaleString('vi-VN')}đ/1M token
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600 }}>API Key cho {config.provider}</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Nhập API Key (để trống nếu dùng key mặc định từ server)</label>
                <input
                  className="form-control"
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder={`${config.provider === 'openai' ? 'sk-...' : config.provider === 'gemini' ? 'AIza...' : 'Nhập API key...'}`}
                />
                {config.apiKeys?.[config.provider] && (
                  <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>✅ Đã có API key được lưu</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          {selectedModel && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span style={{ fontWeight: 600 }}>Model đang chọn</span></div>
              <div className="card-body">
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: providerColors[selectedModel.provider] || '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>
                    🤖
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{selectedModel.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12, textTransform: 'capitalize' }}>{selectedModel.provider}</div>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--gray-500)' }}>Chi phí:</span>
                      <strong style={{ color: 'var(--success)' }}>${selectedModel.costPer1M}/1M token</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Quy đổi:</span>
                      <strong>{Math.round(selectedModel.costPer1M * 25000).toLocaleString('vi-VN')}đ/1M</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600 }}>Gợi ý</span></div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}><strong>Tiết kiệm nhất:</strong> Llama 3 8B (Groq) - Miễn phí có giới hạn</p>
              <p style={{ marginBottom: 8 }}><strong>Cân bằng:</strong> GPT-4o Mini hoặc Gemini 1.5 Flash</p>
              <p><strong>Chất lượng cao:</strong> GPT-4o hoặc Gemini 1.5 Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
