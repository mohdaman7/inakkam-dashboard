import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import PackageAdd from './PackageAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEMO = [
    { _id: '1', totalCoin: 50, amount: 4.99, status: 1 },
    { _id: '2', totalCoin: 150, amount: 9.99, status: 1 },
    { _id: '3', totalCoin: 500, amount: 24.99, status: 1 },
];
const columns = [
    { key: 'totalCoin', label: 'Total Coin', render: (v) => `💰 ${v}` },
    { key: 'amount', label: 'Amount', render: (v) => `$${v}` },
    { key: 'status', label: 'Package Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];
export default function PackageList() {
    const navigate = useNavigate();
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/packages');
            if (res.data?.packages?.length) setData(res.data.packages);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete package with ${row.totalCoin} coins?`)) {
            try {
                await api.delete(`/packages/${row._id}`);
                toast.success('Package deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete package');
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <PackageAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Package</h1>
                <button className="btn btn-primary" onClick={() => navigate('/package/add')}><MdAdd /> Add Package</button>
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
