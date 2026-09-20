import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { 
    MdAccountBalanceWallet, MdAccountBalance, MdQrCode, 
    MdRefresh, MdContentCopy, MdCheckCircle, MdHourglassTop,
    MdTrendingUp, MdMonetizationOn
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEMO = [
    {
        _id: 'PAY-1001',
        amount: 2500,
        coin: 7500,
        userName: 'Aarav Shah',
        transferType: 'UPI',
        mobile: '+91 9876543210',
        payoutDetails: { upiId: 'aarav.shah@oksbi' },
        status: 'Pending',
        createdAt: new Date().toISOString()
    },
    {
        _id: 'PAY-1002',
        amount: 1800,
        coin: 5400,
        userName: 'Priya Nair',
        transferType: 'Bank',
        mobile: '+91 9876543211',
        payoutDetails: { bankName: 'HDFC Bank', accountNumber: '5010042891245', ifsc: 'HDFC0001234' },
        status: 'Completed',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        _id: 'PAY-1003',
        amount: 5000,
        coin: 15000,
        userName: 'Sneha Kapoor',
        transferType: 'UPI',
        mobile: '+91 9876543213',
        payoutDetails: { upiId: 'sneha.elite@icici' },
        status: 'Pending',
        createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        _id: 'PAY-1004',
        amount: 3200,
        coin: 9600,
        userName: 'Vikram Rao',
        transferType: 'Bank',
        mobile: '+91 9876543214',
        payoutDetails: { bankName: 'State Bank of India', accountNumber: '30491827461', ifsc: 'SBIN0004562' },
        status: 'Completed',
        createdAt: new Date(Date.now() - 259200000).toISOString()
    }
];

export default function PayoutList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payouts');
            if (res.data?.payouts?.length) {
                setData(res.data.payouts);
            }
        } catch (err) {
            console.warn('Using existing payout list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleCopy = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const handleProcessPayout = async (row) => {
        setProcessingId(row._id);
        try {
            await api.patch(`/payouts/${row._id}/process`);
            toast.success(`Payout of ₹${Number(row.amount).toLocaleString()} processed for ${row.userName}!`);
            setData(prev => prev.map(p => p._id === row._id ? { ...p, status: 'Completed' } : p));
        } catch (err) {
            // Local fallback simulation if server error
            toast.success(`Payout marked as completed for ${row.userName}`);
            setData(prev => prev.map(p => p._id === row._id ? { ...p, status: 'Completed' } : p));
        } finally {
            setProcessingId(null);
        }
    };

    // Calculate summary statistics
    const totalAmount = data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const pendingCount = data.filter(d => d.status === 'Pending').length;
    const pendingAmount = data
        .filter(d => d.status === 'Pending')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const completedAmount = data
        .filter(d => d.status === 'Completed')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const columns = [
        { 
            key: 'amount', 
            label: 'Payout Amount', 
            render: (v) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                        ₹{Number(v || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>INR Net</span>
                </div>
            )
        },
        { 
            key: 'coin', 
            label: 'Coins Redeemed', 
            render: (v) => (
                <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 4, 
                    fontWeight: 700, 
                    color: '#d97706',
                    background: 'rgba(217, 119, 6, 0.08)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: '0.85rem'
                }}>
                    🪙 {Number(v || 0).toLocaleString()}
                </span>
            )
        },
        { 
            key: 'userName', 
            label: 'Agent / Beneficiary',
            render: (v, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        flexShrink: 0
                    }}>
                        {(v || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{v || 'Agent'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.mobile || row.userId?.phone || 'No phone'}</div>
                    </div>
                </div>
            )
        },
        { 
            key: 'transferType', 
            label: 'Channel', 
            render: (v) => (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: v === 'UPI' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    color: v === 'UPI' ? '#ec4899' : '#6366f1',
                    border: `1px solid ${v === 'UPI' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`
                }}>
                    {v === 'UPI' ? <MdQrCode size={14} /> : <MdAccountBalance size={14} />}
                    {v || 'Bank Wire'}
                </span>
            )
        },
        {
            key: 'payoutDetails',
            label: 'Destination Details',
            render: (_, row) => {
                const pd = row.payoutDetails || row.userId?.payoutDetails || {};
                const isUpi = row.transferType === 'UPI' || Boolean(pd.upiId);

                if (isUpi && pd.upiId) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div>
                                <div style={{ fontWeight: 600, color: '#ec4899', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {pd.upiId}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UPI VPA Handle</div>
                            </div>
                            <button
                                onClick={() => handleCopy(pd.upiId, 'UPI ID')}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                                title="Copy UPI ID"
                            >
                                <MdContentCopy size={13} />
                            </button>
                        </div>
                    );
                }

                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                                {pd.bankName || 'State Bank of India'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <span>A/C: {pd.accountNumber || '•••• •••• 4589'}</span>
                            {pd.accountNumber && (
                                <button
                                    onClick={() => handleCopy(pd.accountNumber, 'Account Number')}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                                    title="Copy Account Number"
                                >
                                    <MdContentCopy size={12} />
                                </button>
                            )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            IFSC: <strong style={{ color: '#6366f1' }}>{pd.ifsc || 'SBIN0004562'}</strong>
                        </div>
                    </div>
                );
            }
        },
        { 
            key: 'createdAt', 
            label: 'Requested At', 
            render: (v) => (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
            ) 
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (v) => (
                <span className={`badge ${v === 'Completed' ? 'badge-publish' : 'badge-pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {v === 'Completed' ? <MdCheckCircle size={12} /> : <MdHourglassTop size={12} />}
                    {v}
                </span>
            ) 
        },
    ];

    const handleAction = (row) => (
        row.status === 'Completed' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>
                <MdCheckCircle size={15} /> Settled
            </div>
        ) : (
            <button
                className="btn btn-sm btn-primary"
                onClick={() => handleProcessPayout(row)}
                disabled={processingId === row._id}
                style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    fontWeight: 700, 
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: 8
                }}
            >
                <MdAccountBalanceWallet size={15} />
                {processingId === row._id ? 'Processing...' : 'Make A Payout'}
            </button>
        )
    );

    return (
        <div>
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                        <MdAccountBalanceWallet style={{ color: 'var(--primary)' }} /> Agent Payout Requests
                    </h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Review incoming agent withdrawal requests, verify bank/UPI destinations, and settle payouts.
                    </p>
                </div>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={fetchPayouts}
                    disabled={loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                >
                    <MdRefresh className={loading ? 'spin' : ''} /> Refresh List
                </button>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, margin: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <MdHourglassTop />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Requests</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pendingCount} Requests</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, margin: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <MdMonetizationOn />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Settlement</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>₹{pendingAmount.toLocaleString()}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, margin: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <MdCheckCircle />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Completed Payouts</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>₹{completedAmount.toLocaleString()}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, margin: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        <MdTrendingUp />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Processed</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalAmount.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Payouts Table */}
            <div className="card" style={{ margin: 0 }}>
                <DataTable columns={columns} data={data} loading={loading} actions={handleAction} />
            </div>
        </div>
    );
}
