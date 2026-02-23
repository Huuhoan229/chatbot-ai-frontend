import React, { useState, useEffect } from 'react';
import { Package, Gift, Users, Cpu, Power, Facebook, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [botActive, setBotActive] = useState(true);
  const [fbPage, setFbPage] = useState(null);
  const [stats, setStats] = useState({ products: 0, gifts: 0, customers: 0 });
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadData();
    // Check if returning from Facebook OAuth
    const params = new URLSearchParams(window.location.search);
    const fbPages = params.get('fb_pages');
    if (fbPages) {
      try {
        const pages = JSON.parse(decodeURIComponent(fbPages));
        showPageSelector(pages);
        window.history.replaceState({}, '', '/dashboard');
      } catch (e) {}
    }
    const fbError = params.get('fb_error');
    if (fbError) {
      toast.error('Kết nối Facebook thất bại!');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const loadData = async () => {
    try {
      const [botRes, pageRes, prodRes, custRes] = await Promise.all([
        api.get('/bot/status'),
        api.get('/facebook/page-info'),
        api.get('/products?limit=1'),
        api.get('/customers?limit=1'),
      ]);
      setBotActive(botRes.data.active);
      setFbPage(pageRes.data.page);
      setStats(s => ({ ...s, products: prodRes.data.total || 0, customers: custRes.data.total || 0 }));
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
    } catch (err) {
      handleError(err);
      setConnecting(false);
    }
  };

  const disconnectFacebook = async () => {
    if (!window.confirm('Bạn chắc chắn muốn ngắt kết nối?')) return;
    try {
      await api.delete('/facebook/disconnect');
      setFbPage(null);
      toast.success('Đã ngắt kết nối Facebook');
    } catch (err) { handleError(err); }
  };

  const showPageSelector = (pages) => {
    if (pages.length === 1) {
      selectPage(pages[0]);
    } else {
      const pageName = window.prompt(
        'Chọn trang (nhập số):\n' + pages.map((p, i) => `${i + 1}. ${p.name}`).join('\n')
      );
      const idx = parseInt(pageName) - 1;
      if (idx >= 0 && idx < pages.length) selectPage(pages[idx]);
    }
  };

  const selectPage = async (page) => {
    try {
      await api.post('/facebook/select-page', {
        pageId: page.id,
        pageName: page.name,
        pageToken: page.access_token,
        pagePicture: page.picture?.data?.url || '',
      });
      toast.success(`Đã kết nối trang "${page.name}"!`);
      loadData();
    } catch (err) { handleError(err); }
  };

  const statCards = [
    { icon: Package, label: 'Sản phẩm', value: stats.products, color: '#6366f1', bg: '#e0e7ff' },
    { icon: Gift, label: 'Quà tặng', value: stats.gifts, color: '#10b981', bg: '#d1fae5' },
    { icon: Users, label: 'Khách hàng', value: stats.customers, color: '#f59e0b', bg: '#fef3c7' },
    { icon: Cpu, label: 'AI Model', value: 'GPT-4o Mini', color: '#8b5cf6', bg: '#ede9fe' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan hệ thống ChatBot AI</p>
        </div>
        <button onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Bot Toggle */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Power size={18} color={botActive ? 'var(--success)' : 'var(--danger)'} />
              <span style={{ fontWeight: 600 }}>Trạng thái Bot</span>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {botActive
                  ? <><CheckCircle size={18} color="var(--success)" /><span style={{ fontWeight: 600, color: 'var(--success)', fontSize: '16px' }}>Bot đang HOẠT ĐỘNG</span></>
                  : <><XCircle size={18} color="var(--danger)" /><span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '16px' }}>Bot đang TẮT</span></>
                }
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                {botActive ? 'Bot sẽ tự động trả lời tin nhắn khách hàng.' : 'Bot sẽ không trả lời tin nhắn.'}
              </p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={botActive} onChange={toggleBot} disabled={loading} />
              <span className="switch-slider" />
            </label>
          </div>
        </div>

        {/* Facebook Connection */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Facebook size={18} color="#1877f2" />
              <span style={{ fontWeight: 600 }}>Kết nối Facebook Fanpage</span>
            </div>
          </div>
          <div className="card-body">
            {fbPage ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {fbPage.pagePicture && (
                    <img src={fbPage.pagePicture} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{fbPage.pageName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>ID: {fbPage.pageId}</div>
                    <span className="badge badge-green" style={{ marginTop: '4px' }}>Đã kết nối</span>
                  </div>
                </div>
                <button onClick={disconnectFacebook} className="btn btn-secondary btn-sm">
                  Ngắt kết nối
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '16px' }}>
                  Kết nối với Facebook Fanpage để bot có thể trả lời tin nhắn tự động.
                </p>
                <button onClick={connectFacebook} disabled={connecting} style={{
                  background: '#1877f2', color: 'white', border: 'none', padding: '10px 20px',
                  borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '8px', fontWeight: 500, fontSize: '14px',
                }}>
                  <Facebook size={16} />
                  {connecting ? 'Đang chuyển hướng...' : 'Đăng nhập với Facebook'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
