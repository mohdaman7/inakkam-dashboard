import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StaffAdd from './StaffAdd';
import { MdAdd, MdPeople } from 'react-icons/md';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ConfirmContext';

const DEMO = [
    { _id: '1', email: 'staff1@inakkam.com', password: '••••••••', status: 1, permissions: { interest_Read: true, faq_Read: true } },
    { _id: '2', email: 'moderator@inakkam.com', password: '••••••••', status: 1, permissions: { interest_Read: true, interest_Write: true } },
    { _id: '3', email: 'support@inakkam.com', password: '••••••••', status: 0, permissions: {} },
];

export default function StaffList() {
    const navigate = useNavigate();
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const confirm = useConfirm();

    const getPermCount = (row) => {
        if (!row.permissions) return 0;
        return Object.values(row.permissions).filter(Boolean).length;
    };

    const columns = [
        { key: 'email', label: 'Email Address' },
        { key: 'password', label: 'Password', render: () => '••••••••' },
        {
            key: 'permissions',
            label: 'Assigned Privileges',
            render: (v, row) => {
                const count = getPermCount(row);
                return (
                    <span 
                        className={`badge ${count > 0 ? 'badge-publish' : 'badge-unpublish'}`} 
                        style={{ 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 500,
                            padding: '3px 10px',
                            background: count > 0 ? 'rgba(0, 214, 143, 0.12)' : 'rgba(255, 61, 113, 0.12)',
                            color: count > 0 ? '#00d68f' : '#ff3d71',
                            border: '1px solid currentColor'
                        }}
                    >
                        {count === 0 ? 'No Access Configured' : `${count} Privileges`}
                    </span>
                );
            }
        },
        { 
            key: 'status', 
            label: 'Account Status', 
            render: (v) => (
                <span 
                    className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        fontSize: '0.78rem'
                    }}
                >
                    {v == 1 ? 'Active' : 'Suspended'}
                </span>
            )
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/staff');
            if (res.data?.staff?.length) setData(res.data.staff);
        } catch { } finally { setLoading(false); }
    };

    const handleDelete = async (row) => {
        const isConfirmed = await confirm({
            title: 'Delete Staff',
            message: `Are you sure you want to delete staff account "${row.email}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
        if (isConfirmed) {
            try {
                await api.delete(`/staff/${row._id}`);
                toast.success('Staff account deleted successfully!');
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
        <div style={{ animation: 'fadeIn 0.35s ease' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                        <MdPeople style={{ color: 'var(--primary)' }} /> Staff Management
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                        Create and configure authorization rules for administrative staff members.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/staff/add')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <MdAdd size={18} /> Add New Staff
                </button>
            </div>
            
            <div className="card" style={{ padding: 24, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
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
