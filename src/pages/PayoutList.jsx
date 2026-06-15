import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { MdAccountBalanceWallet } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEMO = Array.from({ length: 10 }, (_, i) => ({
    _id: String(i + 1),
    amount: (500 + i * 200).toFixed(2),
    coin: 100 + i * 50,
    userName: ['Aarav Shah', 'Priya Nair', 'Rohit Verma', 'Sneha Kapoor', 'Vikram Rao', 'Ananya K', 'Dev Mehta', 'Meera Iyer', 'Karan Bajaj', 'Pooja Reddy'][i],
    transferType: ['UPI', 'Bank', 'PayPal', 'Razorpay'][i % 4],
    mobile: `+91 98765${String(43210 + i).padStart(5, '0')}`,
    status: i % 3 === 0 ? 'Pending' : 'Completed',
}));

const columns = [
    { key: 'amount', label: 'Amount', render: (v) => `₹${v}` },
    { key: 'coin', label: 'Coin', render: (v) => `💰 ${v}` },
    { key: 'userName', label: 'User Name' },
    { key: 'transferType', label: 'Transfer Type', render: (v) => <span className="badge badge-info">{v}</span> },
    { key: 'mobile', label: 'Mobile' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v === 'Completed' ? 'badge-publish' : 'badge-pending'}`}>{v}</span> },
];

export default function PayoutList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    useEffect(() => { api.get('/payouts').then(res => { if (res.data?.payouts?.length) setData(res.data.payouts); }).catch(() => { }); }, []);

    const handleAction = (row) => (
        row.status === 'Completed' ? (
            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Completed</span>
        ) : (
            <button
                className="btn btn-danger btn-sm"
                onClick={() => { toast.success(`Payout processed for ${row.userName}`); setData(prev => prev.map(p => p._id === row._id ? { ...p, status: 'Completed' } : p)); }}
            >
                <MdAccountBalanceWallet /> Make A Payout
            </button>
        )
    );

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Payout List</h1></div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} actions={handleAction} /></div>
        </div>
    );
}
