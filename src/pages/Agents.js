import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Bot, Star, StarOff, Copy, ChevronDown, ChevronUp, Cpu, CheckCircle } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

const AI_MODELS = [
  { provider: 'openai', model: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: 0.15 },
  { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o', cost: 2.50 },
  { provider: 'openai', model: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost: 0.50 },
  { provider: 'gemini', model: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', cost: 0.10 },
  { provider: 'gemini', model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', cost: 0.075 },
  { provider: 'gemini', model: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', cost: 0.0375 },
  { provider: 'gemini', model: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', cost: 3.50 },
  { provider: 'groq', model: 'llama3-8b-8192', name: 'Llama 3 8B (Groq)', cost: 0.05 },
  { provider: 'groq', model: 'llama3-70b-8192', name: 'Llama 3 70B (Groq)', cost: 0.59 },
  { provider: 'deepseek', model: 'deepseek-chat', name: 'DeepSeek Chat', cost: 0.14 },
];

const PROVIDER_COLORS = { openai: '#10a37f', gemini: '#4285f4', groq: '#f55036', deepseek: '#1e40af' };
const PROVIDER_ICONS = { openai: '🤖', gemini: '✨', groq: '⚡', deepseek: '🔍' };

const DEFAULT_RULES = [
  { id: 1, rule: 'Không bịa đặt giá sản phẩm', active: true },
  { id: 2, rule: 'Không tự tạo sản phẩm không có trong danh sách', active: true },
  { id: 3, rule: 'Không hứa hẹn khuyến mãi nếu không có thông tin', active: true },
];

const EMPTY_FORM = {
  name: '', description: '', provider: 'gemini', model: 'gemini-1.5-flash',
  apiKey: '', systemPrompt: '', steelRules: DEFAULT_RULES,
  collectName: true, collectPhone: true, collectAddress: false,
  active: true, isDefault: false
};

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [fbPage, setFbPage] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newRule, setNewRule] = useState('');
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [agentsRes, pageRes] = await Promise.all([
        api.get('/agents'),
        api.get('/facebook/page-info'),
      ]);
      setAgents(agentsRes.data.agents);
      setFbPage(pageRes.data.page);

      if (pageRes.data.page?.pageId) {
        const assignRes = await api.get('/agents/assignments/pages');
        setAssignment(assignRes.data.assignments[pageRes.data.page.pageId] || null);
      }
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (agent) => {
    setEditing(agent);
    setForm({
      name: agent.name, description: agent.description || '',
      provider: agent.provider, model: agent.model,
      apiKey: '', // Don't prefill API key for security
      systemPrompt: agent.systemPrompt || '',
      steelRules: agent.steelRules?.length ? agent.steelRules : DEFAULT_RULES,
      collectName: agent.collectName ?? true,
      collectPhone: agent.collectPhone ?? true,
      collectAddress: agent.collectAddress ?? false,
      active: agent.active, isDefault: agent.isDefault
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/agents/${editing._id}`, form);
        toast.success('Đã cập nhật agent!');
      } else {
        await api.post('/agents', form);
        toast.success('Đã tạo agent mới!');
      }
      setModalOpen(false);
      loadAll();
    } catch (err) { handleError(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa agent này?')) return;
    try { await api.delete(`/agents/${id}`); toast.success('Đã xóa!'); loadAll(); }
    catch (err) { handleError(err); }
  };

  const handleSetDefault = async (agent) => {
    try {
      await api.put(`/agents/${agent._id}`, { ...agent, steelRules: agent.steelRules, isDefault: true });
      toast.success(`"${agent.name}" là agent mặc định`);
      loadAll();
    } catch (err) { handleError(err); }
  };

  const handleAssign = async () => {
    if (!fbPage?.pageId || !selectedAgentForAssign) return;
    try {
      await api.post('/agents/assignments/assign', { pageId: fbPage.pageId, agentId: selectedAgentForAssign });
      const agent = agents.find(a => a._id === selectedAgentForAssign);
      toast.success(`Đã gán "${agent?.name}" cho trang "${fbPage.pageName}"`);
      setAssignModalOpen(false);
      loadAll();
    } catch (err) { handleError(err); }
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    const nextId = Math.max(...form.steelRules.map(r => r.id), 0) + 1;
    setForm({ ...form, steelRules: [...form.steelRules, { id: nextId, rule: newRule.trim(), active: true }] });
    setNewRule('');
  };

  const selectedModelInfo = AI_MODELS.find(m => m.model === form.model);
  const assignedAgent = agents.find(a => a._id === assignment?.agentId);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Quản lý Agent</h1>
          <p>Tạo nhiều agent với cấu hình khác nhau, gắn vào từng Fanpage</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {fbPage && (
            <button onClick={() => { setSelectedAgentForAssign(assignment?.agentId || ''); setAssignModalOpen(true); }} className="btn btn-secondary">
              <Cpu size={16} /> Gán Agent cho Page
            </button>
          )}
          <button onClick={openCreate} className="btn btn-primary">
            <Plus size={16} /> Tạo Agent mới
          </button>
        </div>
      </div>

      {/* Page assignment banner */}
      {fbPage && (
        <div style={{
          background: assignedAgent ? '#f0fdf4' : '#fefce8',
          border: `1px solid ${assignedAgent ? '#bbf7d0' : '#fde68a'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {fbPage.pagePicture && <img src={fbPage.pagePicture} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />}
          <div style={{ flex: 1 }}>
            <strong>{fbPage.pageName}</strong>
            {assignedAgent ? (
              <span style={{ color: '#166534', fontSize: 13 }}> → Agent: <strong>{assignedAgent.name}</strong>
                <span style={{ marginLeft: 6, color: '#64748b' }}>({assignedAgent.provider} / {assignedAgent.model})</span>
              </span>
            ) : (
              <span style={{ color: '#92400e', fontSize: 13 }}> → Chưa gán agent (dùng cấu hình mặc định)</span>
            )}
          </div>
          <button onClick={() => { setSelectedAgentForAssign(assignment?.agentId || ''); setAssignModalOpen(true); }} className="btn btn-secondary btn-sm">
            Thay đổi
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="loading-spinner" /></div>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          <Bot size={48} />
          <h3>Chưa có agent nào</h3>
          <p>Tạo agent để tùy chỉnh cách bot hoạt động cho từng Fanpage</p>
          <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 16 }}>
            <Plus size={16} /> Tạo Agent đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {agents.map(agent => (
            <div key={agent._id} className="card">
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Provider icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: `${PROVIDER_COLORS[agent.provider]}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>
                  {PROVIDER_ICONS[agent.provider]}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{agent.name}</span>
                    {agent.isDefault && <span className="badge badge-purple">⭐ Mặc định</span>}
                    {!agent.active && <span className="badge badge-red">Tắt</span>}
                    {assignment?.agentId === agent._id && <span className="badge badge-green">📌 Đang dùng cho page</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, background: `${PROVIDER_COLORS[agent.provider]}15`, color: PROVIDER_COLORS[agent.provider], padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                      {agent.provider}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', padding: '2px 8px', background: 'var(--gray-100)', borderRadius: 20 }}>
                      {agent.model}
                    </span>
                    {agent.description && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{agent.description}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {!agent.isDefault && (
                    <button onClick={() => handleSetDefault(agent)} className="btn btn-secondary btn-sm" title="Đặt làm mặc định">
                      <Star size={14} /> Mặc định
                    </button>
                  )}
                  <button onClick={() => setExpandedAgent(expandedAgent === agent._id ? null : agent._id)} className="btn btn-secondary btn-sm btn-icon">
                    {expandedAgent === agent._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button onClick={() => openEdit(agent)} className="btn btn-secondary btn-sm btn-icon"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(agent._id)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedAgent === agent._id && (
                <div style={{ borderTop: '1px solid var(--gray-100)', padding: '16px 20px', background: 'var(--gray-50)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase' }}>System Prompt</p>
                      <div style={{ background: 'white', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--gray-600)', maxHeight: 120, overflowY: 'auto', border: '1px solid var(--gray-200)', whiteSpace: 'pre-wrap' }}>
                        {agent.systemPrompt || <em style={{ color: 'var(--gray-300)' }}>Chưa có prompt</em>}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase' }}>Luật Thép ({agent.steelRules?.filter(r => r.active).length || 0} đang bật)</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {agent.steelRules?.filter(r => r.active).slice(0, 4).map(r => (
                          <div key={r.id} style={{ fontSize: 12, color: '#991b1b', background: '#fef2f2', padding: '4px 8px', borderRadius: 6 }}>❌ {r.rule}</div>
                        ))}
                        {!agent.steelRules?.length && <em style={{ fontSize: 12, color: 'var(--gray-300)' }}>Chưa có luật nào</em>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12, color: 'var(--gray-500)' }}>
                    <span>📞 {agent.collectPhone ? '✅' : '❌'} Thu thập SĐT</span>
                    <span>👤 {agent.collectName ? '✅' : '❌'} Thu thập tên</span>
                    <span>📍 {agent.collectAddress ? '✅' : '❌'} Thu thập địa chỉ</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? '✏️ Sửa Agent' : '🤖 Tạo Agent mới'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 22 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Basic info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tên Agent *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="VD: Bot Tư Vấn Thời Trang" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mô tả</label>
                    <input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Dùng cho page nào, mục đích gì..." />
                  </div>
                </div>

                {/* Model selection */}
                <div className="form-group">
                  <label className="form-label">Chọn AI Model *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {AI_MODELS.map(m => (
                      <div
                        key={m.model}
                        onClick={() => setForm({ ...form, provider: m.provider, model: m.model })}
                        style={{
                          padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                          border: `2px solid ${form.model === m.model ? PROVIDER_COLORS[m.provider] : 'var(--gray-200)'}`,
                          background: form.model === m.model ? `${PROVIDER_COLORS[m.provider]}10` : 'white',
                          transition: 'all 0.15s', position: 'relative',
                        }}
                      >
                        {form.model === m.model && (
                          <CheckCircle size={14} color={PROVIDER_COLORS[m.provider]} style={{ position: 'absolute', top: 6, right: 6 }} />
                        )}
                        <div style={{ fontSize: 11, color: PROVIDER_COLORS[m.provider], fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
                          {PROVIDER_ICONS[m.provider]} {m.provider}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--success)' }}>${m.cost}/1M token</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div className="form-group">
                  <label className="form-label">API Key cho {form.provider} {editing ? '(để trống = giữ nguyên)' : ''}</label>
                  <input
                    className="form-control"
                    type="password"
                    value={form.apiKey}
                    onChange={e => setForm({ ...form, apiKey: e.target.value })}
                    placeholder={form.provider === 'openai' ? 'sk-...' : form.provider === 'gemini' ? 'AIza...' : 'API Key...'}
                  />
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Để trống để dùng API key mặc định từ biến môi trường server.</p>
                </div>

                {/* System Prompt */}
                <div className="form-group">
                  <label className="form-label">System Prompt (tính cách bot)</label>
                  <textarea
                    className="form-control"
                    value={form.systemPrompt}
                    onChange={e => setForm({ ...form, systemPrompt: e.target.value })}
                    style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 12 }}
                    placeholder="Bạn là trợ lý tư vấn bán hàng thân thiện của shop [TÊN]..."
                  />
                </div>

                {/* Steel Rules */}
                <div className="form-group">
                  <label className="form-label">Luật Thép riêng của Agent này</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      className="form-control"
                      value={newRule}
                      onChange={e => setNewRule(e.target.value)}
                      placeholder="Thêm luật mới..."
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRule())}
                    />
                    <button type="button" onClick={addRule} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>+ Thêm</button>
                  </div>
                  <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.steelRules.map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: r.active ? '#fef2f2' : 'var(--gray-50)', borderRadius: 6, border: `1px solid ${r.active ? '#fecaca' : 'var(--gray-200)'}` }}>
                        <label className="switch" style={{ transform: 'scale(0.8)', flexShrink: 0 }}>
                          <input type="checkbox" checked={r.active} onChange={() => setForm({ ...form, steelRules: form.steelRules.map(x => x.id === r.id ? { ...x, active: !x.active } : x) })} />
                          <span className="switch-slider" />
                        </label>
                        <span style={{ flex: 1, fontSize: 12 }}>{r.rule}</span>
                        <button type="button" onClick={() => setForm({ ...form, steelRules: form.steelRules.filter(x => x.id !== r.id) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 14 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info collection */}
                <div className="form-group">
                  <label className="form-label">Thu thập thông tin khách hàng</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[['collectName', '👤 Tên'], ['collectPhone', '📞 SĐT'], ['collectAddress', '📍 Địa chỉ']].map(([field, label]) => (
                      <label key={field} className="checkbox-custom">
                        <input type="checkbox" checked={form[field]} onChange={e => setForm({ ...form, [field]: e.target.checked })} />
                        <span className="checkbox-box" />
                        <span style={{ fontSize: 13 }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                <div style={{ display: 'flex', gap: 20 }}>
                  <label className="checkbox-custom">
                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                    <span className="checkbox-box" />
                    <span style={{ fontSize: 13 }}>Kích hoạt</span>
                  </label>
                  <label className="checkbox-custom">
                    <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                    <span className="checkbox-box" />
                    <span style={{ fontSize: 13 }}>⭐ Đặt làm agent mặc định</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật Agent' : 'Tạo Agent'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Page Modal */}
      {assignModalOpen && fbPage && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAssignModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>🔗 Gán Agent cho Fanpage</h2>
              <button onClick={() => setAssignModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 22 }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                {fbPage.pagePicture && <img src={fbPage.pagePicture} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />}
                <div>
                  <strong>{fbPage.pageName}</strong>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>ID: {fbPage.pageId}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Chọn Agent</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {agents.filter(a => a.active).map(a => (
                    <div
                      key={a._id}
                      onClick={() => setSelectedAgentForAssign(a._id)}
                      style={{
                        padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${selectedAgentForAssign === a._id ? PROVIDER_COLORS[a.provider] : 'var(--gray-200)'}`,
                        background: selectedAgentForAssign === a._id ? `${PROVIDER_COLORS[a.provider]}10` : 'white',
                        display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{PROVIDER_ICONS[a.provider]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name} {a.isDefault && '⭐'}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.provider} / {a.model}</div>
                      </div>
                      {selectedAgentForAssign === a._id && <CheckCircle size={18} color={PROVIDER_COLORS[a.provider]} />}
                    </div>
                  ))}
                  {agents.filter(a => a.active).length === 0 && (
                    <p style={{ color: 'var(--gray-400)', fontSize: 14, textAlign: 'center' }}>Chưa có agent nào được kích hoạt</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setAssignModalOpen(false)} className="btn btn-secondary">Hủy</button>
              <button onClick={handleAssign} disabled={!selectedAgentForAssign} className="btn btn-primary">Gán Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
