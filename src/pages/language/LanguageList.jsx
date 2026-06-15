import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import LanguageAdd from './LanguageAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';

const DEMO = [
    { _id: '1', title: 'English', image: '', status: 1 }, { _id: '2', title: 'Hindi', image: '', status: 1 },
    { _id: '3', title: 'Tamil', image: '', status: 1 }, { _id: '4', title: 'Telugu', image: '', status: 1 },
    { _id: '5', title: 'Malayalam', image: '', status: 1 }, { _id: '6', title: 'Kannada', image: '', status: 1 },
    { _id: '7', title: 'Bengali', image: '', status: 1 }, { _id: '8', title: 'Marathi', image: '', status: 1 },
    { _id: '9', title: 'Gujarati', image: '', status: 1 }, { _id: '10', title: 'Punjabi', image: '', status: 1 },
    { _id: '11', title: 'Urdu', image: '', status: 1 }, { _id: '12', title: 'French', image: '', status: 0 },
    { _id: '13', title: 'Arabic', image: '', status: 1 },
];

const columns = [
    { key: 'image', label: 'Language Image', render: (val) => val ? <img src={val} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(150,16,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💬</div> },
    { key: 'title', label: 'Language Title' },
    { key: 'status', label: 'Language Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];

export default function LanguageList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try { const res = await api.get('/languages'); if (res.data?.languages?.length) setData(res.data.languages); }
        catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) return <LanguageAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Language</h1>
                <button className="btn btn-primary" onClick={() => window.location.href = '/language/add'}><MdAdd /> Add Language</button>
            </div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} onEdit={setEditItem} /></div>
        </div>
    );
}
