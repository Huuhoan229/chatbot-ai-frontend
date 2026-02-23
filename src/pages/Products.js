import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, Package, Upload } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || '';

const DEFAULT_FORM = { name: '', price: '', description: '', freeShip: false, gifts: [], status: 'active' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selected, setSelected] = useState([]);
  const fileRef = useRef();

  useEffect(() => {
    loadProducts();
    loadGifts();
  }, []);

  const loadProducts = async (q = search) => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search: q } });
      setProducts(res.data.products);
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const loadGifts = async () => {
    try {
      const res = await api.get('/gifts');
      setGifts(res.data.gifts);
    } catch (err) {}
  };

  const openCreate = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, price: p.price, description: p.description,
      freeShip: p.freeShip, gifts: p.gifts?.map(g => g._id || g), status: p.status
    });
    setImagePreview(p.coverImage ? `${API_URL}${p.coverImage}` : '');
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'gifts') fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    if (imageFile) fd.append('coverImage', imageFile);

    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, fd);
        toast.success('Đã cập nhật sản phẩm!');
      } else {
        await api.post('/products', fd);
        toast.success('Đã thêm sản phẩm!');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) { handleError(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Đã xóa sản phẩm!');
      loadProducts();
    } catch (err) { handleError(err); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !window.confirm(`Xóa ${selected.length} sản phẩm?`)) return;
    try {
      await api.post('/products/bulk-delete', { ids: selected });
      toast.success(`Đã xóa ${selected.length} sản phẩm!`);
      setSelected([]);
      loadProducts();
    } catch (err) { handleError(err); }
  };

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === products.length ? [] : products.map(p => p._id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Sản phẩm</h1>
          <p>Quản lý danh sách sản phẩm ({products.length} sản phẩm)</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={15} color="var(--gray-400)" />
            <input
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => { setSearch(e.target.value); loadProducts(e.target.value); }}
            />
          </div>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
              <Trash2 size={14} /> Xóa {selected.length} mục
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><span className="loading-spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>Chưa có sản phẩm nào</h3>
            <p>Hãy thêm sản phẩm đầu tiên của bạn</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <label className="checkbox-custom">
                    <input type="checkbox" checked={selected.length === products.length} onChange={toggleAll} />
                    <span className="checkbox-box" />
                  </label>
                </th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Freeship</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <label className="checkbox-custom">
                      <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {p.coverImage
                        ? <img src={`${API_URL}${p.coverImage}`} alt="" className="img-preview" />
                        : <div style={{ width: 60, height: 60, background: 'var(--gray-100)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={24} color="var(--gray-300)" /></div>
                      }
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{Number(p.price).toLocaleString('vi-VN')}đ</td>
                  <td>{p.freeShip ? <span className="badge badge-green">Freeship</span> : <span className="badge badge-red">Phí ship</span>}</td>
                  <td>{p.status === 'active' ? <span className="badge badge-green">Hoạt động</span> : <span className="badge badge-red">Tắt</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => openEdit(p)} className="btn btn-secondary btn-sm btn-icon"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm btn-icon"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '20px' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="VD: Áo thun basic" />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá (VNĐ) *</label>
                  <input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="VD: 250000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết sản phẩm..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh bìa</label>
                  <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} />
                  <label className="file-upload-label" onClick={() => fileRef.current?.click()}>
                    <Upload size={16} /> {imageFile ? imageFile.name : 'Chọn ảnh'}
                  </label>
                  {imagePreview && <img src={imagePreview} alt="" style={{ marginTop: 8, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />}
                </div>
                <div className="form-group">
                  <label className="checkbox-custom">
                    <input type="checkbox" checked={form.freeShip} onChange={e => setForm({ ...form, freeShip: e.target.checked })} />
                    <span className="checkbox-box" />
                    <span>Freeship</span>
                  </label>
                </div>
                {gifts.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Quà tặng kèm</label>
                    {gifts.map(g => (
                      <label key={g._id} className="checkbox-custom" style={{ marginBottom: 8 }}>
                        <input
                          type="checkbox"
                          checked={form.gifts.includes(g._id)}
                          onChange={e => setForm({
                            ...form,
                            gifts: e.target.checked ? [...form.gifts, g._id] : form.gifts.filter(x => x !== g._id)
                          })}
                        />
                        <span className="checkbox-box" />
                        <span>{g.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tắt</option>
                  </select>
                </div>
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
