import React, { useState, useEffect } from 'react';
import { Receipt, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { handleError } from '../services/api';

export default function Billing() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBilling(); }, []);

  const loadBilling = async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing', { params: filter });
      setData(res.data);
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const setQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFilter({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setTimeout(loadBilling, 100);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div><h1>Bill / Thống kê</h1><p>Theo dõi chi phí token AI</p></div>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--gray-400)" />
          <button onClick={() => setQuickFilter(7)} className="btn btn-secondary btn-sm">7 ngày</button>
          <button onClick={() => setQuickFilter(30)} className="btn btn-secondary btn-sm">30 ngày</button>
          <button onClick={() => setQuickFilter(90)} className="btn btn-secondary btn-sm">3 tháng</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="date" className="form-control" style={{ width: 'auto' }} value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
            <span>đến</span>
            <input type="date" className="form-control" style={{ width: 'auto' }} value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
            <button onClick={loadBilling} className="btn btn-primary btn-sm">Lọc</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="loading-spinner" /></div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'Tổng Token', value: data.summary.totalTokens?.toLocaleString('vi-VN'), color: '#6366f1', bg: '#e0e7ff' },
              { label: 'Chi phí USD', value: `$${data.summary.totalCostUSD}`, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Chi phí VND', value: `${data.summary.totalCostVND?.toLocaleString('vi-VN')}đ`, color: '#10b981', bg: '#d1fae5' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <Receipt size={22} color={s.color} />
                </div>
                <div className="stat-info">
                  <h3 style={{ fontSize: 20 }}>{s.value}</h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {data.chart?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span style={{ fontWeight: 600 }}>Biểu đồ chi phí theo ngày (VNĐ)</span></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v.toLocaleString('vi-VN')}đ`, 'Chi phí']} />
                    <Bar dataKey="costVND" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Records table */}
          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600 }}>Chi tiết giao dịch</span></div>
            {data.records?.length === 0 ? (
              <div className="empty-state"><Receipt size={40} /><h3>Chưa có dữ liệu</h3></div>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Thời gian</th><th>Model</th><th>Token vào</th><th>Token ra</th><th>Tổng</th><th>Chi phí</th></tr>
                </thead>
                <tbody>
                  {data.records?.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(r.date).toLocaleString('vi-VN')}</td>
                      <td><span className="badge badge-purple">{r.model}</span></td>
                      <td style={{ fontSize: 13 }}>{r.inputTokens?.toLocaleString()}</td>
                      <td style={{ fontSize: 13 }}>{r.outputTokens?.toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{r.totalTokens?.toLocaleString()}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{Math.round(r.costVND).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
