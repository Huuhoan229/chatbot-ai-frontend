import React, { useState, useEffect } from 'react';
import { UserCheck, Save } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

export default function CustomerInfoSettings() {
  const [settings, setSettings] = useState({ collectName: true, collectPhone: true, collectAddress: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/customer-info').then(res => setSettings(res.data.settings)).catch(handleError);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/customer-info', settings);
      toast.success('Đã lưu cài đặt!');
    } catch (err) { handleError(err); }
    finally { setSaving(false); }
  };

  const CheckItem = ({ field, label, desc }) => (
    <div style={{ padding: '16px', border: `2px solid ${settings[field] ? 'var(--primary)' : 'var(--gray-200)'}`, borderRadius: 10, background: settings[field] ? 'var(--primary-light)' : 'white', transition: 'all 0.2s', marginBottom: 12, cursor: 'pointer' }}
      onClick={() => setSettings({ ...settings, [field]: !settings[field] })}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label className="checkbox-custom" style={{ pointerEvents: 'none' }}>
          <input type="checkbox" checked={settings[field]} readOnly />
          <span className="checkbox-box" />
        </label>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{desc}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Thu thập thông tin KH</h1><p>Cấu hình thông tin nào bot cần thu thập</p></div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserCheck size={18} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>Thông tin cần thu thập</span>
            </div>
          </div>
          <div className="card-body">
            <CheckItem field="collectName" label="Tên khách hàng" desc="Bot sẽ hỏi tên khi phù hợp" />
            <CheckItem field="collectPhone" label="Số điện thoại ★" desc="Khi có SĐT, khách sẽ được lưu vào CRM" />
            <CheckItem field="collectAddress" label="Địa chỉ giao hàng" desc="Bot sẽ hỏi địa chỉ khi khách đặt hàng" />
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header"><span style={{ fontWeight: 600 }}>Cách hoạt động</span></div>
          <div className="card-body" style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 12 }}>Bot sẽ <strong>tự động hỏi khéo léo</strong> những thông tin bạn chọn, không hỏi thẳng ngay từ đầu.</p>
            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 12, border: '1px solid #bbf7d0', marginBottom: 12 }}>
              <p style={{ fontWeight: 600, color: '#166534', marginBottom: 6 }}>Ví dụ:</p>
              <p style={{ color: '#15803d', fontStyle: 'italic' }}>"Để mình giúp bạn tư vấn chính xác hơn, cho mình biết bạn tên gì nhé?"</p>
            </div>
            <p>Số điện thoại khi có sẽ được tự động lưu vào <strong>Thông tin Khách hàng</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
