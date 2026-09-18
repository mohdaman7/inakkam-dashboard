import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MdCloudUpload, MdArrowBack, MdCardGiftcard, MdOutlineMonetizationOn, 
    MdAutoAwesome, MdClose, MdCheckCircle, MdInfoOutline, MdPlayArrow,
    MdAccessTime, MdTimer, MdCalendarToday, MdFlashOn, MdHourglassEmpty
} from 'react-icons/md';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import api from '../../utils/api';

const PRESET_COINS = [25, 50, 100, 200, 500, 1000];

// Duration Presets matching client request: "like 7h or 1d etc"
const DURATION_PRESETS = [
    { label: '1 Hour', hours: 1, tag: 'Flash Drop', icon: '⚡' },
    { label: '7 Hours', hours: 7, tag: '7h Drop', icon: '⏱️' },
    { label: '12 Hours', hours: 12, tag: 'Half Day', icon: '⏳' },
    { label: '1 Day (24h)', hours: 24, tag: 'Daily Bonus', icon: '📅' },
    { label: '3 Days', hours: 72, tag: 'Weekend Special', icon: '🗓️' },
    { label: '7 Days', hours: 168, tag: 'Festive Week', icon: '🎁' },
];

const QUICK_EMOJIS = ['🎁', '💎', '👑', '🚀', '🍾', '🏆', '🌹', '💝', '🧸', '🏎️', '🏰', '💍', '🦄', '🎆', '⭐'];

