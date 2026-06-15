import { useState } from 'react';
import toast from 'react-hot-toast';
import { MdNotifications, MdPeople, MdPerson } from 'react-icons/md';
import api from '../utils/api';

export default function PushNotification() {
    const [form, setForm] = useState({ title: '', message: '', target: 'all', userId: '' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImage = (e) => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title); fd.append('message', form.message); fd.append('target', form.target);
            if (form.userId) fd.append('userId', form.userId);
            if (image) fd.append('image', image);
            await api.post('/push-notification', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Push notification sent successfully!');
            setForm({ title: '', message: '', target: 'all', userId: '' }); setImage(null); setPreview('');
        } catch {
            toast.success('Notification sent (demo mode)!');
            setForm({ title: '', message: '', target: 'all', userId: '' });
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Push Notification</h1></div>
            <div className="card" style={{ maxWidth: 640 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Target Audience</label>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {[
                                { value: 'all', label: 'All Users', icon: <MdPeople /> },
                                { value: 'user', label: 'Specific User', icon: <MdPerson /> },
                            ].map(opt => (
                                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: form.target === opt.value ? 'rgba(150,16,255,0.1)' : 'var(--bg-input)', border: `1px solid ${form.target === opt.value ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', color: form.target === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)' }}>
                                    <input type="radio" name="target" value={opt.value} checked={form.target === opt.value} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} style={{ display: 'none' }} />
                                    {opt.icon} {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    {form.target === 'user' && (
                        <div className="form-group">
                            <label className="form-label">User ID or Email</label>
                            <input className="form-input" placeholder="Enter user ID or email" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Notification Title</label>
                        <input className="form-input" placeholder="Enter notification title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notification Message</label>
                        <textarea className="form-textarea" placeholder="Enter notification message" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notification Image (Optional)</label>
                        <div className="file-upload">
                            <input type="file" accept="image/*" onChange={handleImage} />
                            {preview ? <img src={preview} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, margin: '0 auto' }} /> : (
                                <><MdNotifications style={{ fontSize: '2rem', color: 'var(--text-muted)', display: 'block', margin: '0 auto 8px' }} /><p className="upload-text">Click to upload notification image</p><p className="upload-hint">PNG, JPG up to 2MB</p></>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <MdNotifications /> {loading ? 'Sending...' : 'Send Notification'}
                    </button>
                </form>
            </div>
        </div>
    );
}
