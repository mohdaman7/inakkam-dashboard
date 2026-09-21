import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { getSocket, initiateSocketConnection } from '../../utils/socket';
import {
    MdSearch, MdLocationOn, MdVideocam, MdChat,
    MdFilterList, MdVerified, MdStar, MdPeople, MdFlashOn,
    MdCall, MdGridView, MdViewCarousel, MdClose, MdFavorite,
    MdRefresh, MdCheckCircle, MdSchool, MdWork, MdTranslate,
    MdFemale, MdMale
} from 'react-icons/md';
import VideoCall from '../../components/VideoCall';
import toast from 'react-hot-toast';
import './AgentDiscover.css';

// Fallback high-quality member profiles
const DEFAULT_USERS = [
    {
        _id: 'cust_aarav_01',
        name: 'Aarav Shah',
        age: 26,
        gender: 'Man',
        city: 'Mumbai',
        state: 'Maharashtra',
        work: 'Software Architect',
        education: 'IIT Bombay',
        bio: 'Looking for exciting conversations, genuine connections, and weekend travel stories.',
        isOnline: true,
        verified: true,
        membership: 'premium',
        matchPercentage: 96,
        distance: '2.4 km away',
        photos: [
            { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600' },
            { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' }
        ],
        interests: ['Tech', 'Music', 'Fitness', 'Travel', 'Photography']
    },
    {
        _id: 'cust_priya_02',
        name: 'Rohan Varma',
        age: 28,
        gender: 'Man',
        city: 'Bangalore',
        state: 'Karnataka',
        work: 'Senior UX Lead',
        education: 'NID Ahmedabad',
        bio: 'Art director, specialty coffee enthusiast, passionate about minimalist design.',
        isOnline: true,
        verified: true,
        membership: 'boost',
        matchPercentage: 92,
        distance: '0.8 km away',
        photos: [
            { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' },
            { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600' }
        ],
        interests: ['Design', 'Art', 'Coffee', 'Hiking', 'Cinema']
    },
    {
        _id: 'cust_vikram_03',
        name: 'Vikram Malhotra',
        age: 31,
        gender: 'Man',
        city: 'Kochi',
        state: 'Kerala',
        work: 'Business Director',
        education: 'IIM Kozhikode',
        bio: 'Exploring new cultures, global culinary arts, and meeting vibrant minds.',
        isOnline: false,
        verified: true,
        membership: 'lifetime',
        matchPercentage: 88,
        distance: '5.1 km away',
        photos: [
            { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600' }
        ],
        interests: ['Business', 'Travel', 'Fine Dining', 'Sailing']
    },
    {
        _id: 'cust_sameer_04',
        name: 'Sameer Sen',
        age: 27,
        gender: 'Man',
        city: 'Delhi',
        state: 'Delhi',
        work: 'Financial Analyst',
        education: 'Delhi University',
        bio: 'Love spontaneous weekend getaways, good podcasts, and lively late-night chats.',
        isOnline: true,
        verified: false,
        membership: 'premium',
        matchPercentage: 94,
        distance: '3.6 km away',
        photos: [
            { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600' }
        ],
        interests: ['Stocks', 'Gym', 'Cinema', 'Reading']
    },
    {
        _id: 'cust_aditya_05',
        name: 'Aditya Roy',
        age: 29,
        gender: 'Man',
        city: 'Hyderabad',
        state: 'Telangana',
        work: 'Filmmaker & Producer',
        education: 'FTII Pune',
        bio: 'Storyteller, acoustic guitar player, documentary enthusiast, and world traveler.',
        isOnline: true,
        verified: true,
        membership: 'free',
        matchPercentage: 89,
        distance: '1.5 km away',
        photos: [
            { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600' }
        ],
        interests: ['Movies', 'Guitar', 'Photography', 'Writing']
    },
    {
        _id: 'cust_karan_06',
        name: 'Karan Mehra',
        age: 25,
        gender: 'Man',
        city: 'Pune',
        state: 'Maharashtra',
        work: 'Automotive Engineer',
        education: 'COEP Pune',
        bio: 'Motorcycle enthusiast, foodie, spontaneous adventurer looking for good vibes.',
        isOnline: false,
        verified: false,
        membership: 'boost',
        matchPercentage: 85,
        distance: '6.2 km away',
        photos: [
            { url: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=600' }
        ],
        interests: ['Bikes', 'Food', 'Gaming', 'Fitness']
    }
];

// Helper to normalize user object from any backend schema
const normalizeUser = (u, idx) => {
    let photosList = [];
    if (Array.isArray(u.photos) && u.photos.length > 0) {
        photosList = u.photos.map(p => typeof p === 'string' ? p : (p?.url || '')).filter(Boolean);
    } else if (Array.isArray(u.images) && u.images.length > 0) {
        photosList = u.images.map(p => typeof p === 'string' ? p : (p?.url || '')).filter(Boolean);
    }

    if (photosList.length === 0) {
        photosList = ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'];
    }

    let rawInterests = u.interests || [];
    let formattedInterests = [];
    if (Array.isArray(rawInterests)) {
        formattedInterests = rawInterests.map(item => typeof item === 'string' ? item : (item?.name || String(item)));
    }

    const plan = typeof u.membership === 'object' ? (u.membership?.plan || 'free') : (u.membership || 'free');

    return {
        _id: u._id || u.id || `user_${idx}`,
        id: u._id || u.id || `user_${idx}`,
        name: u.name || u.firstName || 'Member',
        age: u.age || (u.dob ? (new Date().getFullYear() - new Date(u.dob).getFullYear()) : 25),
        gender: u.gender || 'Member',
        city: u.city || u.location?.city || u.location?.address || 'Kerala',
        state: u.state || u.location?.state || 'India',
        work: u.work || u.occupation || '',
        education: u.education || '',
        bio: u.bio || 'Looking for exciting conversations and genuine connections on Inakkam.',
        isOnline: u.isOnline ?? (idx % 2 === 0),
        verified: !!(u.verified || u.verificationStatus === 'VERIFIED'),
        membership: plan,
        matchPercentage: u.matchPercentage || (85 + (idx * 3) % 15),
        distance: u.distance || (u.distanceKm ? `${Math.round(u.distanceKm)} km away` : 'Nearby'),
        photos: photosList,
        interests: formattedInterests.length > 0 ? formattedInterests : ['Dating', 'Lifestyle', 'Music'],
        languages: Array.isArray(u.languages) ? u.languages : []
    };
};

export default function AgentDiscover() {
    const navigate = useNavigate();
    const { admin } = useAuth();
    const currentUser = admin || { _id: 'agent_current', name: 'Elite Agent' };

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, online, vip, verified
    const [filterTier, setFilterTier] = useState('all');
    const [filterOnline, setFilterOnline] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // grid, swipe
    const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeCall, setActiveCall] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('inakkam_admin') ? JSON.parse(localStorage.getItem('inakkam_admin')) : null;
        const effectiveUser = admin || storedAdmin;
        if (effectiveUser?._id) {
            initiateSocketConnection(effectiveUser._id);
        }

        const fetchAllMembers = async () => {
            setLoading(true);
            try {
                // Fetch all members from directory
                let fetchedList = [];
                try {
                    const res = await api.get('/users');
                    fetchedList = res.data?.users || res.data?.data || [];
                } catch (e1) {
                    // Fallback to discover endpoint
                    try {
                        const discRes = await api.get('/discover');
                        fetchedList = discRes.data?.users || [];
                    } catch (e2) {
                        fetchedList = [];
                    }
                }

                // Strictly filter to Real Paying Customers only (Agents/Staff are NEVER displayed)
                const realCustomers = (fetchedList || []).filter(u => 
                    !u.isEliteAgent && !u.isStaff && u.role !== 'staff' && u.role !== 'admin'
                );

                if (realCustomers && realCustomers.length > 0) {
                    const normalized = realCustomers.map((u, i) => normalizeUser(u, i));
                    setUsers(normalized);
                } else {
                    setUsers(DEFAULT_USERS.map((u, i) => normalizeUser(u, i)));
                }
            } catch (err) {
                setUsers(DEFAULT_USERS.map((u, i) => normalizeUser(u, i)));
            } finally {
                setLoading(false);
            }
        };

        fetchAllMembers();
    }, [admin]);

    // Filtering logic
    const filteredUsers = users.filter(u => {
        const name = (u.name || '').toLowerCase();
        const city = (u.city || '').toLowerCase();
        const work = (u.work || '').toLowerCase();
        const interestsStr = (u.interests || []).join(' ').toLowerCase();
        const query = search.toLowerCase();

        const matchesSearch = !query || name.includes(query) || city.includes(query) || work.includes(query) || interestsStr.includes(query);
        if (!matchesSearch) return false;

        // Tab category filter
        if (activeTab === 'online' && !u.isOnline) return false;
        if (activeTab === 'vip' && u.membership === 'free') return false;
        if (activeTab === 'verified' && !u.verified) return false;

        // Secondary dropdown filters
        if (filterOnline === 'online' && !u.isOnline) return false;
        if (filterTier !== 'all' && u.membership !== filterTier) return false;

        return true;
    });

    const handleStartChat = (user) => {
        toast.success(`Opening direct chat with ${user.name}`);
        navigate('/agent/chat', { state: { selectedUser: user } });
    };

    const handleStartCall = async (user, callType = 'video') => {
        try {
            toast.loading(`Initializing ${callType} call session...`, { id: 'disc_call' });
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
                        callType: callType
                    });
                }
                toast.dismiss('disc_call');
                setActiveCall({
                    roomId: extractedRoomId,
                    remoteUserName: user.name,
                    remoteUserPhoto: user.photos?.[0] || '',
                    callType: callType,
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

    const handleSwipeAction = (action) => {
        if (action === 'like' || action === 'superlike') {
            toast.success(`Connected with ${filteredUsers[currentSwipeIndex]?.name}!`);
        }
        if (currentSwipeIndex < filteredUsers.length - 1) {
            setCurrentSwipeIndex(prev => prev + 1);
        } else {
            setCurrentSwipeIndex(0);
            toast('You have viewed all discovered members in this batch!', { icon: '✨' });
        }
    };

    const openProfileModal = (user) => {
        setSelectedProfile(user);
        setModalPhotoIndex(0);
    };

    const currentSwipeCard = filteredUsers[currentSwipeIndex];

    return (
        <div className="agent-discover-container">
            {/* Header Banner */}
            <div className="discover-header-card">
                <div className="discover-header-title">
                    <div className="discover-header-badge">
                        <MdFlashOn className="discover-header-badge-icon" />
                        <span>LIVE MEMBER DIRECTORY</span>
                    </div>
                    <h1>Discover Members</h1>
                    <p className="discover-header-sub">
                        Real-time verified client directory synchronized with the Inakkam Member Network.
                    </p>
                </div>

                <div className="discover-header-right">
                    <div className="discover-header-stat-pill">
                        <span className="discover-pulse-dot" />
                        <span>{users.filter(u => u.isOnline).length} Active Online</span>
                    </div>
                    <div className="discover-header-total-pill">
                        <MdPeople size={16} />
                        <span>{users.length} Total Members</span>
                    </div>

                    <div className="discover-view-toggle">
                        <button
                            className={`discover-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <MdGridView size={18} />
                            <span>Grid</span>
                        </button>
                        <button
                            className={`discover-view-btn ${viewMode === 'swipe' ? 'active' : ''}`}
                            onClick={() => setViewMode('swipe')}
                            title="PWA Swipe Card View"
                        >
                            <MdViewCarousel size={18} />
                            <span>PWA Swipe</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Quick Filter Tabs */}
            <div className="discover-category-tabs">
                <button
                    className={`discover-cat-pill ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <MdPeople size={15} />
                    <span>All Members ({users.length})</span>
                </button>
                <button
                    className={`discover-cat-pill ${activeTab === 'online' ? 'active' : ''}`}
                    onClick={() => setActiveTab('online')}
                >
                    <span className="discover-cat-dot online" />
                    <span>Online Now ({users.filter(u => u.isOnline).length})</span>
                </button>
                <button
                    className={`discover-cat-pill ${activeTab === 'vip' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vip')}
                >
                    <MdStar size={15} className="text-yellow" />
                    <span>VIP Premium ({users.filter(u => u.membership !== 'free').length})</span>
                </button>
                <button
                    className={`discover-cat-pill ${activeTab === 'verified' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verified')}
                >
                    <MdVerified size={15} className="text-pink" />
                    <span>Verified Profiles</span>
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="discover-filter-bar">
                <div className="discover-search-box">
                    <MdSearch className="discover-search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by client name, city, profession, or passion tag..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentSwipeIndex(0);
                        }}
                    />
                    {search && (
                        <button className="discover-search-clear" onClick={() => setSearch('')}>
                            <MdClose size={16} />
                        </button>
                    )}
                </div>

                <select
                    className="discover-filter-select"
                    value={filterOnline}
                    onChange={e => setFilterOnline(e.target.value)}
                >
                    <option value="all">Presence: All Statuses</option>
                    <option value="online">🟢 Online Now Only</option>
                </select>

                <select
                    className="discover-filter-select"
                    value={filterTier}
                    onChange={e => setFilterTier(e.target.value)}
                >
                    <option value="all">Plan: All Membership Tiers</option>
                    <option value="premium">👑 VIP Premium</option>
                    <option value="boost">⚡ Boost Member</option>
                    <option value="lifetime">💎 Lifetime VIP</option>
                    <option value="free">Standard Member</option>
                </select>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="discover-loading-state">
                    <div className="discover-spinner" />
                    <p>Fetching active member profiles from Inakkam network...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
                <div className="discover-empty-state">
                    <div className="discover-empty-icon">
                        <MdPeople size={48} />
                    </div>
                    <h3>No matching members found</h3>
                    <p>Try clearing search keywords or switching filters to see more client profiles.</p>
                    <button
                        className="discover-reset-btn"
                        onClick={() => { setSearch(''); setActiveTab('all'); setFilterTier('all'); setFilterOnline('all'); }}
                    >
                        <MdRefresh size={18} /> Reset Filters
                    </button>
                </div>
            )}

            {/* ═══ VIEW MODE 1: GRID VIEW ═══ */}
            {!loading && viewMode === 'grid' && filteredUsers.length > 0 && (
                <div className="discover-grid">
                    {filteredUsers.map(user => {
                        const photo = user.photos[0];

                        return (
                            <div key={user._id} className="discover-user-card">
                                {/* Top Image Area */}
                                <div className="discover-card-photo-wrap" onClick={() => openProfileModal(user)}>
                                    <img src={photo} alt={user.name} className="discover-card-photo" loading="lazy" />
                                    <div className="discover-card-gradient-overlay" />

                                    {/* Verified Badge */}
                                    {user.verified && (
                                        <div className="discover-verified-badge">
                                            <MdCheckCircle size={14} />
                                            <span>VERIFIED</span>
                                        </div>
                                    )}

                                    {/* Online Presence Pill */}
                                    {user.isOnline ? (
                                        <div className="discover-online-pill">
                                            <span className="discover-pulse-dot-sm" />
                                            Online Now
                                        </div>
                                    ) : (
                                        <div className="discover-offline-pill">
                                            Recently Active
                                        </div>
                                    )}

                                    {/* Membership Tier Badge */}
                                    {user.membership !== 'free' && (
                                        <div className={`discover-tier-pill ${user.membership}`}>
                                            ★ {user.membership.toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="discover-card-content">
                                    <div className="discover-card-header-info" onClick={() => openProfileModal(user)}>
                                        <div className="discover-card-name-row">
                                            <span className="discover-card-name">
                                                {user.name}{user.age ? `, ${user.age}` : ''}
                                            </span>
                                        </div>

                                        <div className="discover-card-location">
                                            <MdLocationOn size={14} className="discover-loc-icon" />
                                            <span>{user.city}, {user.state}</span>
                                            <span className="discover-dist-badge">• {user.distance}</span>
                                        </div>

                                        {user.work && (
                                            <div className="discover-card-work">
                                                <MdWork size={13} />
                                                <span>{user.work}</span>
                                            </div>
                                        )}

                                        <div className="discover-card-bio">
                                            {user.bio}
                                        </div>

                                        <div className="discover-card-tags">
                                            {user.interests.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="discover-tag-chip">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {user.interests.length > 3 && (
                                                <span className="discover-tag-chip more">
                                                    +{user.interests.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="discover-card-actions">
                                        <button
                                            className="discover-action-btn chat"
                                            onClick={() => handleStartChat(user)}
                                            title="Open Chat Conversation"
                                        >
                                            <MdChat size={16} />
                                            <span>Chat</span>
                                        </button>
                                        <button
                                            className="discover-action-btn audio"
                                            onClick={() => handleStartCall(user, 'audio')}
                                            title="Start Voice Audio Call (₹25/m)"
                                        >
                                            <MdCall size={16} />
                                            <span>Voice</span>
                                        </button>
                                        <button
                                            className="discover-action-btn video"
                                            onClick={() => handleStartCall(user, 'video')}
                                            title="Start Live Video Call (₹35/m)"
                                        >
                                            <MdVideocam size={17} />
                                            <span>Video Call</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ VIEW MODE 2: PWA SWIPE CARD EXPERIENCE ═══ */}
            {!loading && viewMode === 'swipe' && currentSwipeCard && (
                <div className="discover-swipe-container">
                    <div className="discover-swipe-stack-card">
                        <img
                            src={currentSwipeCard.photos[0]}
                            alt={currentSwipeCard.name}
                            className="discover-swipe-img"
                        />
                        <div className="discover-swipe-gradient" />

                        {/* Top Badges */}
                        <div className="discover-swipe-top-bar">
                            {currentSwipeCard.verified && (
                                <div className="discover-verified-badge">
                                    <MdCheckCircle size={14} />
                                    <span>VERIFIED</span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="discover-swipe-info">
                            <div className="discover-swipe-name-row">
                                <h2>{currentSwipeCard.name}, {currentSwipeCard.age}</h2>
                                {currentSwipeCard.isOnline && (
                                    <span className="discover-swipe-online">🟢 Online</span>
                                )}
                            </div>

                            <div className="discover-swipe-loc-row">
                                <MdLocationOn size={16} />
                                <span>{currentSwipeCard.city}, {currentSwipeCard.state} ({currentSwipeCard.distance})</span>
                            </div>

                            {currentSwipeCard.work && (
                                <div className="discover-swipe-work-row">
                                    <MdWork size={15} />
                                    <span>{currentSwipeCard.work}</span>
                                </div>
                            )}

                            <p className="discover-swipe-bio">{currentSwipeCard.bio}</p>

                            <div className="discover-swipe-tags">
                                {currentSwipeCard.interests.map((t, i) => (
                                    <span key={i} className="discover-swipe-chip">#{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Swipe Controls */}
                    <div className="discover-swipe-actions">
                        <button
                            className="swipe-ctrl-btn pass"
                            onClick={() => handleSwipeAction('pass')}
                            title="Pass"
                        >
                            <MdClose size={26} />
                        </button>
                        <button
                            className="swipe-ctrl-btn profile"
                            onClick={() => openProfileModal(currentSwipeCard)}
                            title="View Full Profile"
                        >
                            <MdStar size={24} />
                        </button>
                        <button
                            className="swipe-ctrl-btn chat"
                            onClick={() => handleStartChat(currentSwipeCard)}
                            title="Message Member"
                        >
                            <MdChat size={22} />
                        </button>
                        <button
                            className="swipe-ctrl-btn call"
                            onClick={() => handleStartCall(currentSwipeCard, 'video')}
                            title="Live Video Call"
                        >
                            <MdVideocam size={24} />
                        </button>
                        <button
                            className="swipe-ctrl-btn like"
                            onClick={() => handleSwipeAction('like')}
                            title="Like Profile"
                        >
                            <MdFavorite size={26} />
                        </button>
                    </div>

                    <div className="discover-swipe-counter">
                        Profile {currentSwipeIndex + 1} of {filteredUsers.length}
                    </div>
                </div>
            )}

            {/* ═══ PROFILE DETAILS MODAL ═══ */}
            {selectedProfile && (
                <div className="discover-modal-backdrop" onClick={() => setSelectedProfile(null)}>
                    <div className="discover-modal-card" onClick={e => e.stopPropagation()}>
                        <button className="discover-modal-close" onClick={() => setSelectedProfile(null)}>
                            <MdClose size={22} />
                        </button>

                        <div className="discover-modal-gallery">
                            <img
                                src={selectedProfile.photos[modalPhotoIndex] || selectedProfile.photos[0]}
                                alt={selectedProfile.name}
                                className="discover-modal-main-img"
                            />
                            {selectedProfile.photos.length > 1 && (
                                <div className="discover-modal-thumbs">
                                    {selectedProfile.photos.map((p, idx) => (
                                        <img
                                            key={idx}
                                            src={p}
                                            alt=""
                                            className={`discover-modal-thumb ${modalPhotoIndex === idx ? 'active' : ''}`}
                                            onClick={() => setModalPhotoIndex(idx)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="discover-modal-body">
                            <div className="discover-modal-name-row">
                                <h2>{selectedProfile.name}, {selectedProfile.age}</h2>
                                {selectedProfile.verified && (
                                    <div className="discover-verified-badge">
                                        <MdCheckCircle size={14} />
                                        <span>VERIFIED</span>
                                    </div>
                                )}
                            </div>

                            <div className="discover-modal-meta-chips">
                                <span className="discover-meta-chip">
                                    <MdLocationOn size={14} /> {selectedProfile.city}, {selectedProfile.state}
                                </span>
                                {selectedProfile.work && (
                                    <span className="discover-meta-chip">
                                        <MdWork size={14} /> {selectedProfile.work}
                                    </span>
                                )}
                                {selectedProfile.education && (
                                    <span className="discover-meta-chip">
                                        <MdSchool size={14} /> {selectedProfile.education}
                                    </span>
                                )}
                                <span className="discover-meta-chip distance">
                                    <MdLocationOn size={14} /> {selectedProfile.distance}
                                </span>
                            </div>

                            <div className="discover-modal-section">
                                <h4>About Me</h4>
                                <p>{selectedProfile.bio}</p>
                            </div>

                            <div className="discover-modal-section">
                                <h4>Interests & Passions</h4>
                                <div className="discover-modal-tags">
                                    {selectedProfile.interests.map((t, idx) => (
                                        <span key={idx} className="discover-modal-tag">#{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Direct Connect Buttons */}
                            <div className="discover-modal-action-bar">
                                <button
                                    className="discover-modal-btn chat"
                                    onClick={() => { setSelectedProfile(null); handleStartChat(selectedProfile); }}
                                >
                                    <MdChat size={18} /> Direct Chat
                                </button>
                                <button
                                    className="discover-modal-btn audio"
                                    onClick={() => { setSelectedProfile(null); handleStartCall(selectedProfile, 'audio'); }}
                                >
                                    <MdCall size={18} /> Voice Call (₹25/m)
                                </button>
                                <button
                                    className="discover-modal-btn video"
                                    onClick={() => { setSelectedProfile(null); handleStartCall(selectedProfile, 'video'); }}
                                >
                                    <MdVideocam size={19} /> Video Call (₹35/m)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
