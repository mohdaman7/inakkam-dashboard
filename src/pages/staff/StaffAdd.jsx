import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const PERMISSIONS = [
    { key: 'interest', label: 'Interest', ops: ['Read', 'Write', 'Update'] },
    { key: 'pages', label: 'Pages', ops: ['Read', 'Write', 'Update'] },
    { key: 'faq', label: 'FAQ', ops: ['Read', 'Write', 'Update'] },
    { key: 'fakeUser', label: 'Fake User', ops: ['Update'] },
    { key: 'coin', label: 'Coin', ops: ['Update'] },
    { key: 'paymentGateway', label: 'Payment Gateway', ops: ['Read', 'Update'] },
    { key: 'language', label: 'Language', ops: ['Read', 'Write', 'Update'] },
    { key: 'payout', label: 'Payout', ops: ['Read', 'Update'] },
    { key: 'report', label: 'Report', ops: ['Read'] },
    { key: 'religion', label: 'Religion', ops: ['Read', 'Write', 'Update'] },
    { key: 'gift', label: 'Gift', ops: ['Read', 'Write', 'Update'] },
    { key: 'relationGoals', label: 'Relation Goals', ops: ['Read', 'Write', 'Update'] },
    { key: 'notification', label: 'Notification', ops: ['Write'] },
    { key: 'plan', label: 'Plan', ops: ['Read', 'Write', 'Update'] },
    { key: 'package', label: 'Package', ops: ['Read', 'Write', 'Update'] },
    { key: 'userList', label: 'User List', ops: ['Read', 'Update'] },
    { key: 'wallet', label: 'Wallet', ops: ['Update'] },
];

export default function StaffAdd({ editData, onSaved }) {
    const initPerms = () => {
        const p = {};
        PERMISSIONS.forEach(perm => { perm.ops.forEach(op => { p[`${perm.key}_${op}`] = false; }); });
        return p;
    };
    const [form, setForm] = useState({ email: '', password: '', status: '1' });
    const [perms, setPerms] = useState(initPerms());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) {
            setForm({ email: editData.email || '', password: '', status: String(editData.status ?? 1) });
            if (editData.permissions) setPerms({ ...initPerms(), ...editData.permissions });
        }
    }, [editData]);

    const togglePerm = (key) => setPerms(p => ({ ...p, [key]: !p[key] }));

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const payload = { ...form, permissions: perms };
            if (editData?._id) { await api.put(`/staff/${editData._id}`, payload); toast.success('Staff updated!'); }
            else { await api.post('/staff', payload); toast.success('Staff added!'); setForm({ email: '', password: '', status: '1' }); setPerms(initPerms()); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Staff' : 'Add Staff'}</h1></div>
            <div className="card" style={{ maxWidth: 700 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" placeholder="staff@inakkam.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder={editData ? 'Leave blank to keep' : 'Min 8 characters'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editData} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Staff Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="1">Publish</option><option value="0">Unpublish</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Permissions</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 8, marginTop: 8 }}>
                            {PERMISSIONS.map(perm => (
                                <div key={perm.key} style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 8 }}>{perm.label}</div>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        {perm.ops.map(op => {
                                            const pkey = `${perm.key}_${op}`;
                                            return (
                                                <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    <input type="checkbox" checked={!!perms[pkey]} onChange={() => togglePerm(pkey)} style={{ accentColor: 'var(--primary)' }} />
                                                    {op}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update Staff' : 'Add Staff'}</button>
                </form>
            </div>
        </div>
    );
}
