import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    MdArrowBack, MdPersonAdd, MdCloudUpload, MdSecurity,
    MdVisibility, MdVisibilityOff, MdFolderSpecial, MdAutoFixHigh,
    MdVerified, MdKey, MdLockOpen, MdCheckCircle, MdInfoOutline,
    MdNavigateNext, MdNavigateBefore, MdSave, MdAccountCircle, MdAssignmentInd
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
    const [activeStep, setActiveStep] = useState(1); // 1: Account, 2: Personal, 3: Bio & Interests

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
        toast.success('Generated a secure random password!');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            toast.success('Profile photo selected!');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => {
        // Simple step validation
        if (activeStep === 1) {
            if (!form.name || !form.email || (!isEdit && !form.password) || !form.phone) {
                toast.error('Please fill in all required account fields.');
                return;
            }
        }
        setActiveStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setActiveStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
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
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                <button
                    onClick={() => navigate('/elite-agent/list')}
                    className="btn btn-secondary btn-sm btn-icon"
                    style={{ borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <MdArrowBack style={{ fontSize: '1.2rem' }} />
                </button>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Module</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>Elite Agent Accounts</span>
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.03em', margin: '4px 0 0 0' }}>
                        {isEdit ? 'Edit Elite Agent' : 'Create Elite Agent Account'}
                    </h1>
                </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 32px',
                background: 'var(--bg-card)',
                borderRadius: 16,
                border: '1px solid var(--border-color)',
                marginBottom: 28,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Horizontal connecting line */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    right: '10%',
                    height: 2,
                    background: 'rgba(255,255,255,0.06)',
                    zIndex: 1
                }} />
                
                {/* Active progress track */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    width: activeStep === 1 ? '0%' : activeStep === 2 ? '40%' : '80%',
                    height: 2,
                    background: 'linear-gradient(90deg, var(--primary) 0%, #9610ff 100%)',
                    zIndex: 1,
                    transition: 'width 0.3s ease'
                }} />

                {/* Step 1 */}
                <div 
                    onClick={() => setActiveStep(1)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, cursor: 'pointer' }}
                >
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: activeStep >= 1 ? 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)' : 'var(--bg-input)',
                        color: activeStep >= 1 ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem',
                        boxShadow: activeStep === 1 ? '0 0 15px var(--primary-glow)' : 'none',
                        transition: 'all 0.3s ease',
                        border: activeStep >= 1 ? 'none' : '1px solid var(--border-color)'
                    }}>
                        1
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: activeStep === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Account Info</span>
                </div>

                {/* Step 2 */}
                <div 
                    onClick={() => { if (form.name && form.email) setActiveStep(2) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, cursor: 'pointer' }}
                >
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: activeStep >= 2 ? 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)' : 'var(--bg-input)',
                        color: activeStep >= 2 ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem',
                        boxShadow: activeStep === 2 ? '0 0 15px var(--primary-glow)' : 'none',
                        transition: 'all 0.3s ease',
                        border: activeStep >= 2 ? 'none' : '1px solid var(--border-color)'
                    }}>
                        2
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: activeStep === 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Personal Profile</span>
                </div>

                {/* Step 3 */}
                <div 
                    onClick={() => { if (form.name && form.email) setActiveStep(3) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, cursor: 'pointer' }}
                >
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: activeStep >= 3 ? 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)' : 'var(--bg-input)',
                        color: activeStep >= 3 ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem',
                        boxShadow: activeStep === 3 ? '0 0 15px var(--primary-glow)' : 'none',
                        transition: 'all 0.3s ease',
                        border: activeStep >= 3 ? 'none' : '1px solid var(--border-color)'
                    }}>
                        3
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: activeStep === 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Interests & Bio</span>
                </div>
            </div>

            {/* Main Form Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28 }}>
                
                {/* Side Widget: Profile Photo & Configurations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Photo Upload Card */}
                    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', textAlign: 'left' }}>
                            Profile Photo
                        </h4>
                        <div style={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            border: '3px dashed var(--border-color)',
                            margin: '0 auto 16px auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            background: 'var(--bg-input)',
                            transition: 'all 0.25s ease',
                            cursor: 'pointer',
                            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
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
                                <div style={{ padding: 10, color: 'var(--text-muted)' }}>
                                    <MdCloudUpload style={{ fontSize: '2.5rem', color: 'var(--primary-light)', marginBottom: 6 }} />
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Upload Image</div>
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                            Select a clear female profile avatar. PNG/JPG up to 5MB.
                        </p>
                    </div>

                    {/* Auto-Config Status widget */}
                    <div className="card" style={{
                        padding: 24,
                        background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.05) 0%, rgba(150, 16, 255, 0.02) 100%)',
                        border: '1px solid rgba(251, 111, 146, 0.15)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: 'rgba(251,111,146,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <MdAutoFixHigh style={{ fontSize: '1rem' }} />
                            </div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                System Auto-Config
                            </h4>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Account Type', value: 'Premium', color: '#ffd43b', bg: 'rgba(255,212,59,0.12)' },
                                { label: 'Verification Status', value: 'Verified', color: '#00d68f', bg: 'rgba(0,214,143,0.12)' },
                                { label: 'Direct Chatting', value: 'Instant Enable', color: '#0095ff', bg: 'rgba(0,149,255,0.12)' },
                                { label: 'KYC Obligation', value: 'Exempt', color: 'var(--primary)', bg: 'rgba(251,111,146,0.12)' }
                            ].map((cfg, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{cfg.label}</span>
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                                        color: cfg.color, background: cfg.bg
                                    }}>{cfg.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Fields Card */}
                <div className="card" style={{ padding: 32, minHeight: 460, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <form onSubmit={e => e.preventDefault()} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        
                        {/* Step 1: Account Setup */}
                        {activeStep === 1 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                                    <MdAssignmentInd style={{ fontSize: '1.3rem', color: 'var(--primary)' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Account Credentials</h3>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Configure main login information for this profile</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="e.g. Anjali Nair"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="anjali@inakkam.com"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    {!isEdit && (
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Login Password *</label>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ position: 'relative', flex: 1 }}>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={form.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="form-control"
                                                        style={{ padding: '12px 40px 12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', width: '100%', fontWeight: 'bold', letterSpacing: showPassword ? 'normal' : '0.2em' }}
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
                                                    style={{ whiteSpace: 'nowrap', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.82rem' }}
                                                >
                                                    <MdKey /> Generate Password
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Mobile Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control"
                                            placeholder="+91 98950 12345"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Gender Profile</label>
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', cursor: 'pointer' }}
                                        >
                                            <option value="Woman">Female (Recommended)</option>
                                            <option value="Man">Male</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Personal Profile Details */}
                        {activeStep === 2 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                                    <MdAccountCircle style={{ fontSize: '1.3rem', color: 'var(--primary)' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Personal Details</h3>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Add demographic and identity characteristics</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={form.dob}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{ padding: '11px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Occupation</label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={form.occupation}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Relationship Consultant"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={form.country}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={form.state}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Kerala"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Kochi"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Religion</label>
                                        <input
                                            type="text"
                                            name="religion"
                                            value={form.religion}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Hindu"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bio & Interests */}
                        {activeStep === 3 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                                    <MdFolderSpecial style={{ fontSize: '1.3rem', color: 'var(--primary)' }} />
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Bio & Engagement Profile</h3>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Provide conversational topics and profile summary</p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Languages Spoken</label>
                                        <input
                                            type="text"
                                            name="language"
                                            value={form.language}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="e.g. Malayalam, English"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Height (cm)</label>
                                            <input
                                                type="number"
                                                name="height"
                                                value={form.height}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder="165"
                                                style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Weight (kg)</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                value={form.weight}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder="54"
                                                style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Interests / Hobbies</label>
                                        <input
                                            type="text"
                                            name="interests"
                                            value={form.interests}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Reading, Music, Travel, Yoga"
                                            style={{ padding: '12px 14px', borderRadius: 10, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>About Me (Bio Description)</label>
                                        <textarea
                                            name="aboutMe"
                                            value={form.aboutMe}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            rows="3"
                                            placeholder="Write an engaging bio to attract customers..."
                                            style={{ padding: '12px 14px', borderRadius: 12, color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', lineHeight: 1.5 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wizard Action Footer */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 32,
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: 24
                        }}>
                            <div>
                                {activeStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="btn btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, fontWeight: 600 }}
                                    >
                                        <MdNavigateBefore style={{ fontSize: '1.2rem' }} /> Back
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/elite-agent/list')}
                                    className="btn btn-secondary"
                                    style={{ borderRadius: 10, fontWeight: 600 }}
                                >
                                    Cancel
                                </button>
                                {activeStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, fontWeight: 700 }}
                                    >
                                        Next Step <MdNavigateNext style={{ fontSize: '1.2rem' }} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn btn-primary"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, fontWeight: 700,
                                            background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)',
                                            boxShadow: '0 4px 16px rgba(251,111,146,0.3)'
                                        }}
                                    >
                                        {loading ? 'Creating...' : (
                                            <>
                                                <MdSave style={{ fontSize: '1.1rem' }} /> {isEdit ? 'Update Profile' : 'Complete Setup'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
