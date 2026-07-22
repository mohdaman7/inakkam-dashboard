import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ConfirmProvider>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: { background: '#1e1e2d', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' },
                            success: { iconTheme: { primary: '#9610ff', secondary: '#fff' } },
                        }}
                    />
                </ConfirmProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
