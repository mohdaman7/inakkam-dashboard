import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MdCloudUpload, MdArrowBack, MdCardGiftcard, MdOutlineMonetizationOn, 
    MdAutoAwesome, MdClose, MdCheckCircle, MdInfoOutline, MdPlayArrow
} from 'react-icons/md';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import api from '../../utils/api';

const PRESET_COINS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
const QUICK_EMOJIS = ['🌹', '💝', '🧸', '💎', '👑', '🏎️', '🚀', '🛥️', '🏰', '🏆', '🍾', '💍', '🦄', '🎆', '🎁'];

export default function GiftAdd({ editData, onSaved }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', coin: '50', status: '1' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🎁');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editData) {
            setForm({
                title: editData.title || '',
                coin: String(editData.coin ?? '50'),
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
        if (!preview) {
            // Give a hint in title if empty
            if (!form.title) {
                const names = {
                    '🌹': 'Romantic Rose',
                    '💝': 'Heart Gift Box',
                    '🧸': 'Cuddly Teddy',
                    '💎': 'Sparkling Diamond',
                    '👑': 'Royal Crown',
                    '🏎️': 'Luxury Sports Car',
                    '🚀': 'Super Rocket',
                    '🛥️': 'Private Yacht',
                    '🏰': 'Dream Castle',
                    '🏆': 'Champion Trophy',
                    '🍾': 'Celebration Champagne',
                    '💍': 'Diamond Ring',
                    '🦄': 'Magical Unicorn',
                    '🎆': 'Grand Fireworks',
                    '🎁': 'Mystery Box'
                };
                if (names[emoji]) {
                    setForm(p => ({ ...p, title: names[emoji] }));
                }
            }
        }
    };

    const triggerTestAnimation = () => {
        setIsAnimating(true);
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
        setTimeout(() => setIsAnimating(false), 1500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const coinVal = parseInt(form.coin, 10);
        if (isNaN(coinVal) || coinVal <= 0) {
            toast.error('Please enter a valid coin value greater than 0');
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            if (form.title) fd.append('title', form.title.trim());
            fd.append('coin', String(coinVal));
            fd.append('status', form.status);
            if (image) {
                fd.append('image', image);
            }

            if (editData?._id) {
                await api.put(`/gifts/${editData._id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Gift updated successfully!');
            } else {
                await api.post('/gifts', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('New virtual gift created successfully!');
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
    const inrValue = (coinNumber / 3).toFixed(2);

    return (
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
            <style>{`
                .gift-form-wrapper {
                    max-width: 1080px;
                    margin: 0 auto;
                }
                .gift-layout-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 24px;
                }
                @media (max-width: 860px) {
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
                    padding: 6px 12px;
                    border-radius: 20px;
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .coin-chip:hover {
                    border-color: #ffb703;
                    color: #ffb703;
                    background: rgba(255, 183, 3, 0.08);
                }
                .coin-chip.selected {
                    background: rgba(255, 183, 3, 0.15);
                    border-color: #ffb703;
                    color: #ffb703;
                    box-shadow: 0 2px 8px rgba(255, 183, 3, 0.2);
                }
                .emoji-selector-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                    gap: 8px;
                    margin-top: 10px;
                }
                .emoji-chip-btn {
                    height: 40px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-input);
                    font-size: 1.3rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .emoji-chip-btn:hover {
                    transform: scale(1.1);
                    border-color: var(--primary);
                    background: var(--bg-card-hover);
                }
                .emoji-chip-btn.active {
                    border-color: var(--primary);
                    background: rgba(251, 111, 146, 0.15);
                    box-shadow: 0 0 10px rgba(251, 111, 146, 0.3);
                }
                .mockup-preview-card {
                    background: linear-gradient(145deg, #1e1b2e 0%, #151221 100%);
                    border: 1px solid rgba(251, 111, 146, 0.25);
                    border-radius: 20px;
                    padding: 24px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
                }
                .gift-bounce {
                    animation: giftPulse 1.2s infinite ease-in-out;
                }
                @keyframes giftPulse {
                    0%, 100% { transform: scale(1) translateY(0); }
                    50% { transform: scale(1.08) translateY(-6px); }
                }
            `}</style>

            <div className="gift-form-wrapper">
                {/* Header with Back Button */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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
                            <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MdCardGiftcard style={{ color: 'var(--primary)' }} />
                                {editData ? 'Edit Virtual Gift' : 'Create New Virtual Gift'}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                                Set gift animation asset, coin valuation, and live member stream availability.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="gift-layout-grid">
                    {/* Form Left Side */}
                    <div className="gift-card-box">
                        <form onSubmit={handleSubmit}>
                            {/* Gift Title */}
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Gift Title / Name</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span>
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. Royal Crown, Romantic Rose"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            {/* Gift Coin Value */}
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Coin Value (🪙)</span>
                                    <span style={{ color: '#ffb703', fontWeight: 600, fontSize: '0.8rem' }}>
                                        ≈ ₹{inrValue} INR
                                    </span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>
                                        🪙
                                    </span>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="e.g. 50"
                                        style={{ paddingLeft: 42, fontSize: '1rem', fontWeight: 700 }}
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
                                            +{c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image Upload Zone */}
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Gift Image / Animation Artwork
                                </label>
                                
                                {preview ? (
                                    <div style={{
                                        position: 'relative',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                        padding: 20,
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 20
                                    }}>
                                        <div style={{
                                            width: 80,
                                            height: 80,
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
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                {image ? image.name : 'Current Image Asset'}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                {image ? `${(image.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                                            </div>
                                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
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
                                        <MdCloudUpload style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: 6 }} />
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                            Click or Drag & Drop Gift Image
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            Supports PNG, JPG, WebP, SVG, GIF (Up to 5MB)
                                        </div>
                                    </div>
                                )}

                                {/* Quick Emoji / Template Selector */}
                                <div style={{ marginTop: 16 }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        Or pick a preset animated emoji:
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
                                <label className="form-label" style={{ fontWeight: 600 }}>Publishing Status</label>
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
                                        transition: 'all 0.2s ease'
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
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Published (Active)</div>
                                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Visible in member gift tray</div>
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
                                        transition: 'all 0.2s ease'
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
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Unpublished (Hidden)</div>
                                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Temporarily disabled</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Submit and Cancel Buttons */}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={handleBack}
                                    style={{ padding: '10px 20px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                            Saving Gift...
                                        </>
                                    ) : editData ? (
                                        'Update Virtual Gift'
                                    ) : (
                                        'Create Virtual Gift'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Live In-App Visualizer */}
                    <div>
                        <div className="gift-card-box" style={{ position: 'sticky', top: 90 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <MdAutoAwesome style={{ color: '#ffb703' }} /> Live In-App Preview
                                </div>
                                <span className={`badge ${form.status === '1' ? 'badge-publish' : 'badge-unpublish'}`}>
                                    {form.status === '1' ? 'Live on App' : 'Hidden'}
                                </span>
                            </div>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 18 }}>
                                Real-time simulation of how this gift appears to users during live video calls and chat conversations.
                            </p>

                            {/* Mockup Card */}
                            <div className="mockup-preview-card">
                                {/* Floating Background Glow */}
                                <div style={{
                                    position: 'absolute',
                                    top: '20%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 140,
                                    height: 140,
                                    background: 'radial-gradient(circle, rgba(251,111,146,0.35) 0%, rgba(150,16,255,0) 70%)',
                                    filter: 'blur(20px)',
                                    pointerEvents: 'none'
                                }} />

                                <div className={isAnimating ? 'gift-bounce' : ''} style={{
                                    width: 110,
                                    height: 110,
                                    margin: '0 auto 16px',
                                    borderRadius: 22,
                                    background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.2) 0%, rgba(150, 16, 255, 0.25) 100%)',
                                    border: '2px solid rgba(251, 111, 146, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3.5rem',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
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

                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                                    {form.title || (preview ? 'Custom Virtual Gift' : 'Virtual Gift')}
                                </div>

                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: 'rgba(255, 183, 3, 0.2)', border: '1px solid #ffb703', color: '#ffb703', fontWeight: 800, fontSize: '0.95rem' }}>
                                    <span>🪙</span>
                                    <span>{coinNumber.toLocaleString()} Coins</span>
                                </div>

                                <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                                    Host Payout Rate: <strong style={{ color: '#00d68f' }}>₹{inrValue} INR</strong> (3 Coins = ₹1)
                                </div>

                                <button
                                    type="button"
                                    onClick={triggerTestAnimation}
                                    style={{
                                        marginTop: 20,
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg, #fb6f92 0%, #ff8fab 100%)',
                                        border: 'none',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        boxShadow: '0 4px 15px rgba(251, 111, 146, 0.4)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <MdPlayArrow size={18} /> Test Sending Animation
                                </button>
                            </div>

                            {/* Info Box */}
                            <div style={{
                                marginTop: 18,
                                padding: 14,
                                borderRadius: 12,
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                gap: 10,
                                alignItems: 'flex-start'
                            }}>
                                <MdInfoOutline style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                    Virtual gifts sent by users during live video calls or chat instantly credit coin earnings to the host agent's wallet.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
