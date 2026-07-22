import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdDarkMode, MdLightMode, MdFullscreen, MdFullscreenExit, MdPerson, MdLogout, MdSettings } from 'react-icons/md';
import './Header.css';

export default function Header({ onMenuToggle, darkMode, onDarkModeToggle, collapsed }) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <header className={`header ${collapsed ? 'collapsed' : ''}`}>
            <button className="header-menu-btn" onClick={onMenuToggle}>
                <MdMenu />
            </button>

            <div className="header-right">
                <button className="header-icon-btn" onClick={onDarkModeToggle} title="Toggle theme">
                    {darkMode ? <MdLightMode /> : <MdDarkMode />}
                </button>

                <button className="header-icon-btn" onClick={toggleFullscreen} title="Toggle fullscreen">
                    {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                </button>

                <div className="header-admin" ref={dropdownRef}>
                    <button
                        className="header-admin-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="header-admin-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                            {admin?.avatar ? (
                                <img src={admin.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <MdPerson />
                            )}
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div className="header-dropdown">
                            <div className="header-dropdown-info">
                                <div className="header-dropdown-name">{admin?.name || 'Administrator'}</div>
                                <div className="header-dropdown-role" style={{ textTransform: 'capitalize' }}>{admin?.role || 'Super Admin'}</div>
                            </div>
                            <div className="header-dropdown-divider" />
                            <button className="header-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>
                                <MdSettings />
                                <span>Settings</span>
                            </button>
                            <button className="header-dropdown-item danger" onClick={logout}>
                                <MdLogout />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
