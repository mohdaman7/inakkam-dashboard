import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StaffAdd from './StaffAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEMO = [
    { _id: '1', email: 'staff1@inakkam.com', password: '••••••••', status: 1 },
    { _id: '2', email: 'moderator@inakkam.com', password: '••••••••', status: 1 },
    { _id: '3', email: 'support@inakkam.com', password: '••••••••', status: 0 },
];
const columns = [
    { key: 'email', label: 'Email' },
    { key: 'password', label: 'Password', render: () => '••••••••' },
    { key: 'status', label: 'Staff Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Active' : 'Inactive'}</span> },
];
export default function StaffList() {
    const navigate = useNavigate();
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/staff');
            if (res.data?.staff?.length) setData(res.data.staff);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        if (window.confirm(`Are you sure you want to delete staff account "${row.email}"?`)) {
            try {
                await api.delete(`/staff/${row._id}`);
                toast.success('Staff deleted successfully!');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to delete staff');
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <StaffAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Staff</h1>
                <button className="btn btn-primary" onClick={() => navigate('/staff/add')}><MdAdd /> Add Staff</button>
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
