import { useState, useEffect, useRef } from 'react';
import {
    MdMic, MdMicOff, MdVideocam, MdVideocamOff,
    MdCallEnd, MdFullscreen, MdFullscreenExit,
    MdMonetizationOn, MdCheckCircle, MdCardGiftcard, MdPerson
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './AgentVideoCallModal.css';

export default function AgentVideoCallModal({ isOpen, onClose, targetUser, onEarningsEarned }) {
    const [callState, setCallState] = useState('calling'); // 'calling' | 'connected' | 'ended'
    const [callDuration, setCallDuration] = useState(0);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [giftAnimation, setGiftAnimation] = useState(false);

    const localVideoRef = useRef(null);
    const streamRef = useRef(null);
    const containerRef = useRef(null);

    // Coin earning rate: 35 coins per minute (approx 0.58 coins per sec)
    const COINS_PER_MINUTE = 35;
    const RUPEE_RATE = 1 / 3; // 3 coins = 1 INR

    // Initialize Camera Stream
    useEffect(() => {
        if (isOpen) {
            setCallState('calling');
            setCallDuration(0);
            setEarnedCoins(0);

            // Connect camera
            navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    streamRef.current = stream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.warn('Camera access denied or unavailable:', err);
                });

            // Simulate call connect after 2.5 seconds
            const connectTimer = setTimeout(() => {
                setCallState('connected');
                toast.success(`Video call connected with ${targetUser?.name || 'Customer'}!`);
            }, 2500);

            return () => {
                clearTimeout(connectTimer);
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(t => t.stop());
                }
            };
        }
    }, [isOpen, targetUser]);

    // Timer & Coin Ticker during connected call
    useEffect(() => {
        let interval = null;
        if (isOpen && callState === 'connected') {
            interval = setInterval(() => {
                setCallDuration(prev => {
                    const next = prev + 1;
                    // Calculate coins
                    const coins = Math.max(10, Math.floor((next / 60) * COINS_PER_MINUTE));
                    setEarnedCoins(coins);
                    return next;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, callState]);

    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(t => {
                t.enabled = !micEnabled;
            });
        }
        setMicEnabled(p => !p);
        toast(micEnabled ? 'Microphone muted' : 'Microphone unmuted', { icon: micEnabled ? '🔇' : '🎙️' });
    };

    const toggleCam = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(t => {
                t.enabled = !camEnabled;
            });
        }
        setCamEnabled(p => !p);
        toast(camEnabled ? 'Camera turned off' : 'Camera turned on', { icon: camEnabled ? '📷' : '📹' });
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleEndCall = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        setCallState('ended');
        if (onEarningsEarned && earnedCoins > 0) {
            onEarningsEarned(earnedCoins);
        }
    };

    const sendTestGift = () => {
        setGiftAnimation(true);
        setEarnedCoins(p => p + 50);
        toast.success(`🎁 Received "Diamond Ring" Gift (+50 Coins)!`, { duration: 4000 });
        setTimeout(() => setGiftAnimation(false), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="agent-videocall-overlay">
            {callState === 'ended' ? (
                /* Post-Call Settlement Receipt */
                <div className="call-receipt-card">
                    <div className="receipt-badge-icon">
                        <MdCheckCircle />
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                        Call Session Completed
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Earnings have been credited to your Agent Wallet
                    </p>

                    <div className="receipt-stats-grid">
                        <div className="receipt-stat-box">
                            <div className="receipt-stat-label">Caller Name</div>
                            <div className="receipt-stat-value" style={{ fontSize: '0.95rem' }}>
                                {targetUser?.name || 'Customer'}
                            </div>
                        </div>
                        <div className="receipt-stat-box">
                            <div className="receipt-stat-label">Duration</div>
                            <div className="receipt-stat-value" style={{ color: '#00d68f' }}>
                                {formatTimer(callDuration)}
                            </div>
                        </div>
                        <div className="receipt-stat-box">
                            <div className="receipt-stat-label">Coins Earned</div>
                            <div className="receipt-stat-value" style={{ color: '#ffd43b' }}>
                                +{earnedCoins}
                            </div>
                        </div>
                        <div className="receipt-stat-box">
                            <div className="receipt-stat-label">Rupee Value</div>
                            <div className="receipt-stat-value" style={{ color: 'var(--primary)' }}>
                                ₹{(earnedCoins * RUPEE_RATE).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: 14,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--primary) 0%, #9610ff 100%)'
                        }}
                    >
                        Return to Workstation
                    </button>
                </div>
            ) : (
                /* Active Video Call Stage */
                <div className="agent-videocall-container" ref={containerRef}>
                    {/* Header Bar */}
                    <div className="call-header-bar">
                        <div className="call-user-tag">
                            {targetUser?.photos?.[0] ? (
                                <img
                                    src={typeof targetUser.photos[0] === 'string' ? targetUser.photos[0] : targetUser.photos[0].url}
                                    alt={targetUser?.name}
                                    className="call-user-avatar"
                                />
                            ) : (
                                <div className="call-user-avatar" style={{ background: '#332e4d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <MdPerson size={20} />
                                </div>
                            )}
                            <div className="call-user-info">
                                <h4>{targetUser?.name || 'Customer'}</h4>
                                <span>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d68f' }} />
                                    {callState === 'calling' ? 'Ringing...' : 'Live Connected'}
                                </span>
                            </div>
                        </div>

                        <div className="call-live-ticker">
                            <div className="call-timer-badge">
                                <span className="call-timer-dot" />
                                {formatTimer(callDuration)}
                            </div>
                            <div className="call-earnings-pill">
                                <MdMonetizationOn size={16} />
                                <span>+{earnedCoins} Coins (₹{(earnedCoins * RUPEE_RATE).toFixed(1)})</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Video Window */}
                    <div className="call-video-grid">
                        {giftAnimation && (
                            <div style={{
                                position: 'absolute',
                                zIndex: 50,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                animation: 'bounce 0.6s infinite alternate'
                            }}>
                                <span style={{ fontSize: '4.5rem' }}>💎🎁✨</span>
                                <div style={{ color: '#ffd43b', fontWeight: 900, fontSize: '1.2rem', textShadow: '0 0 20px #ffd43b' }}>
                                    +50 BONUS GIFT COINS!
                                </div>
                            </div>
                        )}

                        {callState === 'calling' ? (
                            <div className="remote-placeholder-stage">
                                <div className="remote-avatar-pulse">
                                    {targetUser?.photos?.[0] ? (
                                        <img
                                            src={typeof targetUser.photos[0] === 'string' ? targetUser.photos[0] : targetUser.photos[0].url}
                                            alt={targetUser?.name}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25213b', fontSize: '3rem' }}>
                                            👤
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800 }}>Calling {targetUser?.name}...</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Awaiting customer response</p>
                                </div>
                            </div>
                        ) : (
                            <div className="remote-placeholder-stage" style={{ width: '100%', height: '100%' }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    background: 'radial-gradient(circle at center, #1b1730 0%, #080612 100%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div className="remote-avatar-pulse" style={{ width: 140, height: 140, marginBottom: 16 }}>
                                        {targetUser?.photos?.[0] ? (
                                            <img
                                                src={typeof targetUser.photos[0] === 'string' ? targetUser.photos[0] : targetUser.photos[0].url}
                                                alt={targetUser?.name}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#25213b', fontSize: '3.5rem' }}>
                                                👤
                                            </div>
                                        )}
                                    </div>
                                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{targetUser?.name}</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#00d68f', marginTop: 4 }}>• 1080p HD Audio & Video Active</span>
                                </div>
                            </div>
                        )}

                        {/* Local Camera (Picture-in-Picture) */}
                        <div className="self-pip-window">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="self-pip-video"
                                style={{ display: camEnabled ? 'block' : 'none' }}
                            />
                            {!camEnabled && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1833', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Camera Off
                                </div>
                            )}
                            <div className="self-pip-label">You (Agent Host)</div>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="call-controls-dock">
                        <button
                            className={`call-control-btn ${!micEnabled ? 'active-off' : ''}`}
                            onClick={toggleMic}
                            title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
                        >
                            {micEnabled ? <MdMic /> : <MdMicOff />}
                        </button>

                        <button
                            className={`call-control-btn ${!camEnabled ? 'active-off' : ''}`}
                            onClick={toggleCam}
                            title={camEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                        >
                            {camEnabled ? <MdVideocam /> : <MdVideocamOff />}
                        </button>

                        <button
                            className="call-control-btn"
                            onClick={sendTestGift}
                            title="Simulate Gift Received"
                            style={{ color: '#ffd43b', background: 'rgba(255, 212, 59, 0.15)', borderColor: 'rgba(255, 212, 59, 0.3)' }}
                        >
                            <MdCardGiftcard />
                        </button>

                        <button
                            className="call-control-btn"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                        </button>

                        <button
                            className="call-end-btn"
                            onClick={handleEndCall}
                            title="End Call"
                        >
                            <MdCallEnd />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
