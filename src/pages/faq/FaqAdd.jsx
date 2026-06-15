import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function FaqAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ question: '', answer: '', status: '1' });
    const [loading, setLoading] = useState(false);
    useEffect(() => { if (editData) setForm({ question: editData.question || '', answer: editData.answer || '', status: String(editData.status ?? 1) }); }, [editData]);
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (editData?._id) { await api.put(`/faqs/${editData._id}`, form); toast.success('FAQ updated!'); }
            else { await api.post('/faqs', form); toast.success('FAQ added!'); setForm({ question: '', answer: '', status: '1' }); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };
    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit FAQ' : 'Add FAQ'}</h1></div>
            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Enter Question</label><input className="form-input" placeholder="Enter your question" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Enter Answer</label><textarea className="form-textarea" placeholder="Enter the answer" value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} required /></div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="1">Publish</option><option value="0">Unpublish</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update FAQ' : 'Add FAQ'}</button>
                </form>
            </div>
        </div>
    );
}
