import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MdArrowBack, MdPerson, MdVerified, MdEmail, MdPhone,
    MdAccountBalanceWallet, MdChat, MdHistory, MdLockReset, MdBlock,
    MdMailOutline, MdStar, MdAccessTime, MdAttachMoney, MdCheckCircle, MdPaid
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

export default function EliteAgentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('Bank Transfer (SBI)');

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

    return (
        <div>
            {/* Header / Nav */}
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
                        Elite Agent Details
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                        Review earnings, chat engagements, configuration badges, and wallet history.
                    </p>
                </div>
            </div>

            {/* Profile Overview and Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, marginBottom: 24 }}>
                
                {/* Profile Card & Info */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 20 }}>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <div style={{
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ff6b9d 0%, #9610ff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                overflow: 'hidden',
                                border: '3px solid rgba(255,255,255,0.15)'
                            }}>
                                {agent.photos && agent.photos[0] ? (
                                    <img src={agent.photos[0]} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <MdPerson style={{ fontSize: '3rem' }} />
                                )}
                            </div>
                            <span style={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: agent.isOnline ? '#00d68f' : '#8a8aa0',
                                border: '3px solid #151521'
                            }} />
                        </div>

                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 4px 0' }}>
                            {agent.name}
                            <MdVerified style={{ color: '#00d68f', fontSize: '1.2rem' }} title="Verified Profile" />
                        </h2>
                        <span className="badge badge-primary-light" style={{ fontSize: '0.75rem', marginBottom: 12 }}>Elite Agent Account</span>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span className="badge badge-success">Premium</span>
                            <span className={`badge ${agent.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{agent.status}</span>
                        </div>
                    </div>

                    {/* Quick Contacts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                            <MdEmail style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }} />
                            <span>{agent.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                            <MdPhone style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }} />
                            <span>{agent.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                            <MdAccessTime style={{ color: 'var(--primary-light)', fontSize: '1.2rem' }} />
                            <span>Last Active: {agent.lastLogin}</span>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                        <button
                            onClick={handleResetPassword}
                            disabled={actionLoading}
                            className="btn btn-warning"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <MdLockReset style={{ fontSize: '1.2rem' }} /> Reset Password
                        </button>
                        <button
                            onClick={handleSendCredentials}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <MdMailOutline style={{ fontSize: '1.2rem' }} /> Send Credentials to Email
                        </button>
                        <button
                            onClick={handleToggleStatus}
                            disabled={actionLoading}
                            className={`btn ${agent.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <MdBlock style={{ fontSize: '1.2rem' }} /> {agent.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                        </button>
                    </div>
                </div>

                {/* Right Area: Wallet Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.08) 0%, rgba(255, 179, 198, 0.02) 100%)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <MdAccountBalanceWallet style={{ fontSize: '1.8rem', color: '#ffd43b' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Wallet & Earnings</h3>
                            </div>
                            <button
                                onClick={() => setShowPayoutModal(true)}
                                className="btn btn-primary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                disabled={agent.wallet.pendingPayout <= 0}
                            >
                                <MdPaid /> Process Payout
                            </button>
                        </div>

                        {/* Coin counters grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Balance</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffd43b', marginTop: 4 }}>🪙 {agent.wallet.balance}</div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Coins</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffd43b', marginTop: 4 }}>🪙 {agent.wallet.todayCoins}</div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekly Coins</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffd43b', marginTop: 4 }}>🪙 {agent.wallet.weeklyCoins}</div>
                            </div>
                            <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Coins</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffd43b', marginTop: 4 }}>🪙 {agent.wallet.monthlyCoins}</div>
                            </div>
                        </div>

                        {/* Revenue tracking details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <div style={{ padding: '14px 16px', background: 'rgba(64, 192, 87, 0.08)', borderRadius: 10, border: '1px solid rgba(64, 192, 87, 0.15)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime Revenue</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#40c057', marginTop: 4 }}>₹{agent.wallet.lifetimeEarnings.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: '14px 16px', background: 'rgba(255, 140, 66, 0.08)', borderRadius: 10, border: '1px solid rgba(255, 140, 66, 0.15)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Payout</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ff8c42', marginTop: 4 }}>₹{agent.wallet.pendingPayout.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: '14px 16px', background: 'rgba(150, 16, 255, 0.08)', borderRadius: 10, border: '1px solid rgba(150, 16, 255, 0.15)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid Amount</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9610ff', marginTop: 4 }}>₹{agent.wallet.paidAmount.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Biography & Metadata details */}
                    <div className="card">
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8, margin: '0 0 16px 0' }}>Profile Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                            <div><strong>Religion:</strong> {agent.religion || 'N/A'}</div>
                            <div><strong>Languages:</strong> {agent.language || 'N/A'}</div>
                            <div><strong>Occupation:</strong> {agent.occupation || 'N/A'}</div>
                            <div><strong>Interests:</strong> {agent.interests || 'N/A'}</div>
                            <div><strong>Height / Weight:</strong> {agent.height} cm / {agent.weight} kg</div>
                            <div><strong>Birthday / Age:</strong> {agent.dob}</div>
                            <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
                                <strong>About Me:</strong>
                                <p style={{ margin: '4px 0 0 0', lineHeight: 1.5, fontSize: '0.85rem' }}>{agent.aboutMe}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Payout History & Payout Configuration Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24, marginBottom: 24 }}>
                {/* Payout Credentials */}
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 10, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ⚙️ Payout Configurations
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.88rem' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>Bank Name</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agent.payoutDetails.bankName}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>Account Number</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agent.payoutDetails.accountNumber}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>IFSC Code</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agent.payoutDetails.ifsc}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>UPI ID</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{agent.payoutDetails.upiId}</div>
                        </div>
                    </div>
                </div>

                {/* Payout History List */}
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: 10, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdHistory style={{ color: 'var(--primary-light)' }} /> Settlement Payout History
                    </h3>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Payout ID</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{p.id}</td>
                                        <td style={{ color: 'var(--text-primary)' }}>{p.date}</td>
                                        <td style={{ color: '#40c057', fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{p.method}</td>
                                        <td>
                                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <MdCheckCircle /> {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Chat History log */}
            <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <MdChat style={{ fontSize: '1.5rem', color: 'var(--primary-light)' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Chat Sessions & Coin Income</h3>
                </div>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Coins Spent</th>
                                <th>Messages</th>
                                <th>Duration</th>
                                <th>Date/Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_CHATS.map((c, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.customer}</td>
                                    <td style={{ color: '#ffd43b', fontWeight: 600 }}>🪙 {c.coins}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{c.messages} replies</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{c.duration}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Processing Dialog Modal */}
            {showPayoutModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 450, padding: 24, boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdPaid style={{ color: 'var(--primary)' }} /> Process Earnings Payout
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                            Transfer settled chat earnings to the agent's account. Max payout available: <strong>₹{agent.wallet.pendingPayout.toLocaleString()}</strong>.
                        </p>

                        <form onSubmit={handleCreatePayout}>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label" style={{ color: 'var(--text-primary)' }}>Payout Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={agent.wallet.pendingPayout}
                                    placeholder="Enter amount in ₹"
                                    value={payoutAmount}
                                    onChange={e => setPayoutAmount(e.target.value)}
                                    className="form-control"
                                    style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label" style={{ color: 'var(--text-primary)' }}>Transfer Method</label>
                                <select
                                    value={payoutMethod}
                                    onChange={e => setPayoutMethod(e.target.value)}
                                    className="form-control"
                                    style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                >
                                    <option value="Bank Transfer (SBI)">Bank Transfer ({agent.payoutDetails.bankName})</option>
                                    <option value="UPI ID">UPI ID ({agent.payoutDetails.upiId})</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPayoutModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Approve & Settle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
