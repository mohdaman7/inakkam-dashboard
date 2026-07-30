import { useState, useEffect } from 'react';
import { MdSearch, MdEdit, MdDelete, MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function DataTable({
    columns, data, loading, onEdit, onDelete,
    actions, pageKey = 'table', hideSearch = false
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
            {/* Table Toolbar */}
            <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', margin: 0 }}>
                <div className="entries-select" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span>Show</span>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select 
                            value={perPage} 
                            onChange={e => setPerPage(+e.target.value)}
                            style={{
                                padding: '6px 28px 6px 12px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.75rem', pointerEvents: 'none' }}>▼</span>
                    </div>
                    <span>entries</span>
                </div>

                {!hideSearch && (
                    <div className="table-search" style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
                        <MdSearch className="search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                        <input
                            placeholder="Search table..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Table Contents */}
            <div className="data-table-wrapper" style={{ margin: 0, border: 'none' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: 60, padding: '16px 20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sr No.</th>
                            {columns.map(col => (
                                <th key={col.key} style={{ padding: '16px 20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {col.label}
                                </th>
                            ))}
                            <th style={{ width: 120, padding: '16px 20px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: 40 }}>
                                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                    No records found
                                </td>
                            </tr>
                        ) : paginated.map((row, i) => (
                            <tr key={row._id || i} style={{ transition: 'background-color 0.2s' }}>
                                <td style={{ color: 'var(--text-muted)', padding: '14px 20px', fontWeight: 600 }}>
                                    {(page - 1) * perPage + i + 1}
                                </td>
                                {columns.map(col => (
                                    <td key={col.key} style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                <td style={{ padding: '14px 20px', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {actions ? actions(row) : (
                                            <>
                                                {onEdit && (
                                                    <button
                                                        className="btn btn-primary btn-sm btn-icon"
                                                        onClick={() => onEdit(row)}
                                                        title="Edit"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <MdEdit />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        className="btn btn-danger btn-sm btn-icon"
                                                        onClick={() => onDelete(row)}
                                                        title="Delete"
                                                        style={{ borderRadius: '6px' }}
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

            {/* Pagination Footer */}
            <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', margin: 0 }}>
                <div className="pagination-info" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Showing <strong style={{ color: 'var(--text-primary)', background: 'rgba(251, 111, 146, 0.08)', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>{(page - 1) * perPage + 1}</strong> to{' '}
                    <strong style={{ color: 'var(--text-primary)', background: 'rgba(251, 111, 146, 0.08)', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>{Math.min(page * perPage, filtered.length)}</strong> of{' '}
                    <strong style={{ color: 'var(--text-primary)', background: 'rgba(251, 111, 146, 0.08)', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>{filtered.length}</strong> entries
                </div>
                <div className="pagination-buttons" style={{ display: 'flex', gap: 6 }}>
                    <button
                        className="pagination-btn animate-hover"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            opacity: page === 1 ? 0.4 : 1
                        }}
                    >
                        <MdChevronLeft style={{ fontSize: '1.1rem' }} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, index, array) => {
                            const showEllipsis = index > 0 && p - array[index - 1] > 1;
                            const isActive = page === p;

                            return (
                                <div key={p} style={{ display: 'flex', gap: 6 }}>
                                    {showEllipsis && <span style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>...</span>}
                                    <button
                                        className={`pagination-btn ${isActive ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            background: isActive ? 'linear-gradient(135deg, #fb6f92 0%, #ff8fab 100%)' : 'var(--bg-input)',
                                            border: isActive ? 'none' : '1px solid var(--border-color)',
                                            color: isActive ? '#fff' : 'var(--text-primary)',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isActive ? '0 4px 10px rgba(251, 111, 146, 0.2)' : 'none'
                                        }}
                                    >
                                        {p}
                                    </button>
                                </div>
                            );
                        })}
                    <button
                        className="pagination-btn animate-hover"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            opacity: page === totalPages ? 0.4 : 1
                        }}
                    >
                        <MdChevronRight style={{ fontSize: '1.1rem' }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
