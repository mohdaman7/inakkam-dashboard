import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function ReligionAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ title: '', status: '1' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) setForm({ title: editData.title || '', status: String(editData.status ?? 1) });
    }, [editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editData?._id) { await api.put(`/religions/${editData._id}`, form); toast.success('Religion updated!'); }
            else { await api.post('/religions', form); toast.success('Religion added!'); setForm({ title: '', status: '1' }); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Religion' : 'Add Religion'}</h1></div>
            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Religion Title</label>
                        <input className="form-input" placeholder="Enter religion title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="1">Publish</option><option value="0">Unpublish</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update' : 'Add Religion'}</button>
                </form>
            </div>
        </div>
    );
}
