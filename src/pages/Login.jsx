import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart } from 'react-icons/fa';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Login.css';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Demo: accept hardcoded admin or call backend
            if (
                (form.email === 'admin' || form.email === 'admin@inakkam.com') &&
                form.password === 'admin@123'
            ) {
                login({ name: 'Administrator', email: form.email, role: 'admin' });
                localStorage.setItem('inakkam_admin_token', 'demo-admin-token');
                toast.success('Welcome back, Admin!');
                navigate('/');
            } else {
                // Try real backend
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, password: form.password }),
                });
                const data = await res.json();
                if (data.success) {
                    login(data.admin);
                    localStorage.setItem('inakkam_admin_token', data.token);
                    toast.success('Welcome back!');
                    navigate('/');
                } else {
                    toast.error(data.message || 'Invalid credentials');
                }
            }
        } catch {
            toast.error('Invalid credentials. Use admin / admin@123');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated background */}
            <div className="login-bg">
                <div className="login-bg-orb orb1" />
                <div className="login-bg-orb orb2" />
                <div className="login-bg-orb orb3" />
            </div>

            <div className="login-container">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <FaHeart />
                    </div>
                    <h1 className="login-logo-title">Inakkam</h1>
                    <p className="login-logo-sub">Admin Control Panel</p>
                </div>

                {/* Card */}
                <div className="login-card">
                    <div className="login-card-header">
                        <h2>Sign In</h2>
                        <p>Enter your credentials to access the dashboard</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label>Email / Username</label>
                            <div className="login-input-wrap">
                                <MdEmail className="login-input-icon" />
                                <input
                                    type="text"
                                    placeholder="admin@inakkam.com"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label>Password</label>
                            <div className="login-input-wrap">
                                <MdLock className="login-input-icon" />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login-pwd-toggle"
                                    onClick={() => setShowPwd(p => !p)}
                                >
                                    {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <span className="login-spinner" />
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="login-hint">
                        <span>Demo: <code>admin</code> / <code>admin@123</code></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
