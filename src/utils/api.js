import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/admin`,
    headers: { 'Content-Type': 'application/json' },
});

// Attach auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('inakkam_admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('inakkam_admin');
            localStorage.removeItem('inakkam_admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
