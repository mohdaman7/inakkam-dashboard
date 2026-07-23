import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const toggleSidebar = () => setCollapsed(p => !p);
    const toggleMobile = () => setMobileOpen(p => !p);

    return (
        <div className={`admin-layout ${darkMode ? 'dark' : 'light'}`}>
            <Sidebar
                collapsed={collapsed}
                onToggle={toggleSidebar}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <Header
                    onMenuToggle={toggleMobile}
                    onToggleCollapse={toggleSidebar}
                    darkMode={darkMode}
                    onDarkModeToggle={() => setDarkMode(p => !p)}
                    collapsed={collapsed}
                />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
