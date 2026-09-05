import { useState } from 'react';
import {
    MdVideocam, MdCall, MdMonetizationOn, MdAccessTime,
    MdCheckCircle, MdPerson, MdPhoneCallback
} from 'react-icons/md';
import AgentVideoCallModal from './AgentVideoCallModal';
import toast from 'react-hot-toast';
import './AgentCallLogs.css';

const SAMPLE_LOGS = [
    {
        id: 'cl_101',
        callerName: 'Aarav Shah',
        callerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        city: 'Mumbai',
        type: '1-on-1 Video Call',
        duration: '14 mins 20 secs',
        coinsEarned: 500,
        rupeesEarned: '₹166.60',
        timestamp: 'Today, 01:45 PM',
        status: 'Completed'
    },
    {
        id: 'cl_102',
        callerName: 'Rohan Varma',
        callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        city: 'Bangalore',
        type: '1-on-1 Video Call',
        duration: '22 mins 10 secs',
        coinsEarned: 775,
        rupeesEarned: '₹258.33',
        timestamp: 'Today, 11:20 AM',
        status: 'Completed'
    },
    {
        id: 'cl_103',
        callerName: 'Vikram Malhotra',
        callerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        city: 'Kochi',
        type: '1-on-1 Video Call',
        duration: '08 mins 45 secs',
        coinsEarned: 305,
        rupeesEarned: '₹101.66',
        timestamp: 'Yesterday, 09:15 PM',
        status: 'Completed'
    },
    {
        id: 'cl_104',
        callerName: 'Sameer Sen',
        callerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
        city: 'Delhi',
        type: '1-on-1 Video Call',
        duration: '31 mins 00 secs',
        coinsEarned: 1085,
        rupeesEarned: '₹361.66',
        timestamp: 'Yesterday, 04:30 PM',
        status: 'Completed'
    }
];

export default function AgentCallLogs() {
    const [callingUser, setCallingUser] = useState(null);

    const handleCallback = (log) => {
        setCallingUser({
            name: log.callerName,
            photos: [{ url: log.callerAvatar }]
        });
    };

    return (
        <div className="call-logs-container">
            {/* Top Stat Metrics */}
            <div className="call-logs-stats-bar">
                <div className="call-stat-card">
                    <div className="call-stat-icon-box pink">
                        <MdVideocam />
                    </div>
                    <div className="call-stat-meta">
                        <span className="call-stat-label">Video Call Time</span>
                        <h3 className="call-stat-value">76.2 hrs</h3>
                    </div>
                </div>

                <div className="call-stat-card">
                    <div className="call-stat-icon-box gold">
                        <MdMonetizationOn />
                    </div>
                    <div className="call-stat-meta">
                        <span className="call-stat-label">Today's Coins</span>
                        <h3 className="call-stat-value">2,665</h3>
                    </div>
                </div>

                <div className="call-stat-card">
                    <div className="call-stat-icon-box green">
                        <MdCheckCircle />
                    </div>
                    <div className="call-stat-meta">
                        <span className="call-stat-label">Satisfaction</span>
                        <h3 className="call-stat-value">98.4%</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="call-logs-table-card">
                <div className="call-table-header">
                    <h2>
                        <span>📞</span> Recent Video Call Sessions
                    </h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', margin: 0 }}>
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Call Session</th>
                                <th>Duration</th>
                                <th>Coins Earned</th>
                                <th>Rupee Value</th>
                                <th>Date & Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SAMPLE_LOGS.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img
                                                src={log.callerAvatar}
                                                alt={log.callerName}
                                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-color)' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{log.callerName}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.city}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            <MdAccessTime size={14} /> {log.duration}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: '#ffd43b', fontWeight: 800, fontSize: '0.9rem' }}>
                                            +{log.coinsEarned}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: '#00d68f', fontWeight: 800, fontSize: '0.88rem' }}>
                                            {log.rupeesEarned}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {log.timestamp}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleCallback(log)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}
                                        >
                                            <MdPhoneCallback /> Call Back
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Video Call Modal */}
            <AgentVideoCallModal
                isOpen={Boolean(callingUser)}
                onClose={() => setCallingUser(null)}
                targetUser={callingUser}
                onEarningsEarned={(coins) => {
                    toast.success(`🎉 Earned +${coins} coins from video session!`, { icon: '💰' });
                }}
            />
        </div>
    );
}
