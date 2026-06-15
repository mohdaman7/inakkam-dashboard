import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function RelationGoalAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ title: '', subtitle: '', status: '1' });
    const [loading, setLoading] = useState(false);
    useEffect(() => { if (editData) setForm({ title: editData.title || '', subtitle: editData.subtitle || '', status: String(editData.status ?? 1) }); }, [editData]);
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (editData?._id) { await api.put(`/relation-goals/${editData._id}`, form); toast.success('Relation Goal updated!'); }
            else { await api.post('/relation-goals', form); toast.success('Relation Goal added!'); setForm({ title: '', subtitle: '', status: '1' }); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };
    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Relation Goal' : 'Add Relation Goal'}</h1></div>
            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Relation Goal Title</label><input className="form-input" placeholder="Enter relation goal title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Relation Goal Subtitle</label><input className="form-input" placeholder="Enter relation goal subtitle" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="1">Publish</option><option value="0">Unpublish</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update' : 'Add Relation Goal'}</button>
                </form>
            </div>
        </div>
    );
}
