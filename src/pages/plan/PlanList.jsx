import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import PlanAdd from './PlanAdd';
import { MdAdd, MdCheck, MdClose } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ConfirmContext';

const DEMO = [
    { _id: '1', title: 'Inakkam Boost', amount: 14.99, dayLimit: 30, filterInclude: true, directChat: true, chat: true, likeMenu: false, audioVideo: false, status: 1 },
    { _id: '2', title: 'Inakkam Premium', amount: 29.99, dayLimit: 30, filterInclude: true, directChat: true, chat: true, likeMenu: true, audioVideo: true, status: 1 },
    { _id: '3', title: 'Inakkam Lifetime', amount: 119.99, dayLimit: 36500, filterInclude: true, directChat: true, chat: true, likeMenu: true, audioVideo: true, status: 1 },
];
const Tick = ({ v }) => v ? <MdCheck style={{ color: 'var(--success)' }} /> : <MdClose style={{ color: 'var(--danger)' }} />;
const columns = [
    { key: 'title', label: 'Plan Title' },
    { key: 'amount', label: 'Amount', render: (v) => `$${v}` },
    { key: 'dayLimit', label: 'Day Limit' },
    { key: 'filterInclude', label: 'Filter ?', render: (v) => <Tick v={v} /> },
    { key: 'directChat', label: 'Direct Chat ?', render: (v) => <Tick v={v} /> },
    { key: 'chat', label: 'Chat ?', render: (v) => <Tick v={v} /> },
    { key: 'likeMenu', label: 'Like Menu ?', render: (v) => <Tick v={v} /> },
    { key: 'audioVideo', label: 'Audio/Video ?', render: (v) => <Tick v={v} /> },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];
export default function PlanList() {
    const navigate = useNavigate();
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const confirm = useConfirm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/plans');
            if (res.data?.plans?.length) setData(res.data.plans);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        const isConfirmed = await confirm({
            title: 'Delete Plan',
            message: `Are you sure you want to delete plan "${row.title}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
        if (isConfirmed) {
            try {
                await api.delete(`/plans/${row._id}`);
                toast.success('Plan deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete plan');
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <PlanAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Plan</h1>
                <button className="btn btn-primary" onClick={() => navigate('/plan/add')}><MdAdd /> Add Plan</button>
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
