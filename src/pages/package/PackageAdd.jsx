import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function PackageAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ totalCoin: '', amount: '', status: '1' });
    const [loading, setLoading] = useState(false);
    useEffect(() => { if (editData) setForm({ totalCoin: editData.totalCoin || '', amount: editData.amount || '', status: String(editData.status ?? 1) }); }, [editData]);
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (editData?._id) { await api.put(`/packages/${editData._id}`, form); toast.success('Package updated!'); }
            else { await api.post('/packages', form); toast.success('Package added!'); setForm({ totalCoin: '', amount: '', status: '1' }); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };
    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Package' : 'Add Package'}</h1></div>
            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label">Total Coin</label><input className="form-input" type="number" placeholder="Enter total coins" value={form.totalCoin} onChange={e => setForm(p => ({ ...p, totalCoin: e.target.value }))} required /></div>
                    <div className="form-group"><label className="form-label">Amount ($)</label><input className="form-input" type="number" step="0.01" placeholder="Enter amount" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
                    <div className="form-group">
                        <label className="form-label">Package Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="1">Publish</option><option value="0">Unpublish</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update Package' : 'Add Package'}</button>
                </form>
            </div>
        </div>
    );
}
