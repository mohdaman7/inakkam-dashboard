import { useState, useEffect, useCallback } from 'react';
import {
  MdCurrencyRupee, MdCheckCircle, MdCancel, MdPending, MdSearch,
  MdRefresh, MdPerson, MdImage, MdClose, MdOpenInNew, MdWhatsapp,
} from 'react-icons/md';
import api from '../utils/api';

const STATUS_COLORS = {
  pending:  { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: 'Pending' },
  approved: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', label: 'Approved' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Rejected' },
};

const PKG_TYPE_LABEL = { recharge: 'Coin Recharge', audio: 'Audio Bundle', video: 'Video Bundle' };
const PAYMENT_METHOD_LABEL = {
  qr_federal:   { label: 'QR - Federal Bank',   color: '#1a56db', bg: '#eff6ff' },
  qr_hdfc:      { label: 'QR - HDFC Bank',      color: '#004C8F', bg: '#eff6ff' },
  bank_federal: { label: 'Bank - Federal Bank',  color: '#1a56db', bg: '#eff6ff' },
  bank_hdfc:    { label: 'Bank - HDFC Bank',     color: '#004C8F', bg: '#eff6ff' },
  card:         { label: 'Card Payment',         color: '#D51659', bg: '#fdf2f8' },
  whatsapp:     { label: 'Via WhatsApp',         color: '#128C7E', bg: '#f0fdf4' },
  other:        { label: 'Other',                color: '#64748b', bg: '#f8fafc' },
};

