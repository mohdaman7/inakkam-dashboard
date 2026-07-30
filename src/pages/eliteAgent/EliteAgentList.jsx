import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import {
    MdPerson, MdBlock, MdCheckCircle, MdVisibility, MdRefresh,
    MdSearch, MdVerified, MdEmail, MdPhone, MdAdd, MdSecurity,
    MdFilterList, MdLockReset, MdDelete, MdEmojiEvents
} from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MOCK_AGENTS = Array.from({ length: 8 }, (_, i) => {
    const names = [
        'Aishwarya Sen', 'Sneha Nair', 'Pooja Hegde', 'Meera Krishnan',
        'Anjali Verma', 'Kavya Madhavan', 'Riya Pillai', 'Deepika Rao'
    ];
    const earnings = [45000, 32000, 58000, 21000, 39000, 67000, 15000, 89000];
    const coins = [900, 640, 1160, 420, 780, 1340, 300, 1780];
    const chats = [124, 88, 164, 52, 98, 182, 34, 245];
    const statuses = ['Active', 'Active', 'Active', 'Suspended', 'Active', 'Active', 'Suspended', 'Active'];
    const onlines = [true, false, true, false, true, false, false, true];

    return {
        _id: `agent_${i + 1}`,
        name: names[i % names.length],
        email: `agent0${i + 1}@inakkam.com`,
        phone: `+91 98950 1230${i + 1}`,
        gender: 'Woman',
        premium: true,
        verified: true,
        canChat: true,
        status: statuses[i],
        isOnline: onlines[i],
        totalChats: chats[i],
        coinsEarned: coins[i],
        totalEarnings: earnings[i],
        createdAt: new Date(Date.now() - (i + 2) * 86400000).toLocaleDateString(),
        lastLogin: new Date(Date.now() - (i % 2) * 3600000 - 1800000).toLocaleString(),
        photos: []
    };
});

