import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdLock, MdCloudUpload } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ProfileSettings() {
    const { admin, login } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (admin) {
            setForm({
                name: admin.name || '',
                email: admin.email || '',
                password: '',
                confirmPassword: '',
            });
            if (admin.avatar) {
                setPreview(admin.avatar);
            }
        }
    }, [admin]);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.password && form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('email', form.email);
            if (form.password) {
                fd.append('password', form.password);
            }
            if (image) {
                fd.append('avatar', image);
            }

            const res = await api.put('/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                login(res.data.admin);
                toast.success('Profile updated successfully!');
                setForm(p => ({ ...p, password: '', confirmPassword: '' }));
                setImage(null);
            } else {
                toast.error(res.data?.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            toast.error(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Profile Settings</h1>
            </div>

            <div className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    {/* Avatar Upload */}
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                        <label className="form-label" style={{ alignSelf: 'flex-start' }}>Avatar Profile Image</label>
                        <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', boxShadow: 'var(--shadow-md)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 12 }}>
                            {preview ? (
                                <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--text-muted)' }}>
                                    <MdPerson />
                                </div>
                            )}
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', color: 'white', fontSize: '0.8rem' }} className="avatar-overlay">
                                <MdCloudUpload style={{ fontSize: '1.5rem', marginBottom: 4 }} />
                                <span>Upload</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImage} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>Allowed formats: JPG, JPEG, PNG, WEBP (Max 5MB)</span>
                    </div>

                    <style>{`
                        .avatar-overlay:hover { opacity: 1 !important; }
                    `}</style>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Name */}
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <MdPerson style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 44 }}
                                    type="text"
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <MdEmail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 44 }}
                                    type="email"
                                    placeholder="Enter email address"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Role (Read Only) */}
                        <div className="form-group">
                            <label className="form-label">Administrator Role</label>
                            <input
                                className="form-input"
                                style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-body)' }}
                                type="text"
                                value={admin?.role ? admin.role.toUpperCase() : 'ADMIN'}
                                readOnly
                            />
                        </div>

                        {/* Dummy Field for layout spacing alignment */}
                        <div className="form-group"></div>
                    </div>

                    <div className="header-dropdown-divider" style={{ margin: '16px 0 28px 0', background: 'var(--border-color)' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">New Password (leave blank to keep current)</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 44 }}
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <MdLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 44 }}
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
                            {loading ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
