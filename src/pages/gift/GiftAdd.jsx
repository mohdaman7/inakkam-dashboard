import { useState, useEffect } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function GiftAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ coin: '', status: '1' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editData) { setForm({ coin: editData.coin || '', status: String(editData.status ?? 1) }); if (editData.image) setPreview(editData.image); }
    }, [editData]);

    const handleImage = (e) => { const file = e.target.files[0]; if (file) { setImage(file); setPreview(URL.createObjectURL(file)); } };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const fd = new FormData();
            fd.append('coin', form.coin); fd.append('status', form.status);
            if (image) fd.append('image', image);
            if (editData?._id) { await api.put(`/gifts/${editData._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Gift updated!'); }
            else { await api.post('/gifts', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Gift added!'); setForm({ coin: '', status: '1' }); setImage(null); setPreview(''); }
            onSaved?.();
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Gift' : 'Add Gift'}</h1></div>
            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Gift Image</label>
                        <div className="file-upload">
                            <input type="file" accept="image/*" onChange={handleImage} />
                            {preview ? <img src={preview} alt="preview" className="image-preview" style={{ margin: '0 auto' }} /> : (
                                <><MdCloudUpload className="upload-icon" /><p className="upload-text">Click to upload gift image</p><p className="upload-hint">PNG, JPG up to 5MB</p></>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gift Coin</label>
                        <input className="form-input" type="number" placeholder="Enter coin value" value={form.coin} onChange={e => setForm(p => ({ ...p, coin: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            <option value="1">Publish</option><option value="0">Unpublish</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update Gift' : 'Add Gift'}</button>
                </form>
            </div>
        </div>
    );
}
