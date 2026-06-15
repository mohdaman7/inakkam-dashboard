import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import InterestAdd from './InterestAdd';
import { MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../utils/api';

// Demo data
const DEMO = [
    { _id: '1', title: 'Music', image: '', status: 1 },
    { _id: '2', title: 'Travel', image: '', status: 1 },
    { _id: '3', title: 'Cooking', image: '', status: 1 },
    { _id: '4', title: 'Fitness', image: '', status: 1 },
    { _id: '5', title: 'Gaming', image: '', status: 0 },
    { _id: '6', title: 'Reading', image: '', status: 1 },
    { _id: '7', title: 'Movies', image: '', status: 1 },
    { _id: '8', title: 'Art', image: '', status: 1 },
    { _id: '9', title: 'Sports', image: '', status: 1 },
];

const columns = [
    { key: 'image', label: 'Interest Image', render: (val) => val ? <img src={val} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(150,16,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>❤️</div> },
    { key: 'title', label: 'Interest Title' },
    {
        key: 'status', label: 'Interest Status',
        render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span>
    },
];

export default function InterestList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/interests');
            if (res.data?.interests?.length) setData(res.data.interests);
        } catch { /* use demo */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    if (editItem) {
        return <InterestAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Interest</h1>
                <button className="btn btn-primary" onClick={() => window.location.href = '/interest/add'}>
                    <MdAdd /> Add Interest
                </button>
            </div>
            <div className="card">
                <DataTable columns={columns} data={data} loading={loading} onEdit={setEditItem} />
            </div>
        </div>
    );
}
