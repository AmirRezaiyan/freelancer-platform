import React, { useEffect, useRef, useState, useContext } from "react";
import api from "../api/axios";
import { proposalDetailPath } from "../api/paths";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { formatCurrencyToToman, formatDateIran } from "../utils/formatters";
import { mergeUniqueRecords } from "../utils/collectPaginatedResults";

export default function Proposals() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadingMoreRef = useRef(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 

  const [editing, setEditing] = useState(null); 
  const [saving, setSaving] = useState(false);

  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    setPage(1);
    setProposals([]);
  }, [user?.id]);
  
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        api.defaults.withCredentials = true;
        const res = await api.get("/market/proposals/mine/", {
          params: { page },
          signal: controller.signal,
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || res.data || []);
        if (!mounted) return;
        setProposals((current) => mergeUniqueRecords(page === 1 ? [] : current, data));
        setHasNextPage(Boolean(res.data?.next));
      } catch (err) {
        if (!mounted || controller.signal.aborted) return;
        console.error("fetch proposals error", err?.response?.status);
        setError(err?.response?.data?.detail || err.message || "بارگذاری پیشنهادها انجام نشد.");
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      }
    };
    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [user?.id, page]);

  useEffect(() => {
    if (!editing) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) setEditing(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editing, saving]);

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : null;
  }

  async function handleWithdraw(id) {
    if (!window.confirm("آیا می‌خواهید این پیشنهاد را پس بگیرید؟")) return;
    setWithdrawingId(id);
    setError(null);
    try {
      api.defaults.withCredentials = true;
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      await api.delete(proposalDetailPath(id), { headers });
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "پس‌گرفتن پیشنهاد انجام نشد.";
      setError(msg);
    } finally {
      setWithdrawingId(null);
    }
  }

  function openEdit(p) {
    setEditing({ id: p.id, cover_letter: p.message || p.cover_letter || "", bid: p.bid_amount || p.bid || "" });
  }

  async function saveEdit() {
    if (!editing) return;
    if (!editing.cover_letter.trim()) {
      setError("متن پیشنهاد الزامی است.");
      return;
    }
    const bidAmount = Number(editing.bid);
    if (!Number.isInteger(bidAmount) || bidAmount < 1) {
      setError("مبلغ پیشنهاد باید عدد صحیح و مثبت باشد.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      api.defaults.withCredentials = true;
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      const payload = {
        message: editing.cover_letter.trim(),
        bid_amount: bidAmount
      };

      const res = await api.patch(proposalDetailPath(editing.id), payload, { headers });
      const updated = Array.isArray(res.data) ? res.data[0] : res.data;
      setProposals(prev => prev.map(p => p.id === editing.id ? { ...p, ...updated } : p));
      setEditing(null);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "خطا در ذخیره تغییرات";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const shown = proposals.filter(p => {
    if (statusFilter && (p.status || p.state || "").toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (!query) return true;
    const text = `${p.project?.title || p.project_title || ""} ${p.message || p.cover_letter || ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="proposals-page" style={styles.container}>
      <div className="proposals-header" style={styles.header}>
        <div>
          <h2 style={styles.title}>پیشنهادهای من</h2>
          <p style={styles.subtitle}>پیشنهادهایی که برای پروژه‌ها فرستاده‌اید.</p>
        </div>
        <div style={styles.headerControls}>
          <input 
            aria-label="جستجو در پیشنهادها"
            placeholder="جستجو در عنوان یا متن..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            style={styles.searchInput} 
          />
          <select 
            aria-label="فیلتر وضعیت پیشنهاد"
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            style={styles.select}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="accepted">پذیرفته‌شده</option>
            <option value="rejected">ردشده</option>
          </select>
        </div>
      </div>

      {error && <div className="proposals-error" role="alert" style={styles.error}>{error}</div>}

      {loading ? (
        <div className="proposals-loading" role="status" style={styles.loading}>
          <div style={styles.spinner} />
          در حال بارگذاری...
        </div>
      ) : shown.length === 0 ? (
        <div className="proposals-empty" style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>پیشنهادی برای نمایش نیست</h3>
          <p style={styles.emptyText}>برای پیدا کردن فرصت‌های تازه، پروژه‌ها را بررسی کنید.</p>
          <Link to="/dashboard/projects" style={styles.cta}>مشاهده پروژه‌ها</Link>
        </div>
      ) : (
        <div className="proposal-list" style={styles.list}>
          {shown.map(p => {
            const status = (p.status || p.state || 'pending').toLowerCase();
            const isPending = status === 'pending';
            const isAccepted = status === 'accepted';
            const canWithdraw = isPending;
            
            return (
              <div key={p.id} className="proposal-card" style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.projectTitle}>{p.project?.title || p.project_title || '—'}</div>
                    <div style={styles.meta}>{formatDateIran(p.created_at)} • #{p.id}</div>
                  </div>

                  <div style={styles.cardHeaderRight}>
                    <div style={styles.priceSection}>
                      <div style={styles.price}>{formatCurrencyToToman(p.bid_amount || p.bid || p.amount || 0)}</div>
                      <div style={styles.statusRow}>
                        <StatusBadge status={status} />
                      </div>
                    </div>

                    <div style={styles.actionButtons}>
                      <Link 
                        to={`/dashboard/projects/${p.project?.id || p.project}`} 
                        style={styles.viewBtn}
                      >
                        مشاهده پروژه
                      </Link>

                      {isPending && (
                        <button onClick={() => openEdit(p)} style={styles.editBtn}>
                          ویرایش
                        </button>
                      )}

                      <button 
                        onClick={() => handleWithdraw(p.id)} 
                        disabled={withdrawingId === p.id || !canWithdraw}
                        style={{
                          ...styles.withdrawBtn,
                          ...(!canWithdraw ? styles.withdrawBtnDisabled : {})
                        }}
                      >
                        {withdrawingId === p.id 
                          ? 'در حال لغو...' 
                          : isAccepted 
                            ? 'پذیرفته‌شده'
                            : canWithdraw ? 'پس گرفتن' : 'ردشده'
                        }
                      </button>
                    </div>
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.message}>{p.message || p.cover_letter || '—'}</p>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.footerLeft}>
                    <span style={styles.smallText}>وضعیت سرور: {p.status || p.state || 'pending'}</span>
                  </div>
                  <div style={styles.footerRight}>
                    <Link 
                      to={`/dashboard/projects/${p.project?.id || p.project}`} 
                      style={styles.linkSmall}
                    >
                      مشاهده پروژه
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasNextPage && !loading && (
        <button
          onClick={() => {
            if (loadingMoreRef.current) return;
            loadingMoreRef.current = true;
            setLoadingMore(true);
            setPage((current) => current + 1);
          }}
          disabled={loadingMore}
          style={{ display: "block", margin: "20px auto", padding: "10px 18px" }}
        >
          {loadingMore ? "در حال بارگذاری..." : "بارگذاری پیشنهادهای بیشتر"}
        </button>
      )}

      {editing && (
        <div className="proposal-edit-overlay" style={styles.modalWrap}>
          <div className="proposal-edit-backdrop" style={styles.modalBackdrop} onClick={() => !saving && setEditing(null)} />
          <div className="proposal-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="proposal-edit-title" style={styles.modal}>
            <h3 id="proposal-edit-title" style={styles.modalTitle}>ویرایش پیشنهاد</h3>
            <label className="proposal-edit-label" htmlFor="proposal-edit-message">متن پیشنهاد</label>
            <textarea
              id="proposal-edit-message"
              rows={6} 
              value={editing.cover_letter} 
              onChange={e => setEditing(prev => ({ ...prev, cover_letter: e.target.value }))} 
              style={styles.textarea} 
            />
            <label className="proposal-edit-label" htmlFor="proposal-edit-bid">مبلغ پیشنهادی (تومان)</label>
            <input
              id="proposal-edit-bid"
              value={editing.bid} 
              onChange={e => setEditing(prev => ({ ...prev, bid: e.target.value }))} 
              style={styles.input} 
              inputMode="numeric"
            />

            <div style={styles.modalActions}>
              <button onClick={() => setEditing(null)} style={styles.cancelBtn}>
                انصراف
              </button>
              <button 
                onClick={saveEdit} 
                disabled={saving} 
                style={styles.saveBtn}
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const labels = {
    pending: "در انتظار",
    accepted: "پذیرفته‌شده",
    rejected: "رد شده",
  };

  return (
    <span className={`proposal-status proposal-status-${s || "unknown"}`}>
      {labels[s] || status || "نامشخص"}
    </span>
  );
}

const colors = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  muted: '#94a3b8',
  dark: '#0b1220',
  darker: 'rgba(17,24,39,0.6)',
  border: 'rgba(255,255,255,0.04)',
  text: {
    primary: '#fff',
    secondary: '#9ca3af',
    light: '#cbd5e1'
  }
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24
};

const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12
};

const styles = {
  container: {
    maxWidth: "100%", 
    margin: '0',
    padding: '24px',
    color: colors.text.primary,
    minHeight: "100vh", 
    width: "100%", 
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #0b0b0d 0%, #0f172a 100%)", 
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.md
  },
  
  headerControls: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center'
  },
  
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900
  },
  
  subtitle: {
    margin: 0,
    color: colors.text.secondary,
    fontSize: 14
  },
  
  searchInput: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: colors.darker,
    border: `1px solid ${colors.border}`,
    color: colors.text.primary,
    outline: 'none',
    minWidth: 200
  },
  
  select: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: colors.darker,
    border: `1px solid ${colors.border}`,
    color: colors.text.primary,
    cursor: 'pointer'
  },
  
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    padding: 40,
    justifyContent: 'center'
  },
  
  spinner: {
    width: 36,
    height: 36,
    border: '4px solid rgba(255,255,255,0.08)',
    borderTop: '4px solid #60a5fa',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  empty: {
    textAlign: 'center',
    padding: 40,
    background: colors.darker,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.border}`
  },
  
  emptyIcon: {
    fontSize: 44,
    marginBottom: spacing.xs
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: spacing.sm
  },
  
  emptyText: {
    color: colors.muted,
    marginBottom: spacing.lg
  },
  
  cta: {
    display: 'inline-block',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: colors.text.primary,
    textDecoration: 'none',
    fontWeight: 700
  },
  
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg
  },
  
  card: {
    background: colors.darker,
    border: `1px solid ${colors.border}`,
    padding: spacing.lg,
    borderRadius: borderRadius.lg
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: spacing.lg,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  
  cardHeaderRight: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center'
  },
  
  priceSection: {
    textAlign: 'right'
  },
  
  projectTitle: {
    fontSize: 18,
    fontWeight: 800
  },
  
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.sm
  },
  
  price: {
    fontSize: 18,
    fontWeight: 900,
    color: colors.success
  },
  
  statusRow: {
    marginTop: spacing.sm
  },
  
  actionButtons: {
    display: 'flex',
    gap: spacing.sm
  },
  
  viewBtn: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: 'transparent',
    border: `1px solid rgba(96,165,250,0.12)`,
    color: '#60a5fa',
    textDecoration: 'none',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },
  
  editBtn: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: 'rgba(59,130,246,0.12)',
    border: `1px solid rgba(59,130,246,0.12)`,
    color: '#60a5fa',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  
  withdrawBtn: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: borderRadius.md,
    background: 'transparent',
    border: `1px solid rgba(239,68,68,0.12)`,
    color: '#fca5a5',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  
  withdrawBtnDisabled: {
    opacity: 0.62,
    cursor: 'not-allowed',
    border: `1px solid ${colors.border}`,
    color: colors.muted
  },
  
  cardBody: {
    marginTop: spacing.lg
  },
  
  message: {
    color: colors.text.light,
    lineHeight: 1.6,
    margin: 0
  },
  
  cardFooter: {
    marginTop: spacing.lg,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  footerLeft: {
    fontSize: 13
  },
  
  smallText: {
    color: colors.muted
  },
  
  linkSmall: {
    color: '#9fb7ff',
    textDecoration: 'none',
    fontWeight: 700
  },
  
  badge: (bg, color) => ({
    padding: '6px 10px',
    borderRadius: 999,
    fontWeight: 700,
    background: bg,
    color: color,
    fontSize: 12,
    display: 'inline-block'
  }),
  
  modalWrap: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.6)'
  },
  
  modal: {
    position: 'relative',
    zIndex: 61,
    width: 'min(800px, 96%)',
    background: colors.dark,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.border}`
  },
  
  modalTitle: {
    margin: 0,
    marginBottom: spacing.sm
  },
  
  textarea: {
    width: '100%',
    minHeight: 140,
    padding: spacing.lg,
    borderRadius: borderRadius.sm,
    background: colors.darker,
    border: `1px solid ${colors.border}`,
    color: colors.text.primary,
    resize: 'vertical',
    fontFamily: 'inherit',
    marginBottom: spacing.sm
  },
  
  input: {
    width: 240,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    background: colors.darker,
    border: `1px solid ${colors.border}`,
    color: colors.text.primary,
    fontFamily: 'inherit'
  },
  
  modalActions: {
    display: 'flex',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.lg
  },
  
  cancelBtn: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.sm,
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.muted,
    cursor: 'pointer',
    fontWeight: 700
  },
  
  saveBtn: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: borderRadius.sm,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: colors.text.primary,
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none'
  },
  
  error: {
    color: '#fca5a5',
    marginBottom: spacing.lg,
    padding: spacing.md,
    background: 'rgba(239,68,68,0.1)',
    borderRadius: borderRadius.sm,
    border: '1px solid rgba(239,68,68,0.2)'
  }
};