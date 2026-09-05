import { io } from 'socket.io-client';

let socket = null;
let currentSocketUserId = null;

export const initiateSocketConnection = (userId, token) => {
    const rawUserId = userId || (localStorage.getItem('inakkam_admin') ? JSON.parse(localStorage.getItem('inakkam_admin'))._id : null);
    const rawToken = token || localStorage.getItem('inakkam_admin_token');

    if (!rawUserId) {
        console.warn('⚠️ [Socket] Cannot connect without valid userId');
        return socket;
    }

    const uidStr = String(rawUserId);

    // If socket already connected with the same userId, reuse it
    if (socket && socket.connected && currentSocketUserId === uidStr) {
        return socket;
    }

    // If socket connected with a different userId, disconnect first
    if (socket) {
        console.log(`🔌 [Socket] Switching userId from ${currentSocketUserId} to ${uidStr}`);
        socket.disconnect();
        socket = null;
    }

    currentSocketUserId = uidStr;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';

    socket = io(socketUrl, {
        auth: {
            token: rawToken,
            userId: uidStr,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log(`🟢 [Socket] Connected successfully as user_${uidStr} (socketId: ${socket.id})`);
    });

    socket.on('connect_error', (err) => {
        console.error('🔴 [Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log(`🟡 [Socket] Disconnected: ${reason}`);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        console.log('🔌 [Socket] Disconnecting socket...');
        socket.disconnect();
        socket = null;
        currentSocketUserId = null;
    }
};

export const getSocket = () => socket;

export const joinConversation = (conversationId) => {
    if (socket && conversationId) {
        socket.emit('join_room', String(conversationId));
    }
};

export const emitMessage = (data) => {
    if (socket) socket.emit('send_message', data);
};

export const emitTyping = (conversationId) => {
    if (socket) socket.emit('typing', { conversationId });
};

export const emitStopTyping = (conversationId) => {
    if (socket) socket.emit('stop_typing', { conversationId });
};

export const emitMessageRead = (conversationId) => {
    if (socket) socket.emit('message_read', { conversationId });
};
