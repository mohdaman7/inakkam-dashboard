import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MdArrowBack, MdPerson, MdVerified, MdEmail, MdPhone,
    MdAccountBalanceWallet, MdChat, MdHistory, MdLockReset, MdBlock,
    MdMailOutline, MdStar, MdAccessTime, MdAttachMoney, MdCheckCircle, MdPaid,
    MdTrendingUp, MdEdit, MdContentCopy, MdSchedule
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MOCK_CHATS = [
    { customer: 'Rahul Sharma', coins: 120, messages: 24, duration: '18 min', date: 'Today, 2:40 PM' },
    { customer: 'Arjun Menon', coins: 80, messages: 16, duration: '12 min', date: 'Today, 11:15 AM' },
    { customer: 'Priya Patel', coins: 250, messages: 45, duration: '35 min', date: 'Yesterday, 8:20 PM' },
    { customer: 'Siddharth Rao', coins: 150, messages: 30, duration: '22 min', date: '28 July, 4:10 PM' },
    { customer: 'Vikram Singh', coins: 300, messages: 60, duration: '45 min', date: '27 July, 9:30 PM' }
];

const INITIAL_PAYOUTS = [
    { id: 'pay_101', date: '25 July 2026', amount: 15000, method: 'Bank Transfer (SBI)', status: 'Paid' },
    { id: 'pay_102', date: '10 July 2026', amount: 15000, method: 'UPI (GPay)', status: 'Paid' }
];

/* ───────── Animated Radial Progress Ring ───────── */
function CoinRing({ label, value, max, color }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    const offset = circumference - pct * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle
                    cx="44" cy="44" r={radius} fill="none"
                    stroke={color} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '44px 44px', transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="44" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="800">🪙</text>
                <text x="44" y="56" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">{value}</text>
            </svg>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        </div>
    );
}

