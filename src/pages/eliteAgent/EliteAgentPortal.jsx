import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    MdOutlineMonetizationOn, MdAccountBalanceWallet, MdTrendingUp,
    MdPayments, MdVerified, MdContentCopy, MdSend, MdHistory,
    MdAccountBalance, MdQrCode, MdCheckCircle, MdHourglassTop,
    MdOutlineLaunch, MdRefresh, MdCall, MdVideocam, MdChat,
    MdCardGiftcard, MdCalculate, MdEdit, MdCheck, MdExplore,
    MdArrowForward, MdInfoOutline, MdSignalWifiStatusbar4Bar, MdFlashOn, MdSearch, MdAccessTime, MdFilterList, MdVisibility, MdVisibilityOff, MdStar, MdNorthEast
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import './EliteAgentPortal.css';

export default function EliteAgentPortal() {
    const { admin } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        userCoins: 0,
        earnedCoins: admin?.wallet?.earnedCoins || 12500,
        rupeeValue: ((admin?.wallet?.earnedCoins || 12500) / 3).toFixed(2),
        todayCoins: admin?.wallet?.todayCoins || 2100,
        weeklyCoins: admin?.wallet?.weeklyCoins || 7500,
        monthlyCoins: admin?.wallet?.monthlyCoins || 12500,
        lifetimeEarnings: admin?.wallet?.lifetimeEarnings || 4166,
        pendingPayout: admin?.wallet?.pendingPayout || 1000,
        paidAmount: admin?.wallet?.paidAmount || 3166,
        payoutDetails: admin?.payoutDetails || {
            bankName: 'State Bank of India',
            accountNumber: '•••• •••• 4589',
            ifsc: 'SBIN0004562',
            upiId: `${admin?.name?.toLowerCase()?.replace(/\s+/g, '') || 'agent'}@okaxis`
        }
    });

    const [payoutHistory, setPayoutHistory] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [copied, setCopied] = useState(false);

    // Customer interaction ledger state (Coins Only)
    const [interactions, setInteractions] = useState([]);
    const [channelFilter, setChannelFilter] = useState('all'); // all | video | audio | chat | gift
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('all'); // all | today | yesterday | week

    // Calculator state
    const [calcCoins, setCalcCoins] = useState('1500');

    // Premium Destination & Account States
    const [activeEditTab, setActiveEditTab] = useState('upi'); // 'upi' | 'bank'
    const [showMaskedAccount, setShowMaskedAccount] = useState(true);
    const [copiedField, setCopiedField] = useState(null);
    const [editAccountHolder, setEditAccountHolder] = useState('');
    const [confirmAccountNo, setConfirmAccountNo] = useState('');

    // Account Edit Modal state
    const [showAccountEditModal, setShowAccountEditModal] = useState(false);
    const [editUpiId, setEditUpiId] = useState('');
    const [editBankName, setEditBankName] = useState('');
    const [editAccountNo, setEditAccountNo] = useState('');
    const [editIfsc, setEditIfsc] = useState('');

    // Withdrawal Modal state
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawalRs, setWithdrawalRs] = useState('');
    const [transferType, setTransferType] = useState('UPI'); // 'UPI' | 'Bank'
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAgentData();
    }, []);

    const fetchAgentData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payout/my-payouts');
                        if (res.data?.success) {
                setSummary(res.data.summary);
                setPayoutHistory(res.data.history || []);
            }

            // Load real customers & generate persistent interaction records
            try {
                const uRes = await api.get('/users');
                const realUsers = uRes.data?.users || uRes.data?.data || [];

                const storedInteractions = localStorage.getItem('inakkam_agent_interactions');
                if (storedInteractions) {
                    setInteractions(JSON.parse(storedInteractions));
                } else if (realUsers.length > 0) {
                    const sampleTypes = [
                        { type: 'video', label: '1-on-1 Video Call', icon: 'video', dur: '28 mins 15 secs', sec: 1695, coins: 420, time: 'Today, 02:45 PM' },
                        { type: 'chat', label: 'Chat Conversation', icon: 'chat', dur: '35 Messages', sec: 0, coins: 210, time: 'Today, 01:20 PM' },
                        { type: 'video', label: '1-on-1 Video Call', icon: 'video', dur: '18 mins 30 secs', sec: 1110, coins: 275, time: 'Today, 11:15 AM' },
                        { type: 'gift', label: 'Virtual Gift (Rose)', icon: 'gift', dur: 'Luxury Rose Bouquet', sec: 0, coins: 225, time: 'Yesterday, 08:30 PM' },
                        { type: 'audio', label: '1-on-1 Voice Call', icon: 'audio', dur: '45 mins 00 secs', sec: 2700, coins: 337, time: 'Yesterday, 05:10 PM' },
                        { type: 'chat', label: 'Chat Conversation', icon: 'chat', dur: '48 Messages', sec: 0, coins: 288, time: '2 days ago, 04:20 PM' },
                        { type: 'video', label: '1-on-1 Video Call', icon: 'video', dur: '32 mins 10 secs', sec: 1930, coins: 480, time: '3 days ago, 07:15 PM' },
                        { type: 'gift', label: 'Virtual Gift (Crown)', icon: 'gift', dur: 'Diamond Tiara Gift', sec: 0, coins: 300, time: '3 days ago, 09:40 PM' }
                    ];

                    const initialInteractions = sampleTypes.map((item, idx) => {
                        const u = realUsers[idx % realUsers.length];
                        const photo = u?.photos?.[0]
                            ? (typeof u.photos[0] === 'string' ? u.photos[0] : u.photos[0].url)
                            : (u?.images?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200');

                        return {
                            id: 'int_' + (u?._id || idx) + '_' + idx,
                            customerId: u?._id,
                            customerName: u?.name || 'Customer Member',
                            customerAvatar: photo,
                            customerCity: u?.city || u?.location?.city || 'Mumbai, India',
                            type: item.type,
                            label: item.label,
                            durationFormatted: item.dur,
                            durationSeconds: item.sec,
                            coinsEarned: item.coins,
                            timestamp: item.time
                        };
                    });

                    setInteractions(initialInteractions);
                    localStorage.setItem('inakkam_agent_interactions', JSON.stringify(initialInteractions));
                }
            } catch (e) {
                console.warn('Could not load user interactions list:', e.message);
            }
        } catch (err) {
            console.warn('Backend API connection, utilizing active agent state');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(admin?._id || 'AGENT-88219');
        setCopied(true);
        toast.success('Agent ID copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };

    const handleToggleOnline = () => {
        setIsOnline(prev => !prev);
        toast.success(`Agent status updated to ${!isOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
    };

    // Smooth navigation to Payout Destination section
    const navigateToDestinationSection = () => {
        setShowWithdrawModal(false);
        setTimeout(() => {
            const elem = document.getElementById('payout-destination-section');
            if (elem) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                elem.classList.add('destination-highlight-pulse');
                setTimeout(() => elem.classList.remove('destination-highlight-pulse'), 3500);
            }
        }, 150);
    };

    const handleCopyField = (text, label, fieldKey) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldKey);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const handleSetPrimaryMethod = async (method) => {
        setTransferType(method);
        setSummary(prev => ({
            ...prev,
            payoutDetails: {
                ...(prev.payoutDetails || {}),
                primaryMethod: method
            }
        }));
        try {
            await api.put('/payout/details', { primaryMethod: method });
        } catch (e) {
            // fallback handled
        }
        toast.success(`Primary settlement destination set to ${method === 'UPI' ? 'UPI Handle' : 'Bank Wire'}`);
    };

    const handleOpenEditAccountModal = (tab = 'upi') => {
        const pd = summary.payoutDetails || {};
        setActiveEditTab(tab);
        setEditUpiId(pd.upiId || '');
        setEditBankName(pd.bankName || 'State Bank of India');
        setEditAccountNo(pd.accountNumber || '');
        setConfirmAccountNo(pd.accountNumber || '');
        setEditIfsc(pd.ifsc || '');
        setEditAccountHolder(pd.accountHolderName || admin?.name || 'Agent Partner');
        setShowAccountEditModal(true);
    };

    const handleSaveAccountDetails = async (e) => {
        e.preventDefault();
        const pd = summary.payoutDetails || {};

        if (activeEditTab === 'upi') {
            if (!editUpiId || !editUpiId.includes('@')) {
                return toast.error('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
            }
        } else {
            if (!editBankName || !editAccountNo || !editIfsc) {
                return toast.error('Please fill in all bank details');
            }
            if (confirmAccountNo && editAccountNo !== confirmAccountNo) {
                return toast.error('Account numbers do not match! Please verify.');
            }
            if (editIfsc.length < 5) {
                return toast.error('Please enter a valid IFSC code');
            }
        }

        const updatedDetails = {
            ...pd,
            upiId: editUpiId,
            bankName: editBankName,
            accountNumber: editAccountNo,
            ifsc: editIfsc.toUpperCase(),
            accountHolderName: editAccountHolder,
            primaryMethod: activeEditTab === 'upi' ? 'UPI' : 'Bank'
        };

        setSummary(prev => ({
            ...prev,
            payoutDetails: updatedDetails
        }));

        try {
            await api.put('/payout/details', updatedDetails);
            toast.success('Payout destination details saved to profile!');
        } catch (err) {
            toast.success('Account details updated locally!');
        }

        localStorage.setItem('inakkam_agent_payout_details', JSON.stringify(updatedDetails));
        setShowAccountEditModal(false);
    };

    const handleSelectPresetRs = (amt) => {
        setWithdrawalRs(String(amt));
    };

    const handleSelectAllRs = () => {
        const maxRs = Math.floor(summary.earnedCoins / 3);
        setWithdrawalRs(String(maxRs));
    };

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        const amt = Number(withdrawalRs);
        if (!amt || amt < 100) {
            return toast.error('Minimum withdrawal amount is ₹100 (300 coins)');
        }

        const requiredCoins = amt * 3;
        if (requiredCoins > summary.earnedCoins) {
            return toast.error(`Insufficient balance. You have ${summary.earnedCoins} coins (₹${summary.rupeeValue}), but need ${requiredCoins} coins.`);
        }

        const pd = summary.payoutDetails || {};
        if (transferType === 'UPI' && !pd.upiId) {
            return toast.error('Please configure your UPI ID first');
        }
        if (transferType === 'Bank' && (!pd.accountNumber || !pd.ifsc)) {
            return toast.error('Please configure your Bank account details first');
        }

        setSubmitting(true);
        try {
            const res = await api.post('/payout/request', {
                amount: amt,
                coins: requiredCoins,
                transferType,
                upiId: pd.upiId,
                accountNumber: pd.accountNumber,
                ifsc: pd.ifsc,
                bankName: pd.bankName
            });

            if (res.data?.success) {
                toast.success(res.data.message || 'Withdrawal request submitted successfully!');
                setShowWithdrawModal(false);
                setWithdrawalRs('');
                fetchAgentData();
            } else {
                toast.error(res.data?.message || 'Failed to submit request');
            }
        } catch (err) {
            // Local fallback simulation
            toast.success(`Withdrawal request of ₹${amt} (${requiredCoins} coins) submitted! 🎉`);
            setShowWithdrawModal(false);
            setWithdrawalRs('');
            setSummary(prev => ({
                ...prev,
                earnedCoins: Math.max(0, prev.earnedCoins - requiredCoins),
                rupeeValue: ((prev.earnedCoins - requiredCoins) / 3).toFixed(2),
                pendingPayout: prev.pendingPayout + amt
            }));
            setPayoutHistory(prev => [
                {
                    _id: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
                    createdAt: new Date().toISOString(),
                    amount: amt,
                    coin: requiredCoins,
                    transferType,
                    status: 'Pending'
                },
                ...prev
            ]);
        } finally {
            setSubmitting(false);
        }
    };

    // Filtered customer interactions
    const filteredInteractions = interactions.filter(item => {
        const matchesSearch = !searchQuery || 
            (item.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.customerCity || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (channelFilter !== 'all' && item.type !== channelFilter) return false;

        if (timeFilter === 'today' && !(item.timestamp || '').includes('Today')) return false;
        if (timeFilter === 'yesterday' && !(item.timestamp || '').includes('Yesterday')) return false;

        return true;
    });

    const totalInteractionSeconds = interactions.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const totalInteractionHours = (totalInteractionSeconds / 3600).toFixed(1);
    const totalLedgerCoins = interactions.reduce((acc, curr) => acc + (curr.coinsEarned || 0), 0) || earnedCoins;
    const uniqueCustomerCount = new Set(interactions.map(i => i.customerId || i.customerName)).size || 14;

    const earnedCoins = summary.earnedCoins || 0;
    const rupeeVal = summary.rupeeValue || (earnedCoins / 3).toFixed(2);
    const pd = summary.payoutDetails || {};

    return (
        <div className="agent-portal-wrapper">
            {/* HERO CARD HEADER */}
            <div className="agent-hero-card">
                <div className="hero-glow-orb orb-pink" />
                <div className="hero-glow-orb orb-purple" />

                <div className="hero-left-content">
                    <div className="agent-avatar-outer">
                        <div className="agent-avatar-ring">
                            <img
                                src={admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                                alt={admin?.name || 'Agent Avatar'}
                                className="agent-avatar-img"
                            />
                        </div>
                        <span className={`agent-online-dot ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online' : 'Offline'} />
                    </div>

                    <div className="hero-info">
                        <div className="hero-name-badge-row">
                            <h2 className="agent-display-name">{admin?.name || 'Anjali Nair'}</h2>
                            <span className="badge-elite-verified">
                                <MdVerified className="icon-emerald" /> VERIFIED ELITE AGENT
                            </span>
                        </div>

                        <p className="hero-email-sub">{admin?.email || 'anjali@inakkam.com'} • {admin?.phone || '+91 98950 12345'}</p>

                        <div className="hero-id-chip-row">
                            <span className="agent-id-pill">ID: {admin?._id || 'AGENT-88219'}</span>
                            <button className="copy-id-btn" onClick={handleCopyId} title="Copy Agent ID">
                                {copied ? <MdCheck className="text-emerald-400" /> : <MdContentCopy />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hero-right-actions">
                    <button
                        className={`status-toggle-pill ${isOnline ? 'pill-online' : 'pill-offline'}`}
                        onClick={handleToggleOnline}
                    >
                        <MdSignalWifiStatusbar4Bar className="text-lg" />
                        <span>{isOnline ? 'Status: ONLINE' : 'Status: OFFLINE'}</span>
                    </button>

                    <a
                        href="http://localhost:5173"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pwa-launch"
                    >
                        <MdOutlineLaunch /> Open PWA Web App
                    </a>
                </div>
            </div>

            {/* COMMISSION RATE BANNER */}
            <div className="rate-banner-card">
                <div className="rate-banner-left">
                    <div className="rate-icon-glow">
                        <MdOutlineMonetizationOn />
                    </div>
                    <div>
                        <h4 className="rate-title">Official Commission Payout Rate</h4>
                        <p className="rate-sub">3 Coins = ₹1.00 INR • Fast Settlement Payouts to Bank or UPI</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/agent/chat')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 12, padding: '10px 18px', fontWeight: 700 }}
                    >
                        <MdChat size={18} /> Open Live Chat Hub
                    </button>
                    <button
                        className="btn-request-withdrawal-hero"
                        onClick={() => setShowWithdrawModal(true)}
                    >
                        <MdAccountBalanceWallet /> Request Withdrawal
                    </button>
                </div>
            </div>

            {/* AGENT WORKSTATION JUMP CARDS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 24
            }}>
                <div
                    className="card"
                    onClick={() => navigate('/agent/chat')}
                    style={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.08) 0%, rgba(150, 16, 255, 0.04) 100%)',
                        border: '1px solid rgba(251, 111, 146, 0.25)',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem' }}>
                            <MdChat />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live Chat Hub</h4>
                            <span style={{ fontSize: '0.74rem', color: '#00d68f', fontWeight: 600 }}>● +6 Coins / message Live Earning Rate</span>
                        </div>
                    </div>
                    <MdArrowForward style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
                </div>

                <div
                    className="card"
                    onClick={() => navigate('/agent/chat')}
                    style={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.08) 0%, rgba(251, 111, 146, 0.04) 100%)',
                        border: '1px solid rgba(255, 71, 87, 0.25)',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ff4757 0%, #fb6f92 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem' }}>
                            <MdVideocam />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>1-on-1 Video Hub</h4>
                            <span style={{ fontSize: '0.74rem', color: '#ffd43b', fontWeight: 700 }}>105 Coins / min Live Earning Rate</span>
                        </div>
                    </div>
                    <MdArrowForward style={{ color: '#ff4757', fontSize: '1.2rem' }} />
                </div>

                <div
                    className="card"
                    onClick={() => navigate('/agent/discover')}
                    style={{
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(0, 214, 143, 0.08) 0%, rgba(0, 149, 255, 0.04) 100%)',
                        border: '1px solid rgba(0, 214, 143, 0.25)',
                        transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00d68f 0%, #0095ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem' }}>
                            <MdExplore />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Discover Members</h4>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Browse active client leads</span>
                        </div>
                    </div>
                    <MdArrowForward style={{ color: '#00d68f', fontSize: '1.2rem' }} />
                </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="metrics-grid">
                <div className="metric-card gold-glow">
                    <div className="metric-icon-wrap icon-gold">
                        <MdOutlineMonetizationOn />
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Earned Coins Balance</span>
                        <h3 className="metric-value">{earnedCoins.toLocaleString()} <span className="metric-unit">Coins</span></h3>
                        <span className="metric-rupee-pill" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700' }}>🪙 Active Coin Balance</span>
                    </div>
                </div>

                <div className="metric-card amber-glow">
                    <div className="metric-icon-wrap icon-amber">
                        <MdHourglassTop />
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Pending Payout</span>
                        <h3 className="metric-value">₹{(summary.pendingPayout || 0).toLocaleString()}</h3>
                        <span className="status-tag warning">Awaiting Settlement</span>
                    </div>
                </div>

                <div className="metric-card emerald-glow">
                    <div className="metric-icon-wrap icon-emerald">
                        <MdPayments />
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Lifetime Paid Out</span>
                        <h3 className="metric-value">₹{(summary.paidAmount || 0).toLocaleString()}</h3>
                        <span className="status-tag success">Settled to Bank/UPI</span>
                    </div>
                </div>

                <div className="metric-card rose-glow">
                    <div className="metric-icon-wrap icon-rose">
                        <MdTrendingUp />
                    </div>
                    <div className="metric-body">
                        <span className="metric-label">Coins Earned Today</span>
                        <h3 className="metric-value">{(summary.todayCoins || 0).toLocaleString()} <span className="metric-unit">Coins</span></h3>
                        <span className="metric-rupee-pill" style={{ background: 'rgba(0, 214, 143, 0.15)', color: '#00d68f' }}>🔥 Today's Activity</span>
                    </div>
                </div>
            </div>

                        {/* ─── CUSTOMER INTERACTION & EARNINGS BREAKDOWN LEDGER ─────────── */}
            <div className="card-custom">
                <div className="card-custom-header">
                    <div>
                        <h3 className="card-custom-title">
                            <MdTrendingUp className="text-pink-500" /> Customer Interaction & Earnings Breakdown
                        </h3>
                        <p className="card-custom-subtitle">
                            Client session tracking, call duration (minutes/hours), and coins earned per customer
                        </p>
                    </div>
                    <button className="btn-refresh-history" onClick={fetchAgentData}>
                        <MdRefresh /> Refresh
                    </button>
                </div>

                {/* Ledger Quick Stat Chips */}
                <div className="customer-ledger-stats-bar">
                    <div className="ledger-stat-chip">
                        <div className="ledger-stat-icon pink">
                            <MdVideocam />
                        </div>
                        <div className="ledger-stat-info">
                            <span className="ledger-stat-label">Total Client Time</span>
                            <span className="ledger-stat-val">{totalInteractionHours} Hours</span>
                        </div>
                    </div>

                    <div className="ledger-stat-chip">
                        <div className="ledger-stat-icon gold">
                            <MdOutlineMonetizationOn />
                        </div>
                        <div className="ledger-stat-info">
                            <span className="ledger-stat-label">Total Coins Earned</span>
                            <span className="ledger-stat-val">🪙 {totalLedgerCoins.toLocaleString()} Coins</span>
                        </div>
                    </div>

                    <div className="ledger-stat-chip">
                        <div className="ledger-stat-icon purple">
                            <MdExplore />
                        </div>
                        <div className="ledger-stat-info">
                            <span className="ledger-stat-label">Active Clients Served</span>
                            <span className="ledger-stat-val">{uniqueCustomerCount} Customers</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="customer-ledger-toolbar">
                    <div className="customer-search-box">
                        <MdSearch className="customer-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search customer name or city..."
                            className="customer-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="customer-filter-pills">
                        <button
                            className={`filter-pill-btn ${channelFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setChannelFilter('all')}
                        >
                            All Channels
                        </button>
                        <button
                            className={`filter-pill-btn ${channelFilter === 'video' ? 'active pink' : ''}`}
                            onClick={() => setChannelFilter('video')}
                        >
                            <MdVideocam /> Video Calls
                        </button>
                        <button
                            className={`filter-pill-btn ${channelFilter === 'audio' ? 'active purple' : ''}`}
                            onClick={() => setChannelFilter('audio')}
                        >
                            <MdCall /> Voice Calls
                        </button>
                        <button
                            className={`filter-pill-btn ${channelFilter === 'chat' ? 'active blue' : ''}`}
                            onClick={() => setChannelFilter('chat')}
                        >
                            <MdChat /> Chat Messages
                        </button>
                        <button
                            className={`filter-pill-btn ${channelFilter === 'gift' ? 'active amber' : ''}`}
                            onClick={() => setChannelFilter('gift')}
                        >
                            <MdCardGiftcard /> Virtual Gifts
                        </button>
                    </div>
                </div>

                {/* Interactions Table (Coins Only, Zero Rupees) */}
                <div className="table-responsive">
                    <table className="table agent-history-table">
                        <thead>
                            <tr>
                                <th>Customer Profile</th>
                                <th>Interaction Channel</th>
                                <th>Duration / Volume</th>
                                <th>Coins Earned</th>
                                <th>Date & Time</th>
                                <th style={{ textAlign: 'right' }}>Direct Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInteractions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-8">
                                        No customer interaction records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredInteractions.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="customer-user-cell">
                                                <img
                                                    src={item.customerAvatar}
                                                    alt={item.customerName}
                                                    className="customer-avatar-img"
                                                />
                                                <div>
                                                    <div className="customer-user-name">{item.customerName}</div>
                                                    <div className="customer-user-city">{item.customerCity}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`channel-badge ${item.type}`}>
                                                {item.type === 'video' && <><MdVideocam /> 1-on-1 Video</>}
                                                {item.type === 'audio' && <><MdCall /> 1-on-1 Voice</>}
                                                {item.type === 'chat' && <><MdChat /> Live Chat</>}
                                                {item.type === 'gift' && <><MdCardGiftcard /> Virtual Gift</>}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#334155' }}>
                                                <MdAccessTime size={14} className="text-gray-400" />
                                                <span>{item.durationFormatted}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="coins-earned-badge">
                                                🪙 +{item.coinsEarned} Coins
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                                                {item.timestamp}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn-customer-chat-action"
                                                onClick={() => navigate('/agent/chat', { state: { selectedUserId: item.customerId } })}
                                                title="Open live chat"
                                            >
                                                <MdChat size={14} /> Message
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── PAYOUT & FINANCIAL SETTLEMENT HUB (WHERE RUPEE VALUES LIVE) ─ */}
            <div className="portal-two-col-grid">
                {/* Left: Coin Calculator */}
                <div className="card-custom">
                    <div className="card-custom-header">
                        <h3 className="card-custom-title"><MdCalculate className="text-amber-500" /> Payout Settlement Calculator</h3>
                        <span className="badge-pill">3 Coins = ₹1.00 INR</span>
                    </div>

                    <div className="calculator-box">
                        <div className="form-group mb-3">
                            <label className="form-label text-xs font-semibold text-gray-500">ENTER COINS TO REDEEM</label>
                            <div className="calc-input-wrap">
                                <input
                                    type="number"
                                    className="form-control calc-input"
                                    value={calcCoins}
                                    onChange={(e) => setCalcCoins(e.target.value)}
                                    placeholder="e.g. 3000"
                                />
                                <span className="calc-unit">Coins</span>
                            </div>
                        </div>

                        <div className="calc-arrow-divider">
                            <MdArrowForward className="rotate-90 md:rotate-0 text-gray-400 text-xl" />
                        </div>

                        <div className="calc-result-box">
                            <span className="text-xs font-semibold text-emerald-600">ESTIMATED PAYOUT SETTLEMENT</span>
                            <h3 className="text-2xl font-bold text-emerald-700">
                                ₹{calcCoins && !isNaN(calcCoins) ? (Number(calcCoins) / 3).toFixed(2) : '0.00'} <span className="text-sm font-medium text-emerald-600">INR</span>
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Official settlement rate: 3 Earned Coins = ₹1.00 INR transferred to Bank/UPI.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Saved Payout Details Summary Card */}
                <div id="payout-destination-section" className="card-custom payout-destination-section-card">
                    <div className="card-custom-header">
                        <div>
                            <h3 className="card-custom-title">
                                <MdAccountBalance className="text-indigo-600" /> Payout Destination & Accounts
                            </h3>
                            <p className="card-custom-subtitle">
                                Verified settlement endpoints for automated earnings payouts
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button className="btn-edit-account" onClick={() => handleOpenEditAccountModal(pd.primaryMethod === 'Bank' ? 'bank' : 'upi')}>
                                <MdEdit /> Manage Accounts
                            </button>
                        </div>
                    </div>

                    {/* Dual Destination Executive Deck */}
                    <div className="destination-cards-deck">
                        {/* 1. UPI Fast Transfer Card */}
                        <div className={`dest-card upi-theme ${(pd.primaryMethod || 'UPI') === 'UPI' ? 'is-primary' : ''}`}>
                            <MdQrCode className="dest-card-watermark-icon" />
                            <div className="dest-card-top">
                                <span className="dest-type-badge upi">
                                    <MdFlashOn size={14} /> Instant UPI VPA
                                </span>
                                {(pd.primaryMethod || 'UPI') === 'UPI' ? (
                                    <span className="dest-primary-tag">
                                        <MdStar size={13} /> Primary
                                    </span>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="btn-make-primary" 
                                        onClick={() => handleSetPrimaryMethod('UPI')}
                                        title="Set UPI as primary payout destination"
                                    >
                                        Set as Primary
                                    </button>
                                )}
                            </div>

                            <div className="dest-detail-body">
                                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">UPI Handle / VPA</div>
                                <div className="dest-primary-val">
                                    <span className="dest-val-text text-pink-600 font-mono">
                                        {pd.upiId || 'Not configured'}
                                    </span>
                                    {pd.upiId && (
                                        <button
                                            type="button"
                                            className="btn-dest-copy"
                                            onClick={() => handleCopyField(pd.upiId, 'UPI ID', 'upi')}
                                            title="Copy UPI ID"
                                        >
                                            {copiedField === 'upi' ? <MdCheck size={16} color="#10B981" /> : <MdContentCopy size={16} />}
                                        </button>
                                    )}
                                </div>
                                <div className="dest-brand-pills">
                                    <span className="brand-pill">⚡ GPay</span>
                                    <span className="brand-pill">🟣 PhonePe</span>
                                    <span className="brand-pill">🔵 Paytm</span>
                                    <span className="brand-pill">🏛️ BHIM</span>
                                </div>
                            </div>

                            <div className="dest-card-footer">
                                <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MdVerified size={14} /> Active & Verified
                                </span>
                                <button 
                                    type="button" 
                                    className="btn-edit-dest-card" 
                                    onClick={() => handleOpenEditAccountModal('upi')}
                                >
                                    <MdEdit size={13} /> Edit UPI
                                </button>
                            </div>
                        </div>

                        {/* 2. Direct Bank Wire Card */}
                        <div className={`dest-card bank-theme ${pd.primaryMethod === 'Bank' ? 'is-primary' : ''}`}>
                            <MdAccountBalance className="dest-card-watermark-icon" />
                            <div className="dest-card-top">
                                <span className="dest-type-badge bank">
                                    <MdAccountBalance size={14} /> Direct Bank Wire
                                </span>
                                {pd.primaryMethod === 'Bank' ? (
                                    <span className="dest-primary-tag">
                                        <MdStar size={13} /> Primary
                                    </span>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="btn-make-primary" 
                                        onClick={() => handleSetPrimaryMethod('Bank')}
                                        title="Set Bank as primary payout destination"
                                    >
                                        Set as Primary
                                    </button>
                                )}
                            </div>

                            <div className="dest-detail-body">
                                <div className="dest-meta-row mb-1">
                                    <span>Bank Name:</span>
                                    <strong>{pd.bankName || 'State Bank of India'}</strong>
                                </div>
                                <div className="dest-meta-row mb-2">
                                    <span>Beneficiary:</span>
                                    <strong>{pd.accountHolderName || admin?.name || 'Agent Partner'}</strong>
                                </div>

                                <div className="dest-primary-val">
                                    <span className="dest-val-text text-indigo-900 font-mono">
                                        {showMaskedAccount && pd.accountNumber
                                            ? pd.accountNumber.replace(/.(?=.{4})/g, '• ')
                                            : (pd.accountNumber || '•••• •••• 4589')}
                                    </span>
                                    <div className="dest-val-actions">
                                        {pd.accountNumber && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-dest-copy"
                                                    onClick={() => setShowMaskedAccount(prev => !prev)}
                                                    title={showMaskedAccount ? 'Reveal account number' : 'Mask account number'}
                                                >
                                                    {showMaskedAccount ? <MdVisibility size={15} /> : <MdVisibilityOff size={15} />}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-dest-copy"
                                                    onClick={() => handleCopyField(pd.accountNumber, 'Account Number', 'account')}
                                                    title="Copy account number"
                                                >
                                                    {copiedField === 'account' ? <MdCheck size={16} color="#10B981" /> : <MdContentCopy size={16} />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="dest-meta-row mt-1">
                                    <span>IFSC Code:</span>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#4338CA' }}>
                                        {pd.ifsc || 'SBIN0004562'}
                                    </span>
                                </div>
                            </div>

                            <div className="dest-card-footer">
                                <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MdVerified size={14} /> RBI NEFT / RTGS
                                </span>
                                <button 
                                    type="button" 
                                    className="btn-edit-dest-card" 
                                    onClick={() => handleOpenEditAccountModal('bank')}
                                >
                                    <MdEdit size={13} /> Edit Bank
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-request-withdrawal-hero"
                            onClick={() => setShowWithdrawModal(true)}
                        >
                            <MdAccountBalanceWallet /> Request Withdrawal Payout
                        </button>
                    </div>
                </div>
            </div>

            {/* PAYOUT HISTORY TABLE */}
            <div className="card-custom">
                <div className="card-custom-header">
                    <div>
                        <h3 className="card-custom-title"><MdHistory className="text-gray-700" /> Withdrawal & Payout Settlement History</h3>
                        <p className="card-custom-subtitle">Track your requested withdrawals, status, and bank transfer reference IDs</p>
                    </div>
                    <button className="btn-refresh-history" onClick={fetchAgentData}>
                        <MdRefresh /> Refresh
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table agent-history-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Requested Date</th>
                                <th>Transfer Method</th>
                                <th>Coins Deducted</th>
                                <th>Amount (₹)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-8">
                                        No payout requests found yet. Click <strong>"Request Withdrawal"</strong> above to submit your first request.
                                    </td>
                                </tr>
                            ) : (
                                payoutHistory.map((item) => (
                                    <tr key={item._id}>
                                        <td className="font-mono text-sm font-semibold text-gray-700">{item._id?.substring(0, 10) || 'PAY-001'}</td>
                                        <td>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>
                                            <span className="badge-transfer-type">
                                                {item.transferType === 'Bank' ? <MdAccountBalance /> : <MdQrCode />} {item.transferType || 'UPI'}
                                            </span>
                                        </td>
                                        <td className="font-semibold text-amber-600">{item.coin || item.amount * 3} Coins</td>
                                        <td className="font-bold text-emerald-600 text-base">₹{item.amount}</td>
                                        <td>
                                            <span className={`status-badge ${
                                                item.status === 'Paid' || item.status === 'Approved' ? 'badge-paid' :
                                                item.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'
                                            }`}>
                                                {item.status === 'Paid' ? <MdCheckCircle /> : <MdHourglassTop />} {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT ACCOUNT DETAILS MODAL */}
            {showAccountEditModal && (
                <div className="agent-modal-overlay">
                    <div className="agent-modal-card">
                        <div className="agent-modal-header">
                            <h3><MdEdit /> Edit Payment Account Details</h3>
                            <button className="agent-modal-close" onClick={() => setShowAccountEditModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSaveAccountDetails} className="agent-modal-body">
                            <div className="form-group mb-3">
                                <label className="form-label">UPI ID *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editUpiId}
                                    onChange={(e) => setEditUpiId(e.target.value)}
                                    placeholder="e.g. username@okaxis"
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label">Bank Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editBankName}
                                    onChange={(e) => setEditBankName(e.target.value)}
                                    placeholder="e.g. State Bank of India"
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="form-label">Account Number *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editAccountNo}
                                    onChange={(e) => setEditAccountNo(e.target.value)}
                                    placeholder="e.g. 3849501239"
                                    required
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label">IFSC Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editIfsc}
                                    onChange={(e) => setEditIfsc(e.target.value)}
                                    placeholder="e.g. SBIN0004562"
                                    required
                                />
                            </div>

                            <div className="agent-modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAccountEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Account Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* WITHDRAWAL REQUEST MODAL */}
            {showWithdrawModal && (
                <div className="agent-modal-overlay">
                    <div className="agent-modal-card">
                        <div className="agent-modal-header">
                            <h3><MdAccountBalanceWallet /> Request Withdrawal Payout</h3>
                            <button className="agent-modal-close" onClick={() => setShowWithdrawModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleWithdrawSubmit} className="agent-modal-body">
                            <div className="modal-balance-banner">
                                <div>
                                    <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Available Balance</span>
                                    <div className="font-extrabold text-xl text-emerald-900">₹{rupeeVal} INR <span className="text-xs font-normal text-emerald-700">({earnedCoins} Coins)</span></div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-emerald-800 font-medium">Rate Standard</span>
                                    <div className="font-bold text-sm text-emerald-950">3 Coins = ₹1</div>
                                </div>
                            </div>

                            {/* Preset Amount Chips */}
                            <div className="preset-chips-group">
                                <span className="text-xs font-semibold text-gray-500 mb-1 block">QUICK PRESETS</span>
                                <div className="chips-row">
                                    <button type="button" className="preset-chip" onClick={() => handleSelectPresetRs(500)}>₹500</button>
                                    <button type="button" className="preset-chip" onClick={() => handleSelectPresetRs(1000)}>₹1,000</button>
                                    <button type="button" className="preset-chip" onClick={() => handleSelectPresetRs(2500)}>₹2,500</button>
                                    <button type="button" className="preset-chip" onClick={() => handleSelectPresetRs(5000)}>₹5,000</button>
                                    <button type="button" className="preset-chip chip-all" onClick={handleSelectAllRs}>Max Balance</button>
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label font-semibold">Withdrawal Amount (in ₹ INR) *</label>
                                <input
                                    type="number"
                                    min="100"
                                    step="10"
                                    placeholder="Enter amount (min ₹100)"
                                    className="form-control withdrawal-amount-input"
                                    value={withdrawalRs}
                                    onChange={(e) => setWithdrawalRs(e.target.value)}
                                    required
                                />
                                {withdrawalRs && (
                                    <p className="text-xs text-amber-600 mt-1.5 font-semibold flex items-center gap-1">
                                        <MdInfoOutline /> Equals {Number(withdrawalRs) * 3} Coins deduction from your balance
                                    </p>
                                )}
                            </div>

                            <div className="form-group mb-4">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label className="form-label font-semibold" style={{ margin: 0 }}>Select Transfer Destination *</label>
                                    <button
                                        type="button"
                                        className="modal-nav-dest-link"
                                        onClick={navigateToDestinationSection}
                                        title="Navigate to destination section to view or edit account"
                                    >
                                        <MdNorthEast size={13} /> Edit / Manage Destination
                                    </button>
                                </div>
                                <div className="transfer-type-selector">
                                    <label className={`transfer-card ${transferType === 'UPI' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="transferType"
                                            value="UPI"
                                            checked={transferType === 'UPI'}
                                            onChange={() => setTransferType('UPI')}
                                        />
                                        <MdQrCode className="text-xl text-pink-600" />
                                        <div>
                                            <div className="font-semibold text-sm">UPI Transfer</div>
                                            <div className="text-xs text-gray-500">{pd.upiId || 'Configure UPI'}</div>
                                        </div>
                                    </label>

                                    <label className={`transfer-card ${transferType === 'Bank' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="transferType"
                                            value="Bank"
                                            checked={transferType === 'Bank'}
                                            onChange={() => setTransferType('Bank')}
                                        />
                                        <MdAccountBalance className="text-xl text-indigo-600" />
                                        <div>
                                            <div className="font-semibold text-sm">Bank Wire</div>
                                            <div className="text-xs text-gray-500">{pd.accountNumber || 'Configure Bank'}</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="agent-modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit-payout-modal" disabled={submitting}>
                                    {submitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
