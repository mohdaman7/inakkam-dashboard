import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function PageAdd({ editData, onSaved }) {
    const [form, setForm] = useState({ title: '', content: '', status: '1' });
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (editData) {
            setForm({
                title: editData.title || '',
                content: editData.content || '',
                status: String(editData.status ?? 1)
            });
        }
    }, [editData]);

    const handleFormat = (tag) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = form.content;
        const selected = text.substring(start, end);

        let formatted = '';
        switch (tag) {
            case 'Bold':
                formatted = `<strong>${selected || 'bold text'}</strong>`;
                break;
            case 'Italic':
                formatted = `<em>${selected || 'italic text'}</em>`;
                break;
            case 'Underline':
                formatted = `<u>${selected || 'underlined text'}</u>`;
                break;
            case 'H1':
                formatted = `\n<h1>${selected || 'Heading 1'}</h1>\n`;
                break;
            case 'H2':
                formatted = `\n<h2>${selected || 'Heading 2'}</h2>\n`;
                break;
            case 'UL':
                formatted = `\n<ul>\n  <li>${selected || 'List item 1'}</li>\n  <li>List item 2</li>\n</ul>\n`;
                break;
            case 'OL':
                formatted = `\n<ol>\n  <li>${selected || 'List item 1'}</li>\n  <li>List item 2</li>\n</ol>\n`;
                break;
            case 'Link':
                formatted = `<a href="https://inakkam.co">${selected || 'link text'}</a>`;
                break;
            default:
                formatted = selected;
        }

        const newContent = text.substring(0, start) + formatted + text.substring(end);
        setForm(p => ({ ...p, content: newContent }));

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + formatted.length, start + formatted.length);
        }, 50);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editData?._id) {
                await api.put(`/pages/${editData._id}`, form);
                toast.success('Page updated!');
            } else {
                await api.post('/pages', form);
                toast.success('Page added!');
                setForm({ title: '', content: '', status: '1' });
            }
            onSaved?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">{editData ? 'Edit Page' : 'Add Page'}</h1></div>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Page Title</label>
                            <input className="form-input" placeholder="Enter page title (e.g. Terms & Conditions)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="1">Publish</option>
                                <option value="0">Unpublish</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Page Content</label>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(150,16,255,0.05)', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {['Bold', 'Italic', 'Underline', 'H1', 'H2', 'UL', 'OL', 'Link'].map(btn => (
                                    <button
                                        key={btn}
                                        type="button"
                                        onClick={() => handleFormat(btn)}
                                        style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                                        onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                                    >
                                        {btn}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                ref={textareaRef}
                                style={{ width: '100%', minHeight: 320, padding: 16, background: 'var(--bg-input)', color: 'var(--text-primary)', border: 'none', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
                                placeholder="Enter page content here (HTML supported)..."
                                value={form.content}
                                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editData ? 'Update Page' : 'Add Page'}</button>
                </form>
            </div>
        </div>
    );
}
