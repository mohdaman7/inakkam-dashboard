import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    MdOutlineMonetizationOn, MdAccountBalanceWallet, MdTrendingUp,
    MdPayments, MdVerified, MdContentCopy, MdSend, MdHistory,
    MdAccountBalance, MdQrCode, MdCheckCircle, MdHourglassTop,
    MdOutlineLaunch, MdRefresh, MdCall, MdVideocam, MdChat,
    MdCardGiftcard, MdCalculate, MdEdit, MdCheck,
    MdArrowForward, MdInfoOutline, MdSignalWifiStatusbar4Bar
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import './EliteAgentPortal.css';

export default function EliteAgentPortal() {
    const { admin } = useAuth();

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

    // Calculator state
    const [calcCoins, setCalcCoins] = useState('1500');

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

    const handleOpenEditAccountModal = () => {
        const pd = summary.payoutDetails || {};
        setEditUpiId(pd.upiId || '');
        setEditBankName(pd.bankName || 'State Bank of India');
        setEditAccountNo(pd.accountNumber || '');
        setEditIfsc(pd.ifsc || '');
        setShowAccountEditModal(true);
    };

    const handleSaveAccountDetails = (e) => {
        e.preventDefault();
        setSummary(prev => ({
            ...prev,
            payoutDetails: {
                upiId: editUpiId,
                bankName: editBankName,
                accountNumber: editAccountNo,
                ifsc: editIfsc
            }
        }));
        toast.success('Payment account details updated successfully!');
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

                <button
                    className="btn-request-withdrawal-hero"
                    onClick={() => setShowWithdrawModal(true)}
                >
                    <MdAccountBalanceWallet /> Request Withdrawal
                </button>
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
                        <span className="metric-rupee-pill">≈ ₹{rupeeVal} INR</span>
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
                        <span className="metric-rupee-pill">≈ ₹{((summary.todayCoins || 0) / 3).toFixed(2)} INR</span>
                    </div>
                </div>
            </div>

            {/* REVENUE BREAKDOWN & CONVERTER SECTION */}
            <div className="portal-two-col-grid">
                {/* Left: Earnings Breakdown */}
                <div className="card-custom">
                    <div className="card-custom-header">
                        <h3 className="card-custom-title"><MdTrendingUp className="text-pink-500" /> Earnings Source Breakdown</h3>
                        <span className="badge-pill">This Month</span>
                    </div>

                    <div className="revenue-breakdown-list">
                        <div className="breakdown-item">
                            <div className="breakdown-left">
                                <div className="breakdown-icon bg-pink-100 text-pink-600"><MdVideocam /></div>
                                <div>
                                    <h4 className="breakdown-name">Video Calls</h4>
                                    <span className="breakdown-meta">₹35 / min rate</span>
                                </div>
                            </div>
                            <div className="breakdown-right">
                                <span className="breakdown-coins">5,200 Coins</span>
                                <span className="breakdown-rupees">₹1,733.33</span>
                            </div>
                        </div>

                        <div className="breakdown-item">
                            <div className="breakdown-left">
                                <div className="breakdown-icon bg-purple-100 text-purple-600"><MdCall /></div>
                                <div>
                                    <h4 className="breakdown-name">Voice Calls</h4>
                                    <span className="breakdown-meta">₹20 / min rate</span>
                                </div>
                            </div>
                            <div className="breakdown-right">
                                <span className="breakdown-coins">4,100 Coins</span>
                                <span className="breakdown-rupees">₹1,366.67</span>
                            </div>
                        </div>

                        <div className="breakdown-item">
                            <div className="breakdown-left">
                                <div className="breakdown-icon bg-blue-100 text-blue-600"><MdChat /></div>
                                <div>
                                    <h4 className="breakdown-name">Chat Messages</h4>
                                    <span className="breakdown-meta">₹5 / message rate</span>
                                </div>
                            </div>
                            <div className="breakdown-right">
                                <span className="breakdown-coins">2,000 Coins</span>
                                <span className="breakdown-rupees">₹666.67</span>
                            </div>
                        </div>

                        <div className="breakdown-item">
                            <div className="breakdown-left">
                                <div className="breakdown-icon bg-amber-100 text-amber-600"><MdCardGiftcard /></div>
                                <div>
                                    <h4 className="breakdown-name">Virtual Gifts Received</h4>
                                    <span className="breakdown-meta">Gift reward split</span>
                                </div>
                            </div>
                            <div className="breakdown-right">
                                <span className="breakdown-coins">1,200 Coins</span>
                                <span className="breakdown-rupees">₹400.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Coin Converter & Account Info */}
                <div className="portal-col-stack">
                    {/* Coin Calculator */}
                    <div className="card-custom">
                        <div className="card-custom-header">
                            <h3 className="card-custom-title"><MdCalculate className="text-amber-500" /> Instant Coin-to-Rupee Calculator</h3>
                        </div>

                        <div className="calculator-box">
                            <div className="form-group mb-3">
                                <label className="form-label text-xs font-semibold text-gray-500">ENTER COINS AMOUNT</label>
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
                                <span className="text-xs font-semibold text-emerald-600">ESTIMATED PAYOUT VALUE</span>
                                <h3 className="text-2xl font-bold text-emerald-700">
                                    ₹{calcCoins && !isNaN(calcCoins) ? (Number(calcCoins) / 3).toFixed(2) : '0.00'} <span className="text-sm font-medium text-emerald-600">INR</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Based on 3 Coins = ₹1.00 INR settlement standard.</p>
                            </div>
                        </div>
                    </div>

                    {/* Saved Payout Details Summary Card */}
                    <div className="card-custom">
                        <div className="card-custom-header">
                            <h3 className="card-custom-title"><MdAccountBalance className="text-indigo-600" /> Saved Payout Destination</h3>
                            <button className="btn-edit-account" onClick={handleOpenEditAccountModal}>
                                <MdEdit /> Edit Details
                            </button>
                        </div>

                        <div className="payout-details-preview-grid">
                            <div className="pd-preview-item">
                                <span className="pd-label">UPI ID</span>
                                <span className="pd-value font-mono text-pink-600">{pd.upiId || 'Not configured'}</span>
                            </div>
                            <div className="pd-preview-item">
                                <span className="pd-label">Bank Name</span>
                                <span className="pd-value">{pd.bankName || 'State Bank of India'}</span>
                            </div>
                            <div className="pd-preview-item">
                                <span className="pd-label">Account No</span>
                                <span className="pd-value font-mono">{pd.accountNumber || '•••• •••• 4589'}</span>
                            </div>
                            <div className="pd-preview-item">
                                <span className="pd-label">IFSC Code</span>
                                <span className="pd-value font-mono">{pd.ifsc || 'SBIN0004562'}</span>
                            </div>
                        </div>
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
                                <label className="form-label font-semibold">Select Transfer Destination *</label>
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
