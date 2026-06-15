import { useState, useEffect, useRef } from 'react';
import { MdSearch, MdEdit, MdDelete, MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function DataTable({
    columns, data, loading, onEdit, onDelete,
    actions, pageKey = 'table'
}) {
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    const filtered = (data || []).filter(row =>
        columns.some(col => {
            const val = row[col.key];
            return val && String(val).toLowerCase().includes(search.toLowerCase());
        })
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    useEffect(() => { setPage(1); }, [search, perPage]);

    return (
        <div>
            <div className="table-toolbar">
                <div className="entries-select">
                    Show
                    <select value={perPage} onChange={e => setPerPage(+e.target.value)}>
                        {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
                    </select>
                    entries
                </div>
                <div className="table-search">
                    <MdSearch className="search-icon" />
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: 60 }}>Sr No.</th>
                            {columns.map(col => <th key={col.key}>{col.label}</th>)}
                            <th style={{ width: 120 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: 40 }}>
                                <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            </td></tr>
                        ) : paginated.length === 0 ? (
                            <tr><td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                No records found
                            </td></tr>
                        ) : paginated.map((row, i) => (
                            <tr key={row._id || i}>
                                <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * perPage + i + 1}</td>
                                {columns.map(col => (
                                    <td key={col.key}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                <td>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {actions ? actions(row) : (
                                            <>
                                                {onEdit && (
                                                    <button
                                                        className="btn btn-primary btn-sm btn-icon"
                                                        onClick={() => onEdit(row)}
                                                        title="Edit"
                                                    >
                                                        <MdEdit />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        className="btn btn-danger btn-sm btn-icon"
                                                        onClick={() => onDelete(row)}
                                                        title="Delete"
                                                    >
                                                        <MdDelete />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <div className="pagination-info">
                    Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to{' '}
                    {Math.min(page * perPage, filtered.length)} of {filtered.length} entries
                </div>
                <div className="pagination-buttons">
                    <button
                        className="pagination-btn"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <MdChevronLeft />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                        return (
                            <button
                                key={p}
                                className={`pagination-btn ${page === p ? 'active' : ''}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        );
                    })}
                    <button
                        className="pagination-btn"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <MdChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}
