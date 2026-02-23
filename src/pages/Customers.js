import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MapPin, Clock, Trash2 } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async (q = search) => {
    setLoading(true);
    try {
      const res = await api.get('/customers', { params: { search: q } });
      setCustomers(res.data.customers);
      setTotal(res.data.total);
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa khách hàng này?')) return;
    try { await api.delete(`/customers/${id}`); toast.success('Đã xóa!'); loadCustomers(); }
    catch (err) { handleError(err); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Thông tin khách hàng</h1>
          <p>Danh sách khách hàng có số điện thoại ({total} khách)</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={15} color="var(--gray-400)" />
            <input
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              value={search}
              onChange={e => { setSearch(e.target.value); loadCustomers(e.target.value); }}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Tổng: {total} khách</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><span className="loading-spinner" /></div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Chưa có khách hàng nào</h3>
            <p>Khách hàng sẽ xuất hiện ở đây khi bot thu thập được số điện thoại</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Tin nhắn</th>
                <th>Lần cuối chat</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>
                        {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name || 'Chưa có tên'}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>ID: {c.psid?.slice(0, 10)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={13} color="var(--success)" />
                        <span style={{ fontWeight: 600 }}>{c.phone}</span>
                      </div>
                    ) : <span style={{ color: 'var(--gray-300)', fontSize: 13 }}>-</span>}
                  </td>
                  <td>
                    {c.address ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={13} color="var(--warning)" />
                        <span style={{ fontSize: 13 }}>{c.address}</span>
                      </div>
                    ) : <span style={{ color: 'var(--gray-300)', fontSize: 13 }}>-</span>}
                  </td>
                  <td>
                    <span className="badge badge-blue">{c.totalMessages} tin</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-400)' }}>
                      <Clock size={12} />
                      {new Date(c.lastContact).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(c._id)} className="btn btn-secondary btn-sm btn-icon">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
