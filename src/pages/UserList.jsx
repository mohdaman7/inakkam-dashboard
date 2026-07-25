import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import {
    MdPerson, MdBlock, MdCheckCircle, MdVisibility, MdRefresh,
    MdSearch, MdVerified, MdEmail, MdPhone, MdWork, MdSchool, MdClose,
    MdPeople, MdStar, MdSecurity, MdFilterList, MdPersonAdd
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DEMO = Array.from({ length: 20 }, (_, i) => ({
    _id: String(i + 1),
    name: ['Aarav Shah', 'Priya Nair', 'Rohit Verma', 'Sneha Kapoor', 'Vikram Rao', 'Ananya Krishnan', 'Dev Mehta', 'Meera Iyer', 'Karan Bajaj', 'Pooja Reddy', 'Aditya Gupta', 'Kavya Pillai', 'Nikhil Choudhary', 'Riya Sinha', 'Suresh Nambiar', 'Deepika Pal', 'Arjun Menon', 'Lakshmi Das', 'Rahul Singh', 'Simran Malhotra'][i],
    email: `user${i + 1}@example.com`,
    phone: `+91 98765 432${(i + 10).toString().padStart(2, '0')}`,
    gender: i % 3 === 0 ? 'Woman' : 'Man',
    age: 20 + i % 15,
    bio: 'Passionate about travel, photography, and exploring authentic connections.',
    work: i % 2 === 0 ? 'Software Engineer' : 'Creative Director',
    education: 'Master Degree',
    photos: [],
    interests: ['Travel', 'Music', 'Fitness', 'Reading', 'Photography'],
    membership: ['free', 'boost', 'premium', 'lifetime'][i % 4],
    verified: i % 2 === 0,
    verificationStatus: i % 2 === 0 ? 'VERIFIED' : 'NOT_VERIFIED',
    isOnline: i % 3 === 0,
    isDeleted: i % 5 === 0,
    createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

export default function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            if (res.data?.users?.length) {
                setUsers(res.data.users);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleSuspend = async (row) => {
        const targetState = !row.isDeleted;
        setActionLoading(true);
        try {
            await api.patch(`/users/${row._id}/block`, { blocked: targetState });
            const actionLabel = targetState ? 'suspended' : 'activated';
            toast.success(`User "${row.name}" has been ${actionLabel}`);

            setUsers(prev => prev.map(u => u._id === row._id ? { ...u, isDeleted: targetState } : u));
            if (selectedUser && selectedUser._id === row._id) {
                setSelectedUser(prev => prev ? { ...prev, isDeleted: targetState } : null);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setGenderFilter('');
        setPlanFilter('');
        setStatusFilter('');
    };

    const hasActiveFilters = Boolean(searchTerm || genderFilter || planFilter || statusFilter);

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            !searchTerm.trim() ||
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone && user.phone.includes(searchTerm));

        const matchesGender = !genderFilter || user.gender?.toLowerCase() === genderFilter.toLowerCase();
        const matchesPlan = !planFilter || user.membership?.toLowerCase() === planFilter.toLowerCase();

        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = !user.isDeleted;
        else if (statusFilter === 'suspended') matchesStatus = !!user.isDeleted;

        return matchesSearch && matchesGender && matchesPlan && matchesStatus;
    });

    // Calculated Statistics
    const totalCount = users.length;
    const verifiedCount = users.filter(u => u.verified).length;
    const premiumCount = users.filter(u => u.membership !== 'free').length;
    const suspendedCount = users.filter(u => u.isDeleted).length;

    const columns = [
        {
            key: 'name',
            label: 'User Profile',
            render: (v, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(150, 16, 255, 0.25)',
                            border: '2px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {row.photos && row.photos[0] ? (
                                <img src={row.photos[0]} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <MdPerson style={{ fontSize: '1.4rem' }} />
                            )}
                        </div>
                        <span style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 11,
                            height: 11,
                            borderRadius: '50%',
                            background: row.isOnline ? '#00d68f' : '#8a8aa0',
                            border: '2px solid #151521'
                        }} title={row.isOnline ? 'Online now' : 'Offline'} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem' }}>
                            {v}
                            {row.verified && (
                                <MdVerified style={{ color: '#00d68f', fontSize: '1rem' }} title="KYC Verified User" />
                            )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {row.email !== 'N/A' ? row.email : row.phone}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'gender',
            label: 'Gender',
            render: (v) => (
                <span style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    background: v === 'Woman' ? 'rgba(255, 61, 113, 0.12)' : 'rgba(0, 149, 255, 0.12)',
                    color: v === 'Woman' ? '#ff3d71' : '#0095ff',
                    border: `1px solid ${v === 'Woman' ? 'rgba(255, 61, 113, 0.25)' : 'rgba(0, 149, 255, 0.25)'}`
                }}>
                    {v || 'N/A'}
                </span>
            )
        },
        {
            key: 'age',
            label: 'Age',
            render: (v) => <span style={{ fontWeight: 500 }}>{v ? `${v} yrs` : 'N/A'}</span>
        },
        {
            key: 'membership',
            label: 'Membership',
            render: (v) => {
                let bg = 'rgba(255, 255, 255, 0.05)';
                let color = 'var(--text-secondary)';
                let border = 'rgba(255, 255, 255, 0.1)';

                if (v === 'boost') {
                    bg = 'rgba(0, 149, 255, 0.12)';
                    color = '#0095ff';
                    border = 'rgba(0, 149, 255, 0.3)';
                } else if (v === 'premium') {
                    bg = 'rgba(150, 16, 255, 0.15)';
                    color = '#b44dff';
                    border = 'rgba(150, 16, 255, 0.4)';
                } else if (v === 'lifetime') {
                    bg = 'rgba(255, 170, 0, 0.15)';
                    color = '#ffaa00';
                    border = 'rgba(255, 170, 0, 0.4)';
                }

                return (
                    <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        background: bg,
                        color: color,
                        border: `1px solid ${border}`
                    }}>
                        {v || 'free'}
                    </span>
                );
            }
        },
        {
            key: 'isDeleted',
            label: 'Account Status',
            render: (v) => (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: v ? 'rgba(255, 61, 113, 0.15)' : 'rgba(0, 214, 143, 0.15)',
                    color: v ? '#ff3d71' : '#00d68f',
                    border: `1px solid ${v ? 'rgba(255, 61, 113, 0.3)' : 'rgba(0, 214, 143, 0.3)'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: v ? '#ff3d71' : '#00d68f' }} />
                    {v ? 'Suspended' : 'Active'}
                </span>
            )
        },
        { key: 'createdAt', label: 'Registered' }
    ];

    const renderActions = (row) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
                className="btn btn-primary btn-sm btn-icon"
                title="View Full User Profile"
                onClick={() => setSelectedUser(row)}
                style={{ borderRadius: 'var(--radius-sm)' }}
            >
                <MdVisibility />
            </button>

            {row.isDeleted ? (
                <button
                    className="btn btn-success btn-sm btn-icon"
                    title="Reactivate Account"
                    onClick={() => handleToggleSuspend(row)}
                    disabled={actionLoading}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    <MdCheckCircle />
                </button>
            ) : (
                <button
                    className="btn btn-danger btn-sm btn-icon"
                    title="Suspend Account"
                    onClick={() => handleToggleSuspend(row)}
                    disabled={actionLoading}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    <MdBlock />
                </button>
            )}
        </div>
    );

    return (
        <div>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em' }}>
                        <MdPeople style={{ color: 'var(--primary-light)' }} /> User Directory
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Monitor member profiles, verify KYC documentation status, and enforce account safety controls.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => navigate('/user/add')} 
                        style={{ borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <MdPersonAdd /> Add User
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={fetchUsers} title="Refresh directory" style={{ borderRadius: 'var(--radius-sm)' }}>
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            {/* Stat Summary Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {/* Total Users */}
                <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, rgba(150, 16, 255, 0.12) 0%, rgba(150, 16, 255, 0.03) 100%)', border: '1px solid rgba(150, 16, 255, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Total Members</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-white)', marginTop: 4 }}>{totalCount}</div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', boxShadow: 'var(--shadow-primary)' }}>
                            <MdPeople />
                        </div>
                    </div>
                </div>

                {/* Verified Members */}
                <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, rgba(0, 214, 143, 0.12) 0%, rgba(0, 214, 143, 0.03) 100%)', border: '1px solid rgba(0, 214, 143, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Verified Users</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00d68f', marginTop: 4 }}>{verifiedCount}</div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00d68f 0%, #00b377 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem' }}>
                            <MdVerified />
                        </div>
                    </div>
                </div>

                {/* Premium Paid Subscribers */}
                <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.12) 0%, rgba(255, 170, 0, 0.03) 100%)', border: '1px solid rgba(255, 170, 0, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Premium Plans</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffaa00', marginTop: 4 }}>{premiumCount}</div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ffaa00 0%, #d48800 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem' }}>
                            <MdStar />
                        </div>
                    </div>
                </div>

                {/* Suspended Accounts */}
                <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg, rgba(255, 61, 113, 0.12) 0%, rgba(255, 61, 113, 0.03) 100%)', border: '1px solid rgba(255, 61, 113, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Suspended Accounts</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ff3d71', marginTop: 4 }}>{suspendedCount}</div>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ff3d71 0%, #db2c66 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem' }}>
                            <MdSecurity />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="card" style={{
                marginBottom: 24,
                padding: 20,
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(21, 21, 33, 0.95) 100%)',
                border: '1px solid rgba(150, 16, 255, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-light)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                        <MdFilterList style={{ fontSize: '1.2rem' }} /> Filter & Search Directory
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleResetFilters}
                            className="btn btn-secondary btn-sm"
                            style={{
                                fontSize: '0.78rem',
                                padding: '4px 12px',
                                borderRadius: 20,
                                background: 'rgba(255, 61, 113, 0.12)',
                                color: '#ff3d71',
                                border: '1px solid rgba(255, 61, 113, 0.3)'
                            }}
                        >
                            <MdClose style={{ fontSize: '0.9rem' }} /> Reset Filters
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            position: 'absolute',
                            left: 10,
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: 'rgba(150, 16, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-light)'
                        }}>
                            <MdSearch style={{ fontSize: '1.1rem' }} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: 44,
                                paddingRight: 12,
                                height: 42,
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.88rem',
                                fontWeight: 500
                            }}
                        />
                    </div>

                    {/* Gender Filter Dropdown */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            position: 'absolute',
                            left: 10,
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: 'rgba(0, 149, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0095ff',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}>
                            <MdPerson style={{ fontSize: '1.1rem' }} />
                        </div>
                        <select
                            className="form-select"
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            style={{
                                width: '100%',
                                height: 42,
                                paddingLeft: 44,
                                paddingRight: 36,
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.88rem',
                                fontWeight: 500
                            }}
                        >
                            <option value="">All Genders</option>
                            <option value="man">Man</option>
                            <option value="woman">Woman</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Plan Filter Dropdown */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            position: 'absolute',
                            left: 10,
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: 'rgba(255, 170, 0, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffaa00',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}>
                            <MdStar style={{ fontSize: '1.1rem' }} />
                        </div>
                        <select
                            className="form-select"
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            style={{
                                width: '100%',
                                height: 42,
                                paddingLeft: 44,
                                paddingRight: 36,
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.88rem',
                                fontWeight: 500
                            }}
                        >
                            <option value="">All Membership Plans</option>
                            <option value="free">Free Plan</option>
                            <option value="boost">Boost Plan</option>
                            <option value="premium">Premium Plan</option>
                            <option value="lifetime">Lifetime Plan</option>
                        </select>
                    </div>

                    {/* Account Status Filter Dropdown */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            position: 'absolute',
                            left: 10,
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: 'rgba(0, 214, 143, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#00d68f',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}>
                            <MdSecurity style={{ fontSize: '1.1rem' }} />
                        </div>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '100%',
                                height: 42,
                                paddingLeft: 44,
                                paddingRight: 36,
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: '0.88rem',
                                fontWeight: 500
                            }}
                        >
                            <option value="">All Account Statuses</option>
                            <option value="active">Active Members Only</option>
                            <option value="suspended">Suspended Accounts Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <DataTable columns={columns} data={filteredUsers} loading={loading} actions={renderActions} hideSearch={true} />
            </div>

            {/* Premium Glassmorphism User Profile Detail Modal */}
            {selectedUser && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'var(--shadow-lg)' }}>
                        <button
                            onClick={() => setSelectedUser(null)}
                            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        >
                            <MdClose style={{ fontSize: '1.2rem' }} />
                        </button>

                        {/* Profile Header Banner */}
                        <div style={{ background: 'var(--gradient-card)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.2rem', boxShadow: 'var(--shadow-primary)', overflow: 'hidden', flexShrink: 0, border: '3px solid rgba(255,255,255,0.15)' }}>
                                {selectedUser.photos && selectedUser.photos[0] ? (
                                    <img src={selectedUser.photos[0]} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <MdPerson />
                                )}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {selectedUser.name}
                                    {selectedUser.verified && <MdVerified style={{ color: '#00d68f', fontSize: '1.2rem' }} title="Verified User" />}
                                </h2>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                    <span><MdEmail style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--primary-light)' }} />{selectedUser.email}</span>
                                    <span><MdPhone style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--primary-light)' }} />{selectedUser.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Gender & Age</div>
                                <div style={{ fontWeight: 700, color: 'var(--text-white)', marginTop: 2 }}>{selectedUser.gender} ({selectedUser.age} yrs)</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Membership Plan</div>
                                <div style={{ fontWeight: 700, color: 'var(--primary-light)', textTransform: 'capitalize', marginTop: 2 }}>{selectedUser.membership} Plan</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Work / Occupation</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-white)', marginTop: 2 }}><MdWork style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--primary-light)' }} />{selectedUser.work || 'N/A'}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Education</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-white)', marginTop: 2 }}><MdSchool style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--primary-light)' }} />{selectedUser.education || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Bio / About section */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 20 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>About / Bio</div>
                            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedUser.bio || 'No bio specified by user.'}</div>
                        </div>

                        {/* Interests */}
                        {selectedUser.interests && selectedUser.interests.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Interests & Hobbies</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {selectedUser.interests.map((interest, idx) => (
                                        <span key={idx} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(150, 16, 255, 0.12)', border: '1px solid rgba(150, 16, 255, 0.3)', color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 500 }}>
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 18, borderTop: '1px solid var(--border-color)' }}>
                            {selectedUser.isDeleted ? (
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleToggleSuspend(selectedUser)}
                                    disabled={actionLoading}
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    <MdCheckCircle /> Reactivate Account
                                </button>
                            ) : (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleToggleSuspend(selectedUser)}
                                    disabled={actionLoading}
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    <MdBlock /> Suspend Account
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setSelectedUser(null)} style={{ borderRadius: 'var(--radius-sm)' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
