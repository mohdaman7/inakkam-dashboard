import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    MdDashboard, MdOutlineAutoAwesome, MdLanguage, MdBook, MdCardGiftcard,
    MdFavorite, MdQuestionAnswer, MdStar, MdLocalOffer, MdPeople,
    MdPayment, MdPersonAdd, MdReport, MdPages, MdAccountBalanceWallet,
    MdList, MdNotifications, MdAdd, MdVerifiedUser, MdSettings, MdChevronRight,
    MdSecurity
} from 'react-icons/md';
import inakkamLogo from '../../assets/inakkam-logo-icon.png';
import './Sidebar.css';

const menuItems = [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/' },
    { label: 'KYC Verification', icon: <MdVerifiedUser />, path: '/verification-list' },
    {
        label: 'Users', icon: <MdPeople />,
        children: [
            { label: 'Add User', icon: <MdAdd />, path: '/user/add' },
            { label: 'List Users', icon: <MdList />, path: '/user-list' },
        ]
    },
    {
        label: 'Elite Agents', icon: <MdSecurity />,
        children: [
            { label: 'Add Agent', icon: <MdAdd />, path: '/elite-agent/add' },
            { label: 'List Agents', icon: <MdList />, path: '/elite-agent/list' },
        ]
    },
    {
        label: 'Interest', icon: <MdOutlineAutoAwesome />,
        children: [
            { label: 'Add Interest', icon: <MdAdd />, path: '/interest/add' },
            { label: 'List Interest', icon: <MdList />, path: '/interest/list' },
        ]
    },
    {
        label: 'Language', icon: <MdLanguage />,
        children: [
            { label: 'Add Language', icon: <MdAdd />, path: '/language/add' },
            { label: 'List Language', icon: <MdList />, path: '/language/list' },
        ]
    },
    {
        label: 'Religion', icon: <MdBook />,
        children: [
            { label: 'Add Religion', icon: <MdAdd />, path: '/religion/add' },
            { label: 'List Religion', icon: <MdList />, path: '/religion/list' },
        ]
    },
    {
        label: 'Gift', icon: <MdCardGiftcard />,
        children: [
            { label: 'Add Gift', icon: <MdAdd />, path: '/gift/add' },
            { label: 'List Gift', icon: <MdList />, path: '/gift/list' },
        ]
    },
    {
        label: 'Relation Goal', icon: <MdFavorite />,
        children: [
            { label: 'Add Relation Goal', icon: <MdAdd />, path: '/relation-goal/add' },
            { label: 'List Relation Goal', icon: <MdList />, path: '/relation-goal/list' },
        ]
    },
    {
        label: 'FAQ', icon: <MdQuestionAnswer />,
        children: [
            { label: 'Add FAQ', icon: <MdAdd />, path: '/faq/add' },
            { label: 'List FAQ', icon: <MdList />, path: '/faq/list' },
        ]
    },
    {
        label: 'Plan', icon: <MdStar />,
        children: [
            { label: 'Add Plan', icon: <MdAdd />, path: '/plan/add' },
            { label: 'List Plan', icon: <MdList />, path: '/plan/list' },
        ]
    },
    {
        label: 'Package', icon: <MdLocalOffer />,
        children: [
            { label: 'Add Package', icon: <MdAdd />, path: '/package/add' },
            { label: 'List Package', icon: <MdList />, path: '/package/list' },
        ]
    },
    {
        label: 'Staff', icon: <MdPeople />,
        children: [
            { label: 'Add Staff', icon: <MdAdd />, path: '/staff/add' },
            { label: 'List Staff', icon: <MdList />, path: '/staff/list' },
        ]
    },
    { label: 'Payment List', icon: <MdPayment />, path: '/payment-list' },
    { label: 'Payout List', icon: <MdAccountBalanceWallet />, path: '/payout-list' },
    { label: 'Fake User Generator', icon: <MdPersonAdd />, path: '/fake-user-generator' },
    { label: 'Report List', icon: <MdReport />, path: '/report-list' },
    {
        label: 'Page', icon: <MdPages />,
        children: [
            { label: 'Add Page', icon: <MdAdd />, path: '/page/add' },
            { label: 'List Page', icon: <MdList />, path: '/page/list' },
        ]
    },
    { label: 'Push Notification', icon: <MdNotifications />, path: '/push-notification' },
    { label: 'Settings', icon: <MdSettings />, path: '/settings' },
];

