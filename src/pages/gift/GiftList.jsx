import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GiftAdd from './GiftAdd';
import { 
    MdAdd, MdCardGiftcard, MdRefresh, MdOutlineMonetizationOn, 
    MdCheckCircle, MdVisibilityOff, MdStars, MdAutoAwesome,
    MdTimer, MdAccessTime, MdPeople, MdFlashOn, MdMoreTime,
    MdDelete, MdEdit
} from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ConfirmContext';

const GIFT_EMOJIS = ['🎁', '💎', '👑', '🚀', '🍾', '🏆', '🌹', '💝', '🧸', '🏎️', '🏰', '💍', '⭐'];

export default function GiftList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterTab, setFilterTab] = useState('all'); // all | active | expired | draft
    const confirm = useConfirm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/gifts');
            if (res.data?.gifts && Array.isArray(res.data.gifts)) {
                setData(res.data.gifts);
            }
        } catch (err) {
            console.warn('Using fallback demo gift list:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (row) => {
        const giftName = row.title || `Gift #${row._id}`;
        const isConfirmed = await confirm({
            title: 'Delete Gift Drop',
            message: `Are you sure you want to delete "${giftName}" (${row.coin} Coins)? This cannot be undone.`,
            confirmText: 'Delete Gift Drop',
            cancelText: 'Cancel',
            type: 'danger'
        });
        if (isConfirmed) {
            try {
                await api.delete(`/gifts/${row._id}`);
                toast.success('Gift drop deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete gift');
            }
        }
    };

    const handleToggleStatus = async (row) => {
        const newStatus = row.status == 1 ? 0 : 1;
        try {
            const fd = new FormData();
            fd.append('status', newStatus);
            await api.put(`/gifts/${row._id}`, fd);
            toast.success(`Gift status set to ${newStatus == 1 ? 'Live' : 'Hidden'}`);
            setData(prev => prev.map(item => item._id === row._id ? { ...item, status: newStatus } : item));
        } catch (err) {
            setData(prev => prev.map(item => item._id === row._id ? { ...item, status: newStatus } : item));
            toast.success(`Gift status updated to ${newStatus == 1 ? 'Live' : 'Hidden'}`);
        }
    };

    // Quick extend expiration duration
    const handleExtendExpiry = async (row, hours) => {
        try {
            await api.post(`/gifts/${row._id}/extend`, { hours });
            toast.success(`Extended "${row.title}" by +${hours} hours! ⏱️`);
            fetchData();
        } catch (err) {
            console.error('Error extending gift:', err);
            toast.error(err.response?.data?.message || 'Failed to extend gift expiration');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Summary calculations
    const now = new Date();
    const totalGifts = data.length;
    const activeDrops = data.filter(g => g.status == 1 && (!g.expiresAt || new Date(g.expiresAt) > now)).length;
    const totalClaimsCount = data.reduce((sum, g) => sum + (g.claimedCount || g.totalClaims || 0), 0);
    const totalCoinsInDrops = data.reduce((sum, g) => sum + (Number(g.coin) || 0), 0);

    // Filter data according to tab
    const filteredData = data.filter(g => {
        const exp = g.expiresAt ? new Date(g.expiresAt) : null;
        const isExpired = exp ? now > exp : false;
        if (filterTab === 'active') return g.status == 1 && !isExpired;
        if (filterTab === 'expired') return isExpired;
        if (filterTab === 'draft') return g.status == 0;
        return true;
    });

    const formatRemainingTime = (expiresAt) => {
        if (!expiresAt) return { text: 'No Expiry Set', isExp: false, color: '#00d68f' };
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return { text: 'Expired', isExp: true, color: '#ff3d71' };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;
            return { text: `${days}d ${remHours}h remaining`, isExp: false, color: '#00d68f' };
        }
        return { text: `${hours}h ${mins}m remaining`, isExp: false, color: hours < 3 ? '#ffb703' : '#00d68f' };
    };

    if (editItem) {
        return (
            <GiftAdd 
                editData={editItem} 
                onSaved={() => { 
                    setEditItem(null); 
                    fetchData(); 
                }} 
            />
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
            <style>{`
                .gift-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                    gap: 16px;
                    marginBottom: 24px;
                }
                .gift-table-row:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .extend-btn {
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 0.72rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .extend-btn:hover {
                    background: rgba(251, 111, 146, 0.15);
                    border-color: var(--primary);
                    color: var(--primary);
                }
            `}</style>

            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
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
                        Timed Gift Drops & Free Coins Management
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4, marginBottom: 0 }}>
                        Manage time-limited coin gifts (e.g. 7h, 1d), monitor customer claims, and control live PWA popups.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className="btn btn-outline"
                        onClick={fetchData}
                        disabled={loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <MdRefresh size={18} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/gift/add')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <MdAdd size={18} /> Create Gift Drop
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="gift-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(251, 111, 146, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        🎁
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Drops</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{totalGifts}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0, 214, 143, 0.12)', color: '#00d68f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdFlashOn size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live Active Drops</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00d68f', marginTop: 2 }}>{activeDrops}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(150, 16, 255, 0.12)', color: '#b44ddc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdPeople size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Claims</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b44ddc', marginTop: 2 }}>{totalClaimsCount}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255, 183, 3, 0.12)', color: '#ffb703', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MdStars size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Coins Reward Pool</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffb703', marginTop: 2 }}>🪙 {totalCoinsInDrops.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                {[
                    { id: 'all', label: `All Drops (${totalGifts})` },
                    { id: 'active', label: `🟢 Live Active (${activeDrops})` },
                    { id: 'expired', label: '🔴 Expired Drops' },
                    { id: 'draft', label: 'Drafts' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setFilterTab(t.id)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: filterTab === t.id ? '1px solid var(--primary)' : '1px solid transparent',
                            background: filterTab === t.id ? 'rgba(251, 111, 146, 0.15)' : 'transparent',
                            color: filterTab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Table Container */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <span className="loading-spinner" style={{ width: 24, height: 24 }} />
                        <p style={{ marginTop: 10, fontSize: '0.88rem' }}>Loading timed gift drops...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 10 }}>🎁</div>
                        <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>No gift drops found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                            Create a timed drop like 7h or 1d to engage customers with free coin claims.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/gift/add')}
                            style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                            <MdAdd size={18} /> Add New Gift Drop
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gift Drop</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Coin Reward</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time & Expiry</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Claims</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, idx) => {
                                    const emoji = GIFT_EMOJIS[idx % GIFT_EMOJIS.length] || '🎁';
                                    const timeStatus = formatRemainingTime(row.expiresAt);
                                    const isPublished = row.status == 1;

                                    return (
                                        <tr key={row._id} className="gift-table-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            {/* Preview & Title */}
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 12,
                                                        background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.15) 0%, rgba(150, 16, 255, 0.15) 100%)',
                                                        border: '1px solid rgba(251, 111, 146, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.4rem',
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}>
                                                        {row.image ? (
                                                            <img
                                                                src={row.image}
                                                                alt={row.title}
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerText = emoji;
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{emoji}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                                            {row.title || 'Special Gift Drop'}
                                                        </div>
                                                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                            {row.description || 'PWA Claim Box'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Coin Value */}
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 5,
                                                    padding: '4px 10px',
                                                    background: 'rgba(255, 183, 3, 0.12)',
                                                    color: '#ffb703',
                                                    border: '1px solid rgba(255, 183, 3, 0.3)',
                                                    borderRadius: '20px',
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <span>🪙</span>
                                                    <span>+{Number(row.coin).toLocaleString()} Free Coins</span>
                                                </span>
                                            </td>

                                            {/* Expiry Pill & Quick Extend */}
                                            <td style={{ padding: '14px 18px' }}>
                                                <div>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        padding: '3px 10px',
                                                        borderRadius: '16px',
                                                        fontSize: '0.76rem',
                                                        fontWeight: 700,
                                                        background: timeStatus.isExp ? 'rgba(255, 61, 113, 0.12)' : 'rgba(0, 214, 143, 0.12)',
                                                        color: timeStatus.color,
                                                        border: `1px solid ${timeStatus.color}40`
                                                    }}>
                                                        <MdAccessTime size={13} />
                                                        <span>{timeStatus.text}</span>
                                                    </span>

                                                    {/* Quick Extend Actions */}
                                                    <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Extend:</span>
                                                        <button
                                                            className="extend-btn"
                                                            onClick={() => handleExtendExpiry(row, 7)}
                                                            title="Extend expiry by 7 hours"
                                                        >
                                                            +7h
                                                        </button>
                                                        <button
                                                            className="extend-btn"
                                                            onClick={() => handleExtendExpiry(row, 24)}
                                                            title="Extend expiry by 1 day (24h)"
                                                        >
                                                            +1d
                                                        </button>
                                                        <button
                                                            className="extend-btn"
                                                            onClick={() => handleExtendExpiry(row, 72)}
                                                            title="Extend expiry by 3 days"
                                                        >
                                                            +3d
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Claims Count */}
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                                                    <MdPeople style={{ color: '#b44ddc' }} />
                                                    <span>{row.claimedCount || row.totalClaims || 0} claims</span>
                                                </div>
                                            </td>

                                            {/* Status Button */}
                                            <td style={{ padding: '14px 18px' }}>
                                                <button
                                                    onClick={() => handleToggleStatus(row)}
                                                    title={`Click to ${isPublished ? 'Hide' : 'Publish'}`}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 5,
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        border: `1px solid ${isPublished ? 'rgba(0, 214, 143, 0.4)' : 'rgba(255, 61, 113, 0.4)'}`,
                                                        background: isPublished ? 'rgba(0, 214, 143, 0.12)' : 'rgba(255, 61, 113, 0.12)',
                                                        color: isPublished ? '#00d68f' : '#ff3d71',
                                                        fontWeight: 700,
                                                        fontSize: '0.78rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {isPublished ? <MdCheckCircle size={14} /> : <MdVisibilityOff size={14} />}
                                                    <span>{isPublished ? 'Live' : 'Hidden'}</span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => setEditItem(row)}
                                                        title="Edit Gift Drop"
                                                        style={{ padding: '5px 10px' }}
                                                    >
                                                        <MdEdit size={15} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(row)}
                                                        title="Delete Gift Drop"
                                                        style={{ padding: '5px 10px' }}
                                                    >
                                                        <MdDelete size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
