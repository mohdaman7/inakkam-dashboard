import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdArrowBack, MdSecurity, MdCheckCircle, MdOutlineCheckBoxOutlineBlank, MdOutlineVisibility } from 'react-icons/md';
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

const PERMISSION_GROUPS = [
    {
        title: 'Core & User Management',
        description: 'Manage system users, wallet activities, verification logs, and report lists.',
        perms: ['userList', 'wallet', 'report', 'notification']
    },
    {
        title: 'Content & Resources',
        description: 'Configure languages, static pages, FAQ lists, interests, and matching parameters.',
        perms: ['interest', 'language', 'religion', 'gift', 'relationGoals', 'faq', 'pages']
    },
    {
        title: 'Payments & Subscriptions',
        description: 'Control transaction gates, payment configurations, pricing packages, and payouts.',
        perms: ['plan', 'package', 'paymentGateway', 'payout', 'coin']
    },
    {
        title: 'System Utilities',
        description: 'Synthesizer controls and demo/fake user generator settings.',
        perms: ['fakeUser']
    }
];

export default function StaffAdd({ editData, onSaved }) {
    const navigate = useNavigate();
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

    const handleBack = () => {
        if (onSaved) onSaved();
        else navigate('/staff/list');
    };

    const setAllPerms = (val) => {
        const p = {};
        PERMISSIONS.forEach(perm => {
            perm.ops.forEach(op => {
                p[`${perm.key}_${op}`] = val;
            });
        });
        setPerms(p);
    };

    const setReadOnlyPerms = () => {
        const p = {};
        PERMISSIONS.forEach(perm => {
            perm.ops.forEach(op => {
                p[`${perm.key}_${op}`] = (op === 'Read');
            });
        });
        setPerms(p);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const payload = { ...form, permissions: perms };
            if (editData?._id) { 
                await api.put(`/staff/${editData._id}`, payload); 
                toast.success('Staff details updated successfully!'); 
            } else { 
                await api.post('/staff', payload); 
                toast.success('New staff member added!'); 
                setForm({ email: '', password: '', status: '1' }); 
                setPerms(initPerms()); 
            }
            handleBack();
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Error occurred while saving'); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
            <style>{`
                .premium-staff-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    padding: 8px 14px;
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                .back-btn:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: var(--bg-card-hover);
                }
                .form-section-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 28px;
                    margin-bottom: 24px;
                    box-shadow: var(--shadow-sm);
                }
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 12px;
                }
                .preset-btn {
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    font-size: 0.78rem;
                    padding: 6px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .preset-btn:hover {
                    border-color: var(--primary);
                    color: var(--text-primary);
                    background: var(--bg-card-hover);
                }
                .perm-group-box {
                    background: rgba(255,255,255,0.015);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .perm-group-header {
                    margin-bottom: 16px;
                }
                .perm-group-title {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--primary-light);
                }
                .perm-group-desc {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-top: 3px;
                }
                .perm-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 12px;
                }
                .perm-card {
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    padding: 12px 16px;
                    transition: all var(--transition-fast);
                }
                .perm-card:hover {
                    border-color: rgba(251, 111, 146, 0.4);
                }
                .perm-card-title {
                    font-weight: 600;
                    font-size: 0.82rem;
                    color: var(--text-primary);
                    margin-bottom: 10px;
                }
                .perm-pill-container {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .perm-checkbox-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    user-select: none;
                }
                .perm-checkbox-label input {
                    display: none;
                }
                .perm-checkbox-label.active {
                    background: var(--primary-glow);
                    border-color: var(--primary);
                    color: var(--text-primary);
                }
                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 8px;
                }
            `}</style>
            
            <div className="premium-staff-container">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button className="back-btn" onClick={handleBack}>
                            <MdArrowBack size={16} /> Back
                        </button>
                        <h1 className="page-title" style={{ margin: 0 }}>
                            {editData ? 'Edit Staff Account' : 'Add Staff Member'}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info Section */}
                    <div className="form-section-card">
                        <div className="section-title">
                            Account Information
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input 
                                    className="form-input" 
                                    type="email" 
                                    placeholder="e.g. support@inakkam.com" 
                                    value={form.email} 
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input 
                                    className="form-input" 
                                    type="password" 
                                    placeholder={editData ? 'Leave blank to keep current password' : 'Min 8 characters'} 
                                    value={form.password} 
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                                    required={!editData} 
                                />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">Staff Account Status</label>
                            <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="1">Active / Published</option>
                                <option value="0">Suspended / Unpublished</option>
                            </select>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="form-section-card">
                        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MdSecurity /> Access Control Permissions
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" className="preset-btn" onClick={() => setAllPerms(true)}>
                                    <MdCheckCircle size={14} /> Full Access
                                </button>
                                <button type="button" className="preset-btn" onClick={setReadOnlyPerms}>
                                    <MdOutlineVisibility size={14} /> Read Only
                                </button>
                                <button type="button" className="preset-btn" onClick={() => setAllPerms(false)}>
                                    <MdOutlineCheckBoxOutlineBlank size={14} /> Clear All
                                </button>
                            </div>
                        </div>

                        {PERMISSION_GROUPS.map(group => {
                            // Find permissions belonging to this group
                            const groupPerms = PERMISSIONS.filter(p => group.perms.includes(p.key));
                            if (groupPerms.length === 0) return null;
                            
                            return (
                                <div key={group.title} className="perm-group-box">
                                    <div className="perm-group-header">
                                        <div className="perm-group-title">{group.title}</div>
                                        <div className="perm-group-desc">{group.description}</div>
                                    </div>
                                    <div className="perm-cards-grid">
                                        {groupPerms.map(perm => (
                                            <div key={perm.key} className="perm-card">
                                                <div className="perm-card-title">{perm.label}</div>
                                                <div className="perm-pill-container">
                                                    {perm.ops.map(op => {
                                                        const pkey = `${perm.key}_${op}`;
                                                        const active = !!perms[pkey];
                                                        return (
                                                            <label key={op} className={`perm-checkbox-label ${active ? 'active' : ''}`}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={active} 
                                                                    onChange={() => togglePerm(pkey)} 
                                                                />
                                                                {op}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} onClick={handleBack}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving Changes...' : editData ? 'Update Staff Member' : 'Create Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
