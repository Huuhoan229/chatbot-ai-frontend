import React, { useState, useEffect } from 'react';
import { Package, Gift, Users, Cpu, Power, Facebook, RefreshCw, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

const PROVIDER_COLORS = { openai: '#10a37f', gemini: '#4285f4', groq: '#f55036', deepseek: '#1e40af' };
const PROVIDER_ICONS = { openai: '🤖', gemini: '✨', groq: '⚡', deepseek: '🔍' };

export default function Dashboard() {
  const [botActive, setBotActive] = useState(true);
  const [fbPage, setFbPage] = useState(null);
  const [stats, setStats] = useState({ products: 0, gifts: 0, customers: 0, agents: 0 });
  const [activeModel, setActiveModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const params = new URLSearchParams(window.location.search);
    const fbPages = params.get('fb_pages');
    if (fbPages) {
      try {
        const pages = JSON.parse(decodeURIComponent(fbPages));
        showPageSelector(pages);
        window.history.replaceState({}, '', '/dashboard');
      } catch (e) {}
    }
    if (params.get('fb_error')) {
      toast.error('Kết nối Facebook thất bại!');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const loadData = async () => {
    try {
      const [botRes, pageRes, prodRes, custRes, aiRes, agentsRes] = await Promise.all([
        api.get('/bot/status'),
        api.get('/facebook/page-info'),
        api.get('/products?limit=1'),
        api.get('/customers?limit=1'),
        api.get('/ai-config'),
        api.get('/agents'),
      ]);
      setBotActive(botRes.data.active);
      setFbPage(pageRes.data.page);
      setStats({
        products: prodRes.data.total || 0,
        customers: custRes.data.total || 0,
        agents: agentsRes.data.agents?.length || 0,
      });

      // Determine the actual active model
      const defaultAgent = agentsRes.data.agents?.find(a => a.isDefault && a.active);
      const anyAgent = agentsRes.data.agents?.find(a => a.active);
      if (defaultAgent) {
        setActiveModel({ name: defaultAgent.model, provider: defaultAgent.provider, fromAgent: defaultAgent.name, isAgent: true });
      } else if (anyAgent) {
        setActiveModel({ name: anyAgent.model, provider: anyAgent.provider, fromAgent: anyAgent.name, isAgent: true });
      } else {
        const m = aiRes.data.activeModel || aiRes.data.config;
        setActiveModel({ name: m?.model || 'Chưa cấu hình', provider: m?.provider || 'openai', isAgent: false });
      }
    } catch (err) {}
  };

  const toggleBot = async () => {
    setLoading(true);
    try {
      const res = await api.post('/bot/toggle', { active: !botActive });
      setBotActive(res.data.active);
      toast.success(res.data.message);
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const connectFacebook = async () => {
    setConnecting(true);
    try {
      const res = await api.get('/facebook/auth-url');
      window.location.href = res.data.url;
    } catch (err) { handleError(err); setConnecting(false); }
  };

  const disconnectFacebook = async () => {
    if (!window.confirm('Ngắt kết nối?')) return;
    try { await api.delete('/facebook/disconnect'); setFbPage(null); toast.success('Đã ngắt kết nối'); }
    catch (err) { handleError(err); }
  };

  const showPageSelector = (pages) => {
    if (pages.length === 1) { selectPage(pages[0]); return; }
    const idx = parseInt(window.prompt('Chọn trang (nhập số):\n' + pages.map((p, i) => `${i + 1}. ${p.name}`).join('\n'))) - 1;
    if (idx >= 0 && idx < pages.length) selectPage(pages[idx]);
  };

  const selectPage = async (page) => {
    try {
      await api.post('/facebook/select-page', { pageId: page.id, pageName: page.name, pageToken: page.access_token, pagePicture: page.picture?.data?.url || '' });
      toast.success(`Đã kết nối "${page.name}"!`);
      loadData();
    } catch (err) { handleError(err); }
  };

  const statCards = [
    { icon: Package, label: 'Sản phẩm', value: stats.products, color: '#6366f1', bg: '#e0e7ff', path: '/products' },
    { icon: Gift, label: 'Quà tặng', value: stats.gifts, color: '#10b981', bg: '#d1fae5', path: '/gifts' },
    { icon: Users, label: 'Khách hàng', value: stats.customers, color: '#f59e0b', bg: '#fef3c7', path: '/customers' },
    {
      icon: Sparkles, label: 'AI Model đang dùng', path: '/agents',
      value: activeModel ? activeModel.name : '...',
      subValue: activeModel?.fromAgent ? `Agent: ${activeModel.fromAgent}` : 'Global config',
      color: activeModel ? (PROVIDER_COLORS[activeModel.provider] || '#8b5cf6') : '#8b5cf6',
      bg: '#ede9fe',
      emoji: activeModel ? PROVIDER_ICONS[activeModel.provider] : '🤖',
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Dashboard</h1><p>Tổng quan hệ thống ChatBot AI</p></div>
        <button onClick={loadData} className="btn btn-secondary btn-sm"><RefreshCw size={14} /> Làm mới</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" onClick={() => navigate(s.path)} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <div className="stat-icon" style={{ background: s.bg }}>
              {s.emoji ? <span style={{ fontSize: 22 }}>{s.emoji}</span> : <s.icon size={22} color={s.color} />}
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: i === 3 ? 14 : 24, color: s.color }}>{s.value}</h3>
              <p>{s.label}</p>
              {s.subValue && <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{s.subValue}</p>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Bot Toggle */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Power size={18} color={botActive ? 'var(--success)' : 'var(--danger)'} />
              <span style={{ fontWeight: 600 }}>Trạng thái Bot</span>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {botActive
                  ? <><CheckCircle size={18} color="var(--success)" /><span style={{ fontWeight: 600, color: 'var(--success)', fontSize: 16 }}>Bot đang HOẠT ĐỘNG</span></>
                  : <><XCircle size={18} color="var(--danger)" /><span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: 16 }}>Bot đang TẮT</span></>
                }
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                {botActive ? 'Bot tự động trả lời tin nhắn khách hàng.' : 'Bot không trả lời tin nhắn.'}
              </p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={botActive} onChange={toggleBot} disabled={loading} />
              <span className="switch-slider" />
            </label>
          </div>
        </div>

        {/* Facebook */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Facebook size={18} color="#1877f2" />
              <span style={{ fontWeight: 600 }}>Kết nối Facebook Fanpage</span>
            </div>
          </div>
          <div className="card-body">
            {fbPage ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {fbPage.pagePicture && <img src={fbPage.pagePicture} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{fbPage.pageName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>ID: {fbPage.pageId}</div>
                    <span className="badge badge-green" style={{ marginTop: 4 }}>Đã kết nối</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={disconnectFacebook} className="btn btn-secondary btn-sm">Ngắt kết nối</button>
                  <button onClick={() => navigate('/agents')} className="btn btn-primary btn-sm"><Sparkles size={13} /> Gán Agent</button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>Kết nối Fanpage để bot trả lời tin nhắn tự động.</p>
                <button onClick={connectFacebook} disabled={connecting} style={{ background: '#1877f2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 14 }}>
                  <Facebook size={16} />
                  {connecting ? 'Đang chuyển hướng...' : 'Đăng nhập với Facebook'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent quick info */}
      {activeModel && (
        <div style={{ marginTop: 16 }} className="card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${PROVIDER_COLORS[activeModel.provider]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {PROVIDER_ICONS[activeModel.provider]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>
                AI đang dùng: <span style={{ color: PROVIDER_COLORS[activeModel.provider] }}>{activeModel.name}</span>
                {activeModel.fromAgent && <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 8 }}>via Agent "{activeModel.fromAgent}"</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Provider: {activeModel.provider}</div>
            </div>
            <button onClick={() => navigate('/agents')} className="btn btn-secondary btn-sm">
              <Sparkles size={14} /> Quản lý Agent
            </button>
            <button onClick={() => navigate('/ai-config')} className="btn btn-secondary btn-sm">
              <Cpu size={14} /> Cấu hình AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
