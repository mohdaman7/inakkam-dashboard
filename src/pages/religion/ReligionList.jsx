import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import ReligionAdd from './ReligionAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';

const DEMO = [
    { _id: '1', title: 'Hindu', status: 1 }, { _id: '2', title: 'Muslim', status: 1 },
    { _id: '3', title: 'Christian', status: 1 }, { _id: '4', title: 'Sikh', status: 1 },
    { _id: '5', title: 'Buddhist', status: 1 }, { _id: '6', title: 'Jain', status: 1 },
    { _id: '7', title: 'Jewish', status: 1 }, { _id: '8', title: 'Parsi', status: 0 },
    { _id: '9', title: 'Atheist', status: 1 }, { _id: '10', title: 'Other', status: 1 },
    { _id: '11', title: 'Agnostic', status: 1 }, { _id: '12', title: 'Spiritual', status: 1 },
];

const columns = [
    { key: 'title', label: 'Religion Title' },
    { key: 'status', label: 'Religion Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];

export default function ReligionList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const fetchData = async () => { setLoading(true); try { const res = await api.get('/religions'); if (res.data?.religions?.length) setData(res.data.religions); } catch { } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);
    if (editItem) return <ReligionAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">List Religion</h1>
                <button className="btn btn-primary" onClick={() => window.location.href = '/religion/add'}><MdAdd /> Add Religion</button>
            </div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} onEdit={setEditItem} /></div>
        </div>
    );
}
