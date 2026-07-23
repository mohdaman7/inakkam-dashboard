import React, { createContext, useContext, useState, useRef } from 'react';
import { MdWarning, MdClose } from 'react-icons/md';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const resolveRef = useRef(null);

    const confirm = (options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfig({
                title: options.title || 'Are you sure?',
                message: options.message || 'Do you really want to perform this action?',
                confirmText: options.confirmText || 'Delete',
                cancelText: options.cancelText || 'Cancel',
                type: options.type || 'danger', // danger, warning, info
            });
        });
    };

    const handleConfirm = () => {
        if (resolveRef.current) resolveRef.current(true);
        setConfig(null);
    };

    const handleCancel = () => {
        if (resolveRef.current) resolveRef.current(false);
        setConfig(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {config && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal" style={{ maxWidth: '400px', transform: 'scale(1)', transition: 'transform 0.2s' }}>
                        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: config.type === 'danger' ? 'rgba(255, 61, 113, 0.15)' : 'rgba(255, 170, 0, 0.15)',
                                    color: config.type === 'danger' ? 'var(--danger)' : 'var(--warning)',
                                    fontSize: '20px',
                                    flexShrink: 0
                                }}>
                                    <MdWarning />
                                </div>
                                <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{config.title}</h3>
                            </div>
                            <button className="modal-close" onClick={handleCancel}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ paddingTop: '12px', paddingBottom: '20px', color: 'var(--text-secondary)' }}>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{config.message}</p>
                        </div>
                        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleCancel}
                                style={{ 
                                    background: 'transparent', 
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            >
                                {config.cancelText}
                            </button>
                            <button 
                                className="btn" 
                                onClick={handleConfirm}
                                style={{ 
                                    background: config.type === 'danger' ? 'var(--danger)' : 'var(--primary)', 
                                    color: '#fff',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '500',
                                    boxShadow: config.type === 'danger' ? '0 4px 12px rgba(255, 61, 113, 0.2)' : 'var(--shadow-primary)'
                                }}
                            >
                                {config.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};
