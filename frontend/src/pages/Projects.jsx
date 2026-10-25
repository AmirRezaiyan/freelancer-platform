import React, { useEffect, useState, useContext, useMemo } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { formatCurrencyToToman, formatDateIran, formatProjectCategory } from "../utils/formatters";
import fetchAllPages from "../utils/fetchAllPages";
import { buildProposalPayload, validateProposalBid } from "../utils/proposalPayload";
import { mergeUniqueRecords } from "../utils/collectPaginatedResults";

export default function Projects() {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [applyingFor, setApplyingFor] = useState(null);
  const [proposal, setProposal] = useState({ cover_letter: "", bid: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingProjectId, setRatingProjectId] = useState(null);
  const [ratingTargetUserId, setRatingTargetUserId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingNote, setRatingNote] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingModalTitle, setRatingModalTitle] = useState("ثبت امتیاز");
  const [userRatings, setUserRatings] = useState({}); // { "12:34": true, "0:34": true }
  const [isNarrow, setIsNarrow] = useState(typeof window !== "undefined" ? window.innerWidth <= 1024 : false);
  const isClient = user?.user_type === "client";

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth <= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setPage(1);
    setProjects([]);
    setUserRatings({});
    setHasNextPage(false);
  }, [userId, debouncedQuery, statusFilter]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (debouncedQuery) params.q = debouncedQuery;
        params.page = page;
        const endpoint = isClient ? "/market/projects/mine/" : "/market/projects/";
        const res = await api.get(endpoint, { params, signal: controller.signal });
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.results;
        if (!Array.isArray(data)) throw new Error("Invalid project response");
        setHasNextPage(Boolean(res.data?.next));
        const normalized = data.map((p) => ({
          ...p,
          has_applied: Boolean(p?.has_applied || p?.user_proposal_id),
        }));
        setProjects((current) => mergeUniqueRecords(page === 1 ? [] : current, normalized));

        if (userId) {
          try {
            const ratingsData = await fetchAllPages(
              "/market/ratings/",
              { from_user: userId },
              { signal: controller.signal },
            );
            if (!mounted || controller.signal.aborted) return;
            
            const ratingsMap = {};
            ratingsData.forEach((rating) => {
              const proj = rating.project ?? rating.project_id ?? null;
              const to = rating.user_to ?? rating.to_user ?? rating.user ?? rating.user_to_id ?? rating.to_user_id ?? null;

              if (proj && to) {
                ratingsMap[`${proj}:${to}`] = true;
              } else if (proj && !to) {
                ratingsMap[`${proj}:0`] = true;
              } else if (!proj && to) {
                ratingsMap[`0:${to}`] = true;
              }
            });
            setUserRatings(ratingsMap);
          } catch (err) {
            if (controller.signal.aborted) return;
            console.error("Error loading user ratings:", err?.response?.status);
          }
        }
      } catch {
        if (!mounted || controller.signal.aborted) return;
        setLoadError("بارگذاری پروژه‌ها انجام نشد. اتصال و دسترسی خود را بررسی و دوباره تلاش کنید.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [userId, statusFilter, page, debouncedQuery, isClient, loadAttempt]);

  const skillsList = useMemo(() => {
    const s = new Set();
    projects.forEach((p) => {
      if (!p) return;
      if (Array.isArray(p.skills)) p.skills.forEach((sk) => sk && s.add(sk));
      else if (typeof p.skills === "string") p.skills.split(",").map((x) => x.trim()).filter(Boolean).forEach((sk) => s.add(sk));
    });
    return Array.from(s).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (!p) return false;
      if (skillFilter) {
        const skills = Array.isArray(p.skills) ? p.skills : (p.skills || "").toString().split(",").map(x => x.trim());
        if (!skills.map(x => (x || "").toLowerCase()).includes(skillFilter.toLowerCase())) return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, skillFilter, statusFilter]);

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : null;
  }

  async function submitProposal(projectId) {
    if (!user) {
      setMessage({ type: "error", text: "برای ارسال درخواست ابتدا وارد شوید." });
      return;
    }
    if (submitting) return;
    if (!proposal.cover_letter.trim()) {
      setMessage({ type: "error", text: "متن پیشنهاد الزامی است." });
      return;
    }
    const selectedProject = projects.find((project) => String(project.id) === String(projectId));
    const bidError = validateProposalBid(proposal.bid, selectedProject?.budget_min, selectedProject?.budget_max);
    if (bidError) {
      setMessage({ type: "error", text: bidError });
      return;
    }
    const bidValue = Number(proposal.bid);
    setSubmitting(true);
    setMessage(null);

    try {
      api.defaults.withCredentials = true;
      const payload = buildProposalPayload(projectId, bidValue, proposal.cover_letter.trim());
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      const res = await api.post("/market/proposals/create/", payload, { headers });
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, has_applied: true, user_proposal_id: res?.data?.id || p.user_proposal_id } : p)));
      setMessage({ type: "success", text: "درخواست ارسال شد." });
      setApplyingFor(null);
      setProposal({ cover_letter: "", bid: "" });
    } catch (err) {
      const serverData = err?.response?.data;
      let text = "خطا در ارسال درخواست";
      if (serverData) {
        if (typeof serverData === "string") text = serverData;
        else if (serverData.detail) text = serverData.detail;
        else if (serverData.message) text = serverData.message;
        else if (Array.isArray(serverData) && serverData.length) text = serverData[0];
        else text = JSON.stringify(serverData);
      } else text = err.message || text;

      if (typeof text === "string" && /قبلا|قبلاً|already/i.test(text)) {
        setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, has_applied: true } : p)));
      }

      setMessage({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  }

  const hasUserRatedProject = (projectId, targetUserId) => {
    if (!user) return false;
    const pid = projectId ?? 0;
    const tid = targetUserId ?? 0;
    if (userRatings[`${pid}:${tid}`]) return true;
    if (userRatings[`0:${tid}`]) return true;
    if (userRatings[`${pid}:0`]) return true;
    return false;
  };

  async function markProjectCompleted(projectId, hiredFreelancerId = null, clientId = null, isFreelancerRating = false) {
    if (!user) {
      setMessage({ type: "error", text: "برای این عملیات باید وارد شوید." });
      return;
    }
    
    const targetId = isFreelancerRating ? clientId : (hiredFreelancerId || clientId);

    if (targetId && hasUserRatedProject(projectId, targetId)) {
      setMessage({ type: "info", text: "شما قبلاً به این پروژه/کاربر امتیاز داده‌اید." });
      return;
    }
    
    if (!isFreelancerRating) {
      if (!window.confirm("آیا مطمئن هستید پروژه را تکمیل شده اعلام کنید؟ بعد از تأیید پروژه از لیست برداشته می‌شود.")) return;
    }

    setMessage(null);
    const csrftoken = getCookie("csrftoken");
    const headers = {};
    if (csrftoken) headers["X-CSRFToken"] = csrftoken;

    if (!isFreelancerRating) {
      try {
        await api.post(`/market/projects/${projectId}/complete/`, {}, { headers });
      } catch (err) {
        let text = "خطا در علامت‌گذاری تکمیل پروژه";
        if (err?.response?.data?.detail) text = err.response.data.detail;
        setMessage({ type: "error", text });
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setMessage({ type: "success", text: "پروژه با موفقیت تکمیل شد — اکنون می‌توانید طرف مقابل را امتیاز دهید." });
    }

    setRatingProjectId(projectId);
    if (isFreelancerRating && clientId) {
      setRatingTargetUserId(clientId);
      setRatingModalTitle("امتیاز به کارفرما");
    } else if (hiredFreelancerId) {
      setRatingTargetUserId(hiredFreelancerId);
      setRatingModalTitle("امتیاز به فریلنسر");
    }
    setRatingValue(5);
    setRatingNote("");
    setRatingOpen(true);
  }

  async function submitRating() {
    if (!ratingProjectId || !ratingTargetUserId) {
      setMessage({ type: "error", text: "اطلاعات امتیاز ناقص است." });
      return;
    }
    setRatingSubmitting(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      const payload = {
        user_to: ratingTargetUserId,
        rating: ratingValue,
        review: ratingNote,
      };

      await api.post(`/market/projects/${ratingProjectId}/rate/`, payload, { headers });
      
      const compositeKey = `${ratingProjectId}:${ratingTargetUserId}`;
      setUserRatings(prev => ({
        ...prev,
        [compositeKey]: true,
      }));
      
      setProjects(prev => prev.map(p => 
        p.id === ratingProjectId 
          ? { ...p, has_rated_client: true } 
          : p
      ));
      
      setMessage({ type: "success", text: "امتیاز ثبت شد. متشکریم!" });
      setRatingOpen(false);
      setRatingProjectId(null);
      setRatingTargetUserId(null);
      setRatingValue(5);
      setRatingNote("");
      setRatingModalTitle("ثبت امتیاز");
    } catch (err) {
      console.error("rating error", err?.response?.status);
      let text = "خطا در ثبت امتیاز";
      const sd = err?.response?.data;
      if (sd?.detail) text = sd.detail;
      else if (sd) text = JSON.stringify(sd);
      setMessage({ type: "error", text });
    } finally {
      setRatingSubmitting(false);
    }
  }

  async function handleDeleteProject(projectId) {
    if (!user) {
      setMessage({ type: "error", text: "برای حذف پروژه باید وارد شوید." });
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      setMessage({ type: "error", text: "پروژه پیدا نشد." });
      return;
    }

    if (project.status !== "open") {
      setMessage({ 
        type: "error", 
        text: `پروژه‌های با وضعیت "${getStatusLabel(project.status)}" قابل حذف نیستند. فقط پروژه‌های با وضعیت "باز" قابل حذف هستند.` 
      });
      return;
    }

    if (!window.confirm("آیا از حذف این پروژه مطمئن هستید؟ این عمل غیرقابل بازگشت است.")) return;

    try {
      api.defaults.withCredentials = true;
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;
      await api.delete(`/market/projects/${projectId}/`, { headers });
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setMessage({ type: "success", text: "پروژه با موفقیت حذف شد." });
    } catch (err) {
      console.error("delete project error", err?.response?.status);
      let text = "خطا در حذف پروژه";
      const serverData = err?.response?.data;
      if (serverData && serverData.detail) text = serverData.detail;
      else if (serverData) text = JSON.stringify(serverData);
      setMessage({ type: "error", text });
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case "open": return "باز";
      case "in_progress": return "در حال انجام";
      case "completed": return "تکمیل‌شده";
      case "cancelled": return "لغوشده";
      default: return status;
    }
  };

  const mainGridStyle = {
    ...styles.mainGrid,
    gridTemplateColumns: isNarrow ? "1fr" : "280px minmax(0, 1fr)",
  };

  const renderStatusBadgeInline = (status) => {
    const base = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 10px",
      borderRadius: 999,
      fontWeight: 800,
      fontSize: 13,
      color: "#fff",
      minWidth: 78,
      textAlign: "center",
    };
    if (status === "open") {
      return <div style={{ ...base, background: "#10b981", marginInlineStart: 12 }}>باز</div>;
    } else if (status === "in_progress") {
      return <div style={{ ...base, background: "#f97316", marginInlineStart: 12 }}>در حال انجام</div>;
    } else if (status === "completed") {
      return <div style={{ ...base, background: "#6b7280", marginInlineStart: 12 }}>تمام شده</div>;
    } else if (status === "cancelled") {
      return <div style={{ ...base, background: "#a9362b", marginInlineStart: 12 }}>لغوشده</div>;
    }
    return null;
  };

  return (
    <div className="projects-page" data-user-type={user?.user_type} style={styles.container}>
      <div className="projects-hero" style={styles.hero}>
        <img className="projects-hero-image" src="/images/marketplace.jpg" alt="" width="1400" height="933" fetchPriority="high" />
        <div className="projects-hero-shade" style={styles.heroOverlay} />
        <div className="projects-hero-content" style={styles.heroContent}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <h1 className="projects-page-title" style={styles.heroTitle}>
                <span style={styles.titleGradient}>پروژه‌ها</span>
              </h1>
              <p style={styles.heroSubtitle}>{isClient
                ? "پروژه‌های خود را مدیریت و بر اساس وضعیت یا مهارت فیلتر کنید."
                : "پروژه‌های باز را بررسی و بر اساس وضعیت یا مهارت فیلتر کنید."}</p>
            </div>

            {user?.user_type === "client" && (
              <Link className="projects-create-action" to="/dashboard/projects/create" style={styles.createBtn}>
                ساخت پروژه
              </Link>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div style={{ 
          ...styles.alert, 
          background: message.type === "success" 
            ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))" 
            : message.type === "info"
            ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))"
            : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))" 
        }}>
          <span style={{ fontSize: 20 }}>
            {message.type === "success" ? "✅" : message.type === "info" ? "ℹ️" : "❌"}
          </span>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={styles.alertClose}>×</button>
        </div>
      )}

      <div style={mainGridStyle}>
        {!isNarrow && (
          <aside style={styles.sidebar}>
            {/* <div style={styles.filterCard}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/dashboard" style={styles.sidebarLink}><span>🏠</span> داشبورد</Link>
                <Link to="/dashboard/projects" style={{ ...styles.sidebarLink, background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}><span>📁</span> پروژه‌ها</Link>
                <Link to="/dashboard/proposals" style={styles.sidebarLink}><span>📄</span> پیشنهادها</Link>
                <Link to="/dashboard/messages" style={styles.sidebarLink}><span>💬</span> پیام‌ها</Link>
                <Link to="/profile" style={styles.sidebarLink}><span>⚙️</span> حساب</Link>
              </div>
            </div> */}

            <div style={styles.filterCard}>
              <h3 style={styles.filterTitle}>فیلترها</h3>

              <div style={styles.filterSection}>
                <h4 style={styles.filterSectionTitle}>مهارت‌ها</h4>
                <div style={styles.skillsFilter}>
                  <button className="projects-filter-chip" aria-pressed={!skillFilter} onClick={() => setSkillFilter("")} style={{ ...styles.skillFilterChip, background: !skillFilter ? "#3b82f6" : "rgba(255,255,255,0.05)", color: !skillFilter ? "#fff" : "#94a3b8" }}>همه</button>
                  {skillsList.map((sk) => (
                    <button className="projects-filter-chip" key={sk} aria-pressed={sk === skillFilter} onClick={() => setSkillFilter(sk === skillFilter ? "" : sk)} style={{ ...styles.skillFilterChip, background: sk === skillFilter ? "#3b82f6" : "rgba(255,255,255,0.05)", color: sk === skillFilter ? "#fff" : "#94a3b8" }}>{sk}</button>
                  ))}
                </div>
              </div>

              <div style={styles.filterSection}>
                <h4 style={styles.filterSectionTitle}>وضعیت پروژه</h4>
                <div style={styles.skillsFilter}>
                  <button className="projects-filter-chip" aria-pressed={!statusFilter} onClick={() => { setPage(1); setProjects([]); setStatusFilter(""); }} style={{ ...styles.skillFilterChip, background: !statusFilter ? "#3b82f6" : "rgba(255,255,255,0.05)", color: !statusFilter ? "#fff" : "#94a3b8" }}>همه</button>
                  <button className="projects-filter-chip" aria-pressed={statusFilter === "open"} onClick={() => { setPage(1); setProjects([]); setStatusFilter("open"); }} style={{ ...styles.skillFilterChip, background: statusFilter === "open" ? "#3b82f6" : "rgba(255,255,255,0.05)", color: statusFilter === "open" ? "#fff" : "#94a3b8" }}>باز</button>
                  <button className="projects-filter-chip" aria-pressed={statusFilter === "in_progress"} onClick={() => { setPage(1); setProjects([]); setStatusFilter("in_progress"); }} style={{ ...styles.skillFilterChip, background: statusFilter === "in_progress" ? "#3b82f6" : "rgba(255,255,255,0.05)", color: statusFilter === "in_progress" ? "#fff" : "#94a3b8" }}>در حال انجام</button>
                  <button className="projects-filter-chip" aria-pressed={statusFilter === "completed"} onClick={() => { setPage(1); setProjects([]); setStatusFilter("completed"); }} style={{ ...styles.skillFilterChip, background: statusFilter === "completed" ? "#3b82f6" : "rgba(255,255,255,0.05)", color: statusFilter === "completed" ? "#fff" : "#94a3b8" }}>تمام شده</button>
                  <button className="projects-filter-chip" aria-pressed={statusFilter === "cancelled"} onClick={() => { setPage(1); setProjects([]); setStatusFilter("cancelled"); }} style={{ ...styles.skillFilterChip, background: statusFilter === "cancelled" ? "#3b82f6" : "rgba(255,255,255,0.05)", color: statusFilter === "cancelled" ? "#fff" : "#94a3b8" }}>لغوشده</button>
                </div>
              </div>
            </div>
          </aside>
        )}

        <main style={{ ...styles.mainContent, minWidth: 0 }}>
          <div style={styles.searchBar}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input className="projects-search-input" type="search" placeholder="جستجو در عنوان و توضیحات پروژه..." value={query} onChange={(e) => setQuery(e.target.value)} style={styles.searchInput} />
            </div>
            {(query || skillFilter || statusFilter) && (
              <button className="projects-filter-reset" onClick={() => { setPage(1); setProjects([]); setQuery(""); setSkillFilter(""); setStatusFilter(""); }} style={styles.clearBtn}>پاک کردن فیلترها</button>
            )}
          </div>

          <div className="projects-results-meta" aria-live="polite">
            <span>{filtered.length.toLocaleString("fa-IR")} پروژه در نتایج بارگذاری‌شده</span>
            <span>جستجو و وضعیت از سرور اعمال می‌شود؛ فیلتر مهارت فقط نتایج بارگذاری‌شده را محدود می‌کند.</span>
          </div>

          {isNarrow && (
            <section className="project-mobile-filters" aria-label="فیلتر پروژه‌ها">
              <button
                type="button"
                aria-expanded={mobileFiltersOpen}
                onClick={() => setMobileFiltersOpen((open) => !open)}
              >
                {mobileFiltersOpen ? "بستن فیلترها" : "فیلتر مهارت و وضعیت"}
              </button>
              {mobileFiltersOpen && (
                <div className="project-mobile-filter-controls">
                  <label>
                    مهارت
                    <select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)}>
                      <option value="">همهٔ مهارت‌ها</option>
                      {skillsList.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                  </label>
                  <label>
                    وضعیت پروژه
                    <select value={statusFilter} onChange={(event) => { setPage(1); setProjects([]); setStatusFilter(event.target.value); }}>
                      <option value="">همهٔ وضعیت‌ها</option>
                      <option value="open">باز</option>
                      <option value="in_progress">در حال انجام</option>
                      <option value="completed">تکمیل‌شده</option>
                      <option value="cancelled">لغوشده</option>
                    </select>
                  </label>
                </div>
              )}
            </section>
          )}

          {loadError && (
            <div className="projects-load-error" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>تلاش دوباره</button>
            </div>
          )}
          {loading && projects.length === 0 ? (
            <div style={styles.loadingCard}><div style={styles.spinner} /><p>در حال بارگذاری پروژه‌ها...</p></div>
          ) : loadError && projects.length === 0 ? null : (
            filtered.length === 0 ? (
              <div style={styles.emptyCard}><div style={styles.emptyIcon}>📭</div><h3 style={styles.emptyTitle}>نتیجه‌ای یافت نشد</h3><p style={styles.emptyText}>{query || skillFilter ? "فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید." : "هیچ پروژه‌ای در حال حاضر موجود نیست."}</p></div>
            ) : (
              <div style={styles.projectsGrid}>
                {filtered.map((p) => (
                  <article key={p.id} style={styles.projectCard}>
                    <div style={styles.projectCardGlow} />

                    <div style={{ position: "relative", zIndex: 2 }}>
                      <div style={styles.projectHeader}>
                        <h3 style={styles.projectTitle}>{p.title}</h3>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {renderStatusBadgeInline(p.status)}
                          <div style={styles.projectBudget}>
                            <span style={styles.budgetAmount}>{formatCurrencyToToman(p.budget_min)} - {formatCurrencyToToman(p.budget_max)}</span>
                            <span style={styles.budgetLabel}>تومان</span>
                          </div>
                        </div>
                      </div>

                      <p style={styles.projectDescription}>{p.description?.slice?.(0, 160)}{p.description?.length > 160 && "..."}</p>

                      {(Array.isArray(p.skills) ? p.skills : (p.skills || "").toString().split(",").map((x) => x.trim())).length > 0 && (
                        <div style={styles.skillsContainer}>
                          {(Array.isArray(p.skills) ? p.skills : (p.skills || "").toString().split(",").map((x) => x.trim())).slice(0, 5).map((sk, i) => (
                            <button className="project-skill-tag" key={i} onClick={() => setSkillFilter(sk)} style={styles.skillChip}>{sk}</button>
                          ))}
                        </div>
                      )}

                      <div style={styles.projectFooter}>
                        <div style={styles.projectMeta}>
                          <span style={styles.metaItem}><span style={styles.metaIcon}>📅</span>{formatDateIran(p.created_at)}</span>
                          {p.category && (<span style={styles.metaItem}><span style={styles.metaIcon}>📂</span>{formatProjectCategory(p.category)}</span>)}
                        </div>

                        <div style={styles.projectActions}>
                          <Link className="project-secondary-action" to={`/dashboard/projects/${p.id}`} style={styles.viewBtn}>جزئیات</Link>

                          {user?.user_type === "freelancer" && (
                            p.status === "open" ? (
                              p.has_applied ? (
                                <div style={{ ...styles.applyBtn, opacity: 0.6, cursor: "not-allowed", display: "inline-flex", alignItems: "center", gap: 8 }}>✅ پیشنهاد ارسال شده</div>
                              ) : (
                                applyingFor === p.id ? (
                                  <div style={styles.proposalForm}>
                                    <textarea aria-label="متن پیشنهاد" placeholder="پیشنهاد خود را بنویسید..." value={proposal.cover_letter} onChange={(e) => setProposal({ ...proposal, cover_letter: e.target.value })} style={styles.proposalTextarea} rows={3} />
                                    <input aria-label="مبلغ پیشنهاد به تومان" inputMode="numeric" placeholder="پیشنهاد قیمت (تومان)" value={proposal.bid} onChange={(e) => setProposal({ ...proposal, bid: e.target.value })} style={styles.proposalInput} />
                                    <div style={styles.proposalActions}>
                                      <button onClick={() => setApplyingFor(null)} disabled={submitting} style={styles.cancelBtn}>انصراف</button>
                                      <button onClick={() => submitProposal(p.id)} disabled={submitting} style={styles.submitBtn}>{submitting ? <><span style={styles.smallSpinner} /> ارسال...</> : "✉️ ارسال"}</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => { if (!p.has_applied) { setApplyingFor(p.id); setProposal({ cover_letter: "", bid: "" }); } }} style={styles.applyBtn}>📨 ارسال پیشنهاد</button>
                                )
                              )
                            ) : p.status === "completed" && p.hired_freelancer?.id === user?.id ? (
                              (() => {
                                const targetClientId = p.client?.id || p.client;
                                const userHasRatedTarget = hasUserRatedProject(p.id, targetClientId);
                                return userHasRatedTarget || p.has_rated_client ? (
                                  <button disabled style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", cursor: "not-allowed", fontWeight: 800, display: "flex", alignItems: "center", gap: 6, opacity: 0.7 }}>
                                    ✅ شما امتیاز داده‌اید
                                  </button>
                                ) : (
                                  <button onClick={() => markProjectCompleted(p.id, null, p.client?.id || p.client, true)} style={{ padding: "10px 14px", borderRadius: 8, background: "linear-gradient(135deg,#f97316,#f59e0b)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                                    ⭐ امتیاز به کارفرما
                                  </button>
                                );
                              })()
                            ) : (
                              <div style={{ ...styles.applyBtn, opacity: 0.6, cursor: "not-allowed" }}>{p.status === "completed" ? "پروژه تمام شده" : "پروژه در حال انجام"}</div>
                            )
                          )}

                          {user?.user_type === "client" && (() => {
                            const clientId = typeof p.client === "number" ? p.client : p.client?.id;
                            if (clientId === user?.id) {
                              return (
                                <>
                                  {p.status === "open" && <Link className="project-edit-action" to={`/dashboard/projects/${p.id}/edit`} style={styles.editBtn}>ویرایش</Link>}
                                  {p.status === "open" && <button className="project-delete-action" onClick={() => handleDeleteProject(p.id)} style={styles.deleteBtn}>حذف</button>}
                                  {p.status === "in_progress" && (() => {
                                    const targetFreelancerId = p.hired_freelancer?.id || p.hired_freelancer;
                                    const userHasRatedTarget = hasUserRatedProject(p.id, targetFreelancerId);
                                    return userHasRatedTarget ? (
                                      <button disabled style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", cursor: "not-allowed", fontWeight: 800, opacity: 0.7 }}>✅ شما امتیاز داده‌اید</button>
                                    ) : (
                                      <button onClick={() => markProjectCompleted(p.id, p.hired_freelancer?.id)} style={{ padding: "10px 14px", borderRadius: 8, background: "linear-gradient(135deg,#f97316,#f59e0b)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>✅ تایید تحویل</button>
                                    );
                                  })()}
                                </>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
          {hasNextPage && (
            <button className="projects-load-more" disabled={loading} onClick={() => setPage((current) => current + 1)}>
              {loading ? "در حال بارگذاری..." : "بارگذاری پروژه‌های بیشتر"}
            </button>
          )}
        </main>
      </div>

      {ratingOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "#00000088" }} onClick={() => setRatingOpen(false)} />
          <div style={{ position: "relative", zIndex: 1201, width: "min(680px, 96%)", background: "#0b1220", padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
            <h3 style={{ color: "#fff", margin: 0 }}>{ratingModalTitle}</h3>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>لطفاً با انتخاب ستاره به طرف مقابل امتیاز دهید.</p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRatingValue(n)} style={{ fontSize: 26, background: "transparent", border: "none", color: n <= ratingValue ? "#ffd166" : "#94a3b8", cursor: "pointer" }}>★</button>
              ))}
              <div style={{ color: "#94a3b8" }}>{ratingValue} از 5</div>
            </div>

            <textarea placeholder="نظر (اختیاری)" value={ratingNote} onChange={(e) => setRatingNote(e.target.value)} style={{ width: "100%", marginTop: 12, padding: 12, borderRadius: 8, background: "#071029", color: "#fff", border: "1px solid rgba(255,255,255,0.04)" }} rows={4} />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={() => setRatingOpen(false)} style={styles.cancelBtn}>انصراف</button>
              <button onClick={submitRating} disabled={ratingSubmitting} style={{ ...styles.submitBtn }}>{ratingSubmitting ? "در حال ارسال..." : "ثبت امتیاز"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    color: "#fff",
    maxWidth: 1600,
    margin: "0 auto",
    padding: "0 20px",
    boxSizing: "border-box",
  },
  hero: {
    position: "relative",
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
    borderRadius: 20,
    overflow: "hidden",
    padding: 40,
    marginBottom: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 50%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
  },
  heroTitle: {
    margin: 0,
    fontSize: 36,
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  titleIcon: {
    fontSize: 40,
  },
  titleGradient: {
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    marginTop: 12,
    fontSize: 16,
    margin: "12px 0 0 0",
  },
  searchBar: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
  },
  searchIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 18,
    opacity: 0.5,
  },
  searchInput: {
    width: "100%",
    padding: "14px 50px 14px 20px",
    background: "rgba(17, 24, 39, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 14,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    textAlign: "right",
    boxSizing: "border-box",
  },
  clearBtn: {
    padding: "14px 24px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    color: "#fca5a5",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
  alert: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    border: "1px solid",
    marginBottom: 20,
    fontSize: 15,
    fontWeight: 600,
    position: "relative",
  },
  alertClose: {
    marginLeft: "auto",
    background: "transparent",
    border: "none",
    color: "inherit",
    fontSize: 24,
    cursor: "pointer",
    padding: "0 8px",
    lineHeight: 1,
  },
  mainGrid: {
    display: "grid",
    gap: 24,
    alignItems: "start",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    position: "sticky",
    top: 20,
  },
  sidebarLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 10,
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 600,
    transition: "all 0.2s",
    cursor: "pointer",
  },
  filterCard: {
    background: "rgba(17, 24, 39, 0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  filterTitle: {
    margin: "0 0 20px 0",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
  },
  filterSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#e2e8f0",
    fontSize: 14,
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  filterSectionTitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 12,
    fontWeight: 600,
  },
  skillsFilter: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  skillFilterChip: {
    padding: "8px 14px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
  createBtn: {
    padding: "12px 24px",
    background: "rgba(16, 185, 129, 0.2)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: 10,
    color: "#10b981",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    textAlign: "center",
    display: "inline-flex",
    alignItems: "center",
  },
  mainContent: {
    minHeight: 400,
  },
  loadingCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 80,
    background: "rgba(17, 24, 39, 0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.05)",
    gap: 16,
  },
  spinner: {
    width: 48,
    height: 48,
    border: "4px solid rgba(59, 130, 246, 0.2)",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 80,
    background: "rgba(17, 24, 39, 0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.05)",
    gap: 16,
  },
  emptyIcon: {
    fontSize: 80,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    margin: 0,
  },
  projectsGrid: {
    display: "grid",
    gap: 20,
  },
  projectCard: {
    position: "relative",
    background: "rgba(17, 24, 39, 0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: 16,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.05)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  projectCardGlow: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 60%)",
    pointerEvents: "none",
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  projectTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    flex: 1,
    minWidth: 200,
  },
  projectBudget: {
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 900,
    color: "#10b981",
    whiteSpace: "nowrap",
  },
  budgetLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  projectDescription: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 16,
  },
  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  skillChip: {
    padding: "6px 14px",
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: 20,
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  projectFooter: {
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  projectMeta: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#94a3b8",
    fontSize: 13,
  },
  metaIcon: {
    fontSize: 14,
  },
  projectActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  viewBtn: {
    padding: "10px 18px",
    background: "rgba(59, 130, 246, 0.2)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: 10,
    color: "#60a5fa",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    display: "inline-block",
  },
  applyBtn: {
    padding: "10px 18px",
    background: "rgba(16, 185, 129, 0.2)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: 10,
    color: "#10b981",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  editBtn: {
    padding: "10px 14px",
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: 8,
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "10px 14px",
    background: "transparent",
    border: "1px solid rgba(239, 68, 68, 0.18)",
    borderRadius: 8,
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  proposalForm: {
    width: "100%",
    marginTop: 16,
    padding: 16,
    background: "rgba(30, 41, 59, 0.6)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  proposalTextarea: {
    width: "100%",
    padding: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
    marginBottom: 10,
    textAlign: "right",
    boxSizing: "border-box",
  },
  proposalInput: {
    width: "100%",
    padding: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    marginBottom: 10,
    textAlign: "right",
    boxSizing: "border-box",
  },
  proposalActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 18px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  submitBtn: {
    padding: "10px 18px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  smallSpinner: {
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
};