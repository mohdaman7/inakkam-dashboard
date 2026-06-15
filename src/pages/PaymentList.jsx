import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEMO = Array.from({ length: 8 }, (_, i) => ({
    _id: String(i + 1),
    name: ['Razorpay', 'Stripe', 'PayPal', 'Paytm', 'Google Pay', 'PhonePe', 'UPI', 'Bank Transfer'][i],
    subtitle: ['International Cards', 'Global Payments', 'Online Wallet', 'Indian Payments', 'QR Code', 'Indian UPI', 'Direct Transfer', 'Wire Transfer'][i],
    image: '',
    status: i < 5 ? 1 : 0,
    showOnWallet: i < 4 ? 1 : 0,
}));

const columns = [
    { key: 'image', label: 'Image', render: () => <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(150,16,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💳</div> },
    { key: 'name', label: 'Gateway Name', render: (v) => <strong>{v}</strong> },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Active' : 'Inactive'}</span> },
    { key: 'showOnWallet', label: 'Show On Wallet?', render: (v) => <span className={`badge ${v == 1 ? 'badge-info' : 'badge-unpublish'}`}>{v == 1 ? 'Yes' : 'No'}</span> },
];

export default function PaymentList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    useEffect(() => { api.get('/payment-gateways').then(res => { if (res.data?.gateways?.length) setData(res.data.gateways); }).catch(() => { }); }, []);
    return (
        <div>
            <div className="page-header"><h1 className="page-title">Payment List</h1></div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} onEdit={(row) => toast.success(`Edit ${row.name}`)} /></div>
        </div>
    );
}
