import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdBlock, MdCheck } from 'react-icons/md';

const DEMO = Array.from({ length: 12 }, (_, i) => ({
    _id: String(i + 1),
    reporterName: `User ${i * 3 + 1}`,
    reportedName: `User ${i * 3 + 2}`,
    reason: ['Spam content', 'Inappropriate photos', 'Harassment', 'Fake profile', 'Abusive language', 'Scam behavior'][i % 6],
    description: 'User posted inappropriate content.',
    status: 'pending',
    createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

const columns = [
    { key: 'reporterName', label: 'Report Maker', render: (v) => <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> },
    { key: 'reportedName', label: 'Reported User', render: (v) => <span style={{ color: 'var(--danger)', fontWeight: 500 }}>{v}</span> },
    { key: 'reason', label: 'Reason', render: (v) => <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{v}</span> },
    { key: 'description', label: 'Details' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v === 'resolved' ? 'badge-publish' : v === 'dismissed' ? 'badge-unpublish' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>{v}</span> },
    { key: 'createdAt', label: 'Date' },
];

export default function ReportList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get('/reports')
            .then(res => { if (res.data?.reports?.length) setData(res.data.reports); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleReportAction = async (row, action) => {
        try {
            await api.patch(`/reports/${row._id}/action`, { action });
            toast.success(action === 'ban' ? 'Reported user banned' : 'Report dismissed');
            setData(prev => prev.map(r => r._id === row._id ? { ...r, status: action === 'ban' ? 'resolved' : 'dismissed' } : r));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update report action');
        }
    };

    const handleAction = (row) => (
        row.status !== 'pending' ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{row.status}</span>
        ) : (
            <div style={{ display: 'flex', gap: 6 }}>
                <button
                    className="btn btn-danger btn-sm"
                    title="Ban User"
                    onClick={() => handleReportAction(row, 'ban')}
                >
                    <MdBlock /> Ban
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    title="Dismiss Report"
                    onClick={() => handleReportAction(row, 'dismiss')}
                >
                    <MdCheck /> Dismiss
                </button>
            </div>
        )
    );

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Report List</h1></div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} actions={handleAction} /></div>
        </div>
    );
}