export default function CoinRequests() {
  const [requests, setRequests]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected]     = useState(null); // detail modal
  const [noteInput, setNoteInput]   = useState('');
  const [imgModal, setImgModal]     = useState(null); // full-screen screenshot

  const LIMIT = 12;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter !== 'all') params.set('status', filter);
      const res = await api.get(`/admin/coin-requests?${params}`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setTotal(res.data.total || 0);
        setPendingCount(res.data.pendingCount || 0);
      }
    } catch (err) {
      console.error('Failed to load coin requests', err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const endpoint = `/admin/coin-requests/${id}/${action}`;
      const res = await api.patch(endpoint, { note: noteInput });
      if (res.data.success) {
        alert(`✅ ${action === 'approve' ? 'Coins credited!' : 'Request rejected.'} ${res.data.message || ''}`);
        setSelected(null);
        setNoteInput('');
        fetchRequests();
      } else {
        alert('Error: ' + (res.data.message || 'Action failed'));
      }
    } catch (err) {
      alert('Error: ' + (typeof err === 'string' ? err : 'Action failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search
    ? requests.filter(r => {
        const name = r.user?.name || '';
        const email = r.user?.email || '';
        const phone = r.user?.phone || '';
        return [name, email, phone].some(v => v.toLowerCase().includes(search.toLowerCase()));
      })
    : requests;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: '32px', minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            💰 Coin Requests
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Review UPI payment screenshots &amp; credit coins to users
          </p>
        </div>
        <button
          onClick={fetchRequests}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          <MdRefresh size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pending Review', value: pendingCount, color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
          { label: 'Total Requests', value: total, color: '#6366f1', bg: '#eef2ff', icon: '📋' },
          { label: 'Approved Today', value: requests.filter(r => r.status === 'approved').length, color: '#10b981', bg: '#ecfdf5', icon: '✅' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: '#ef4444', bg: '#fef2f2', icon: '❌' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '18px 20px', border: `1.5px solid ${s.color}22` }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter + Search Row ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: '2px solid',
              borderColor: filter === f ? '#D51659' : '#e2e8f0',
              background: filter === f ? '#D51659' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span style={{ marginLeft: 6, background: '#fff', color: '#D51659', borderRadius: 50, padding: '1px 7px', fontSize: 11, fontWeight: 900 }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name / phone / email..."
            style={{ paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, width: 260, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* ── Requests Grid ─────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontSize: 16 }}>
          Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>No coin requests found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>New requests will appear here as users submit payments</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map(req => {
            const user = req.user || {};
            const avatar = user.photos?.[0]?.url || '';
            const status = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
            const timeAgo = (() => {
              const diff = Date.now() - new Date(req.createdAt).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 60) return `${mins}m ago`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h ago`;
              return `${Math.floor(hrs / 24)}d ago`;
            })();
            return (
              <div
                key={req._id}
                onClick={() => { setSelected(req); setNoteInput(''); }}
                style={{
                  background: '#fff', borderRadius: 20, border: `1.5px solid ${req.status === 'pending' ? '#fde68a' : '#e2e8f0'}`,
                  padding: 20, cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: req.status === 'pending' ? '0 4px 24px rgba(245, 158, 11, 0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {/* Row 1: User + Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: '#f1f5f9',
                      backgroundImage: avatar ? `url(${avatar})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {!avatar && <MdPerson style={{ fontSize: 22, color: '#94a3b8' }} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', margin: 0 }}>
                        {user.name || 'Unknown User'}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, marginTop: 1 }}>
                        {user.phone || user.email || 'No contact'}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 800,
                    background: status.bg, color: status.text, border: `1.5px solid ${status.border}`
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Row 2: Coins + Amount */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: '#fffbeb', borderRadius: 12, padding: '10px 14px', border: '1px solid #fde68a' }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Coins</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#78350f' }}>
                      🪙 {req.coins?.toLocaleString()}
                    </p>
                  </div>
                  <div style={{ flex: 1, background: '#f0fdf4', borderRadius: 12, padding: '10px 14px', border: '1px solid #bbf7d0' }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#064e3b' }}>₹{req.amount?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Row 3: Payment method + time + screenshot thumb */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {(() => {
                      const pm = PAYMENT_METHOD_LABEL[req.paymentMethod] || PAYMENT_METHOD_LABEL.other;
                      return (
                        <span style={{ fontSize: 10, color: pm.color, fontWeight: 700, background: pm.bg, padding: '3px 8px', borderRadius: 6, display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pm.label}{req.submittedViaWhatsapp ? ' [WA]' : ''}
                        </span>
                      );
                    })()}
                    <p style={{ margin: 0, marginTop: 5, fontSize: 11, color: '#94a3b8' }}>{timeAgo}</p>
                  </div>
                  {req.screenshotUrl ? (
                    <div onClick={e => { e.stopPropagation(); setImgModal(req.screenshotUrl); }}
                      style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: '2px solid #e2e8f0', cursor: 'zoom-in', flexShrink: 0 }}>
                      <img src={req.screenshotUrl} alt="Payment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : req.submittedViaWhatsapp ? (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dcfce7', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MdWhatsapp size={22} color="#16a34a" />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: page === 1 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Page {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: page === totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ================================================================
          DETAIL MODAL
      ================================================================ */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>Coin Request Detail</h2>
                <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: '#94a3b8' }}>Review payment and take action</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ padding: 8, borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <MdClose size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* User Info */}
              {(() => {
                const u = selected.user || {};
                const av = u.photos?.[0]?.url || '';
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8fafc', borderRadius: 16, padding: '14px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e2e8f0', backgroundImage: av ? `url(${av})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {!av && <MdPerson size={28} color="#94a3b8" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{u.name || 'Unknown'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{u.email || ''} {u.phone ? `• ${u.phone}` : ''}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>User ID: {u._id || selected.user}</p>
                    </div>
                    <span style={{ padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 800, background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.text, border: `1.5px solid ${STATUS_COLORS[selected.status]?.border}` }}>
                      {STATUS_COLORS[selected.status]?.label}
                    </span>
                  </div>
                );
              })()}

              {/* Coin + Amount Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Coins to Credit', value: `🪙 ${selected.coins?.toLocaleString()}`, bg: '#fffbeb', border: '#fde68a', textColor: '#78350f' },
                  { label: 'INR Amount Paid', value: `₹${selected.amount?.toLocaleString()}`, bg: '#f0fdf4', border: '#bbf7d0', textColor: '#064e3b' },
                  { label: 'Package Type', value: PKG_TYPE_LABEL[selected.packageType] || 'Recharge', bg: '#eff6ff', border: '#bfdbfe', textColor: '#1e3a5f' },
                  { label: 'Submitted', value: new Date(selected.createdAt).toLocaleString('en-IN'), bg: '#f8fafc', border: '#e2e8f0', textColor: '#334155' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '12px 14px', border: `1.5px solid ${item.border}` }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: item.textColor }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* UTR Number */}
              {selected.utrNumber && (
                <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>UTR / Transaction Reference</p>
                  <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 800, color: '#334155', fontFamily: 'monospace' }}>{selected.utrNumber}</p>
                </div>
              )}

              {/* Payment Screenshot */}
              {selected.screenshotUrl && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <MdImage style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Payment Screenshot
                  </p>
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                    <img
                      src={selected.screenshotUrl}
                      alt="Payment proof"
                      style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: '#f8fafc', display: 'block' }}
                    />
                    <button
                      onClick={() => setImgModal(selected.screenshotUrl)}
                      style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <MdOpenInNew size={14} /> Full View
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Note */}
              {selected.status === 'pending' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Admin Note / Rejection Reason (optional)
                  </label>
                  <textarea
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add a note for the user (e.g. payment verified / reason for rejection)..."
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', resize: 'vertical', fontFamily: 'inherit', fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {/* Show processed info if already done */}
              {selected.status !== 'pending' && selected.adminNote && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Admin Note</p>
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: '#334155' }}>{selected.adminNote}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selected.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => handleAction(selected._id, 'reject')}
                    disabled={!!actionLoading}
                    style={{
                      flex: 1, padding: '14px 0', borderRadius: 16, border: '2px solid #fca5a5',
                      background: actionLoading === selected._id + 'reject' ? '#fee2e2' : '#fff',
                      color: '#dc2626', fontWeight: 900, fontSize: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s',
                    }}
                  >
                    <MdCancel size={18} />
                    {actionLoading === selected._id + 'reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleAction(selected._id, 'approve')}
                    disabled={!!actionLoading}
                    style={{
                      flex: 2, padding: '14px 0', borderRadius: 16, border: 'none',
                      background: actionLoading === selected._id + 'approve'
                        ? '#059669'
                        : 'linear-gradient(135deg, #059669, #10b981)',
                      color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)', transition: 'all 0.15s',
                    }}
                  >
                    <MdCheckCircle size={18} />
                    {actionLoading === selected._id + 'approve' ? 'Crediting Coins...' : `Credit ${selected.coins?.toLocaleString()} Coins`}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  This request has been <strong style={{ color: selected.status === 'approved' ? '#059669' : '#dc2626' }}>{selected.status}</strong>.
                  {selected.processedAt && ` Processed on ${new Date(selected.processedAt).toLocaleString('en-IN')}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          FULL SCREEN IMAGE MODAL
      ================================================================ */}
      {imgModal && (
        <div
          onClick={() => setImgModal(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 24 }}
        >
          <button
            onClick={() => setImgModal(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 50, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <MdClose size={22} />
          </button>
          <img
            src={imgModal}
            alt="Full screenshot"
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

