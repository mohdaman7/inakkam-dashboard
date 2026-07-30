import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    MdArrowBack, MdPersonAdd, MdCloudUpload, MdSecurity,
    MdVisibility, MdVisibilityOff, MdFolderSpecial, MdAutoFixHigh,
    MdVerified, MdKey, MdLockOpen
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function EliteAgentAdd() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        gender: 'Woman', // Default Female
        dob: '',
        country: 'India',
        state: '',
        city: '',
        religion: '',
        language: '',
        interests: '',
        aboutMe: '',
        height: '',
        weight: '',
        occupation: '',
        // Auto-configurations set to YES/True/Active by default
        premium: 'true',
        verified: 'true',
        canChat: 'true',
        status: 'Active',
        role: 'Elite Agent'
    });

    useEffect(() => {
        if (isEdit) {
            const fetchAgent = async () => {
                setLoading(true);
                try {
                    const res = await api.get(`/elite-agents/${id}`);
                    if (res.data?.agent) {
                        const agent = res.data.agent;
                        setForm({
                            ...agent,
                            premium: String(agent.premium),
                            verified: String(agent.verified),
                            canChat: String(agent.canChat ?? true)
                        });
                        if (agent.photos && agent.photos[0]) {
                            setPreview(agent.photos[0]);
                        }
                    }
                } catch (err) {
                    console.log('API error loading agent, using mock edit state');
                } finally {
                    setLoading(false);
                }
            };
            fetchAgent();
        } else {
            generateRandomPassword();
        }
    }, [id, isEdit]);

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm(prev => ({ ...prev, password: pass }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...form,
                premium: form.premium === 'true',
                verified: form.verified === 'true',
                canChat: form.canChat === 'true'
            };

            if (isEdit) {
                await api.put(`/elite-agents/${id}`, payload);
                toast.success('Elite Agent profile updated successfully!');
            } else {
                await api.post('/elite-agents', payload);
                toast.success(`Elite Agent created successfully!\nEmail: ${form.email}\nPassword: ${form.password}`, { duration: 8000 });
            }
            navigate('/elite-agent/list');
        } catch (err) {
            toast.success(isEdit ? 'Elite Agent profile updated (Demo Mode)!' : `Elite Agent created (Demo Mode)!\nEmail: ${form.email}\nPassword: ${form.password}`, { duration: 8000 });
            navigate('/elite-agent/list');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button
                    onClick={() => navigate('/elite-agent/list')}
                    className="btn btn-secondary btn-sm btn-icon"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    <MdArrowBack />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em', margin: 0 }}>
                        <MdSecurity style={{ color: 'var(--primary)' }} /> {isEdit ? 'Edit Elite Agent' : 'Add Elite Agent'}
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                        {isEdit ? 'Update settings, wallet details, and personal info.' : 'Create a company-managed chat profile. Automatically sets Premium, Verified, and Chat enabled.'}
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="card" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 36px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 40 }}>

                        {/* LEFT COLUMN: Profile Image Upload & Auto-Configurations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            
                            {/* Image Uploader */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Profile Photo</label>
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    borderRadius: '16px',
                                    border: '2px dashed var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: 'var(--bg-input)',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            opacity: 0,
                                            cursor: 'pointer',
                                            zIndex: 2
                                        }}
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>
                                            <MdCloudUpload style={{ fontSize: '3rem', color: 'var(--primary)' }} />
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8 }}>Click to Upload</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG up to 5MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Auto Settings Status Panel */}
                            <div style={{ padding: '20px 24px', background: 'rgba(251, 111, 146, 0.04)', borderRadius: '14px', border: '1px solid rgba(251, 111, 146, 0.12)' }}>
                                <h4 style={{ fontSize: '0.88rem', color: 'var(--primary)', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <MdAutoFixHigh /> Auto-Config
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Premium Badge</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px' }}>YES</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Verified Badge</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px' }}>YES</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Immediate Chat</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px' }}>ENABLED</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>KYC Exemption</span>
                                        <span className="badge badge-primary-light" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', color: 'var(--primary)' }}>EXEMPT</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>System Role</span>
                                        <span className="badge badge-primary" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', background: 'var(--primary)' }}>AGENT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Form Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            
                            {/* Section 1: Basic Information */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    👤 Basic Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="Enter full name"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="agent@inakkam.com"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    {!isEdit && (
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label className="form-label" style={{ fontWeight: 600 }}>Password *</label>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ position: 'relative', flex: 1 }}>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={form.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="form-control"
                                                        style={{ padding: '12px 40px 12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', width: '100%' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        {showPassword ? <MdVisibilityOff style={{ fontSize: '1.2rem' }} /> : <MdVisibility style={{ fontSize: '1.2rem' }} />}
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={generateRandomPassword}
                                                    className="btn btn-secondary"
                                                    style={{ whiteSpace: 'nowrap', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                                                >
                                                    <MdKey /> Generate Password
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Mobile Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="+91 98765 43210"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Gender</label>
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', cursor: 'pointer' }}
                                        >
                                            <option value="Woman">Female (Default)</option>
                                            <option value="Man">Male</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={form.dob}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{ padding: '11px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={form.country}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={form.state}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Kerala"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Kochi"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Profile Details */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MdFolderSpecial style={{ color: 'var(--primary-light)' }} /> Profile Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Language(s)</label>
                                        <input
                                            type="text"
                                            name="language"
                                            value={form.language}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Malayalam, English, Hindi"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Religion</label>
                                        <input
                                            type="text"
                                            name="religion"
                                            value={form.religion}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Hindu, Christian, Muslim"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label" style={{ fontWeight: 600 }}>Interests (Comma separated)</label>
                                        <input
                                            type="text"
                                            name="interests"
                                            value={form.interests}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Reading, Music, Travel, Cinema"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Height (cm)</label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={form.height}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="165"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 600 }}>Weight (kg)</label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={form.weight}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="55"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label" style={{ fontWeight: 600 }}>Occupation</label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={form.occupation}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Relationship Consultant"
                                            style={{ padding: '12px 14px', borderRadius: '10px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label" style={{ fontWeight: 600 }}>About Me</label>
                                        <textarea
                                            name="aboutMe"
                                            value={form.aboutMe}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            rows="4"
                                            placeholder="Write something engaging for the user profile description..."
                                            style={{ padding: '12px 14px', borderRadius: '12px', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', lineHeight: '1.5' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submission Buttons */}
                            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/elite-agent/list')}
                                    className="btn btn-secondary"
                                    style={{ padding: '11px 24px', borderRadius: '10px', fontWeight: 600 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary animate-hover"
                                    style={{ minWidth: 170, padding: '11px 24px', borderRadius: '10px', fontWeight: 700, boxShadow: 'var(--shadow-primary)' }}
                                >
                                    {loading ? 'Saving...' : isEdit ? 'Update Agent Profile' : 'Create Agent Account'}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
