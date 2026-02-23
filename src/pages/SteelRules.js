import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Save } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

export default function SteelRules() {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/steel-rules').then(res => setRules(res.data.rules)).catch(handleError);
  }, []);

  const addRule = () => {
    if (!newRule.trim()) return;
    const nextId = Math.max(...rules.map(r => r.id), 0) + 1;
    setRules([...rules, { id: nextId, rule: newRule.trim(), active: true }]);
    setNewRule('');
  };

  const toggleRule = (id) => setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const deleteRule = (id) => setRules(rules.filter(r => r.id !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/steel-rules', { rules });
      toast.success('Đã lưu Luật Thép!');
    } catch (err) { handleError(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Luật Thép</h1>
          <p>Các quy tắc bất biến mà bot PHẢI tuân theo</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu Luật Thép'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} color="var(--danger)" />
              <span style={{ fontWeight: 600 }}>Danh sách Luật</span>
            </div>
            <span className="badge badge-purple">{rules.filter(r => r.active).length} đang bật</span>
          </div>
          <div className="card-body">
            {/* Add new rule */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                className="form-control"
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                placeholder="Thêm luật mới... VD: Không bịa đặt thông tin"
                onKeyDown={e => e.key === 'Enter' && addRule()}
              />
              <button onClick={addRule} className="btn btn-primary" style={{ flexShrink: 0 }}>
                <Plus size={16} /> Thêm
              </button>
            </div>

            {/* Rules list */}
            {rules.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: r.active ? '#fef2f2' : 'var(--gray-50)',
                borderRadius: 8, marginBottom: 8,
                border: `1px solid ${r.active ? '#fecaca' : 'var(--gray-200)'}`,
                transition: 'all 0.2s',
              }}>
                <label className="switch" style={{ flexShrink: 0 }}>
                  <input type="checkbox" checked={r.active} onChange={() => toggleRule(r.id)} />
                  <span className="switch-slider" />
                </label>
                <span style={{ flex: 1, fontSize: 14, color: r.active ? '#991b1b' : 'var(--gray-400)', fontWeight: r.active ? 500 : 400 }}>
                  {r.active && '❌ '}{r.rule}
                </span>
                <button onClick={() => deleteRule(r.id)} className="btn btn-secondary btn-sm btn-icon" style={{ flexShrink: 0 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="empty-state"><ShieldCheck size={40} /><h3>Chưa có luật nào</h3></div>
            )}
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header"><span style={{ fontWeight: 600 }}>Tại sao cần Luật Thép?</span></div>
          <div className="card-body" style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: 12 }}>AI có thể tự ý "sáng tạo" thông tin gây hại cho business của bạn. Luật Thép sẽ ngăn chặn điều đó.</p>
            <div style={{ background: '#fef2f2', borderRadius: 8, padding: 12, border: '1px solid #fecaca' }}>
              <p style={{ fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>Ví dụ luật hay:</p>
              <ul style={{ paddingLeft: 16, color: '#b91c1c' }}>
                <li>Không bịa đặt giá sản phẩm</li>
                <li>Không hứa khuyến mãi giả</li>
                <li>Không nói xấu đối thủ</li>
                <li>Không cung cấp thông tin sai lệch</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
