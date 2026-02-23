import React, { useState, useEffect } from 'react';
import { Brain, Save } from 'lucide-react';
import api, { handleError } from '../services/api';
import toast from 'react-hot-toast';

const EXAMPLE_PROMPT = `Bạn là trợ lý tư vấn bán hàng online thân thiện và nhiệt tình của cửa hàng [TÊN CỬA HÀNG].

PHONG CÁCH:
- Giao tiếp thân thiện, gần gũi như người bạn
- Dùng emoji phù hợp để tạo cảm giác sinh động 
- Trả lời ngắn gọn, súc tích, đúng trọng tâm
- Luôn đề cao lợi ích cho khách hàng

CÁCH TƯ VẤN:
- Chỉ giới thiệu sản phẩm phù hợp với nhu cầu khách
- Nêu rõ điểm nổi bật của sản phẩm
- Thông báo rõ về freeship và quà tặng (nếu có)
- Hỗ trợ khách đến khi chốt đơn thành công`;

export default function TrainingAI() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/training').then(res => { setPrompt(res.data.prompt || ''); setLoading(false); }).catch(handleError);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/training', { prompt });
      toast.success('Đã lưu Training Prompt!');
    } catch (err) { handleError(err); }
    finally { setSaving(false); }
  };

  const useExample = () => setPrompt(EXAMPLE_PROMPT);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Training AI</h1>
          <p>Cấu hình tính cách và cách hoạt động của Bot</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Brain size={18} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>System Prompt</span>
            </div>
            <button onClick={useExample} className="btn btn-secondary btn-sm">Dùng ví dụ</button>
          </div>
          <div className="card-body">
            {loading ? <span className="loading-spinner" /> : (
              <textarea
                className="form-control"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{ minHeight: 400, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
                placeholder="Nhập system prompt cho bot của bạn..."
              />
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span style={{ fontWeight: 600 }}>Hướng dẫn</span></div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 12 }}>System Prompt là "linh hồn" của bot - quyết định cách bot giao tiếp và tư vấn.</p>
              <p style={{ marginBottom: 8 }}><strong>Nên bao gồm:</strong></p>
              <ul style={{ paddingLeft: 16, marginBottom: 12 }}>
                <li>Vai trò của bot</li>
                <li>Giọng điệu giao tiếp</li>
                <li>Cách xử lý từng tình huống</li>
                <li>Ngôn ngữ sử dụng</li>
              </ul>
              <p style={{ marginBottom: 8 }}><strong>Lưu ý:</strong></p>
              <ul style={{ paddingLeft: 16 }}>
                <li>Bot sẽ tự động có dữ liệu sản phẩm</li>
                <li>Luật Thép sẽ được inject tự động</li>
                <li>Không cần ghi lại sản phẩm trong prompt</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span style={{ fontWeight: 600 }}>Thống kê</span></div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Số ký tự:</span><strong>{prompt.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Số từ:</span><strong>{prompt.split(/\s+/).filter(Boolean).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Token ước tính:</span><strong>~{Math.ceil(prompt.length / 4)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
