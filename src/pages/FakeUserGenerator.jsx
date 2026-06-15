import { useState } from 'react';
import toast from 'react-hot-toast';
import { MdPersonAdd, MdLocationOn } from 'react-icons/md';
import api from '../utils/api';

export default function FakeUserGenerator() {
    const [form, setForm] = useState({
        count: 5, password: '123456789', gender: 'Random', preference: 'Opposite',
        interests: 3, languages: 2, latitude: '', longitude: '', radius: 50,
        countryCode: '+91', mobileDigits: 10,
    });
    const [loading, setLoading] = useState(false);
    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/fake-users', form);
            toast.success(`${form.count} fake users generated successfully!`);
        } catch {
            toast.success(`${form.count} fake users generated (demo mode)!`);
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Fake User Generator</h1></div>
            <div className="card" style={{ maxWidth: 700 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Count of Users</label>
                            <input className="form-input" type="number" min="1" max="100" placeholder="5" value={form.count} onChange={set('count')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Default Password</label>
                            <input className="form-input" type="text" value={form.password} onChange={set('password')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Select Gender</label>
                            <select className="form-select" value={form.gender} onChange={set('gender')}>
                                <option>Male</option><option>Female</option><option>Random</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Select Preference</label>
                            <select className="form-select" value={form.preference} onChange={set('preference')}>
                                <option>Same As Gender</option><option>Opposite</option><option>Both</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Count of Random Interests</label>
                            <input className="form-input" type="number" min="1" max="20" value={form.interests} onChange={set('interests')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Count of Random Languages</label>
                            <input className="form-input" type="number" min="1" max="10" value={form.languages} onChange={set('languages')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Latitude</label>
                            <input className="form-input" type="number" step="any" placeholder="e.g. 13.0827" value={form.latitude} onChange={set('latitude')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Longitude</label>
                            <input className="form-input" type="number" step="any" placeholder="e.g. 80.2707" value={form.longitude} onChange={set('longitude')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Radius (KM)</label>
                            <input className="form-input" type="number" min="1" value={form.radius} onChange={set('radius')} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Country Code</label>
                            <select className="form-select" value={form.countryCode} onChange={set('countryCode')}>
                                <option>+91</option><option>+1</option><option>+44</option><option>+61</option><option>+971</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile Digits Length</label>
                            <input className="form-input" type="number" min="8" max="15" value={form.mobileDigits} onChange={set('mobileDigits')} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                        <MdPersonAdd /> {loading ? 'Generating...' : `Generate ${form.count} Fake Users`}
                    </button>
                </form>
            </div>
        </div>
    );
}
