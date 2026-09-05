import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Send, Smile, Phone, Video, Info,
    CheckCircle2, Search, Plus, Mic, MessageSquare,
    Trash2, Sparkles, PhoneOff, User, ArrowLeft, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import {
    getSocket,
    initiateSocketConnection,
    joinConversation,
    emitMessage
} from '../../utils/socket';
import VideoCall from '../../components/VideoCall';
import toast from 'react-hot-toast';
import './AgentChat.css';

const emojiList = ['❤️', '😂', '🔥', '🧗‍♂️', '👍', '✨', '😍', '🌹'];

const CANNED_REPLIES = [
    "Hello handsome! How are you doing today? 😊",
    "I was hoping you'd message! Tell me about your day.",
    "Would you like to hop on a private video call? 🎥",
    "Thank you so much for the compliment! ❤️",
    "What are your plans for this weekend? ✨"
];

const DEFAULT_DEMO_CHATS = [
    {
        id: 'cust_aarav_01',
        conversationId: 'cust_aarav_01',
        userName: 'Aarav Shah',
        userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        lastActive: 'Online',
        userId: 'cust_aarav_01',
        user: {
            _id: 'cust_aarav_01',
            name: 'Aarav Shah',
            age: 26,
            city: 'Mumbai',
            work: 'Software Architect',
            bio: 'Looking for genuine connections and interesting conversations.',
            photos: [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }],
            interests: ['Tech', 'Music', 'Fitness', 'Travel'],
            verified: true
        },
        lastMessage: {
            text: "Hey! Glad we matched. Are you free for a call?",
            createdAt: new Date().toISOString()
        }
    },
    {
        id: 'cust_rohan_02',
        conversationId: 'cust_rohan_02',
        userName: 'Rohan Varma',
        userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        lastActive: 'Online',
        userId: 'cust_rohan_02',
        user: {
            _id: 'cust_rohan_02',
            name: 'Rohan Varma',
            age: 28,
            city: 'Bangalore',
            work: 'Product Designer',
            bio: 'Art director, coffee enthusiast, passionate about photography.',
            photos: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' }],
            interests: ['Design', 'Art', 'Coffee', 'Hiking'],
            verified: true
        },
        lastMessage: {
            text: "Your profile photos look amazing! 😊",
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    },
    {
        id: 'cust_vikram_03',
        conversationId: 'cust_vikram_03',
        userName: 'Vikram Malhotra',
        userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
        lastActive: '2h ago',
        userId: 'cust_vikram_03',
        user: {
            _id: 'cust_vikram_03',
            name: 'Vikram Malhotra',
            age: 31,
            city: 'Kochi',
            work: 'Business Owner',
            bio: 'Traveler and food enthusiast. Let’s talk!',
            photos: [{ url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' }],
            interests: ['Business', 'Travel', 'Fine Dining'],
            verified: true
        },
        lastMessage: {
            text: "Let me know when you're available for a chat.",
            createdAt: new Date(Date.now() - 7200000).toISOString()
        }
    }
];

export default function AgentChat() {
    const navigate = useNavigate();
    const { admin } = useAuth();
    const currentUser = admin || { _id: 'agent_current', name: 'Elite Agent' };

    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messagesMap, setMessagesMap] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'online' | 'vip' | 'unread'
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedMsgForReaction, setSelectedMsgForReaction] = useState(null);
    const [showProfileDrawer, setShowProfileDrawer] = useState(true);

    // Call-related state
    const [activeCall, setActiveCall] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);

    const messagesEndRef = useRef(null);

    // Active Chat Object
    const activeChat = activeChatId
        ? chats.find(c => String(c.id || c.conversationId) === String(activeChatId) || String(c.conversationId) === String(activeChatId))
        : null;

    const activeChatMessages = (activeChatId && messagesMap[activeChatId]) ? messagesMap[activeChatId] : [];

    // Initialize Socket & Conversations on Mount
    useEffect(() => {
        const storedAdmin = localStorage.getItem('inakkam_admin') ? JSON.parse(localStorage.getItem('inakkam_admin')) : null;
        const effectiveUser = admin || storedAdmin;
        const userId = effectiveUser?._id;
        const token = localStorage.getItem('inakkam_admin_token');

        if (userId) {
            initiateSocketConnection(userId, token);
        }

        // Fetch Conversations
        const loadConversations = async () => {
            try {
                const res = await api.get('/conversations');
                if (res.data?.success && res.data.conversations?.length > 0) {
                    const formatted = res.data.conversations.map(c => {
                        const otherUser = c.user || {};
                        const avatar = otherUser.photos?.[0]
                            ? (typeof otherUser.photos[0] === 'string' ? otherUser.photos[0] : otherUser.photos[0].url)
                            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
                        return {
                            id: c.conversationId,
                            conversationId: c.conversationId,
                            userName: otherUser.name || 'Member',
                            userImage: avatar,
                            lastActive: otherUser.isOnline ? 'Online' : 'Recently active',
                            userId: otherUser._id,
                            user: otherUser,
                            lastMessage: c.lastMessage || { text: 'Start conversation...', createdAt: c.updatedAt }
                        };
                    });
                    setChats(formatted);
                    if (!activeChatId && formatted.length > 0) {
                        setActiveChatId(formatted[0].id);
                    }
                    return;
                }
            } catch (err) {
                console.log('Conversations endpoint returned empty, loading database users directory...');
            }

            // Fallback: Fetch real users from MongoDB directory so all calls connect to real accounts
            try {
                const usersRes = await api.get('/users');
                const userList = usersRes.data?.users || usersRes.data?.data || [];
                if (userList.length > 0) {
                    const formatted = userList.map(u => {
                        const avatar = u.photos?.[0]
                            ? (typeof u.photos[0] === 'string' ? u.photos[0] : u.photos[0].url)
                            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
                        return {
                            id: u._id,
                            conversationId: u._id,
                            userName: u.name || 'Member',
                            userImage: avatar,
                            lastActive: u.isOnline ? 'Online' : 'Recently active',
                            userId: u._id,
                            user: u,
                            lastMessage: { text: 'Click to connect live session', createdAt: u.createdAt || new Date().toISOString() }
                        };
                    });
                    setChats(formatted);
                    if (!activeChatId && formatted.length > 0) {
                        setActiveChatId(formatted[0].id);
                    }
                    return;
                }
            } catch (uErr) {
                console.log('Could not load user list');
            }

            setChats(DEFAULT_DEMO_CHATS);
            if (!activeChatId) setActiveChatId(DEFAULT_DEMO_CHATS[0].id);
        };

        loadConversations();
    }, [admin]);

    // Socket Event Handlers for Calls & Messages
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleIncomingCall = (data) => {
            console.log('📞 Socket event: incoming_call', data);
            setIncomingCall(data);
        };

        const handleCallAccepted = (data) => {
            console.log('📞 Socket event: call_accepted', data);
            toast.success('Call accepted! Connecting...');
        };

        const handleCallRejected = (data) => {
            console.log('📞 Socket event: call_rejected', data);
            toast.error('Call declined by user');
            setActiveCall(null);
        };

        const handleCallEnded = (data) => {
            console.log('📞 Socket event: call_ended', data);
            toast('Call ended', { icon: '📞' });
            setActiveCall(null);
            setIncomingCall(null);
        };

        const handleCallError = (data) => {
            toast.error(data.message || 'Call error occurred');
            setActiveCall(null);
        };

        const handleNewMessage = (msg) => {
            const convId = msg.conversation || msg.conversationId;
            if (!convId) return;

            setMessagesMap(prev => {
                const currentList = prev[convId] || [];
                if (currentList.some(m => (m._id && m._id === msg._id) || (m.tempId && m.tempId === msg.tempId))) {
                    return prev;
                }
                return {
                    ...prev,
                    [convId]: [...currentList, msg]
                };
            });
        };

        const handleMessageDeleted = ({ conversationId, messageId }) => {
            if (!conversationId || !messageId) return;
            setMessagesMap(prev => ({
                ...prev,
                [conversationId]: (prev[conversationId] || []).filter(m => m._id !== messageId && m.id !== messageId)
            }));
        };

        socket.on('incoming_call', handleIncomingCall);
        socket.on('call_accepted', handleCallAccepted);
        socket.on('call_rejected', handleCallRejected);
        socket.on('call_ended', handleCallEnded);
        socket.on('call_error', handleCallError);
        socket.on('new_message', handleNewMessage);
        socket.on('message_deleted', handleMessageDeleted);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
            socket.off('call_accepted', handleCallAccepted);
            socket.off('call_rejected', handleCallRejected);
            socket.off('call_ended', handleCallEnded);
            socket.off('call_error', handleCallError);
            socket.off('new_message', handleNewMessage);
            socket.off('message_deleted', handleMessageDeleted);
        };
    }, []);

    // Load Messages when Active Chat changes
    useEffect(() => {
        if (!activeChatId) return;

        joinConversation(activeChatId);

        const loadMessages = async () => {
            try {
                const res = await api.get(`/conversations/${activeChatId}/messages`);
                if (res.data?.success && res.data.messages) {
                    setMessagesMap(prev => ({
                        ...prev,
                        [activeChatId]: res.data.messages
                    }));
                } else if (!messagesMap[activeChatId]) {
                    setMessagesMap(prev => ({
                        ...prev,
                        [activeChatId]: [
                            {
                                _id: `init_1_${activeChatId}`,
                                sender: { _id: activeChat?.user?._id || activeChat?.userId },
                                text: `Hi ${currentUser?.name || 'there'}! I saw your profile and wanted to connect. 😊`,
                                createdAt: new Date(Date.now() - 3600000).toISOString()
                            },
                            {
                                _id: `init_2_${activeChatId}`,
                                sender: { _id: currentUser?._id },
                                text: `Hey! Thanks for reaching out. How is your day going? ❤️`,
                                createdAt: new Date(Date.now() - 1800000).toISOString()
                            }
                        ]
                    }));
                }
            } catch (err) {
                if (!messagesMap[activeChatId]) {
                    setMessagesMap(prev => ({
                        ...prev,
                        [activeChatId]: [
                            {
                                _id: `init_1_${activeChatId}`,
                                sender: { _id: activeChat?.user?._id || activeChat?.userId },
                                text: `Hi ${currentUser?.name || 'there'}! I saw your profile and wanted to connect. 😊`,
                                createdAt: new Date(Date.now() - 3600000).toISOString()
                            }
                        ]
                    }));
                }
            }
        };

        loadMessages();
    }, [activeChatId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages, isTyping]);

    // Filter conversations
    const filteredChats = chats.filter((chat) => {
        const nameMatch = chat.userName?.toLowerCase().includes(searchQuery.toLowerCase());
        const msgMatch = chat.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = nameMatch || msgMatch;
        if (!matchesSearch) return false;

        if (filterTab === 'online') return chat.lastActive === 'Online';
        if (filterTab === 'vip') return chat.user?.membership === 'premium' || chat.user?.membership?.plan === 'premium';
        return true;
    });

    // ─── START CALL (VOICE / VIDEO) ────────────────────────────
    const handleStartCall = async (type) => {
        if (!activeChat) return;
        const targetUserId = activeChat.user?._id || activeChat.userId;
        if (!targetUserId) {
            toast.error('Cannot call this user');
            return;
        }

        try {
            toast.loading('Initializing call session...', { id: 'call_init' });

            let roomId = '';

            // 1. Create Real EnableX Room via smart-routed api
            const roomRes = await api.post('/enablex/create-room', {
                name: `Call with ${activeChat.userName || 'User'}`
            });

            const extractedRoomId =
                roomRes.data?.roomId ||
                roomRes.data?.room?.room_id ||
                roomRes.data?.room?.roomId ||
                roomRes.data?.room?._id ||
                roomRes.data?.id;

            if (roomRes.data?.success && extractedRoomId) {
                roomId = extractedRoomId;
            } else {
                throw new Error(roomRes.data?.message || 'Failed to create call session');
            }

            // 2. Emit socket call event
            const socket = getSocket();
            if (socket) {
                socket.emit('call_user', {
                    conversationId: activeChat.id || activeChat.conversationId,
                    targetUserId,
                    roomId,
                    callerName: currentUser?.name || 'Inakkam Agent',
                    callerPhoto: currentUser?.avatar || currentUser?.photos?.[0]?.url || '',
                    callType: type
                });
            }

            toast.dismiss('call_init');

            // 3. Set Active Call State (Opens full VideoCall component)
            setActiveCall({
                roomId,
                remoteUserName: activeChat.userName,
                remoteUserPhoto: activeChat.userImage,
                callType: type,
                targetUserId,
                isCaller: true,
            });

        } catch (err) {
            toast.dismiss('call_init');
            const errMsg = typeof err === 'string' ? err : (err.response?.data?.message || err.message || 'Failed to start call');
            toast.error(errMsg);
            console.error('[Start Call Error]', err);
        }
    };

    // ─── ACCEPT INCOMING CALL ──────────────────────────────────
    const handleAcceptCall = () => {
        if (!incomingCall) return;

        try {
            const socket = getSocket();
            if (socket) {
                socket.emit('accept_call', {
                    conversationId: incomingCall.conversationId,
                    callerId: incomingCall.callerId
                });
            }

            setActiveCall({
                roomId: incomingCall.roomId,
                remoteUserName: incomingCall.callerName,
                remoteUserPhoto: incomingCall.callerPhoto,
                callType: incomingCall.callType,
                targetUserId: incomingCall.callerId,
                isCaller: false,
            });

            setIncomingCall(null);
        } catch (err) {
            toast.error(err.message || 'Failed to accept call');
        }
    };

    // ─── DECLINE INCOMING CALL ──────────────────────────────────
    const handleDeclineCall = () => {
        if (!incomingCall) return;

        const socket = getSocket();
        if (socket) {
            socket.emit('reject_call', {
                conversationId: incomingCall.conversationId,
                callerId: incomingCall.callerId
            });
        }

        setIncomingCall(null);
    };

    // ─── END CALL ──────────────────────────────────────────────
    const handleEndCall = () => {
        const callSnapshot = activeCall;
        const socket = getSocket();
        if (socket && callSnapshot) {
            socket.emit('end_call', {
                conversationId: activeChat?.id || activeChat?.conversationId || callSnapshot.roomId,
                targetUserId: callSnapshot.targetUserId
            });
        }

        setActiveCall(null);
        setIncomingCall(null);
    };

    // ─── SEND MESSAGE ──────────────────────────────────────────
    const handleSendMessage = async (customText = null) => {
        const textToSend = (typeof customText === 'string' ? customText : inputMessage).trim();
        if (!textToSend || !activeChat) return;

        const recipientId = activeChat.user?._id || activeChat.userId;
        const activeId = activeChat.conversationId || activeChat.id;
        const tempId = `temp_${Date.now()}`;

        const newMessageObj = {
            _id: tempId,
            tempId: tempId,
            conversationId: activeId,
            conversation: activeId,
            text: textToSend,
            sender: {
                _id: currentUser?._id,
                name: currentUser?.name
            },
            createdAt: new Date().toISOString()
        };

        // 1. Optimistic append
        setMessagesMap(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), newMessageObj]
        }));

        setInputMessage('');
        setShowEmojiPicker(false);

        // 2. Socket emission & REST fallback
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit('send_message', {
                conversationId: activeId,
                recipientId,
                text: textToSend,
                tempId
            });
        }

        try {
            await api.post(`/conversations/${activeId}/messages`, { text: textToSend });
        } catch (err) {
            console.log('Message delivered via socket');
        }
    };

    // ─── DELETE MESSAGE ────────────────────────────────────────
    const handleDeleteMessage = async (messageId) => {
        if (!activeChatId || !messageId) return;

        setMessagesMap(prev => ({
            ...prev,
            [activeChatId]: (prev[activeChatId] || []).filter(m => m._id !== messageId && m.id !== messageId)
        }));

        try {
            await api.delete(`/conversations/${activeChatId}/messages/${messageId}`);
            toast.success('Message deleted');
        } catch (err) {
            console.log('Message deleted locally');
        }
    };

    // ─── REACTION ──────────────────────────────────────────────
    const handleAddReaction = (messageId, emoji) => {
        if (!activeChatId) return;

        setMessagesMap(prev => ({
            ...prev,
            [activeChatId]: (prev[activeChatId] || []).map(m => {
                if ((m._id && m._id === messageId) || (m.id && m.id === messageId)) {
                    const currentReactions = m.reactions || [];
                    return {
                        ...m,
                        reactions: currentReactions.includes(emoji) ? currentReactions : [...currentReactions, emoji]
                    };
                }
                return m;
            })
        }));

        setSelectedMsgForReaction(null);
    };

    return (
        <div className="agent-chat-station-container">
            {/* ─── LEFT CONVERSATIONS LIST ─── */}
            <div className={`agent-chat-left-pane ${activeChatId ? 'has-active-chat' : ''}`}>
                <div className="agent-chat-left-header">
                    <div className="agent-chat-header-title-row">
                        <h2>
                            <span style={{ color: 'var(--primary)' }}>💬</span> Messages & Calls
                        </h2>
                        <div className="agent-chat-live-pill">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d68f' }} />
                            Live Host
                        </div>
                    </div>

                    <div className="agent-chat-search-input-wrap">
                        <Search className="agent-chat-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search active leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="agent-chat-filter-strip">
                    {[
                        { key: 'all', label: 'All Leads' },
                        { key: 'online', label: 'Online Now' },
                        { key: 'vip', label: 'VIP Members' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`agent-chat-filter-btn ${filterTab === tab.key ? 'active' : ''}`}
                            onClick={() => setFilterTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="agent-chat-conversation-list">
                    {filteredChats.map((chat) => {
                        const isSelected = activeChatId === (chat.id || chat.conversationId);
                        return (
                            <div
                                key={chat.id || chat.conversationId}
                                onClick={() => setActiveChatId(chat.id || chat.conversationId)}
                                className={`agent-chat-conversation-item ${isSelected ? 'active' : ''}`}
                            >
                                <div className="agent-chat-avatar-wrap">
                                    <img
                                        src={chat.userImage}
                                        alt={chat.userName}
                                        className="agent-chat-avatar-img"
                                    />
                                    {chat.lastActive === 'Online' && (
                                        <span className="agent-chat-online-indicator" />
                                    )}
                                </div>

                                <div className="agent-chat-conversation-meta">
                                    <div className="agent-chat-meta-top">
                                        <div className="agent-chat-user-name">
                                            {chat.userName}
                                            <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <span className="agent-chat-timestamp">
                                            {chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                        </span>
                                    </div>
                                    <div className="agent-chat-preview-text">
                                        {chat.lastMessage?.text || 'Start conversation...'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ─── CENTER CHAT THREAD ─── */}
            <div className={`agent-chat-center-pane ${!activeChat ? 'no-chat' : ''}`}>
                {activeChat ? (
                    <>
                        {/* Top Bar Header */}
                        <div className="agent-chat-top-bar">
                            <div className="agent-chat-active-user-info">
                                <button
                                    className="agent-chat-mobile-back-btn"
                                    onClick={() => setActiveChatId(null)}
                                    title="Back to conversations"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={activeChat.userImage}
                                        alt={activeChat.userName}
                                        className="agent-chat-active-avatar"
                                    />
                                    {activeChat.lastActive === 'Online' && (
                                        <span className="agent-chat-online-indicator" />
                                    )}
                                </div>
                                <div className="agent-chat-active-title">
                                    <h3>
                                        {activeChat.userName}
                                        <CheckCircle2 size={15} style={{ color: 'var(--primary)' }} />
                                    </h3>
                                    <span className="agent-chat-active-status">
                                        {activeChat.lastActive === 'Online' ? '• Online Now' : '• Recently active'}
                                    </span>
                                </div>
                            </div>

                            {/* Voice & Video Call Action Buttons */}
                            <div className="agent-chat-call-actions">
                                <button
                                    onClick={() => handleStartCall('audio')}
                                    className="agent-chat-voice-btn"
                                    title="Start 1-on-1 Voice Call"
                                >
                                    <Phone size={16} style={{ color: '#00d68f' }} /> <span>Voice Call</span>
                                </button>

                                <button
                                    onClick={() => handleStartCall('video')}
                                    className="agent-chat-video-btn"
                                    title="Start 1-on-1 Video Call (₹35/min)"
                                >
                                    <Video size={17} /> <span>Video Call (₹35/m)</span>
                                </button>

                                <button
                                    onClick={() => setShowProfileDrawer(p => !p)}
                                    className="agent-chat-info-btn"
                                    title="Client Profile Inspector"
                                >
                                    <Info size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Canned Replies */}
                        <div className="agent-chat-canned-bar">
                            <span className="agent-chat-canned-label">
                                <Sparkles size={13} style={{ color: 'var(--primary)' }} /> QUICK:
                            </span>
                            {CANNED_REPLIES.map((reply, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(reply)}
                                    className="agent-chat-canned-pill"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>

                        {/* Messages Stream */}
                        <div className="agent-chat-messages-scroll">
                            {activeChatMessages.map((msg) => {
                                const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
                                const myId = currentUser?._id;
                                const isMe = Boolean(myId && senderId && String(senderId) === String(myId)) || senderId === 'me' || (msg.sender && msg.sender._id === 'me');
                                const timestamp = msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : '';

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg._id || msg.id}
                                        className={`agent-chat-msg-row ${isMe ? 'outgoing' : 'incoming'}`}
                                    >
                                        {!isMe && (
                                            <img
                                                src={activeChat.userImage}
                                                alt={activeChat.userName}
                                                style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0, marginTop: 4 }}
                                            />
                                        )}

                                        <div style={{ position: 'relative' }}>
                                            <div
                                                onClick={() => setSelectedMsgForReaction(selectedMsgForReaction === (msg._id || msg.id) ? null : (msg._id || msg.id))}
                                                className="agent-chat-bubble"
                                            >
                                                <p style={{ margin: 0 }}>{msg.text}</p>

                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: -9,
                                                        right: isMe ? 8 : 'auto',
                                                        left: isMe ? 'auto' : 8,
                                                        display: 'flex',
                                                        gap: 3,
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-color)',
                                                        padding: '2px 6px',
                                                        borderRadius: 12,
                                                        fontSize: '0.72rem',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}>
                                                        {msg.reactions.map((r, i) => (
                                                            <span key={i}>{r}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="agent-chat-msg-time-row">
                                                <span>{timestamp}</span>
                                                {isMe && <span style={{ color: '#00d68f', fontWeight: 800 }}>✓✓</span>}
                                            </div>

                                            {/* Reaction Picker Overlay */}
                                            <AnimatePresence>
                                                {selectedMsgForReaction === (msg._id || msg.id) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: 40,
                                                            right: isMe ? 0 : 'auto',
                                                            left: isMe ? 'auto' : 0,
                                                            background: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            padding: '6px 10px',
                                                            borderRadius: 14,
                                                            display: 'flex',
                                                            gap: 6,
                                                            zIndex: 20,
                                                            boxShadow: 'var(--shadow-md)'
                                                        }}
                                                    >
                                                        {emojiList.map(em => (
                                                            <button
                                                                key={em}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddReaction(msg._id || msg.id, em);
                                                                }}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                            >
                                                                {em}
                                                            </button>
                                                        ))}
                                                        {isMe && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteMessage(msg._id || msg.id);
                                                                }}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4757', display: 'flex', alignItems: 'center' }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Floating Input Dock */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="agent-chat-bottom-dock"
                        >
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <Plus size={18} />
                            </button>

                            <input
                                type="text"
                                placeholder={`Message ${activeChat.userName}...`}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className="agent-chat-dock-input"
                            />

                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <Smile size={18} />
                            </button>

                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: 60,
                                            right: 60,
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            padding: 10,
                                            borderRadius: 14,
                                            display: 'flex',
                                            gap: 8,
                                            zIndex: 30,
                                            boxShadow: 'var(--shadow-md)'
                                        }}
                                    >
                                        {emojiList.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => {
                                                    setInputMessage(prev => prev + em);
                                                    setShowEmojiPicker(false);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={!inputMessage.trim()}
                                className="agent-chat-dock-send-btn"
                                style={{ opacity: inputMessage.trim() ? 1 : 0.6 }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <MessageSquare style={{ width: 48, height: 48, marginBottom: 12, opacity: 0.3 }} />
                        <span>Select a conversation to start messaging.</span>
                    </div>
                )}
            </div>

            {/* ─── RIGHT PROFILE DRAWER ─── */}
            {showProfileDrawer && activeChat && (
                <div className="agent-chat-right-drawer">
                    <div className="agent-chat-drawer-header">
                        <div className="agent-chat-drawer-header-title">Client Details</div>
                        <button
                            onClick={() => setShowProfileDrawer(false)}
                            className="agent-chat-drawer-close-btn"
                            title="Close Inspector"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <img
                        src={activeChat.userImage}
                        alt={activeChat.userName}
                        className="agent-chat-drawer-avatar"
                    />
                    <div className="agent-chat-drawer-name">
                        {activeChat.userName}
                        <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="agent-chat-drawer-sub">
                        {activeChat.user?.city || 'Kerala'}, India
                    </span>

                    <div className="agent-chat-drawer-bio-card">
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>About Client</div>
                        {activeChat.user?.bio || 'Looking to connect with genuine and energetic personalities for fun video calls and chats.'}
                        {activeChat.user?.work && (
                            <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                                💼 {activeChat.user.work}
                            </div>
                        )}
                    </div>

                    <div className="agent-chat-drawer-actions">
                        <button
                            onClick={() => handleStartCall('video')}
                            className="agent-chat-video-btn"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                        >
                            <Video size={16} /> Start Video Call (₹35/m)
                        </button>

                        <button
                            onClick={() => handleStartCall('audio')}
                            className="agent-chat-voice-btn"
                            style={{ width: '100%', justifyContent: 'center', padding: '9px' }}
                        >
                            <Phone size={15} style={{ color: '#00d68f' }} /> Voice Call
                        </button>
                    </div>
                </div>
            )}

            {/* ─── REAL PRODUCTION ENABLEX CALL COMPONENT (PWA PARITY) ─── */}
            {activeCall && (
                <VideoCall
                    roomId={activeCall.roomId}
                    remoteUserName={activeCall.remoteUserName}
                    remoteUserPhoto={activeCall.remoteUserPhoto}
                    callType={activeCall.callType}
                    onEndCall={handleEndCall}
                    currentUser={currentUser}
                    targetUserId={activeCall.targetUserId || activeChat?.user?._id || activeChat?.userId}
                    isCaller={activeCall.isCaller ?? true}
                />
            )}

            {/* ─── INCOMING CALL POPUP DIALOG (PWA PARITY) ─── */}
            <AnimatePresence>
                {incomingCall && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: 16
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: 'var(--bg-modal, #17142b)',
                                borderRadius: 24,
                                padding: 28,
                                width: '100%',
                                maxWidth: 360,
                                textAlign: 'center',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                                <img
                                    src={incomingCall.callerPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                                    alt={incomingCall.callerName}
                                    style={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '4px solid var(--primary)',
                                        margin: '0 auto'
                                    }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                                {incomingCall.callerName}
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: '#00d68f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Incoming {incomingCall.callType === 'audio' ? 'Voice' : 'Video'} Call...
                            </p>

                            <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
                                <button
                                    onClick={handleDeclineCall}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: 14,
                                        background: 'rgba(255, 71, 87, 0.15)',
                                        border: '1px solid #ff4757',
                                        color: '#ff4757',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <PhoneOff size={16} /> Decline
                                </button>
                                <button
                                    onClick={handleAcceptCall}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: 14,
                                        background: '#00d68f',
                                        border: 'none',
                                        color: '#080612',
                                        fontWeight: 800,
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(0, 214, 143, 0.3)'
                                    }}
                                >
                                    {incomingCall.callType === 'audio' ? <Phone size={16} /> : <Video size={16} />} Accept
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
