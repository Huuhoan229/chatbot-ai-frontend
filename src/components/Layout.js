import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Gift, Image, Brain, ShieldCheck,
  Cpu, Receipt, UserCheck, Users, Settings, ChevronLeft,
  ChevronRight, LogOut, Menu, Bot, ChevronDown, ChevronUp
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
      { icon: Receipt, label: 'Bill / Thống kê', path: '/billing' },
      { icon: UserCheck, label: 'Thu thập TT KH', path: '/customer-info' },
    ]
  },
  { icon: Users, label: 'Thông tin KH', path: '/customers' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [chatAIOpen, setChatAIOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isChatAIActive = ['/products', '/gifts', '/images', '/training', '/steel-rules', '/ai-config', '/billing', '/customer-info'].some(p => location.pathname.startsWith(p));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '72px' : '260px',
        minHeight: '100vh',
        background: 'white',
        borderRight: '1px solid var(--gray-100)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0,
        left: mobileOpen ? 0 : (window.innerWidth < 768 ? '-260px' : 0),
        zIndex: 100,
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Logo */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 20px' : '0 20px',
          borderBottom: '1px solid var(--gray-100)',
          gap: '12px',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: 'white'
          }}>
            <Bot size={20} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--gray-900)' }}>ChatBot AI</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item, idx) => {
            if (item.group) {
              return (
                <div key={idx}>
                  <button
                    onClick={() => !collapsed && setChatAIOpen(!chatAIOpen)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: isChatAIActive ? 'var(--primary-light)' : 'transparent',
                      color: isChatAIActive ? 'var(--primary)' : 'var(--gray-600)',
                      fontSize: '14px', fontWeight: 500, justifyContent: collapsed ? 'center' : 'space-between',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <item.icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (chatAIOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </button>
                  {(!collapsed && chatAIOpen) && (
                    <div style={{ marginLeft: '16px', borderLeft: '2px solid var(--gray-100)', paddingLeft: '8px', marginTop: '4px', marginBottom: '4px' }}>
                      {item.children.map((child, cidx) => (
                        <NavLink key={cidx} to={child.path} style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', borderRadius: '6px', fontSize: '13px',
                          color: isActive ? 'var(--primary)' : 'var(--gray-500)',
                          background: isActive ? 'var(--primary-light)' : 'transparent',
                          textDecoration: 'none', fontWeight: isActive ? 500 : 400,
                          marginBottom: '2px', transition: 'all 0.15s',
                        })}>
                          <child.icon size={15} />
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink key={idx} to={item.path} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                marginBottom: '4px', transition: 'all 0.2s',
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
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
              gap: '8px', padding: '8px 12px', border: 'none', background: 'transparent',
              color: 'var(--gray-400)', cursor: 'pointer', borderRadius: '8px', fontSize: '13px',
              transition: 'all 0.2s',
            }}
          >
            {!collapsed && <span>Thu gọn</span>}
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--danger)', fontSize: '14px',
            justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 0.2s',
          }}>
            <LogOut size={18} />
            {!collapsed && 'Đăng xuất'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: window.innerWidth >= 768 ? (collapsed ? '72px' : '260px') : 0,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header style={{
          height: '64px', background: 'white', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          gap: '16px', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 0 var(--gray-100)',
        }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-600)' }}
            className="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            👋 Xin chào, <strong style={{ color: 'var(--gray-800)' }}>Admin</strong>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
