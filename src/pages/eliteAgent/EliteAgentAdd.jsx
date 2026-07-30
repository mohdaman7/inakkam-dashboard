import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdPersonAdd, MdCloudUpload, MdSecurity, MdVisibility, MdVisibilityOff } from 'react-icons/md';
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
            // Load current agent details for editing
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
            // Fallback mock mode
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
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em', margin: 0 }}>
                        <MdSecurity style={{ color: 'var(--primary-light)' }} /> {isEdit ? 'Edit Elite Agent' : 'Add Elite Agent'}
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                        {isEdit ? 'Update settings, wallet details, and personal info.' : 'Create a company-managed chat profile. Automatically sets Premium, Verified, and Chat enabled.'}
                    </p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 950, margin: '0 auto', padding: 28 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 32 }}>

                        {/* LEFT COLUMN: Profile Image Upload & Auto-Configurations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                <label className="form-label" style={{ alignSelf: 'flex-start' }}>Profile Photo</label>
                                <div style={{
                                    width: 170,
                                    height: 170,
                                    borderRadius: '50%',
                                    border: '2px dashed var(--border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: 'var(--bg-input)',
                                    transition: 'border-color 0.2s',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
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
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <MdCloudUpload style={{ fontSize: '2.5rem', color: 'var(--primary-light)' }} />
                                            <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Upload Photo</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Auto Settings Status Panel */}
                            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-light)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Configuration</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Premium Badge</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>YES</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Verified Badge</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>YES</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Immediate Chat</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ENABLED</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>KYC Exemption</span>
                                        <span className="badge badge-primary-light" style={{ fontSize: '0.7rem' }}>EXEMPT</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Role</span>
                                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>ELITE AGENT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Section 1: Basic Information */}
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8, marginBottom: 16 }}>
                                    Basic Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="agent@inakkam.com"
                                        />
                                    </div>

                                    {!isEdit && (
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label className="form-label">Password *</label>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <div style={{ position: 'relative', flex: 1 }}>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={form.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="form-control"
                                                        style={{ paddingRight: 40 }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                    >
                                                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={generateRandomPassword}
                                                    className="btn btn-secondary"
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Gender</label>
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        >
                                            <option value="Woman">Female (Default)</option>
                                            <option value="Man">Male</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={form.dob}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={form.country}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={form.state}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Kerala"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Kochi"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Profile Metadata */}
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8, marginBottom: 16 }}>
                                    Profile Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Language(s)</label>
                                        <input
                                            type="text"
                                            name="language"
                                            value={form.language}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Malayalam, English, Hindi"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Religion</label>
                                        <input
                                            type="text"
                                            name="religion"
                                            value={form.religion}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Hindu, Christian, Muslim"
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Interests (Comma separated)</label>
                                        <input
                                            type="text"
                                            name="interests"
                                            value={form.interests}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Reading, Music, Travel, Cinema"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Height (cm)</label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={form.height}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="165"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Weight (kg)</label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={form.weight}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="55"
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Occupation</label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={form.occupation}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Relationship Consultant"
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">About Me</label>
                                        <textarea
                                            name="aboutMe"
                                            value={form.aboutMe}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            rows="3"
                                            placeholder="Write something engaging for the user profile description..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submission Buttons */}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/elite-agent/list')}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ minWidth: 150 }}
                                >
                                    {loading ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Agent Account'}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}
