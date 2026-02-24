import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Gift, Image, Brain, ShieldCheck,
  Cpu, Receipt, UserCheck, Users, ChevronLeft, ChevronRight,
  LogOut, Bot, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  {
    icon: Bot, label: 'Chat AI', group: true,
    children: [
      { icon: Package, label: 'Sản phẩm', path: '/products' },
      { icon: Gift, label: 'Quà tặng', path: '/gifts' },
      { icon: Image, label: 'Kho ảnh', path: '/images' },
      { icon: Brain, label: 'Training AI', path: '/training' },
      { icon: ShieldCheck, label: 'Luật Thép', path: '/steel-rules' },
      { icon: Cpu, label: 'Kết nối AI', path: '/ai-config' },
      { icon: Sparkles, label: 'Quản lý Agent', path: '/agents' },
      { icon: Receipt, label: 'Bill / Thống kê', path: '/billing' },
      { icon: UserCheck, label: 'Thu thập TT KH', path: '/customer-info' },
    ]
  },
  { icon: Users, label: 'Thông tin KH', path: '/customers' },
];

const CHAT_AI_PATHS = ['/products', '/gifts', '/images', '/training', '/steel-rules', '/ai-config', '/agents', '/billing', '/customer-info'];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [chatAIOpen, setChatAIOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatAIActive = CHAT_AI_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <aside style={{
        width: collapsed ? '72px' : '260px',
        minHeight: '100vh',
        background: 'white',
        borderRight: '1px solid var(--gray-100)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>
        {/* Logo */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--gray-100)', gap: 12, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>
            <Bot size={20} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>ChatBot AI</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item, idx) => {
            if (item.group) {
              return (
                <div key={idx}>
                  <button onClick={() => !collapsed && setChatAIOpen(!chatAIOpen)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: isChatAIActive ? 'var(--primary-light)' : 'transparent',
                    color: isChatAIActive ? 'var(--primary)' : 'var(--gray-600)',
                    fontSize: 14, fontWeight: 500,
                    justifyContent: collapsed ? 'center' : 'space-between',
                    transition: 'all 0.2s', marginBottom: 4,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <item.icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (chatAIOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </button>
                  {!collapsed && chatAIOpen && (
                    <div style={{ marginLeft: 16, borderLeft: '2px solid var(--gray-100)', paddingLeft: 8, marginBottom: 4 }}>
                      {item.children.map((child, cidx) => (
                        <NavLink key={cidx} to={child.path} style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 10px', borderRadius: 6, fontSize: 13,
                          color: isActive ? 'var(--primary)' : 'var(--gray-500)',
                          background: isActive ? 'var(--primary-light)' : 'transparent',
                          textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                          marginBottom: 2, transition: 'all 0.15s',
                        })}>
                          <child.icon size={15} />
                          {child.label}
                          {child.path === '/agents' && <span style={{ marginLeft: 'auto', fontSize: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', padding: '1px 5px', borderRadius: 8, fontWeight: 700 }}>NEW</span>}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink key={idx} to={item.path} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, fontSize: 14,
                color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                marginBottom: 4, transition: 'all 0.2s',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}>
                <item.icon size={18} />
                {!collapsed && item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--gray-100)' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
            gap: 8, padding: '8px 12px', border: 'none', background: 'transparent',
            color: 'var(--gray-400)', cursor: 'pointer', borderRadius: 8, fontSize: 13,
          }}>
            {!collapsed && <span>Thu gọn</span>}
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--danger)', fontSize: 14,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <LogOut size={18} />
            {!collapsed && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: collapsed ? 72 : 260, transition: 'margin-left 0.3s ease', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 64, background: 'white', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            👋 Xin chào, <strong style={{ color: 'var(--gray-800)' }}>Admin</strong>
          </div>
        </header>
        <main style={{ flex: 1, padding: 24 }}><Outlet /></main>
      </div>
    </div>
  );
}
