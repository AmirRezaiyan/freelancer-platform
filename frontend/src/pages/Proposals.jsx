import React, { useEffect, useRef, useState, useContext } from "react";
import api from "../api/axios";
import { proposalDetailPath } from "../api/paths";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { formatCurrencyToToman, formatDateIran } from "../utils/formatters";
import { mergeUniqueRecords } from "../utils/collectPaginatedResults";
import { ArrowUpLeft, BriefcaseBusiness, FileText, Pencil, RotateCcw, Search, X } from "lucide-react";

export default function Proposals() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
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
  }, [user?.id, page, loadAttempt]);

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

  const statusCounts = proposals.reduce((counts, proposal) => {
    const status = (proposal.status || proposal.state || "pending").toLowerCase();
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const statusFilters = [
    { value: "", label: "همه", count: proposals.length },
    { value: "pending", label: "در انتظار", count: statusCounts.pending || 0 },
    { value: "accepted", label: "پذیرفته‌شده", count: statusCounts.accepted || 0 },
    { value: "rejected", label: "ردشده", count: statusCounts.rejected || 0 },
  ];
  const resetFilters = () => {
    setQuery("");
    setStatusFilter("");
  };

  return (
    <div className="proposals-page" data-user-type="freelancer" style={styles.container}>
      <header className="proposals-page-header">
        <div>
          <span className="proposals-page-eyebrow">فضای کاری فریلنسر</span>
          <h1>پیشنهادهای من</h1>
          <p>وضعیت و مبلغ پیشنهادهایی که برای پروژه‌ها فرستاده‌اید.</p>
        </div>
        <Link className="proposals-find-project" to="/dashboard/projects">
          <BriefcaseBusiness size={16} aria-hidden="true" />
          جستجوی پروژه‌ها
          <ArrowUpLeft size={15} aria-hidden="true" />
        </Link>
      </header>

      <section className="proposals-toolbar" aria-label="جستجو و فیلتر پیشنهادها">
        <label className="proposal-search-field">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="جستجو در پیشنهادها"
            placeholder="جستجو در عنوان یا متن..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
          {query && (
            <button type="button" className="proposal-search-clear" aria-label="پاک کردن جستجو" onClick={() => setQuery("")}>
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </label>
        <div className="proposal-status-tabs" role="group" aria-label="فیلتر وضعیت پیشنهاد">
          {statusFilters.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            >
              <span>{filter.label}</span>
              <span className="proposal-filter-count">{filter.count.toLocaleString("fa-IR")}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="proposals-results-meta" aria-live="polite">
        <strong>{shown.length.toLocaleString("fa-IR")} پیشنهاد</strong>
        <span>از {proposals.length.toLocaleString("fa-IR")} مورد بارگذاری‌شده</span>
        <span>فیلترها فقط روی موارد دریافت‌شده از سرور اعمال می‌شوند.</span>
      </div>

      {error && (
        <div className="proposals-error" role="alert" style={styles.error}>
          <span>{error}</span>
          {!loading && <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>تلاش دوباره</button>}
        </div>
      )}

      {loading ? (
        <div className="proposals-loading" role="status" style={styles.loading}>
          <div style={styles.spinner} />
          در حال بارگذاری...
        </div>
      ) : shown.length === 0 ? (
        proposals.length > 0 ? (
          <div className="proposals-empty proposals-filter-empty">
            <span className="proposals-empty-icon"><Search size={21} aria-hidden="true" /></span>
            <h2>نتیجه‌ای با این فیلترها پیدا نشد</h2>
            <p>عبارت جستجو یا وضعیت انتخاب‌شده را تغییر دهید.</p>
            <button type="button" onClick={resetFilters}>پاک کردن فیلترها</button>
          </div>
        ) : (
          <div className="proposals-empty">
            <span className="proposals-empty-icon"><FileText size={22} aria-hidden="true" /></span>
            <h2>هنوز پیشنهادی ارسال نکرده‌اید</h2>
            <p>پروژه‌های باز را بررسی کنید و برای فرصت مناسب پیشنهاد بفرستید.</p>
            <Link className="proposals-empty-link" to="/dashboard/projects">
              جستجوی پروژه‌ها <ArrowUpLeft size={15} aria-hidden="true" />
            </Link>
          </div>
        )
      ) : (
        <div className="proposal-list">
          {shown.map(p => {
            const status = (p.status || p.state || 'pending').toLowerCase();
            const isPending = status === 'pending';
            const canMutate = isPending && p.project_status === "open";
            const projectId = p.project?.id ?? p.project;
            const projectTitle = p.project_title || p.project?.title || "عنوان پروژه در دسترس نیست";
            const amount = p.bid_amount ?? p.bid ?? p.amount;
            
            return (
              <article key={p.id} className="proposal-card">
                <header className="proposal-card-header">
                  <div className="proposal-project-main">
                    <span className="proposal-project-icon"><BriefcaseBusiness size={18} aria-hidden="true" /></span>
                    <div className="proposal-project-copy">
                      <Link className="proposal-project-title" to={`/dashboard/projects/${projectId}`}>
                        {projectTitle}
                      </Link>
                      <div className="proposal-record-meta">
                        <time dateTime={p.created_at}>{formatDateIran(p.created_at)}</time>
                        <span>شناسهٔ پیشنهاد {Number(p.id).toLocaleString("fa-IR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="proposal-offer-summary">
                    <span>مبلغ پیشنهادی</span>
                    <strong>{amount == null ? "—" : formatCurrencyToToman(amount)}</strong>
                  </div>
                  <StatusBadge status={status} />
                </header>

                <div className="proposal-card-message">
                  <span>متن پیشنهاد</span>
                  <p dir="auto">{p.message || p.cover_letter || "متنی برای این پیشنهاد ثبت نشده است."}</p>
                </div>

                {isPending && p.project_status !== "open" && (
                  <p className="proposal-action-note">
                    {p.project_status ? "پروژه دیگر باز نیست و امکان تغییر پیشنهاد وجود ندارد." : "وضعیت پروژه برای تغییر پیشنهاد در دسترس نیست."}
                  </p>
                )}

                <footer className="proposal-card-actions">
                  <Link className="proposal-project-link" to={`/dashboard/projects/${projectId}`}>
                    مشاهده پروژه <ArrowUpLeft size={15} aria-hidden="true" />
                  </Link>
                  {canMutate && (
                    <div className="proposal-mutation-actions">
                      <button type="button" className="proposal-edit-button" onClick={() => openEdit(p)}>
                        <Pencil size={15} aria-hidden="true" /> ویرایش
                      </button>
                      <button
                        type="button"
                        className="proposal-withdraw-button"
                        onClick={() => handleWithdraw(p.id)}
                        disabled={withdrawingId === p.id}
                      >
                        {withdrawingId === p.id ? <RotateCcw size={15} aria-hidden="true" /> : <X size={15} aria-hidden="true" />}
                        {withdrawingId === p.id ? "در حال پس‌گرفتن..." : "پس گرفتن پیشنهاد"}
                      </button>
                    </div>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {hasNextPage && !loading && (
        <button
          className="proposals-load-more"
          onClick={() => {
            if (loadingMoreRef.current) return;
            loadingMoreRef.current = true;
            setLoadingMore(true);
            setPage((current) => current + 1);
          }}
          disabled={loadingMore}
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