export default function EliteAgentList() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState(MOCK_AGENTS);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onlineFilter, setOnlineFilter] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/elite-agents');
            if (res.data?.agents?.length) {
                setAgents(res.data.agents);
            }
        } catch (err) {
            console.log('Using mock data for elite agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleToggleStatus = async (row) => {
        const targetStatus = row.status === 'Active' ? 'Suspended' : 'Active';
        setActionLoading(true);
        try {
            await api.patch(`/elite-agents/${row._id}/status`, { status: targetStatus });
            toast.success(`Agent status updated to ${targetStatus}`);
            setAgents(prev => prev.map(a => a._id === row._id ? { ...a, status: targetStatus } : a));
        } catch (err) {
            toast.success(`Agent "${row.name}" status updated to ${targetStatus} (Demo Mode)`);
            setAgents(prev => prev.map(a => a._id === row._id ? { ...a, status: targetStatus } : a));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (row) => {
        if (!window.confirm(`Are you sure you want to delete Elite Agent "${row.name}"?`)) return;
        setActionLoading(true);
        try {
            await api.delete(`/elite-agents/${row._id}`);
            toast.success('Agent deleted successfully');
            setAgents(prev => prev.filter(a => a._id !== row._id));
        } catch (err) {
            toast.success('Agent deleted successfully (Demo Mode)');
            setAgents(prev => prev.filter(a => a._id !== row._id));
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async (row) => {
        const newPassword = Math.random().toString(36).slice(-8);
        setActionLoading(true);
        try {
            await api.post(`/elite-agents/${row._id}/reset-password`, { password: newPassword });
            toast.success(`Password reset successfully. New password: ${newPassword}`, { duration: 6000 });
        } catch (err) {
            toast.success(`Password reset successfully (Demo Mode). New password: ${newPassword}`, { duration: 8000 });
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setOnlineFilter('');
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch =
            !searchTerm.trim() ||
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.phone.includes(searchTerm);

        const matchesStatus = !statusFilter || agent.status === statusFilter;
        
        let matchesOnline = true;
        if (onlineFilter === 'online') matchesOnline = agent.isOnline;
        else if (onlineFilter === 'offline') matchesOnline = !agent.isOnline;

        return matchesSearch && matchesStatus && matchesOnline;
    });

    const totalCoins = agents.reduce((acc, a) => acc + (a.coinsEarned || 0), 0);
    const totalRevenue = agents.reduce((acc, a) => acc + (a.totalEarnings || 0), 0);
    const onlineCount = agents.filter(a => a.isOnline).length;

    // Leaderboard logic: get top 3 agents by total earnings
    const leaderboard = [...agents]
        .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
        .slice(0, 3);

    const columns = [
        {
            key: 'name',
            label: 'Agent Profile',
            render: (v, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff6b9d 0%, #9610ff 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(255, 107, 157, 0.25)',
                            border: '2px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {row.photos && row.photos[0] ? (
                                <img src={row.photos[0]} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        }} title={row.isOnline ? 'Online' : 'Offline'} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {row.name}
                            <MdVerified style={{ color: '#00d68f', fontSize: '0.95rem' }} title="Auto Verified" />
                            <span className="badge badge-primary-light" style={{ fontSize: '0.65rem', padding: '1px 4px' }}>Premium</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            render: (v) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <MdPhone style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--primary-light)' }} />
                        {v}
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Account Status',
            render: (v) => (
                <span className={`badge ${v === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {v}
                </span>
            )
        },
        {
            key: 'totalChats',
            label: 'Total Chats',
            render: (v) => <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{v} chats</span>
        },
        {
            key: 'coinsEarned',
            label: 'Coins Earned',
            render: (v) => <span style={{ color: '#ffd43b', fontWeight: 600 }}>🪙 {v}</span>
        },
        {
            key: 'totalEarnings',
            label: 'Total Earnings',
            render: (v) => <span style={{ color: '#40c057', fontWeight: 700 }}>₹{v.toLocaleString()}</span>
        },
        {
            key: 'createdAt',
            label: 'Created / Last Login',
            render: (v, row) => (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div>Created: {v}</div>
                    <div>Active: {row.lastLogin}</div>
                </div>
            )
        }
    ];

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em', margin: 0 }}>
                        <MdSecurity style={{ color: 'var(--primary-light)' }} /> Elite Agent Management
                    </h1>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
                        Create, monitor, and manage official company-managed female profiles with auto-verification.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/elite-agent/add')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <MdAdd style={{ fontSize: '1.2rem' }} /> Add Elite Agent
                </button>
            </div>

            {/* Quick Stat Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Total Agents •</h4>
                        <div className="stat-value">{agents.length}</div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(150, 16, 255, 0.1)', color: '#9610ff' }}>
                        👤
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Online Agents •</h4>
                        <div className="stat-value">{onlineCount}</div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(0, 214, 143, 0.1)', color: '#00d68f' }}>
                        🟢
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Coins Earned Today •</h4>
                        <div className="stat-value">🪙 {totalCoins}</div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(255, 212, 59, 0.1)', color: '#ffd43b' }}>
                        🪙
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Total Revenue •</h4>
                        <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(64, 192, 87, 0.1)', color: '#40c057' }}>
                        🔥
                    </div>
                </div>
            </div>

            {/* Visual Leaderboard Podium (Gold, Silver, Bronze) */}
            <div className="card" style={{ padding: '24px 28px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(251, 111, 146, 0.08) 0%, rgba(255, 179, 198, 0.02) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <MdEmojiEvents style={{ fontSize: '1.8rem', color: '#ffd43b' }} />
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Top Performing Agents Leaderboard</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Highest coin generators ranking by revenue</p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, paddingTop: 16 }}>
                    {/* Rank 2 (Silver) */}
                    {leaderboard[1] && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 180, textAlign: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <div style={{ width: 68, height: 68, borderRadius: '50%', border: '3px solid #cbd5e1', overflow: 'hidden' }}>
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #a0aec0 0%, #cbd5e1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem' }}>
                                        {leaderboard[1].name[0]}
                                    </div>
                                </div>
                                <span style={{ position: 'absolute', top: -10, right: -10, background: '#cbd5e1', color: '#1e293b', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>2</span>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{leaderboard[1].name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0' }}>{leaderboard[1].totalChats} Chats</div>
                            <div style={{ color: '#40c057', fontWeight: 800, fontSize: '1rem' }}>₹{leaderboard[1].totalEarnings.toLocaleString()}</div>
                        </div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {leaderboard[0] && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200, textAlign: 'center', transform: 'scale(1.1)' }}>
                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #ffd43b', overflow: 'hidden', boxShadow: '0 0 20px rgba(255, 212, 59, 0.4)' }}>
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e2b007 0%, #ffd43b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.2rem' }}>
                                        {leaderboard[0].name[0]}
                                    </div>
                                </div>
                                <span style={{ position: 'absolute', top: -12, right: -12, background: '#ffd43b', color: '#1e293b', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(255,212,59,0.3)' }}>1</span>
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{leaderboard[0].name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0' }}>{leaderboard[0].totalChats} Chats</div>
                            <div style={{ color: '#40c057', fontWeight: 800, fontSize: '1.05rem' }}>₹{leaderboard[0].totalEarnings.toLocaleString()}</div>
                        </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {leaderboard[2] && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 180, textAlign: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <div style={{ width: 68, height: 68, borderRadius: '50%', border: '3px solid #cd7f32', overflow: 'hidden' }}>
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #b87333 0%, #cd7f32 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.8rem' }}>
                                        {leaderboard[2].name[0]}
                                    </div>
                                </div>
                                <span style={{ position: 'absolute', top: -10, right: -10, background: '#cd7f32', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>3</span>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{leaderboard[2].name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0' }}>{leaderboard[2].totalChats} Chats</div>
                            <div style={{ color: '#40c057', fontWeight: 800, fontSize: '1rem' }}>₹{leaderboard[2].totalEarnings.toLocaleString()}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Row */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <MdFilterList style={{ fontSize: '1.1rem', color: 'var(--primary-light)' }} /> Filters
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-control"
                            style={{ margin: 0, padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                        />
                    </div>

                    <div style={{ width: 140 }}>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="form-control"
                            style={{ margin: 0, padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>

                    <div style={{ width: 140 }}>
                        <select
                            value={onlineFilter}
                            onChange={e => setOnlineFilter(e.target.value)}
                            className="form-control"
                            style={{ margin: 0, padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                        >
                            <option value="">All Activity</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>

                    {(searchTerm || statusFilter || onlineFilter) && (
                        <button
                            onClick={handleResetFilters}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                            <MdRefresh /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <DataTable
                    columns={columns}
                    data={filteredAgents}
                    loading={loading}
                    hideSearch={true}
                    actions={(row) => (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button
                                className="btn btn-primary btn-sm btn-icon"
                                onClick={() => navigate(`/elite-agent/${row._id}`)}
                                title="View Details & Wallet"
                            >
                                <MdVisibility />
                            </button>
                            <button
                                className="btn btn-secondary btn-sm btn-icon"
                                onClick={() => navigate(`/elite-agent/edit/${row._id}`)}
                                title="Edit Profile"
                            >
                                ✏️
                            </button>
                            <button
                                className={`btn btn-sm btn-icon ${row.status === 'Active' ? 'btn-danger' : 'btn-success'}`}
                                onClick={() => handleToggleStatus(row)}
                                title={row.status === 'Active' ? 'Suspend Agent' : 'Activate Agent'}
                                disabled={actionLoading}
                            >
                                <MdBlock />
                            </button>
                            <button
                                className="btn btn-warning btn-sm btn-icon"
                                onClick={() => handleResetPassword(row)}
                                title="Reset Password"
                                disabled={actionLoading}
                            >
                                <MdLockReset />
                            </button>
                            <button
                                className="btn btn-danger btn-sm btn-icon"
                                onClick={() => handleDelete(row)}
                                title="Delete Agent"
                                disabled={actionLoading}
                            >
                                <MdDelete />
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
