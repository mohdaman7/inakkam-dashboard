import { useState, useEffect } from 'react';
import api from '../utils/api';

const statCards = [
    { key: 'interests', label: 'Interest', icon: '❤️', color: '#ff6b9d' },
    { key: 'languages', label: 'Language', icon: '💬', color: '#9610ff' },
    { key: 'religions', label: 'Religion', icon: '📖', color: '#4dabf7' },
    { key: 'relationGoals', label: 'Relation Goal', icon: '💜', color: '#cc5de8' },
    { key: 'faqs', label: 'FAQ', icon: '💬', color: '#ff6b6b' },
    { key: 'plans', label: 'Plan', icon: '⭐', color: '#ffd43b' },
    { key: 'users', label: 'Total Users', icon: '👤', color: '#40c057' },
    { key: 'pages', label: 'Total Pages', icon: '📄', color: '#ff8c42' },
    { key: 'gifts', label: 'Total Gift', icon: '🎁', color: '#20c997' },
    { key: 'packages', label: 'Total Package', icon: '👑', color: '#ffd43b' },
    { key: 'maleUsers', label: 'Total Male', icon: '👨', color: '#4dabf7' },
    { key: 'femaleUsers', label: 'Total Female', icon: '👩', color: '#ff6b9d' },
    { key: 'fakeUsers', label: 'Total Fake User', icon: '🎭', color: '#40c057' },
    { key: 'earnings', label: 'Total Earning', icon: '🔥', color: '#ff6b35', format: 'money' },
];

// Demo static data (will be replaced by real API)
const DEMO_STATS = {
    interests: 9, languages: 13, religions: 12, relationGoals: 7,
    faqs: 10, plans: 3, users: 1431, pages: 4,
    gifts: 10, packages: 3, maleUsers: 1219, femaleUsers: 173,
    fakeUsers: 0, earnings: 15740,
};

export default function Dashboard() {
    const [stats, setStats] = useState(DEMO_STATS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/stats')
            .then(res => {
                if (res.data?.stats) setStats(res.data.stats);
            })
            .catch(() => {
                // Use demo data silently
            });
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Report Data</h1>
            </div>

            <div className="stats-grid">
                {statCards.map((card) => (
                    <StatCard
                        key={card.key}
                        label={card.label}
                        value={stats[card.key] ?? 0}
                        icon={card.icon}
                        color={card.color}
                        format={card.format}
                    />
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, format }) {
    const displayValue = format === 'money' ? `₹${(value || 0).toLocaleString()}` : (value ?? 0).toLocaleString();

    return (
        <div className="stat-card">
            <div className="stat-info">
                <h4>{label} •</h4>
                <div className="stat-value">{displayValue}</div>
            </div>
            <div className="stat-icon" style={{ background: `${color}18`, color }}>
                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{icon}</span>
            </div>
        </div>
    );
}
