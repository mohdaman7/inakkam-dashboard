import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DEMO = Array.from({ length: 12 }, (_, i) => ({
    _id: String(i + 1),
    reporterName: `User ${i * 3 + 1}`,
    reportedName: `User ${i * 3 + 2}`,
    comment: ['Spam content', 'Inappropriate photos', 'Harassment', 'Fake profile', 'Abusive language', 'Scam behavior'][i % 6],
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

const columns = [
    { key: 'reporterName', label: 'Report Maker', render: (v) => <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span> },
    { key: 'reportedName', label: 'Reported User', render: (v) => <span style={{ color: 'var(--danger)' }}>{v}</span> },
    { key: 'comment', label: 'Comment' },
    { key: 'date', label: 'Date' },
];

export default function ReportList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        api.get('/reports').then(res => { if (res.data?.reports?.length) setData(res.data.reports); }).catch(() => { });
    }, []);
    return (
        <div>
            <div className="page-header"><h1 className="page-title">Report List</h1></div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} actions={() => null} /></div>
        </div>
    );
}
