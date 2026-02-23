// Gifts.js
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Gift } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

export function Gifts() {
  const [gifts, setGifts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', condition: '', active: true });

  useEffect(() => { loadGifts(); }, []);

  const loadGifts = async () => {
    try { const res = await api.get('/gifts'); setGifts(res.data.gifts); } catch (err) { handleError(err); }
  };

  const openEdit = (g) => { setEditing(g); setForm({ name: g.name, description: g.description, condition: g.condition, active: g.active }); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', condition: '', active: true }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/gifts/${editing._id}`, form); toast.success('Đã cập nhật!'); }
      else { await api.post('/gifts', form); toast.success('Đã thêm quà tặng!'); }
      setModalOpen(false); loadGifts();
    } catch (err) { handleError(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa quà tặng này?')) return;
    try { await api.delete(`/gifts/${id}`); toast.success('Đã xóa!'); loadGifts(); } catch (err) { handleError(err); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Quà tặng</h1><p>Quản lý danh sách quà tặng kèm sản phẩm</p></div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Thêm quà tặng</button>
      </div>
      <div className="card">
        {gifts.length === 0 ? (
          <div className="empty-state"><Gift size={48} /><h3>Chưa có quà tặng</h3><p>Thêm quà tặng để gắn vào sản phẩm</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>Tên quà</th><th>Mô tả</th><th>Điều kiện</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {gifts.map(g => (
                <tr key={g._id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{g.description}</td>
                  <td style={{ fontSize: 13 }}>{g.condition || '-'}</td>
                  <td>{g.active ? <span className="badge badge-green">Bật</span> : <span className="badge badge-red">Tắt</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(g)} className="btn btn-secondary btn-sm btn-icon"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(g._id)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? 'Sửa quà tặng' : 'Thêm quà tặng'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Tên quà *</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Mô tả</label><textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Điều kiện (nếu có)</label><input className="form-control" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} placeholder="VD: Khi mua từ 2 sản phẩm" /></div>
                <label className="checkbox-custom"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /><span className="checkbox-box" /><span>Kích hoạt</span></label>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gifts;
