import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdVerifiedUser, MdCheckCircle, MdCancel, MdVisibility, MdRefresh, MdClose } from 'react-icons/md';

export default function VerificationList() {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [rejectModal, setRejectModal] = useState(null); // { id, reason }
    const [actionLoading, setActionLoading] = useState(false);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const url = filterStatus ? `/verifications?status=${filterStatus}` : '/verifications';
            const res = await api.get(url);
            if (res.data?.verifications) {
                setVerifications(res.data.verifications);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch verification requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, [filterStatus]);

    const handleUpdateStatus = async (id, status, rejectionReason = '') => {
        setActionLoading(true);
        try {
            await api.patch(`/verifications/${id}/status`, { status, rejectionReason });
            toast.success(`Verification status updated to ${status.replace(/_/g, ' ')}`);
            setRejectModal(null);
            if (selectedDoc && selectedDoc._id === id) {
                setSelectedDoc(prev => prev ? { ...prev, status } : null);
            }
            fetchVerifications();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        {
            key: 'fullName',
            label: 'User Name',
            render: (v, row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>{v || row.userId?.name || 'N/A'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.email || row.userId?.email || row.phone}</div>
                </div>
            )
        },
        { key: 'gender', label: 'Gender', render: (v) => v || 'N/A' },
        { key: 'occupation', label: 'Occupation', render: (v) => v || 'N/A' },
        { key: 'paymentMethod', label: 'Payout Method', render: (v) => <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{v || 'N/A'}</span> },
        {
            key: 'status',
            label: 'Status',
            render: (v) => {
                let badgeClass = 'badge-pending';
                if (v === 'VERIFIED') badgeClass = 'badge-publish';
                else if (v === 'REJECTED') badgeClass = 'badge-unpublish';
                else if (v === 'UNDER_VERIFICATION') badgeClass = 'badge-info';
                return <span className={`badge ${badgeClass}`}>{v ? v.replace(/_/g, ' ') : 'NOT VERIFIED'}</span>;
            }
        },
        {
            key: 'submittedAt',
            label: 'Submitted Date',
            render: (v) => v ? new Date(v).toLocaleDateString() : 'N/A'
        }
    ];

    const renderActions = (row) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
                className="btn btn-primary btn-sm btn-icon"
                title="View Verification Documents"
                onClick={() => setSelectedDoc(row)}
            >
                <MdVisibility />
            </button>
            {row.status !== 'VERIFIED' && (
                <button
                    className="btn btn-success btn-sm btn-icon"
                    title="Approve Verification"
                    onClick={() => handleUpdateStatus(row._id, 'VERIFIED')}
                    disabled={actionLoading}
                >
                    <MdCheckCircle />
                </button>
            )}
            {row.status !== 'REJECTED' && (
                <button
                    className="btn btn-danger btn-sm btn-icon"
                    title="Reject Verification"
                    onClick={() => setRejectModal({ id: row._id, reason: '' })}
                    disabled={actionLoading}
                >
                    <MdCancel />
                </button>
            )}
        </div>
    );

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MdVerifiedUser style={{ color: 'var(--primary-light)' }} /> KYC Verification Requests
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Review Aadhaar, PAN, facial verification and payout bank details submitted by users.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING_VERIFICATION">Pending</option>
                        <option value="UNDER_VERIFICATION">Under Verification</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={fetchVerifications} title="Refresh list">
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            <div className="card">
                <DataTable columns={columns} data={verifications} loading={loading} actions={renderActions} hideSearch={true} />
            </div>

            {/* Document Viewer Details Modal */}
            {selectedDoc && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button
                            onClick={() => setSelectedDoc(null)}
                            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <MdClose />
                        </button>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-white)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MdVerifiedUser /> Verification Details – {selectedDoc.fullName || selectedDoc.userId?.name}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</div>
                                <div style={{ fontWeight: 600 }}>{selectedDoc.fullName}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone / Email</div>
                                <div style={{ fontWeight: 600 }}>{selectedDoc.phone} | {selectedDoc.email}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                                <div style={{ fontWeight: 600 }}>{selectedDoc.address}, {selectedDoc.city}, {selectedDoc.state} - {selectedDoc.pincode}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupation & DOB</div>
                                <div style={{ fontWeight: 600 }}>{selectedDoc.occupation} | {selectedDoc.dateOfBirth ? new Date(selectedDoc.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>

                        {/* Payout Details */}
                        <div style={{ background: 'rgba(150, 16, 255, 0.05)', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '0.95rem', color: 'var(--primary-light)', marginBottom: 8 }}>Payout Method: {selectedDoc.paymentMethod?.toUpperCase()}</h3>
                            {selectedDoc.paymentMethod === 'bank' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.85rem' }}>
                                    <div><strong>Account Holder:</strong> {selectedDoc.bankDetails?.accountHolderName || 'N/A'}</div>
                                    <div><strong>Bank Name:</strong> {selectedDoc.bankDetails?.bankName || 'N/A'}</div>
                                    <div><strong>Account Number:</strong> {selectedDoc.bankDetails?.accountNumber || 'N/A'}</div>
                                    <div><strong>IFSC Code:</strong> {selectedDoc.bankDetails?.ifscCode || 'N/A'}</div>
                                </div>
                            ) : (
                                <div><strong>UPI ID:</strong> {selectedDoc.upiId || 'N/A'}</div>
                            )}
                        </div>

                        {/* Documents Grid */}
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-white)', marginBottom: 12 }}>Uploaded Documents</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                            {selectedDoc.selfieImage && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Live Selfie</div>
                                    <img src={selectedDoc.selfieImage} alt="Selfie" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }} />
                                </div>
                            )}
                            {selectedDoc.aadhaarFront && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Aadhaar Front</div>
                                    <img src={selectedDoc.aadhaarFront} alt="Aadhaar Front" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }} />
                                </div>
                            )}
                            {selectedDoc.aadhaarBack && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Aadhaar Back</div>
                                    <img src={selectedDoc.aadhaarBack} alt="Aadhaar Back" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }} />
                                </div>
                            )}
                            {selectedDoc.panCard && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>PAN Card</div>
                                    <img src={selectedDoc.panCard} alt="PAN Card" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }} />
                                </div>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                            {selectedDoc.status !== 'VERIFIED' && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleUpdateStatus(selectedDoc._id, 'VERIFIED')}
                                    disabled={actionLoading}
                                >
                                    <MdCheckCircle /> Approve & Verify User
                                </button>
                            )}
                            {selectedDoc.status !== 'REJECTED' && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => { setRejectModal({ id: selectedDoc._id, reason: '' }); }}
                                    disabled={actionLoading}
                                >
                                    <MdCancel /> Reject Application
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setSelectedDoc(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 450 }}>
                        <h3 style={{ color: 'var(--danger)', marginBottom: 12 }}>Reject Verification Application</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Please specify the reason for rejecting this verification application so the user can fix the issue.
                        </p>
                        <textarea
                            rows={4}
                            placeholder="Reason for rejection (e.g., Aadhaar card image is blurry, name mismatch...)"
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal(prev => prev ? { ...prev, reason: e.target.value } : null)}
                            style={{ width: '100%', padding: 12, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', marginBottom: 16 }}
                        />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleUpdateStatus(rejectModal.id, 'REJECTED', rejectModal.reason)}
                                disabled={actionLoading || !rejectModal.reason.trim()}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
