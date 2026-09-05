import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    headers: { 'Content-Type': 'application/json' },
});

// Attach auth token and smart baseURL routing
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('inakkam_admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    let url = config.url || '';
    if (url.startsWith('/api/')) {
        config.baseURL = API_BASE_URL;
    } else if (
        url.startsWith('/enablex') ||
        url.startsWith('/conversations') ||
        url.startsWith('/coins') ||
        url.startsWith('/users') ||
        url.startsWith('/matches') ||
        url.startsWith('/auth') ||
        url.startsWith('/discover')
    ) {
        config.baseURL = `${API_BASE_URL}/api`;
    } else {
        config.baseURL = `${API_BASE_URL}/api/admin`;
    }

    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('inakkam_admin');
            localStorage.removeItem('inakkam_admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
