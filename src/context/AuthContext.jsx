import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('inakkam_admin');
        if (stored) {
            try {
                setAdmin(JSON.parse(stored));
            } catch {
                localStorage.removeItem('inakkam_admin');
            }
        }
        setLoading(false);
    }, []);

    const login = (adminData) => {
        setAdmin(adminData);
        localStorage.setItem('inakkam_admin', JSON.stringify(adminData));
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('inakkam_admin');
        localStorage.removeItem('inakkam_admin_token');
    };

    const hasPermission = (moduleKey, op) => {
        if (!admin) return false;
        if (admin.role === 'superadmin') return true;
        if (!admin.permissions) return false;
        return !!admin.permissions[`${moduleKey}_${op}`];
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}
