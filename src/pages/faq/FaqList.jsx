import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import FaqAdd from './FaqAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEMO = Array.from({ length: 10 }, (_, i) => ({
    _id: String(i + 1),
    question: `How do I ${['set up my profile', 'find matches', 'send messages', 'upgrade my plan', 'delete my account', 'report a user', 'add photos', 'use filters', 'get verified', 'cancel subscription'][i]}?`,
    answer: `To ${['set up your profile', 'find matches', 'send messages', 'upgrade your plan', 'delete your account', 'report a user', 'add photos', 'use filters', 'get verified', 'cancel subscription'][i]}, go to settings and follow the instructions.`,
    status: i < 8 ? 1 : 0
}));

const columns = [
    { key: 'question', label: 'Question', render: (v) => <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div> },
    { key: 'answer', label: 'Answer', render: (v) => <div style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{v}</div> },
    { key: 'status', label: 'FAQ Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];

export default function FaqList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/faqs');
            if (res.data?.faqs?.length) setData(res.data.faqs);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this FAQ?`)) {
            try {
                await api.delete(`/faqs/${row._id}`);
                toast.success('FAQ deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete FAQ');
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <FaqAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List FAQ</h1>
                <button className="btn btn-primary" onClick={() => window.location.href = '/faq/add'}><MdAdd /> Add FAQ</button>
            </div>
            <div className="card">
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    onEdit={setEditItem}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
