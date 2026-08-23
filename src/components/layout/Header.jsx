import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MdChevronRight, MdChevronLeft, MdDarkMode, MdLightMode,
    MdFullscreen, MdFullscreenExit, MdPerson, MdLogout, MdSettings, MdVerifiedUser
} from 'react-icons/md';
import './Header.css';

const pageTitleMap = {
    '/': 'Dashboard Overview',
    '/user-list': 'User List',
    '/verification-list': 'KYC Verification Requests',
    '/report-list': 'Report List',
    '/payment-list': 'Payment Gateways',
    '/payout-list': 'Payout List',
    '/fake-user-generator': 'Fake User Generator',
    '/push-notification': 'Push Notifications',
    '/settings': 'Admin Profile Settings',
    '/interest/add': 'Add New Interest',
    '/interest/list': 'Interest List',
    '/language/add': 'Add New Language',
    '/language/list': 'Language List',
    '/religion/add': 'Add New Religion',
    '/religion/list': 'Religion List',
    '/gift/add': 'Add New Gift',
    '/gift/list': 'Gift List',
    '/relation-goal/add': 'Add Relation Goal',
    '/relation-goal/list': 'Relation Goal List',
    '/faq/add': 'Add New FAQ',
    '/faq/list': 'FAQ List',
    '/plan/add': 'Add Membership Plan',
    '/plan/list': 'Membership Plan List',
    '/package/add': 'Add Coin Package',
    '/package/list': 'Coin Package List',
    '/staff/add': 'Add Staff Member',
    '/staff/list': 'Staff List',
    '/page/add': 'Add Custom Page',
    '/page/list': 'Custom Page List',
};

export default function Header({ onMenuToggle, onToggleCollapse, darkMode, onDarkModeToggle, collapsed }) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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

    const handleMenuClick = () => {
        if (window.innerWidth <= 992) {
            onMenuToggle();
        } else if (onToggleCollapse) {
            onToggleCollapse();
        } else {
            onMenuToggle();
        }
    };

    const isAgent = admin?.role === 'agent' || admin?.isEliteAgent;
    const currentTitle = isAgent 
        ? (pageTitleMap[location.pathname] === 'Dashboard Overview' ? 'Elite Agent Portal' : pageTitleMap[location.pathname] || 'Elite Agent Portal')
        : (pageTitleMap[location.pathname] || 'Inakkam Admin');

    return (
        <header className={`header ${collapsed ? 'collapsed' : ''}`}>
            <div className="header-left">
                <button
                    className="header-menu-btn"
                    onClick={handleMenuClick}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
                </button>

                {collapsed && (
                    <div
                        className="header-collapsed-brand"
                        onClick={() => onToggleCollapse && onToggleCollapse()}
                        title="Expand sidebar"
                    >
                        <div className="header-brand-icon">
                            <img src="/favicon.png" alt="Inakkam Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span className="header-brand-name">Inakkam</span>
                    </div>
                )}

                <div className="header-page-info">
                    <span className="header-page-title">{currentTitle}</span>
                </div>
            </div>

            <div className="header-right">
                {!isAgent && (
                    <button
                        className="header-icon-btn header-kyc-btn"
                        onClick={() => navigate('/verification-list')}
                        title="KYC Verifications"
                    >
                        <MdVerifiedUser />
                    </button>
                )}

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
                        <div className="header-admin-avatar">
                            {admin?.avatar ? (
                                <img src={admin.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <MdPerson />
                            )}
                        </div>
                        <div className="header-admin-details">
                            <span className="header-admin-name">{admin?.name || 'Administrator'}</span>
                            <span className="header-admin-role">{isAgent ? 'Elite Agent' : (admin?.role || 'Super Admin')}</span>
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div className="header-dropdown">
                            <div className="header-dropdown-info">
                                <div className="header-dropdown-name">{admin?.name || 'Administrator'}</div>
                                <div className="header-dropdown-email">{admin?.email || 'admin@inakkam.com'}</div>
                                <div className="header-dropdown-role">{isAgent ? 'Elite Agent' : (admin?.role || 'Super Admin')}</div>
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
