import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import GiftAdd from './GiftAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEMO = Array.from({ length: 10 }, (_, i) => ({ _id: String(i + 1), coin: (i + 1) * 5, image: '', status: i < 8 ? 1 : 0 }));
const columns = [
    { key: 'image', label: 'Gift Image', render: (val) => <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(150,16,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎁</div> },
    { key: 'coin', label: 'Gift Coin' },
    { key: 'status', label: 'Gift Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];

export default function GiftList() {
    const navigate = useNavigate();
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/gifts');
            if (res.data?.gifts?.length) setData(res.data.gifts);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete this gift?`)) {
            try {
                await api.delete(`/gifts/${row._id}`);
                toast.success('Gift deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete gift');
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <GiftAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Gift</h1>
                <button className="btn btn-primary" onClick={() => navigate('/gift/add')}><MdAdd /> Add Gift</button>
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