export default function GiftAdd({ editData, onSaved }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ 
        title: '', 
        description: 'Claim your exclusive free coins before time runs out!',
        coin: '50', 
        durationHours: 24,
        customHours: '',
        useCustomExpiry: false,
        customDate: '',
        status: '1' 
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🎁');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editData) {
            let initialHours = editData.durationHours || 24;
            let customDateStr = '';
            if (editData.expiresAt) {
                const exp = new Date(editData.expiresAt);
                customDateStr = exp.toISOString().slice(0, 16);
            }
            setForm({
                title: editData.title || '',
                description: editData.description || 'Claim your exclusive free coins before time runs out!',
                coin: String(editData.coinReward ?? editData.coinCost ?? editData.coin ?? '50'),
                durationHours: initialHours,
                customHours: String(initialHours),
                useCustomExpiry: false,
                customDate: customDateStr,
                status: String(editData.status ?? 1)
            });
            if (editData.image) {
                setPreview(editData.image);
            }
        }
    }, [editData]);

    const handleBack = () => {
        if (onSaved) onSaved();
        else navigate('/gift/list');
    };

    const handleFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file (PNG, JPG, SVG, WebP, GIF)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds maximum limit of 5MB');
            return;
        }
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        handleFile(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSelectEmoji = (emoji) => {
        setSelectedEmoji(emoji);
        if (!preview && !form.title) {
            const names = {
                '🎁': 'Surprise Coin Drop! 🎁',
                '💎': 'Diamond Mystery Box 💎',
                '👑': 'Royal Bonus Drop 👑',
                '🚀': 'Rocket Boost Gift 🚀',
                '🍾': 'Celebration Coin Drop 🍾',
                '🏆': 'Winner\'s Free Gift 🏆',
                '🌹': 'Romantic Spark Box 🌹',
                '💝': 'Special Love Box 💝',
                '🧸': 'Cuddly Surprise 🧸',
                '🏎️': 'Turbo Flash Drop 🏎️',
                '🏰': 'Kingdom Coin Drop 🏰',
                '💍': 'Golden Treasure Box 💍',
                '🦄': 'Magical Free Coins 🦄',
                '🎆': 'Festival Fireworks Drop 🎆',
                '⭐': 'Lucky Star Drop ⭐'
            };
            if (names[emoji]) {
                setForm(p => ({ ...p, title: names[emoji] }));
            }
        }
    };

    const triggerTestAnimation = () => {
        setIsAnimating(true);
        confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
        });
        setTimeout(() => setIsAnimating(false), 1800);
    };

    // Calculate preview expiry timestamp
    const getCalculatedExpiryText = () => {
        if (form.useCustomExpiry && form.customDate) {
            const d = new Date(form.customDate);
            if (!isNaN(d.getTime())) {
                return d.toLocaleString('en-IN', { 
                    dateStyle: 'full', 
                    timeStyle: 'short' 
                });
            }
        }
        const hours = Number(form.durationHours) || 24;
        const targetDate = new Date(Date.now() + hours * 60 * 60 * 1000);
        return targetDate.toLocaleString('en-IN', { 
            dateStyle: 'full', 
            timeStyle: 'short' 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const coinVal = parseInt(form.coin, 10);
        if (isNaN(coinVal) || coinVal <= 0) {
            toast.error('Please enter a valid coin value greater than 0');
            return;
        }

        const hoursVal = Number(form.durationHours);
        if (!form.useCustomExpiry && (isNaN(hoursVal) || hoursVal <= 0)) {
            toast.error('Please select or specify a valid duration in hours');
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title.trim() || `Free ${coinVal} Coins Drop 🎁`);
            fd.append('description', form.description.trim());
            fd.append('coin', String(coinVal));
            fd.append('coinReward', String(coinVal));
            fd.append('status', form.status);
            fd.append('type', 'free_claim');

            if (form.useCustomExpiry && form.customDate) {
                fd.append('expiresAt', new Date(form.customDate).toISOString());
            } else {
                fd.append('durationHours', String(hoursVal));
                const calcExp = new Date(Date.now() + hoursVal * 60 * 60 * 1000);
                fd.append('expiresAt', calcExp.toISOString());
            }

            if (image) {
                fd.append('image', image);
            }

            if (editData?._id) {
                await api.put(`/gifts/${editData._id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Gift drop updated successfully!');
            } else {
                await api.post('/gifts', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('New Gift Drop created and scheduled successfully!');
            }

            handleBack();
        } catch (err) {
            console.error('Error saving gift:', err);
            toast.error(err.response?.data?.message || 'Error occurred while saving gift');
        } finally {
            setLoading(false);
        }
    };

    const coinNumber = Number(form.coin) || 0;

    return (
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
            <style>{`
                .gift-form-wrapper {
                    max-width: 1160px;
                    margin: 0 auto;
                }
                .gift-layout-grid {
                    display: grid;
                    grid-template-columns: 1.25fr 0.75fr;
                    gap: 24px;
                }
                @media (max-width: 960px) {
                    .gift-layout-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .gift-card-box {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                }
                .gift-upload-zone {
                    border: 2px dashed var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 24px 16px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: rgba(255, 255, 255, 0.015);
                    position: relative;
                }
                .gift-upload-zone.active, .gift-upload-zone:hover {
                    border-color: var(--primary);
                    background: rgba(251, 111, 146, 0.04);
                }
                .coin-chip {
                    padding: 7px 14px;
                    border-radius: 20px;
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .coin-chip:hover {
                    border-color: #ffb703;
                    color: #ffb703;
                    background: rgba(255, 183, 3, 0.08);
                }
                .coin-chip.selected {
                    background: rgba(255, 183, 3, 0.16);
                    border-color: #ffb703;
                    color: #ffb703;
                    box-shadow: 0 2px 8px rgba(255, 183, 3, 0.25);
                }
                .duration-preset-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-top: 10px;
                }
                @media (max-width: 600px) {
                    .duration-preset-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                .duration-card {
                    padding: 12px 14px;
                    border-radius: 12px;
                    background: var(--bg-input);
                    border: 1.5px solid var(--border-color);
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .duration-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .duration-card.selected {
                    border-color: var(--primary);
                    background: rgba(251, 111, 146, 0.12);
                    box-shadow: 0 4px 14px rgba(251, 111, 146, 0.2);
                }
                .emoji-selector-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
                    gap: 8px;
                    margin-top: 10px;
                }
                .emoji-chip-btn {
                    height: 42px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-input);
                    font-size: 1.35rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .emoji-chip-btn:hover {
                    transform: scale(1.12);
                    border-color: var(--primary);
                }
                .emoji-chip-btn.active {
                    border-color: var(--primary);
                    background: rgba(251, 111, 146, 0.2);
                    box-shadow: 0 0 12px rgba(251, 111, 146, 0.35);
                }
                .mockup-preview-card {
                    background: linear-gradient(150deg, #181528 0%, #0d0a18 100%);
                    border: 1px solid rgba(251, 111, 146, 0.3);
                    border-radius: 24px;
                    padding: 26px 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 16px 36px rgba(0,0,0,0.45);
                }
                .gift-bounce-anim {
                    animation: giftFloat 1.8s infinite ease-in-out;
                }
                @keyframes giftFloat {
                    0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
                    50% { transform: translateY(-8px) scale(1.06) rotate(3deg); }
                }
                .gift-pulse-aura {
                    animation: auraGlow 2s infinite alternate;
                }
                @keyframes auraGlow {
                    0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
                    100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
                }
            `}</style>

            <div className="gift-form-wrapper">
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleBack}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
                        >
                            <MdArrowBack size={18} /> Back to List
                        </button>
                        <div>
                            <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    background: 'linear-gradient(135deg, #fb6f92 0%, #ff8fab 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(251, 111, 146, 0.3)'
                                }}>
                                    <MdCardGiftcard size={22} />
                                </div>
                                {editData ? 'Edit Timed Gift Drop' : 'Create Timed Gift Drop'}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '3px 0 0 0' }}>
                                Schedule time-limited free coin drops (e.g. 7h, 1d) that pop up as a Gift Box on customer PWAs.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="gift-layout-grid">
                    {/* Left Form Area */}
                    <div className="gift-card-box">
                        <form onSubmit={handleSubmit}>
                            {/* Gift Title */}
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Gift Drop Title</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shown in PWA Popup</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. Weekend Special Drop 🎁, Festive Welcome Box"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            {/* Gift Description */}
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Popup Subtitle / Note
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. Claim your free coins before the timer expires!"
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

                            {/* Free Coin Reward Amount */}
                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Free Coin Reward (🪙)</span>
                                    <span style={{ color: '#ffb703', fontWeight: 700, fontSize: '0.82rem' }}>
                                        Credited directly to customer wallet
                                    </span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>
                                        🪙
                                    </span>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 50"
                                        style={{ paddingLeft: 44, fontSize: '1.05rem', fontWeight: 800 }}
                                        value={form.coin}
                                        onChange={e => setForm(p => ({ ...p, coin: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* Preset Coin Pills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                    {PRESET_COINS.map(c => (
                                        <button
                                            type="button"
                                            key={c}
                                            className={`coin-chip ${Number(form.coin) === c ? 'selected' : ''}`}
                                            onClick={() => setForm(p => ({ ...p, coin: String(c) }))}
                                        >
                                            +{c} Coins
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Period / Expiration Duration System */}
                            <div className="form-group" style={{ marginBottom: 24, padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(251, 111, 146, 0.04)', border: '1.5px solid rgba(251, 111, 146, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <label className="form-label" style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)' }}>
                                        <MdTimer style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
                                        Gift Expiration & Duration Period
                                    </label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(251, 111, 146, 0.12)', padding: '2px 8px', borderRadius: 10 }}>
                                        Auto-Expires
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                                    Choose how long customers have to claim this gift. A live countdown timer is shown on the PWA.
                                </p>

                                {/* Duration Presets Grid */}
                                <div className="duration-preset-grid">
                                    {DURATION_PRESETS.map((dp) => {
                                        const isSelected = !form.useCustomExpiry && form.durationHours === dp.hours;
                                        return (
                                            <div
                                                key={dp.hours}
                                                className={`duration-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => setForm(p => ({ ...p, durationHours: dp.hours, useCustomExpiry: false }))}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{dp.icon}</span>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                        {dp.tag}
                                                    </span>
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                                    {dp.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Custom Hours or Specific Date Toggle */}
                                <div style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={form.useCustomExpiry}
                                            onChange={e => setForm(p => ({ ...p, useCustomExpiry: e.target.checked }))}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                        <span>Set Specific Date & Time</span>
                                    </label>
                                </div>

                                {form.useCustomExpiry ? (
                                    <div style={{ marginTop: 12 }}>
                                        <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Select exact expiration date and time:</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={form.customDate}
                                            onChange={e => setForm(p => ({ ...p, customDate: e.target.value }))}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or custom hours:</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ width: 100, padding: '6px 10px', fontSize: '0.85rem' }}
                                            min="1"
                                            placeholder="Hours"
                                            value={form.durationHours}
                                            onChange={e => setForm(p => ({ ...p, durationHours: Number(e.target.value) }))}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>hours from now</span>
                                    </div>
                                )}

                                {/* Expiry Preview Bar */}
                                <div style={{
                                    marginTop: 14,
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}>
                                    <MdAccessTime style={{ color: '#ffb703', fontSize: '1.2rem', flexShrink: 0 }} />
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Expires on: <strong style={{ color: '#fff' }}>{getCalculatedExpiryText()}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Gift Image / Visual Artwork */}
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Gift Box Artwork / Animated Icon
                                </label>
                                
                                {preview ? (
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                        padding: 16,
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16
                                    }}>
                                        <div style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 14,
                                            background: 'rgba(251, 111, 146, 0.1)',
                                            border: '1px solid rgba(251, 111, 146, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            <img src={preview} alt="Gift preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                                {image ? image.name : 'Current Image Asset'}
                                            </div>
                                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                                >
                                                    Change Image
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={handleRemoveImage}
                                                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                                >
                                                    <MdClose /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`gift-upload-zone ${dragActive ? 'active' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageChange}
                                        />
                                        <MdCloudUpload style={{ fontSize: '2.4rem', color: 'var(--primary)', marginBottom: 6 }} />
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                            Click or Drag & Drop Custom Gift Artwork
                                        </div>
                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            Supports PNG, JPG, WebP, SVG, GIF (Up to 5MB)
                                        </div>
                                    </div>
                                )}

                                {/* Quick Emoji / 3D Icon Selector */}
                                <div style={{ marginTop: 14 }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        Or select a 3D animated emoji badge:
                                    </label>
                                    <div className="emoji-selector-grid">
                                        {QUICK_EMOJIS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                className={`emoji-chip-btn ${selectedEmoji === emoji && !preview ? 'active' : ''}`}
                                                onClick={() => handleSelectEmoji(emoji)}
                                                title={`Select ${emoji}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Visibility Status */}
                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>Drop Publishing Status</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: `1px solid ${form.status === '1' ? 'var(--primary)' : 'var(--border-color)'}`,
                                        background: form.status === '1' ? 'rgba(251, 111, 146, 0.08)' : 'var(--bg-input)',
                                        cursor: 'pointer',
                                    }}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="1"
                                            checked={form.status === '1'}
                                            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Live on PWA (Active)</div>
                                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Immediately claimable by customers</div>
                                        </div>
                                    </label>

                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: `1px solid ${form.status === '0' ? 'var(--primary)' : 'var(--border-color)'}`,
                                        background: form.status === '0' ? 'rgba(251, 111, 146, 0.08)' : 'var(--bg-input)',
                                        cursor: 'pointer',
                                    }}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="0"
                                            checked={form.status === '0'}
                                            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>Draft / Unpublished</div>
                                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Hidden from customer app</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Submit and Cancel Buttons */}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={handleBack}
                                    style={{ padding: '10px 22px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ padding: '10px 26px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                            Scheduling Drop...
                                        </>
                                    ) : editData ? (
                                        'Save & Update Drop'
                                    ) : (
                                        '🚀 Publish Timed Gift Drop'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Live Customer PWA Visualizer */}
                    <div>
                        <div className="gift-card-box" style={{ position: 'sticky', top: 90 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <MdAutoAwesome style={{ color: '#ffb703' }} /> Live Customer PWA Popup
                                </div>
                                <span className={`badge ${form.status === '1' ? 'badge-publish' : 'badge-unpublish'}`}>
                                    {form.status === '1' ? 'Live on App' : 'Hidden'}
                                </span>
                            </div>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 18, lineHeight: 1.4 }}>
                                Real-time simulation of the glowing Gift Box popup and unbox animation seen by all app customers.
                            </p>

                            {/* Mockup Card */}
                            <div className="mockup-preview-card">
                                {/* Ambient Glow Aura */}
                                <div className="gift-pulse-aura" style={{
                                    position: 'absolute',
                                    top: '30%',
                                    left: '50%',
                                    width: 160,
                                    height: 160,
                                    background: 'radial-gradient(circle, rgba(251,111,146,0.45) 0%, rgba(150,16,255,0) 70%)',
                                    filter: 'blur(24px)',
                                    pointerEvents: 'none'
                                }} />

                                {/* Floating 3D Gift Box Visual */}
                                <div className={isAnimating ? 'gift-bounce-anim' : 'gift-bounce-anim'} style={{
                                    width: 96,
                                    height: 96,
                                    margin: '0 auto 14px',
                                    borderRadius: 22,
                                    background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.25) 0%, rgba(150, 16, 255, 0.3) 100%)',
                                    border: '2px solid rgba(251, 111, 146, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3.4rem',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 28px rgba(0,0,0,0.5)',
                                    position: 'relative'
                                }}>
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Gift Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span>{selectedEmoji}</span>
                                    )}
                                </div>

                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                                    {form.title || 'Surprise Coin Drop! 🎁'}
                                </div>

                                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: 14, padding: '0 10px' }}>
                                    {form.description}
                                </div>

                                {/* Coin Reward Badge */}
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 18px', borderRadius: 20, background: 'rgba(255, 183, 3, 0.2)', border: '1px solid #ffb703', color: '#ffb703', fontWeight: 900, fontSize: '1.05rem', marginBottom: 12 }}>
                                    <span>🪙</span>
                                    <span>+{coinNumber.toLocaleString()} FREE COINS</span>
                                </div>

                                {/* Live Countdown Mock */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    borderRadius: 12,
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    color: '#ff8fab',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    marginBottom: 16
                                }}>
                                    <span>⏳</span>
                                    <span>Expires in: {form.durationHours || 24}h 00m 00s</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={triggerTestAnimation}
                                    style={{
                                        width: '100%',
                                        padding: '11px',
                                        borderRadius: 14,
                                        background: 'linear-gradient(135deg, #fb6f92 0%, #ff8fab 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        fontWeight: 800,
                                        fontSize: '0.88rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        boxShadow: '0 4px 18px rgba(251, 111, 146, 0.45)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <MdPlayArrow size={20} /> Test Unbox & Confetti
                                </button>
                            </div>

                            <div style={{
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 12,
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                gap: 8,
                                alignItems: 'flex-start'
                            }}>
                                <MdInfoOutline style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                    When a customer claims this gift on the PWA, their coin balance updates instantly and cannot be claimed twice by the same user.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
