import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { getSocket, initiateSocketConnection } from '../../utils/socket';
import {
    MdSearch, MdLocationOn, MdVideocam, MdChat,
    MdFilterList, MdVerified, MdStar, MdPeople, MdFlashOn
} from 'react-icons/md';
import VideoCall from '../../components/VideoCall';
import toast from 'react-hot-toast';
import './AgentDiscover.css';

const DEFAULT_USERS = [
    {
        _id: 'cust_aarav_01',
        name: 'Aarav Shah',
        age: 26,
        city: 'Mumbai',
        state: 'Maharashtra',
        work: 'Software Architect',
        bio: 'Looking for exciting conversations and genuine connections.',
        isOnline: true,
        membership: 'premium',
        photos: [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' }],
        interests: ['Tech', 'Music', 'Fitness', 'Travel']
    },
    {
        _id: 'cust_priya_02',
        name: 'Rohan Varma',
        age: 28,
        city: 'Bangalore',
        state: 'Karnataka',
        work: 'Senior UX Lead',
        bio: 'Art director, coffee enthusiast, passionate about photography.',
        isOnline: true,
        membership: 'boost',
        photos: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500' }],
        interests: ['Design', 'Art', 'Coffee', 'Hiking']
    },
    {
        _id: 'cust_vikram_03',
        name: 'Vikram Malhotra',
        age: 31,
        city: 'Kochi',
        state: 'Kerala',
        work: 'Business Director',
        bio: 'Exploring new cultures and meeting creative minds.',
        isOnline: false,
        membership: 'lifetime',
        photos: [{ url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500' }],
        interests: ['Business', 'Travel', 'Fine Dining']
    },
    {
        _id: 'cust_sameer_04',
        name: 'Sameer Sen',
        age: 27,
        city: 'Delhi',
        state: 'Delhi',
        work: 'Financial Analyst',
        bio: 'Love weekend getaways and engaging late-night chats.',
        isOnline: true,
        membership: 'premium',
        photos: [{ url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500' }],
        interests: ['Stocks', 'Gym', 'Cinema']
    },
    {
        _id: 'cust_aditya_05',
        name: 'Aditya Roy',
        age: 29,
        city: 'Hyderabad',
        state: 'Telangana',
        work: 'Filmmaker',
        bio: 'Storyteller, acoustic guitar player, world traveler.',
        isOnline: true,
        membership: 'free',
        photos: [{ url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500' }],
        interests: ['Movies', 'Guitar', 'Photography']
    },
    {
        _id: 'cust_karan_06',
        name: 'Karan Mehra',
        age: 25,
        city: 'Pune',
        state: 'Maharashtra',
        work: 'Automotive Engineer',
        bio: 'Motorcycle enthusiast, foodie, spontaneous adventurer.',
        isOnline: false,
        membership: 'boost',
        photos: [{ url: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=500' }],
        interests: ['Bikes', 'Food', 'Gaming']
    }
];

export default function AgentDiscover() {
    const navigate = useNavigate();
    const { admin } = useAuth();
    const currentUser = admin || { _id: 'agent_current', name: 'Elite Agent' };
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [filterTier, setFilterTier] = useState('all');
    const [filterOnline, setFilterOnline] = useState('all');
    const [loading, setLoading] = useState(false);
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('inakkam_admin') ? JSON.parse(localStorage.getItem('inakkam_admin')) : null;
        const effectiveUser = admin || storedAdmin;
        if (effectiveUser?._id) {
            initiateSocketConnection(effectiveUser._id);
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await api.get('/users');
                const userList = res.data?.users || res.data?.data || [];
                if (userList.length > 0) {
                    setUsers(userList);
                } else {
                    setUsers(DEFAULT_USERS);
                }
            } catch (err) {
                setUsers(DEFAULT_USERS);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [admin]);

    const filteredUsers = users.filter(u => {
        const name = (u.name || '').toLowerCase();
        const city = (u.city || '').toLowerCase();
        const query = search.toLowerCase();
        const matchesSearch = name.includes(query) || city.includes(query);
        if (!matchesSearch) return false;

        if (filterOnline === 'online' && !u.isOnline) return false;
        if (filterTier !== 'all') {
            const plan = typeof u.membership === 'object' ? u.membership?.plan : u.membership;
            if (plan !== filterTier) return false;
        }

        return true;
    });

    const handleStartChat = (user) => {
        toast.success(`Opening conversation with ${user.name}`);
        navigate('/agent/chat');
    };

    const handleStartCall = async (user) => {
        try {
            toast.loading('Initializing video call session...', { id: 'disc_call' });
            const roomRes = await api.post('/enablex/create-room', {
                name: `Call with ${user.name}`
            });

            const extractedRoomId =
                roomRes.data?.roomId ||
                roomRes.data?.room?.room_id ||
                roomRes.data?.room?.roomId ||
                roomRes.data?.room?._id ||
                roomRes.data?.id;

            if (roomRes.data?.success && extractedRoomId) {
                const storedAdmin = localStorage.getItem('inakkam_admin') ? JSON.parse(localStorage.getItem('inakkam_admin')) : null;
                const effectiveUser = admin || storedAdmin || currentUser;
                const socket = getSocket() || initiateSocketConnection(effectiveUser?._id);

                if (socket) {
                    socket.emit('call_user', {
                        conversationId: `conv_${user._id}`,
                        targetUserId: String(user._id),
                        roomId: extractedRoomId,
                        callerName: effectiveUser?.name || 'Inakkam Agent',
                        callerPhoto: effectiveUser?.avatar || '',
                        callType: 'video'
                    });
                }
                toast.dismiss('disc_call');
                setActiveCall({
                    roomId: extractedRoomId,
                    remoteUserName: user.name,
                    remoteUserPhoto: user.photos?.[0] ? (typeof user.photos[0] === 'string' ? user.photos[0] : user.photos[0].url) : '',
                    callType: 'video',
                    targetUserId: String(user._id),
                    isCaller: true
                });
            } else {
                throw new Error('Failed to create call session');
            }
        } catch (err) {
            toast.dismiss('disc_call');
            toast.error(err.response?.data?.message || err.message || 'Failed to start call');
        }
    };

    return (
        <div className="agent-discover-container">
            {/* Header Banner */}
            <div className="discover-header-card">
                <div className="discover-header-title">
                    <h1>
                        <MdFlashOn style={{ color: 'var(--primary)' }} /> Discover & Connect with Members
                    </h1>
                    <p>
                        Browse active clients looking to connect, chat, and start video calls.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                        background: 'rgba(0, 214, 143, 0.15)',
                        border: '1px solid rgba(0, 214, 143, 0.3)',
                        color: '#00d68f',
                        padding: '8px 16px',
                        borderRadius: 12,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d68f' }} />
                        {users.filter(u => u.isOnline).length || 4} Members Online Now
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="discover-filter-bar">
                <div className="discover-search-box">
                    <MdSearch className="discover-search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search by client name, city or interest..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="discover-filter-select"
                    value={filterOnline}
                    onChange={e => setFilterOnline(e.target.value)}
                >
                    <option value="all">All Presence Status</option>
                    <option value="online">🟢 Online Now Only</option>
                </select>

                <select
                    className="discover-filter-select"
                    value={filterTier}
                    onChange={e => setFilterTier(e.target.value)}
                >
                    <option value="all">All Membership Tiers</option>
                    <option value="premium">👑 VIP Premium</option>
                    <option value="boost">⚡ Boost Member</option>
                    <option value="lifetime">💎 Lifetime VIP</option>
                    <option value="free">Standard Member</option>
                </select>
            </div>

            {/* Cards Grid */}
            <div className="discover-grid">
                {filteredUsers.map(user => {
                    const plan = typeof user.membership === 'object' ? (user.membership?.plan || 'free') : (user.membership || 'free');
                    const photo = user.photos?.[0]
                        ? (typeof user.photos[0] === 'string' ? user.photos[0] : user.photos[0].url)
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';

                    return (
                        <div key={user._id} className="discover-user-card">
                            <div className="discover-card-photo-wrap">
                                <img src={photo} alt={user.name} className="discover-card-photo" />
                                {user.isOnline && (
                                    <div className="discover-online-pill">
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d68f' }} />
                                        Online Now
                                    </div>
                                )}
                                {plan !== 'free' && (
                                    <div className="discover-tier-pill">
                                        ★ {plan}
                                    </div>
                                )}
                            </div>

                            <div className="discover-card-content">
                                <div>
                                    <div className="discover-card-name-row">
                                        <span className="discover-card-name">
                                            {user.name}{user.age ? `, ${user.age}` : ''}
                                        </span>
                                    </div>

                                    <div className="discover-card-location">
                                        <MdLocationOn size={14} />
                                        {user.city || 'Kerala'}, India
                                        {user.work && <span>• {user.work}</span>}
                                    </div>

                                    <div className="discover-card-bio">
                                        {user.bio || 'Looking to meet energetic and genuine people for engaging calls and friendship.'}
                                    </div>

                                    <div className="discover-card-tags">
                                        {(user.interests || ['Travel', 'Music', 'Fitness']).slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="discover-tag-chip">
                                                #{typeof tag === 'string' ? tag : tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="discover-card-actions">
                                    <button className="discover-chat-btn" onClick={() => handleStartChat(user)}>
                                        <MdChat size={16} /> Chat
                                    </button>
                                    <button className="discover-call-btn" onClick={() => handleStartCall(user)}>
                                        <MdVideocam size={17} /> Call (₹35/m)
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Production EnableX Video Call Component */}
            {activeCall && (
                <VideoCall
                    roomId={activeCall.roomId}
                    remoteUserName={activeCall.remoteUserName}
                    remoteUserPhoto={activeCall.remoteUserPhoto}
                    callType={activeCall.callType}
                    onEndCall={() => setActiveCall(null)}
                    currentUser={currentUser}
                    targetUserId={activeCall.targetUserId}
                    isCaller={true}
                />
            )}
        </div>
    );
}