const agentMenuItems = [
    { label: 'Agent Portal', icon: <MdDashboard />, path: '/' },
    { label: 'Settings', icon: <MdSettings />, path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

    const { admin, hasPermission } = useAuth();

    const isItemVisible = (item) => {
        if (!admin) return false;
        if (admin.role === 'agent' || admin.isEliteAgent) return false;
        if (admin.role === 'superadmin') return true;
        if (item.label === 'Staff') return false;

        if (item.label === 'KYC Verification' || item.label === 'User List' || item.label === 'Users' || item.label === 'Elite Agents') {
            return hasPermission('userList', 'Read') || hasPermission('eliteAgent', 'Read');
        }
        if (item.label === 'Payment List') {
            return hasPermission('paymentGateway', 'Read');
        }
        if (item.label === 'Payout List') {
            return hasPermission('payout', 'Read');
        }
        if (item.label === 'Fake User Generator') {
            return hasPermission('fakeUser', 'Update');
        }
        if (item.label === 'Report List') {
            return hasPermission('report', 'Read');
        }
        if (item.label === 'Push Notification') {
            return hasPermission('notification', 'Write');
        }

        let key = null;
        if (item.label === 'Interest') key = 'interest';
        else if (item.label === 'Language') key = 'language';
        else if (item.label === 'Religion') key = 'religion';
        else if (item.label === 'Gift') key = 'gift';
        else if (item.label === 'Relation Goal') key = 'relationGoals';
        else if (item.label === 'FAQ') key = 'faq';
        else if (item.label === 'Plan') key = 'plan';
        else if (item.label === 'Package') key = 'package';
        else if (item.label === 'Page') key = 'pages';

        if (key) {
            return hasPermission(key, 'Read') || hasPermission(key, 'Write');
        }

        return true;
    };

    const getFilteredMenuItems = () => {
        if (admin && (admin.role === 'agent' || admin.isEliteAgent)) {
            return agentMenuItems;
        }
        return menuItems
            .filter(isItemVisible)
            .map(item => {
                if (item.children) {
                    const filteredChildren = item.children.filter(child => {
                        let key = null;
                        if (item.label === 'Interest') key = 'interest';
                        else if (item.label === 'Language') key = 'language';
                        else if (item.label === 'Religion') key = 'religion';
                        else if (item.label === 'Gift') key = 'gift';
                        else if (item.label === 'Relation Goal') key = 'relationGoals';
                        else if (item.label === 'FAQ') key = 'faq';
                        else if (item.label === 'Plan') key = 'plan';
                        else if (item.label === 'Package') key = 'package';
                        else if (item.label === 'Page') key = 'pages';
                        else if (item.label === 'Users') key = 'userList';
                        else if (item.label === 'Elite Agents') key = 'eliteAgent';
                        
                        if (key) {
                            if (child.label.startsWith('Add')) {
                                return hasPermission(key, 'Write') || (key === 'eliteAgent' && hasPermission('userList', 'Write'));
                            }
                            if (child.label.startsWith('List')) {
                                return hasPermission(key, 'Read') || (key === 'eliteAgent' && hasPermission('userList', 'Read'));
                            }
                        }
                        return true;
                    });
                    return { ...item, children: filteredChildren };
                }
                return item;
            })
            .filter(item => !item.children || item.children.length > 0);
    };

    const toggleMenu = (label) => {
        if (collapsed && onToggle) {
            onToggle(); // expand sidebar if collapsed
        }
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const isChildActive = (children) =>
        children?.some(c => location.pathname === c.path);

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={onMobileClose} />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo Section */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <img src={inakkamLogo} alt="Inakkam" className="sidebar-logo-img" />
                    </div>
                    {!collapsed && (
                        <div className="sidebar-logo-text">
                            <span className="sidebar-logo-name">Inakkam</span>
                            <span className="sidebar-logo-sub">Admin Panel</span>
                        </div>
                    )}
                </div>

                {/* Nav Menu */}
                <nav className="sidebar-nav">
                    {getFilteredMenuItems().map((item) => {
                        if (item.children) {
                            const isOpen = openMenus[item.label] || isChildActive(item.children);
                            return (
                                <div key={item.label} className={`sidebar-group ${isOpen ? 'open' : ''}`}>
                                    <button
                                        className={`sidebar-item sidebar-item-parent ${isChildActive(item.children) ? 'active-parent' : ''}`}
                                        onClick={() => toggleMenu(item.label)}
                                        title={collapsed ? item.label : ''}
                                    >
                                        <span className="sidebar-icon">{item.icon}</span>
                                        {!collapsed && (
                                            <>
                                                <span className="sidebar-label">{item.label}</span>
                                                <MdChevronRight className={`sidebar-arrow ${isOpen ? 'rotated' : ''}`} />
                                            </>
                                        )}
                                    </button>
                                    {!collapsed && isOpen && (
                                        <div className="sidebar-submenu">
                                            {item.children.map(child => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `sidebar-subitem ${isActive ? 'active' : ''}`
                                                    }
                                                    onClick={onMobileClose}
                                                >
                                                    <span className="sidebar-icon">{child.icon}</span>
                                                    <span className="sidebar-label">{child.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `sidebar-item ${isActive ? 'active' : ''}`
                                }
                                title={collapsed ? item.label : ''}
                                onClick={onMobileClose}
                            >
                                <span className="sidebar-icon">{item.icon}</span>
                                {!collapsed && <span className="sidebar-label">{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {!collapsed && admin && (admin.role === 'agent' || admin.isEliteAgent) && (
                    <div className="sidebar-agent-lounge-card">
                        <div className="sal-avatar-wrap">
                            <img src={admin?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} alt={admin?.name || 'Agent'} />
                            <span className="sal-online-dot" />
                        </div>
                        <div className="sal-info">
                            <span className="sal-name">{admin?.name || 'Anjali Nair'}</span>
                            <span className="sal-role">Verified Elite Agent</span>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
