import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ToggleField = ({ label, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
        <label className="toggle-switch">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="toggle-slider" />
        </label>
    </div>
);

export default function PlanAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ title: '', amount: '', dayLimit: '', description: '', filterInclude: false, audioVideo: false, directChat: false, chat: false, likeMenu: false, status: '1' });
    const [loading, setLoading] = useState(false);
    useEffect(() => { if (editData) setForm({ title: editData.title || '', amount: editData.amount || '', dayLimit: editData.dayLimit || '', description: editData.description || '', filterInclude: !!editData.filterInclude, audioVideo: !!editData.audioVideo, directChat: !!editData.directChat, chat: !!editData.chat, likeMenu: !!editData.likeMenu, status: String(editData.status ?? 1) }); }, [editData]);
    const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            if (editData?._id) { await api.put(`/plans/${editData._id}`, form); toast.success('Plan updated!'); }
            else { await api.post('/plans', form); toast.success('Plan added!'); setForm({ title: '', amount: '', dayLimit: '', description: '', filterInclude: false, audioVideo: false, directChat: false, chat: false, likeMenu: false, status: '1' }); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };
    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Plan' : 'Add Plan'}</h1></div>
            <div className="card" style={{ maxWidth: 640 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group"><label className="form-label">Plan Title</label><input className="form-input" placeholder="Plan title" value={form.title} onChange={e => set('title')(e.target.value)} required /></div>
                        <div className="form-group"><label className="form-label">Plan Amount ($)</label><input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => set('amount')(e.target.value)} required /></div>
                        <div className="form-group"><label className="form-label">Day Limit</label><input className="form-input" type="number" placeholder="Days" value={form.dayLimit} onChange={e => set('dayLimit')(e.target.value)} required /></div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={form.status} onChange={e => set('status')(e.target.value)}>
                                <option value="1">Publish</option><option value="0">Unpublish</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group"><label className="form-label">Plan Description</label><textarea className="form-textarea" placeholder="Describe the plan features" value={form.description} onChange={e => set('description')(e.target.value)} rows={3} /></div>
                    <div className="form-group" style={{ marginTop: 8 }}>
                        <label className="form-label">Features</label>
                        <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '0 16px', border: '1px solid var(--border-color)' }}>
                            <ToggleField label="Filter Include ?" checked={form.filterInclude} onChange={set('filterInclude')} />
                            <ToggleField label="Audio Video ?" checked={form.audioVideo} onChange={set('audioVideo')} />
                            <ToggleField label="Direct Chat ?" checked={form.directChat} onChange={set('directChat')} />
                            <ToggleField label="Chat ?" checked={form.chat} onChange={set('chat')} />
                            <ToggleField label="Like Menu ?" checked={form.likeMenu} onChange={set('likeMenu')} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update Plan' : 'Add Plan'}</button>
                </form>
            </div>
        </div>
    );
}
