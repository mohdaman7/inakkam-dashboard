import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { MdPerson, MdBlock, MdVisibility } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEMO = Array.from({ length: 20 }, (_, i) => ({
    _id: String(i + 1),
    name: ['Aarav Shah', 'Priya Nair', 'Rohit Verma', 'Sneha Kapoor', 'Vikram Rao', 'Ananya Krishnan', 'Dev Mehta', 'Meera Iyer', 'Karan Bajaj', 'Pooja Reddy', 'Aditya Gupta', 'Kavya Pillai', 'Nikhil Choudhary', 'Riya Sinha', 'Suresh Nambiar', 'Deepika Pal', 'Arjun Menon', 'Lakshmi Das', 'Rahul Singh', 'Simran Malhotra'][i],
    email: `user${i + 1}@example.com`,
    gender: i % 3 === 0 ? 'Woman' : 'Man',
    age: 20 + i % 15,
    membership: ['free', 'boost', 'premium', 'lifetime'][i % 4],
    isOnline: i % 3 === 0,
    createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

const columns = [
    {
        key: 'name', label: 'Name', render: (v, row) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(150,16,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><MdPerson /></div>
                <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-white)' }}>{v}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                </div>
            </div>
        )
    },
    { key: 'gender', label: 'Gender' },
    { key: 'age', label: 'Age' },
    { key: 'membership', label: 'Plan', render: (v) => <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{v}</span> },
    { key: 'isOnline', label: 'Status', render: (v) => <span className={`badge ${v ? 'badge-publish' : 'badge-unpublish'}`}>{v ? 'Online' : 'Offline'}</span> },
    { key: 'createdAt', label: 'Joined' },
];

export default function UserList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/users')
            .then(res => { if (res.data?.users?.length) setData(res.data.users); })
            .catch(() => { });
    }, []);

    const handleAction = (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-primary btn-sm btn-icon" title="View Profile"><MdVisibility /></button>
            <button className="btn btn-danger btn-sm btn-icon" title="Block User" onClick={() => toast.success(`User "${row.name}" blocked`)}><MdBlock /></button>
        </div>
    );

    return (
        <div>
            <div className="page-header"><h1 className="page-title">User List</h1></div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} actions={handleAction} /></div>
        </div>
    );
}
