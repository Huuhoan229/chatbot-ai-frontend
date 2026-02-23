import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image, Upload } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function ImageGallery() {
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  useEffect(() => { loadImages(); }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/images');
      setGrouped(res.data.grouped);
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error('Vui lòng chọn ảnh'); return; }
    const fd = new FormData();
    fd.append('image', imageFile);
    fd.append('productId', selectedProduct);
    fd.append('description', description);
    try {
      await api.post('/images', fd);
      toast.success('Đã thêm ảnh!');
      setModalOpen(false);
      setImageFile(null); setImagePreview(''); setDescription('');
      loadImages();
    } catch (err) { handleError(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa ảnh này?')) return;
    try { await api.delete(`/images/${id}`); toast.success('Đã xóa ảnh!'); loadImages(); }
    catch (err) { handleError(err); }
  };

  const allProducts = grouped.map(g => g.product);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Kho ảnh</h1>
          <p>Ảnh theo mô tả - Bot sẽ gửi ảnh phù hợp khi khách hỏi</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary"><Plus size={16} /> Thêm ảnh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="loading-spinner" /></div>
      ) : grouped.length === 0 ? (
        <div className="empty-state"><Image size={48} /><h3>Chưa có ảnh nào</h3><p>Thêm sản phẩm trước, sau đó thêm ảnh vào đây</p></div>
      ) : (
        grouped.map(({ product, images }) => (
          <div key={product._id} className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {product.coverImage && <img src={`${API_URL}${product.coverImage}`} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{images.length} ảnh</div>
                </div>
              </div>
              <button onClick={() => { setSelectedProduct(product._id); setModalOpen(true); }} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Thêm ảnh
              </button>
            </div>
            <div className="card-body">
              {images.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontSize: 14, textAlign: 'center' }}>Chưa có ảnh nào cho sản phẩm này</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {images.map(img => (
                    <div key={img._id} style={{ border: '1px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden', position: 'relative', background: 'var(--gray-50)' }}>
                      <img src={`${API_URL}${img.url}`} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '8px 10px' }}>
                        <p style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.4 }}>{img.description}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(img._id)}
                        style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Thêm ảnh vào kho</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Sản phẩm *</label>
                  <select className="form-control" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required>
                    <option value="">-- Chọn sản phẩm --</option>
                    {allProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chọn ảnh *</label>
                  <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} />
                  <label className="file-upload-label" onClick={() => fileRef.current?.click()}>
                    <Upload size={16} /> {imageFile ? imageFile.name : 'Chọn ảnh để upload'}
                  </label>
                  {imagePreview && <img src={imagePreview} alt="" style={{ marginTop: 8, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />}
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả ảnh *</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} placeholder="VD: chi tiết chất vải, ảnh đóng gói, màu sắc sản phẩm..." required />
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Bot sẽ gửi ảnh này khi khách hỏi về nội dung trong mô tả.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm ảnh</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