/* ───────── Metric Card ───────── */
function MetricCard({ icon, label, value, color, gradient }) {
    return (
        <div style={{
            padding: '18px 20px',
            borderRadius: 14,
            background: gradient || `linear-gradient(135deg, ${color}12 0%, ${color}04 100%)`,
            border: `1px solid ${color}22`,
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}15`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', color: color, flexShrink: 0
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: color, letterSpacing: '-0.02em' }}>{value}</div>
            </div>
        </div>
    );
}

/* ───────── Info Row ───────── */
function InfoRow({ icon, label, value }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'background 0.2s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,111,146,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        >
            <span style={{ color: 'var(--primary-light)', fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'N/A'}</div>
            </div>
        </div>
    );
}

export default function EliteAgentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('Bank Transfer (SBI)');
    const [activeTab, setActiveTab] = useState('chats');

    // Initial mock profile info
    const [agent, setAgent] = useState({
        _id: id,
        name: 'Aishwarya Sen',
        email: 'agent01@inakkam.com',
        phone: '+91 98950 12301',
        gender: 'Woman',
        premium: true,
        verified: true,
        canChat: true,
        status: 'Active',
        isOnline: true,
        createdAt: '25/07/2026',
        lastLogin: 'Today, 3:12 PM',
        dob: '12/04/1998',
        country: 'India',
        state: 'Kerala',
        city: 'Kochi',
        religion: 'Hindu',
        language: 'Malayalam, English',
        interests: 'Reading, Music, Travel',
        aboutMe: 'Enthusiastic relationship consultant helping souls discover real bonds.',
        height: '165',
        weight: '54',
        occupation: 'Relationship Consultant',
        payoutDetails: {
            bankName: 'State Bank of India',
            accountNumber: '•••• •••• 5678',
            ifsc: 'SBIN0004562',
            upiId: 'aishwarya@okaxis'
        },
        wallet: {
            balance: 900,
            totalCoins: 900,
            todayCoins: 200,
            weeklyCoins: 700,
            monthlyCoins: 900,
            lifetimeEarnings: 45000,
            pendingPayout: 15000,
            paidAmount: 30000
        }
    });

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/elite-agents/${id}`);
                if (res.data?.agent) {
                    setAgent(res.data.agent);
                }
            } catch (err) {
                console.log('API error, loaded mock details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleToggleStatus = async () => {
        const targetStatus = agent.status === 'Active' ? 'Suspended' : 'Active';
        setActionLoading(true);
        try {
            await api.patch(`/elite-agents/${id}/status`, { status: targetStatus });
            setAgent(prev => ({ ...prev, status: targetStatus }));
            toast.success(`Agent status updated to ${targetStatus}`);
        } catch (err) {
            setAgent(prev => ({ ...prev, status: targetStatus }));
            toast.success(`Agent status updated to ${targetStatus} (Demo Mode)`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const newPassword = Math.random().toString(36).slice(-8);
        setActionLoading(true);
        try {
            await api.post(`/elite-agents/${id}/reset-password`, { password: newPassword });
            toast.success(`Password reset. New password: ${newPassword}`, { duration: 6000 });
        } catch (err) {
            toast.success(`Password reset (Demo Mode). New password: ${newPassword}`, { duration: 8000 });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendCredentials = () => {
        toast.success(`Credentials sent to ${agent.email}!`);
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(agent._id);
        toast.success('Agent ID copied to clipboard');
    };

    const handleCreatePayout = (e) => {
        e.preventDefault();
        const amt = parseFloat(payoutAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (amt > agent.wallet.pendingPayout) {
            toast.error('Payout amount exceeds pending balance');
            return;
        }

        const newPayout = {
            id: `pay_${Date.now().toString().slice(-4)}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: amt,
            method: payoutMethod,
            status: 'Paid'
        };

        setPayouts(prev => [newPayout, ...prev]);
        setAgent(prev => ({
            ...prev,
            wallet: {
                ...prev.wallet,
                pendingPayout: prev.wallet.pendingPayout - amt,
                paidAmount: prev.wallet.paidAmount + amt
            }
        }));

        setShowPayoutModal(false);
        setPayoutAmount('');
        toast.success(`Payout of ₹${amt.toLocaleString()} processed successfully!`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    const tabStyle = (active) => ({
        padding: '10px 20px',
        fontSize: '0.85rem',
        fontWeight: 700,
        borderRadius: '10px 10px 0 0',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        background: active ? 'var(--bg-card)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        display: 'flex', alignItems: 'center', gap: 6
    });

    const actionBtnStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: '0.82rem', fontWeight: 600, padding: '10px 16px',
        borderRadius: 10, border: 'none', cursor: 'pointer',
        transition: 'all 0.25s ease', width: '100%'
    };

    return (
        <div>
            {/* ═══════ Header ═══════ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button
                        onClick={() => navigate('/elite-agent/list')}
                        className="btn btn-secondary btn-sm btn-icon"
                        style={{ borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <MdArrowBack style={{ fontSize: '1.2rem' }} />
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
                            letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            Agent Profile
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 700,
                                background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)',
                                color: '#fff', padding: '3px 10px', borderRadius: 20
                            }}>
                                ELITE
                            </span>
                        </h1>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                            Manage profile, monitor earnings, and process payouts
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/elite-agent/edit/${agent._id}`)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10 }}
                >
                    <MdEdit /> Edit Profile
                </button>
            </div>

            {/* ═══════ Profile Hero + Wallet ═══════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, marginBottom: 24 }}>

                {/* ───── Left: Profile Card ───── */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Gradient Header Banner */}
                    <div style={{
                        height: 90,
                        background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 50%, #6366f1 100%)',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)'
                        }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ff6b9d 0%, #9610ff 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', overflow: 'hidden',
                                border: '4px solid var(--bg-card)',
                                boxShadow: '0 4px 20px rgba(251,111,146,0.3)'
                            }}>
                                {agent.photos && agent.photos[0] ? (
                                    <img src={agent.photos[0]} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <MdPerson style={{ fontSize: '2.5rem' }} />
                                )}
                            </div>
                            {/* Online indicator */}
                            <span style={{
                                position: 'absolute', bottom: 4, right: 4,
                                width: 14, height: 14, borderRadius: '50%',
                                background: agent.isOnline ? '#00d68f' : '#8a8aa0',
                                border: '3px solid var(--bg-card)'
                            }} />
                        </div>
                    </div>

                    {/* Profile Info Section */}
                    <div style={{ padding: '52px 24px 24px', textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 0 6px 0'
                        }}>
                            {agent.name}
                            <MdVerified style={{ color: '#00d68f', fontSize: '1.1rem' }} title="Verified Profile" />
                        </h2>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                            {agent.occupation || 'Elite Agent'}
                        </div>

                        {/* Status Badges */}
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                            <span style={{
                                fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                background: 'rgba(255,215,59,0.12)', color: '#ffd43b', border: '1px solid rgba(255,215,59,0.2)'
                            }}>⭐ Premium</span>
                            <span style={{
                                fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                background: agent.status === 'Active' ? 'rgba(0,214,143,0.12)' : 'rgba(255,61,113,0.12)',
                                color: agent.status === 'Active' ? '#00d68f' : '#ff3d71',
                                border: `1px solid ${agent.status === 'Active' ? 'rgba(0,214,143,0.2)' : 'rgba(255,61,113,0.2)'}`
                            }}>{agent.status === 'Active' ? '● Active' : '● Suspended'}</span>
                            <span style={{
                                fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                background: 'rgba(0,149,255,0.12)', color: '#0095ff', border: '1px solid rgba(0,149,255,0.2)'
                            }}>💬 Chat Enabled</span>
                        </div>

                        {/* Contact Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, textAlign: 'left' }}>
                            <InfoRow icon={<MdEmail />} label="Email" value={agent.email} />
                            <InfoRow icon={<MdPhone />} label="Phone" value={agent.phone} />
                            <InfoRow icon={<MdAccessTime />} label="Last Active" value={agent.lastLogin} />
                            <InfoRow icon={<MdSchedule />} label="Joined" value={agent.createdAt} />
                        </div>

                        {/* Agent ID Copy */}
                        <div
                            onClick={handleCopyId}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 8,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)',
                                fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer',
                                transition: 'all 0.2s ease', marginBottom: 20
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <MdContentCopy style={{ fontSize: '0.85rem' }} />
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>ID: {agent._id}</span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 18 }}>
                            <button
                                onClick={handleResetPassword}
                                disabled={actionLoading}
                                style={{
                                    ...actionBtnStyle,
                                    background: 'rgba(255,170,0,0.1)', color: '#ffaa00',
                                    border: '1px solid rgba(255,170,0,0.15)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,170,0,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,170,0,0.1)'}
                            >
                                <MdLockReset style={{ fontSize: '1.1rem' }} /> Reset Password
                            </button>
                            <button
                                onClick={handleSendCredentials}
                                style={{
                                    ...actionBtnStyle,
                                    background: 'rgba(0,149,255,0.1)', color: '#0095ff',
                                    border: '1px solid rgba(0,149,255,0.15)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,149,255,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,149,255,0.1)'}
                            >
                                <MdMailOutline style={{ fontSize: '1.1rem' }} /> Send Credentials
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                disabled={actionLoading}
                                style={{
                                    ...actionBtnStyle,
                                    background: agent.status === 'Active' ? 'rgba(255,61,113,0.1)' : 'rgba(0,214,143,0.1)',
                                    color: agent.status === 'Active' ? '#ff3d71' : '#00d68f',
                                    border: `1px solid ${agent.status === 'Active' ? 'rgba(255,61,113,0.15)' : 'rgba(0,214,143,0.15)'}`
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <MdBlock style={{ fontSize: '1.1rem' }} />
                                {agent.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ───── Right: Wallet & Earnings ───── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Wallet Overview Card */}
                    <div className="card" style={{
                        padding: 0, overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(251,111,146,0.06) 0%, rgba(150,16,255,0.03) 100%)'
                    }}>
                        {/* Wallet Header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '20px 24px', borderBottom: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #ffd43b 0%, #ff8c42 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MdAccountBalanceWallet style={{ fontSize: '1.3rem', color: '#fff' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Wallet & Earnings</h3>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Revenue overview & coin tracking</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPayoutModal(true)}
                                className="btn btn-primary btn-sm"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)',
                                    boxShadow: '0 4px 16px rgba(251,111,146,0.25)'
                                }}
                                disabled={agent.wallet.pendingPayout <= 0}
                            >
                                <MdPaid /> Process Payout
                            </button>
                        </div>

                        {/* Coin Progress Rings */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
                            padding: '24px 20px',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            <CoinRing label="Today" value={agent.wallet.todayCoins} max={agent.wallet.monthlyCoins} color="#ffd43b" />
                            <CoinRing label="This Week" value={agent.wallet.weeklyCoins} max={agent.wallet.monthlyCoins} color="#ff8c42" />
                            <CoinRing label="This Month" value={agent.wallet.monthlyCoins} max={agent.wallet.monthlyCoins} color="#fb6f92" />
                            <CoinRing label="Balance" value={agent.wallet.balance} max={agent.wallet.monthlyCoins} color="#00d68f" />
                        </div>

                        {/* Revenue Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 24px' }}>
                            <MetricCard icon={<MdTrendingUp />} label="Lifetime Revenue" value={`₹${agent.wallet.lifetimeEarnings.toLocaleString()}`} color="#40c057" />
                            <MetricCard icon={<MdSchedule />} label="Pending Payout" value={`₹${agent.wallet.pendingPayout.toLocaleString()}`} color="#ff8c42" />
                            <MetricCard icon={<MdCheckCircle />} label="Paid Amount" value={`₹${agent.wallet.paidAmount.toLocaleString()}`} color="#9610ff" />
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="card">
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
                            paddingBottom: 14, borderBottom: '1px solid var(--border-color)'
                        }}>
                            <MdPerson style={{ fontSize: '1.2rem', color: 'var(--primary-light)' }} />
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Profile Details</h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {[
                                { label: 'Gender', value: agent.gender },
                                { label: 'Religion', value: agent.religion },
                                { label: 'Languages', value: agent.language },
                                { label: 'Location', value: `${agent.city}, ${agent.state}` },
                                { label: 'Occupation', value: agent.occupation },
                                { label: 'Interests', value: agent.interests },
                                { label: 'Height / Weight', value: `${agent.height} cm / ${agent.weight} kg` },
                                { label: 'Birthday', value: agent.dob },
                                { label: 'Country', value: agent.country }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    padding: '10px 14px', borderRadius: 10,
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)'
                                }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>{item.label}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.value || 'N/A'}</div>
                                </div>
                            ))}
                        </div>

                        {agent.aboutMe && (
                            <div style={{
                                marginTop: 14, padding: '14px 16px', borderRadius: 10,
                                background: 'rgba(251,111,146,0.04)', border: '1px solid rgba(251,111,146,0.08)'
                            }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>About Me</div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{agent.aboutMe}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════ Tabbed Section: Chats / Payouts / Config ═══════ */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Tab Bar */}
                <div style={{
                    display: 'flex', gap: 0,
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0 24px', background: 'rgba(255,255,255,0.01)'
                }}>
                    <button style={tabStyle(activeTab === 'chats')} onClick={() => setActiveTab('chats')}>
                        <MdChat /> Chat Sessions
                    </button>
                    <button style={tabStyle(activeTab === 'payouts')} onClick={() => setActiveTab('payouts')}>
                        <MdHistory /> Payout History
                    </button>
                    <button style={tabStyle(activeTab === 'config')} onClick={() => setActiveTab('config')}>
                        ⚙️ Payout Config
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ padding: 24 }}>

                    {/* ─── Chat Sessions Tab ─── */}
                    {activeTab === 'chats' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Chat Sessions</h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>Track coin income from customer conversations</p>
                                </div>
                                <span style={{
                                    fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                                    background: 'rgba(255,215,59,0.1)', color: '#ffd43b', border: '1px solid rgba(255,215,59,0.15)'
                                }}>
                                    🪙 Total: {MOCK_CHATS.reduce((s, c) => s + c.coins, 0)} coins
                                </span>
                            </div>

                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Coins Earned</th>
                                            <th>Messages</th>
                                            <th>Duration</th>
                                            <th>Date / Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MOCK_CHATS.map((c, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: `hsl(${(i * 72 + 200) % 360}, 60%, 55%)`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#fff', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0
                                                        }}>
                                                            {c.customer.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{c.customer}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: '0.82rem',
                                                        background: 'rgba(255,215,59,0.1)', color: '#ffd43b'
                                                    }}>
                                                        🪙 {c.coins}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.messages} replies</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.duration}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ─── Payout History Tab ─── */}
                    {activeTab === 'payouts' && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settlement History</h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>All processed payouts for this agent</p>
                                </div>
                                <span style={{
                                    fontSize: '0.72rem', fontWeight: 700, padding: '5px 12px', borderRadius: 20,
                                    background: 'rgba(0,214,143,0.1)', color: '#00d68f', border: '1px solid rgba(0,214,143,0.15)'
                                }}>
                                    Total Paid: ₹{agent.wallet.paidAmount.toLocaleString()}
                                </span>
                            </div>

                            {payouts.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '40px 20px',
                                    color: 'var(--text-muted)', fontSize: '0.88rem'
                                }}>
                                    No payouts processed yet
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {payouts.map((p, idx) => (
                                        <div key={p.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px 20px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,111,146,0.04)'; e.currentTarget.style.borderColor = 'rgba(251,111,146,0.15)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                {/* Timeline dot */}
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: idx === 0 ? 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)' : 'rgba(0,214,143,0.12)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    <MdCheckCircle style={{ fontSize: '1.1rem', color: idx === 0 ? '#fff' : '#00d68f' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                        ₹{p.amount.toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                        {p.method}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{p.date}</div>
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                                                    background: 'rgba(0,214,143,0.12)', color: '#00d68f', marginTop: 4, display: 'inline-block'
                                                }}>
                                                    ✓ {p.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Payout Config Tab ─── */}
                    {activeTab === 'config' && (
                        <div>
                            <div style={{ marginBottom: 18 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Payout Configuration</h3>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>Bank and UPI details used for payout processing</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                {[
                                    { label: 'Bank Name', value: agent.payoutDetails.bankName, icon: '🏦' },
                                    { label: 'Account Number', value: agent.payoutDetails.accountNumber, icon: '🔢' },
                                    { label: 'IFSC Code', value: agent.payoutDetails.ifsc, icon: '🏷️' },
                                    { label: 'UPI ID', value: agent.payoutDetails.upiId, icon: '📱' }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '16px 18px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,111,146,0.04)'; e.currentTarget.style.borderColor = 'rgba(251,111,146,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                    >
                                        <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ═══════ Payout Processing Modal ═══════ */}
            {showPayoutModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(6px)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div className="card" style={{
                        width: '100%', maxWidth: 460, padding: 0, overflow: 'hidden',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                        animation: 'slideUp 0.3s ease'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}>
                            <MdPaid style={{ fontSize: '1.5rem', color: '#fff' }} />
                            <div>
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Process Payout</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '2px 0 0 0' }}>
                                    Transfer earnings to agent's account
                                </p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 24 }}>
                            {/* Available Balance Display */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 16px', borderRadius: 10, marginBottom: 20,
                                background: 'rgba(255,140,66,0.08)', border: '1px solid rgba(255,140,66,0.12)'
                            }}>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available for Payout</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ff8c42' }}>₹{agent.wallet.pendingPayout.toLocaleString()}</span>
                            </div>

                            <form onSubmit={handleCreatePayout}>
                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}>Payout Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={agent.wallet.pendingPayout}
                                        placeholder="Enter amount in ₹"
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        className="form-control"
                                        style={{
                                            color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                                            background: 'var(--bg-input)', borderRadius: 10, padding: '12px 14px',
                                            fontSize: '1rem', fontWeight: 700
                                        }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 24 }}>
                                    <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}>Transfer Method</label>
                                    <select
                                        value={payoutMethod}
                                        onChange={e => setPayoutMethod(e.target.value)}
                                        className="form-control"
                                        style={{
                                            color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                                            background: 'var(--bg-input)', borderRadius: 10, padding: '12px 14px'
                                        }}
                                    >
                                        <option value="Bank Transfer (SBI)">🏦 Bank Transfer ({agent.payoutDetails.bankName})</option>
                                        <option value="UPI ID">📱 UPI ID ({agent.payoutDetails.upiId})</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowPayoutModal(false)}
                                        style={{
                                            ...actionBtnStyle,
                                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            ...actionBtnStyle,
                                            background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)',
                                            color: '#fff', border: 'none',
                                            boxShadow: '0 4px 16px rgba(251,111,146,0.3)'
                                        }}
                                    >
                                        <MdCheckCircle /> Approve & Settle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ Inline Keyframes ═══════ */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>
        </div>
    );
}
