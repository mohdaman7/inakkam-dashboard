import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import PageAdd from './PageAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEMO = [
    { _id: '1', title: 'Terms & Conditions', status: 1 },
    { _id: '2', title: 'Privacy Policy', status: 1 },
    { _id: '3', title: 'About Us', status: 1 },
    { _id: '4', title: 'Community Guidelines', status: 0 },
];
const columns = [
    { key: 'title', label: 'Page Name' },
    { key: 'status', label: 'Page Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];
export default function PageList() {
    const navigate = useNavigate();
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pages');
            if (res.data?.pages?.length) setData(res.data.pages);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete page "${row.title}"?`)) {
            try {
                await api.delete(`/pages/${row._id}`);
                toast.success('Page deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete page');
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <PageAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Pages</h1>
                <button className="btn btn-primary" onClick={() => navigate('/page/add')}><MdAdd /> Add Page</button>
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
