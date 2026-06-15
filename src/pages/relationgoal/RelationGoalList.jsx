import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import RelationGoalAdd from './RelationGoalAdd';
import { MdAdd } from 'react-icons/md';
import api from '../../utils/api';

const DEMO = [
    { _id: '1', title: 'Casual Dating', subtitle: 'Just having fun', status: 1 },
    { _id: '2', title: 'Long-term Relationship', subtitle: 'Looking for partner', status: 1 },
    { _id: '3', title: 'Marriage', subtitle: 'Ready to settle', status: 1 },
    { _id: '4', title: 'Friendship', subtitle: 'New connections', status: 1 },
    { _id: '5', title: 'Open Relationship', subtitle: 'Flexible', status: 1 },
    { _id: '6', title: 'Not Sure Yet', subtitle: 'Taking it slow', status: 0 },
    { _id: '7', title: 'Something Serious', subtitle: 'Committed', status: 1 },
];

const columns = [
    { key: 'title', label: 'Relation Goal Title' },
    { key: 'subtitle', label: 'Relation Goal Subtitle' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v == 1 ? 'badge-publish' : 'badge-unpublish'}`}>{v == 1 ? 'Publish' : 'Unpublish'}</span> },
];

export default function RelationGoalList() {
    const [data, setData] = useState(DEMO);
    const [loading, setLoading] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const fetchData = async () => { setLoading(true); try { const res = await api.get('/relation-goals'); if (res.data?.goals?.length) setData(res.data.goals); } catch { } finally { setLoading(false); } };
    useEffect(() => { fetchData(); }, []);
    if (editItem) return <RelationGoalAdd editData={editItem} onSaved={() => { setEditItem(null); fetchData(); }} />;
    return (
        <div>
            <div className="page-header"><h1 className="page-title">List Relation Goal</h1><button className="btn btn-primary" onClick={() => window.location.href = '/relation-goal/add'}><MdAdd /> Add Relation Goal</button></div>
            <div className="card"><DataTable columns={columns} data={data} loading={loading} onEdit={setEditItem} /></div>
        </div>
    );
}
