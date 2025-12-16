import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserAvatar from "../components/UserAvatar";
import api from "../api/axios";

export default function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
      color: "#fff"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        animation: "pulse 2s infinite"
      }}>
        <div style={{
          width: 60,
          height: 60,
          border: "3px solid rgba(99, 102, 241, 0.3)",
          borderTopColor: "#6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <span style={{ fontSize: 18, fontWeight: 600 }}>در حال بارگذاری...</span>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );

  const isIndex = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const normalizedUserTop = normalizeUser(user);
  const isClientTop = normalizedUserTop?.user_type === "client";

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      margin: 0,
      padding: 0,
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #1e1b4b 100%)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)",
          animation: "float 20s ease-in-out infinite"
        }} />
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
        }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(99, 102, 241, 0.4) !important; }
      `}</style>

      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 28px",
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        animation: "fadeInUp 0.6s ease-out"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            style={{
              fontSize: 22,
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
              color: "#a5b4fc",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ☰
          </button>
          <div
            onClick={() => navigate("/dashboard")}
            style={{
              fontWeight: 900,
              fontSize: 26,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              letterSpacing: "-0.5px"
            }}
          >
            <span style={{
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>My</span>
            <span style={{ color: "#fff" }}>Market</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", direction: "rtl" }} ref__={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                position: "relative"
              }}
            >
              <div style={{ position: "relative", borderRadius: "50%", overflow: "hidden" }}>
                <UserAvatar src={normalizedUserTop?.avatar} size={44} alt={normalizedUserTop?.username || "user"} />
              </div>
              <div style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                background: "#10b981",
                border: "3px solid #0f172a",
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)"
              }} />
            </button>

            {/*
            {menuOpen && (
              <div style={{
                position: "absolute",
                right: 0,
                top: 60,
                width: 300,
                background: "rgba(15, 23, 42, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 25px 70px rgba(0,0,0,0.6)",
                borderRadius: 20,
                padding: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                animation: "scaleIn 0.2s ease-out",
                transformOrigin: "top right"
              }}>
                <div style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 16,
                  padding: 16,
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
                  borderRadius: 16,
                  border: "1px solid rgba(99, 102, 241, 0.2)"
                }}>
                  <div style={{ position: "relative" }}>
                    <UserAvatar src={normalizedUserTop?.avatar} size={60} alt={normalizedUserTop?.username} />
                    <div style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      background: "#10b981",
                      border: "3px solid rgba(15, 23, 42, 0.98)",
                      borderRadius: "50%"
                    }} />
                  </div>
                  <div style={{ textAlign: "right", flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: 17 }}>{normalizedUserTop?.username}</div>
                    <div style={{
                      color: isClientTop ? "#f472b6" : "#34d399",
                      fontSize: 13,
                      marginTop: 6,
                      padding: "5px 12px",
                      background: isClientTop ? "rgba(244, 114, 182, 0.15)" : "rgba(52, 211, 153, 0.15)",
                      borderRadius: 8,
                      display: "flex",
                      fontWeight: 600
                    }}>
                      {isClientTop ? "🎯 کارفرما" : "💼 فریلنسر"}
                    </div>
                  </div>
                </div>

                <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link to="/dashboard/profile" onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    color: "#e2e8f0", textDecoration: "none", borderRadius: 12,
                    transition: "all 0.2s", justifyContent: "flex-end",
                    background: "transparent"
                  }}>
                    <span>پروفایل</span>
                    <span style={{ fontSize: 20 }}>⚙️</span>
                  </Link>
                  <Link to="/dashboard/projects" onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    color: "#e2e8f0", textDecoration: "none", borderRadius: 12,
                    transition: "all 0.2s", justifyContent: "flex-end"
                  }}>
                    <span>پروژه‌ها</span>
                    <span style={{ fontSize: 20 }}>📁</span>
                  </Link>
                  {!isClientTop && (
                    <Link to="/dashboard/proposals" onClick={() => setMenuOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                      color: "#e2e8f0", textDecoration: "none", borderRadius: 12,
                      transition: "all 0.2s", justifyContent: "flex-end"
                    }}>
                      <span>پروپوزال‌ها</span>
                      <span style={{ fontSize: 20 }}>✉️</span>
                    </Link>
                  )}
                  <Link to="/dashboard/messages" onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    color: "#e2e8f0", textDecoration: "none", borderRadius: 12,
                    transition: "all 0.2s", justifyContent: "flex-end"
                  }}>
                    <span>پیام‌ها</span>
                    <span style={{ fontSize: 20 }}>💬</span>
                  </Link>
                </nav>

                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "16px 0" }} />

                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 15,
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10
                  }}
                >
                  <span>🔐</span>
                  <span>خروج از حساب</span>
                </button>
              </div>
            )}
            */}
          </div>
        </div>
      </header>

      <div style={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1
      }}>
        {sidebarOpen && (
          <aside style={{
            width: 280,
            minWidth: 280,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px)",
            padding: 20,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            animation: "fadeInLeft 0.4s ease-out",
            overflowY: "auto"
          }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { to: "/dashboard", icon: "🏠", label: "داشبورد" },
                { to: "/dashboard/projects", icon: "📁", label: "پروژه‌ها" },
                ...(!isClientTop ? [{ to: "/dashboard/proposals", icon: "✉️", label: "پروپوزال‌ها" }] : []),
                { to: "/dashboard/messages", icon: "💬", label: "پیام‌ها" },
                { to: "/dashboard/profile", icon: "⚙️", label: "حساب کاربری" }
              ].map((item, idx) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="hover-lift"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 18px",
                    textDecoration: "none",
                    color: location.pathname === item.to ? "#fff" : "#94a3b8",
                    borderRadius: 14,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: location.pathname === item.to
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)"
                      : "transparent",
                    border: location.pathname === item.to
                      ? "1px solid rgba(99, 102, 241, 0.3)"
                      : "1px solid transparent",
                    animation: `fadeInLeft ${0.3 + idx * 0.1}s ease-out`
                  }}
                >
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="hover-lift"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: 14,
                  color: "#fca5a5",
                  cursor: "pointer",
                  marginTop: 20,
                  transition: "all 0.3s",
                  width: "100%",
                  textAlign: "right"
                }}
              >
                <span style={{ fontSize: 22 }}>🔐</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>خروج</span>
              </button>
            </nav>
          </aside>
        )}

        <main style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: 28,
          display: "flex",
          flexDirection: "column"
        }}>
          {isIndex ? <DashboardHome user={user} /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    balance: 0,
    proposals: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    messages: 0,
    projects: { total: 0, active: 0, completed: 0 },
    recentActivities: [],
    portfolios: []
  });
  const [loading, setLoading] = useState(true);

  const [portfolios, setPortfolios] = useState([]);
  const [portLoading, setPortLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItem, setViewerItem] = useState(null);

  const normalizedUser = normalizeUser(user);
  const isFreelancer = normalizedUser?.user_type === "freelancer";
  const isClient = normalizedUser?.user_type === "client";

  useEffect(() => {
    let cancelled = false;
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const requests = [
          api.get("/market/wallet/balance/").catch(() => null),
          api.get("/market/proposals/stats/").catch(() => null),
          api.get("/market/messages/unread/").catch(() => null),
          api.get("/market/projects/my-stats/").catch(() => null),
          api.get("/market/activities/recent/?limit=5").catch(() => null),
          api.get("/market/portfolio/?limit=6").catch(() => null)
        ];
        const results = await Promise.allSettled(requests);

        const newStats = {
          balance: 0,
          proposals: { total: 0, pending: 0, accepted: 0, rejected: 0 },
          messages: 0,
          projects: { total: 0, active: 0, completed: 0 },
          recentActivities: [],
          portfolios: []
        };

        if (results[0].status === "fulfilled" && results[0].value?.data) {
          newStats.balance = results[0].value.data.balance ?? 0;
        }

        if (results[1].status === "fulfilled" && results[1].value?.data) {
          const d = results[1].value.data;
          newStats.proposals = {
            total: d.total ?? 0,
            pending: d.pending ?? 0,
            accepted: d.accepted ?? 0,
            rejected: d.rejected ?? 0
          };
        }

        if (results[2].status === "fulfilled" && results[2].value?.data) {
          const d = results[2].value.data;
          newStats.messages = d.unread ?? d.unread_count ?? d.count ?? 0;
        }

        if (results[3].status === "fulfilled" && results[3].value?.data) {
          const d = results[3].value.data;
          newStats.projects = {
            total: d.total ?? 0,
            active: d.active ?? 0,
            completed: d.completed ?? 0
          };
        }

        if (results[4].status === "fulfilled" && results[4].value?.data) {
          const d = results[4].value.data;
          newStats.recentActivities = d?.results ?? d?.activities ?? d ?? [];
        }

        if (results[5].status === "fulfilled" && results[5].value?.data) {
          const d = results[5].value.data;
          newStats.portfolios = d?.results ?? d?.portfolios ?? d ?? [];
        }

        if (!cancelled) {
          setStats(newStats);
          loadPortfolios();
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDashboardStats();
    return () => { cancelled = true; };
  }, [user]);


  useEffect(() => {
    if (location.pathname === "/dashboard/messages" && stats.messages > 0) {
      markAllProjectMessagesAsRead().then(() => {
        window.dispatchEvent(new CustomEvent("messagesReadByEmployer"));
        setStats(prev => ({ ...prev, messages: 0 }));
      });
    }
  }, [location.pathname, stats.messages]);

  async function markAllProjectMessagesAsRead() {
    try {
      const res = await api.get("/market/projects/", { withCredentials: true });
      const projects = Array.isArray(res.data) ? res.data : (res.data?.results || res.data || []);
      const clientId = user?.user?.id || user?.id;
      const myProjects = projects.filter(p => {
        if (!p) return false;
        if (typeof p.client === "number") return Number(p.client) === Number(clientId);
        if (typeof p.client === "object") return (p.client.id ?? p.client.pk) === clientId;
        return false;
      });
      await Promise.all(myProjects.map(p =>
        api.post(`/market/messages/${p.id}/mark-read/`, {}, { withCredentials: true })
      ));
      setStats(prev => ({ ...prev, messages: 0 }));
    } catch (err) {
      console.error("Error marking all project messages as read:", err);
    }
  }

  async function loadPortfolios() {
    try {
      setPortLoading(true);
      const res = await api.get("/market/portfolio/", { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data?.portfolios ?? [];
      setPortfolios(data);
    } catch (err) {
      console.error("load portfolios error", err);
    } finally {
      setPortLoading(false);
    }
  }

  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : null;
  }

  function openNewPortfolio() {
    setEditing({ id: null, title: "", description: "", filePreviewUrl: null, fileObj: null, media_type: null });
    setUploadError(null);
    setFileInputKey(Date.now());
    setUploadOpen(true);
  }

  function openEditPortfolio(p) {
    setEditing({
      id: p.id,
      title: p.title || "",
      description: p.description || "",
      filePreviewUrl: p.media || null,
      fileObj: null,
      media_type: p.media?.endsWith?.('.mp4') ? 'video' : 'image'
    });
    setUploadError(null);
    setUploadOpen(true);
  }

  function onFileChange(e) {
    setUploadError(null);
    const f = e.target.files?.[0];
    if (!f) {
      setEditing(prev => ({ ...prev, fileObj: null, filePreviewUrl: null, media_type: null }));
      return;
    }
    const isImage = f.type.startsWith("image/");
    const isVideo = f.type.startsWith("video/");
    const url = URL.createObjectURL(f);
    setEditing(prev => ({ ...prev, fileObj: f, filePreviewUrl: url, media_type: isImage ? "image" : (isVideo ? "video" : "file") }));
  }

  async function submitPortfolio() {
    if (!editing) return;
    if (!editing.title?.trim()) {
      setUploadError("عنوان را وارد کنید.");
      return;
    }
    setSaving(true);
    setUploadError(null);
    try {
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      let res;
      if (editing.fileObj) {
        const fd = new FormData();
        fd.append("title", editing.title);
        fd.append("description", editing.description || "");
        fd.append("media", editing.fileObj);
        if (editing.id) {
          res = await api.patch(`/market/portfolio/${editing.id}/`, fd, { headers, withCredentials: true });
        } else {
          res = await api.post("/market/portfolio/", fd, { headers, withCredentials: true });
        }
      } else {
        const payload = { title: editing.title, description: editing.description || "" };
        if (editing.id) {
          res = await api.patch(`/market/portfolio/${editing.id}/`, payload, { headers: { "Content-Type": "application/json", ...headers }, withCredentials: true });
        } else {
          res = await api.post("/market/portfolio/", payload, { headers: { "Content-Type": "application/json", ...headers }, withCredentials: true });
        }
      }
      const saved = res.data;
      setPortfolios(prev => editing.id ? prev.map(x => x.id === saved.id ? saved : x) : [saved, ...prev]);
      setUploadOpen(false);
      setEditing(null);
    } catch (err) {
      console.error("portfolio submit error", err);
      setUploadError("خطا در ارسال نمونه‌کار");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePortfolio(id) {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    setDeletingId(id);
    try {
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;
      await api.delete(`/market/portfolio/${id}/`, { headers, withCredentials: true });
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("خطا در حذف");
    } finally {
      setDeletingId(null);
    }
  }

  function openViewer(item) {
    setViewerItem(item);
    setViewerOpen(true);
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    setViewerOpen(false);
    setViewerItem(null);
    document.body.style.overflow = "";
  }

  const formatNumber = (num) => num?.toLocaleString('fa-IR') || '۰';
  const completion = computeCompletion(normalizedUser);

  const openProjects = stats.projects.active;
  const inProgressProjects = stats.projects.active;
  const completedProjects = stats.projects.completed;

  return (
    <div style={{ width: "100%", color: "#fff" }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card:hover { transform: translateY(-8px) scale(1.02); }
        .portfolio-card:hover { transform: translateY(-6px); box-shadow: 0 25px 50px rgba(0,0,0,0.4) !important; }
      `}</style>

      <section style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        marginBottom: 32,
        animation: "fadeInUp 0.6s ease-out"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: isClient
            ? "linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(99, 102, 241, 0.15) 100%)"
            : "linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(99, 102, 241, 0.15) 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 8s ease infinite"
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)"
        }} />

        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: 32,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "40px 36px",
          flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <h1 style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.2,
              background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {isClient ? "سلام، کارفرمای عزیز" : "سلام، فریلنسر عزیز"} 👋
            </h1>

            <p style={{
              color: "#94a3b8",
              marginTop: 16,
              fontSize: 17,
              lineHeight: 1.8,
              maxWidth: 500
            }}>
              {isClient
                ? "به پنل مدیریت کارفرمایی خوش آمدید. پروژه‌های خود را منتشر کنید، بهترین فریلنسرها را پیدا کنید و روند همکاری را به راحتی مدیریت کنید."
                : "به پنل فریلنسری خوش آمدید. پروژه‌های جدید را کشف کنید، پیشنهادات حرفه‌ای ارسال کنید و مهارت‌هایتان را به نمایش بگذارید."
              }
            </p>

            <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
              {isClient ? (
                <>
                  <button
                    onClick={() => navigate("/dashboard/projects/create")}
                    className="hover-glow"
                    style={{
                      background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
                      color: "#fff",
                      padding: "16px 28px",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 16,
                      boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <span>➕</span>
                    <span>انتشار پروژه جدید</span>
                  </button>
                  <button
                    onClick={() => navigate("/dashboard/projects")}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(10px)",
                      color: "#fff",
                      padding: "16px 28px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.15)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 16,
                      transition: "all 0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <span>🔍</span>
                    <span>مشاهده پروژه‌ها</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/dashboard/projects")}
                    className="hover-glow"
                    style={{
                      background: "linear-gradient(135deg, #34d399 0%, #3b82f6 100%)",
                      color: "#fff",
                      padding: "16px 28px",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 16,
                      boxShadow: "0 10px 30px rgba(52, 211, 153, 0.3)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <span>🔍</span>
                    <span>جستجوی پروژه‌ها</span>
                  </button>
                  <Link
                    to="/dashboard/proposals"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(10px)",
                      color: "#fff",
                      padding: "16px 28px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.15)",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      transition: "all 0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <span>✉️</span>
                    <span>پیشنهادات من</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div style={{
            minWidth: 340,
            maxWidth: 380,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(20px)",
            padding: 28,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            animation: "fadeInRight 0.7s ease-out"
          }}>
            <div style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: 24
            }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>{normalizedUser?.username}</div>
                <div style={{
                  color: isClient ? "#f472b6" : "#34d399",
                  fontSize: 14,
                  marginTop: 6,
                  fontWeight: 600
                }}>
                  {isClient ? "🎯 کارفرما" : "💼 فریلنسر"}
                </div>
              </div>
              <div style={{ position: "relative", borderRadius: "50%", overflow: "hidden" }}>
                <UserAvatar src={normalizedUser?.avatar} size={80} alt={normalizedUser?.username} />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>تکمیل پروفایل</span>
                <span style={{
                  fontWeight: 900,
                  fontSize: 20,
                  background: completion >= 80 ? "linear-gradient(135deg, #10b981, #34d399)" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>{completion}%</span>
              </div>
              <div style={{
                height: 12,
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{
                  width: `${completion}%`,
                  height: "100%",
                  background: completion >= 80
                    ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                    : "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
                  borderRadius: 12,
                  transition: "width 1s ease-out",
                  boxShadow: `0 0 20px ${completion >= 80 ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`
                }} />
              </div>
            </div>

            <Link
              to="/dashboard/profile"
              style={{
                display: "block",
                marginTop: 20,
                padding: "14px 20px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: 12,
                color: "#a5b4fc",
                textDecoration: "none",
                textAlign: "center",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.3s"
              }}
            >
              📈 بهبود پروفایل
            </Link>
          </div>
        </div>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20,
        marginBottom: 32
      }}>
        {isClient ? (
          <>
            <StatCard
              icon="📁"
              label="پروژه‌های فعال من"
              value={formatNumber(stats.projects.active)}
              subLabel="پروژه در حال انجام"
              gradient="linear-gradient(135deg, #f472b6 0%, #a855f7 100%)"
              delay="0.1s"
            />
            <StatCard
              icon="✅"
              label="تکمیل شده"
              value={formatNumber(stats.projects.completed)}
              subLabel="پروژه به اتمام رسیده"
              gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
              delay="0.2s"
            />
            <StatCard
              icon="💬"
              label="پیام‌های جدید"
              value={formatNumber(stats.messages)}
              subLabel="پیام خوانده نشده"
              gradient="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
              delay="0.3s"
            />
            <StatCard
              icon="💰"
              label="موجودی کیف پول"
              value={formatNumber(stats.balance)}
              subLabel="تومان"
              gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              delay="0.4s"
            />
          </>
        ) : (
          <>
            <StatCard
              icon="✉️"
              label="پیشنهادات ارسالی"
              value={formatNumber(stats.proposals.total)}
              subLabel={`${formatNumber(stats.proposals.pending)} در انتظار`}
              gradient="linear-gradient(135deg, #34d399 0%, #3b82f6 100%)"
              delay="0.1s"
            />
            <StatCard
              icon="✅"
              label="پذیرفته شده"
              value={formatNumber(stats.proposals.accepted)}
              subLabel="پیشنهاد موفق"
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              delay="0.2s"
            />
            <StatCard
              icon="📁"
              label="پروژه‌های فعال"
              value={formatNumber(stats.projects.active)}
              subLabel="در حال انجام"
              gradient="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
              delay="0.3s"
            />
            <StatCard
              icon="💰"
              label="موجودی کیف پول"
              value={formatNumber(stats.balance)}
              subLabel="تومان"
              gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
              delay="0.4s"
            />
          </>
        )}
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        gap: 28
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: 28,
            border: "1px solid rgba(255,255,255,0.06)",
            animation: "fadeInUp 0.7s ease-out"
          }}>
            <h3 style={{
              margin: "0 0 24px 0",
              fontSize: 22,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 14
            }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <span>فعالیت‌های اخیر</span>
            </h3>

            <div style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: 16,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.04)"
            }}>
              {loading ? (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    border: "3px solid rgba(99, 102, 241, 0.3)",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px"
                  }} />
                  در حال بارگذاری...
                </div>
              ) : stats.recentActivities.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {stats.recentActivities.map((activity, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 16,
                        background: "rgba(99, 102, 241, 0.05)",
                        borderRadius: 12,
                        border: "1px solid rgba(99, 102, 241, 0.1)",
                        animation: `fadeInUp ${0.3 + idx * 0.1}s ease-out`
                      }}
                    >
                      <div style={{ color: "#e2e8f0", fontSize: 15, marginBottom: 6 }}>
                        {activity.action || activity.title || activity.description}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>
                        {activity.created_at ? new Date(activity.created_at).toLocaleDateString('fa-IR') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 16, marginBottom: 20 }}>
                    {isClient
                      ? "هنوز فعالیتی ثبت نشده. اولین پروژه خود را ایجاد کنید!"
                      : "هنوز فعالیتی ثبت نشده. شروع به ارسال پیشنهاد کنید!"
                    }
                  </div>
                  <button
                    onClick={() => navigate(isClient ? "/dashboard/projects/create" : "/dashboard/projects")}
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      color: "#fff",
                      padding: "12px 24px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    {isClient ? "➕ ایجاد پروژه" : "🔍 مشاهده پروژه‌ها"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: 28,
            border: "1px solid rgba(255,255,255,0.06)",
            animation: "fadeInUp 0.8s ease-out"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 14
              }}>
                <span style={{ fontSize: 28 }}>{isFreelancer ? "🎨" : "🧰"}</span>
                <span>{isFreelancer ? "نمونه‌کارهای من" : "ابزارهای کارفرما"}</span>
              </h3>

              {isFreelancer && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={openNewPortfolio}
                    style={{
                      background: "linear-gradient(135deg, #34d399 0%, #3b82f6 100%)",
                      color: "#fff",
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.3s"
                    }}
                  >
                    <span>➕</span>
                    <span>افزودن نمونه‌کار</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.04)"
            }}>
              {isFreelancer ? (
                portLoading ? (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>در حال بارگذاری...</div>
                ) : portfolios.length > 0 ? (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16
                  }}>
                    {portfolios.map((p, idx) => (
                      <article
                        key={p.id}
                        className="portfolio-card"
                        onClick={() => openViewer(p)}
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.06)",
                          cursor: "pointer",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          animation: `fadeInUp ${0.3 + idx * 0.1}s ease-out`
                        }}
                      >
                        <div style={{
                          height: 140,
                          background: "#020617",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden"
                        }}>
                          {p.media?.endsWith?.('.mp4') ? (
                            <video src={p.media} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                          ) : p.media ? (
                            <img src={p.media} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ color: "#475569", fontSize: 40 }}>🖼️</div>
                          )}
                        </div>
                        <div style={{ padding: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 8 }}>{p.title}</div>
                          <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, minHeight: 40 }}>
                            {p.description?.slice(0, 60)}{p.description?.length > 60 ? "..." : ""}
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditPortfolio(p); }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: "rgba(59, 130, 246, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                color: "#60a5fa",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 13
                              }}
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePortfolio(p.id); }}
                              disabled={deletingId === p.id}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#fca5a5",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 13
                              }}
                            >
                              {deletingId === p.id ? "..." : "🗑️"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>🎨</div>
                    <div style={{ fontSize: 17, marginBottom: 12, color: "#e2e8f0" }}>نمونه‌کارهای خود را به نمایش بگذارید</div>
                    <div style={{ fontSize: 14, marginBottom: 24, color: "#64748b" }}>
                      آپلود نمونه‌کار باعث افزایش ۳ برابری شانس استخدام شما می‌شود
                    </div>
                    <button
                      onClick={openNewPortfolio}
                      style={{
                        background: "linear-gradient(135deg, #34d399 0%, #3b82f6 100%)",
                        color: "#fff",
                        padding: "14px 28px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 15
                      }}
                    >
                      ➕ افزودن اولین نمونه‌کار
                    </button>
                  </div>
                )
              ) : (
                <div style={{ color: "#e2e8f0" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                    marginBottom: 24
                  }}>
                    <button
                      onClick={() => navigate("/dashboard/projects/create")}
                      className="hover-lift"
                      style={{
                        padding: 24,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s"
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>انتشار پروژه</div>
                      <div style={{ color: "#94a3b8", fontSize: 13 }}>پروژه جدید ایجاد کنید</div>
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/projects")}
                      className="hover-lift"
                      style={{
                        padding: 24,
                        borderRadius: 16,
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s"
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>جستجوی فریلنسر</div>
                      <div style={{ color: "#94a3b8", fontSize: 13 }}>بهترین‌ها را پیدا کنید</div>
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/messages")}
                      className="hover-lift"
                      style={{
                        padding: 24,
                        borderRadius: 16,
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.3s"
                      }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>پیام‌ها</div>
                      <div style={{ color: "#94a3b8", fontSize: 13 }}>ارتباط با فریلنسرها</div>
                    </button>
                  </div>

                  <div style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.15)"
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                      <span>💡</span>
                      <span>نکات طلایی برای کارفرمایان</span>
                    </div>
                    <ul style={{ margin: 0, paddingRight: 20, color: "#94a3b8", lineHeight: 2 }}>
                      <li>شرح پروژه را دقیق و کامل بنویسید</li>
                      <li>بودجه و زمان‌بندی را شفاف مشخص کنید</li>
                      <li>از فریلنسرها نمونه‌کار مرتبط بخواهید</li>
                      <li>امتیازات و نظرات کاربران را بررسی کنید</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(20px)",
            padding: 24,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.06)",
            animation: "fadeInRight 0.6s ease-out"
          }}>
            <h4 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
              <span>🎯</span>
              <span>{isClient ? "دسترسی سریع" : "پیشنهادهای سریع"}</span>
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {isClient ? (
                <>
                  <SidebarButton icon="📝" label="ایجاد پروژه جدید" onClick={() => navigate("/dashboard/projects/create")} />
                  <SidebarButton icon="📁" label="مدیریت پروژه‌ها" onClick={() => navigate("/dashboard/projects")} />
                  <SidebarButton icon="💬" label="پیام‌ها" onClick={() => navigate("/dashboard/messages")} />
                </>
              ) : (
                <>
                  <SidebarButton icon="🔍" label="جستجوی پروژه‌ها" onClick={() => navigate("/dashboard/projects")} />
                  <SidebarButton icon="✉️" label="پیشنهادات من" onClick={() => navigate("/dashboard/proposals")} />
                  <SidebarButton icon="✏️" label="به‌روزرسانی مهارت‌ها" onClick={() => navigate("/dashboard/profile")} />
                </>
              )}
            </div>
          </div>

          {isFreelancer ? (
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              padding: 24,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.06)",
              animation: "fadeInRight 0.7s ease-out"
            }}>
              <h4 style={{ margin: "0 0 18px 0", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                <span>🏷️</span>
                <span>دسته‌های محبوب</span>
              </h4>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {['Python', 'JavaScript', 'React', 'Django', 'Mobile', 'UI/UX', 'Node.js', 'Flutter'].map((c) => (
                  <Link
                    key={c}
                    to="/dashboard/projects"
                    style={{
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#a5b4fc",
                      padding: "10px 16px",
                      borderRadius: 25,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      transition: "all 0.3s"
                    }}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              padding: 24,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.06)",
              animation: "fadeInRight 0.7s ease-out"
            }}>
              <h4 style={{ margin: "0 0 18px 0", fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
                <span>📊</span>
                <span>آمار پروژه‌ها</span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8" }}>در حال انجام</span>
                  <span style={{ fontWeight: 700, color: "#60a5fa" }}>{formatNumber(inProgressProjects)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8" }}>تکمیل شده</span>
                  <span style={{ fontWeight: 700, color: "#10b981" }}>{formatNumber(completedProjects)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#94a3b8" }}>کل پروژه‌ها</span>
                  <span style={{ fontWeight: 700, color: "#a855f7" }}>{formatNumber(stats.projects.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
            padding: 24,
            borderRadius: 20,
            border: "1px solid rgba(99, 102, 241, 0.2)",
            animation: "fadeInRight 0.8s ease-out"
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
            <h4 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: 17, fontWeight: 800 }}>نکته روز</h4>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              {isClient
                ? "برای جذب فریلنسرهای حرفه‌ای، شرح پروژه را دقیق بنویسید و بودجه منصفانه تعیین کنید. درخواست نمونه‌کار مرتبط کیفیت انتخاب را بالا می‌برد."
                : "پروفایل کامل و نمونه‌کارهای با کیفیت، شانس استخدام شما را تا ۳ برابر افزایش می‌دهد! همین الان پروفایل خود را تقویت کنید."
              }
            </p>
          </div>
        </aside>
      </section>

      {uploadOpen && editing && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(8px)"
            }}
            onClick={() => { setUploadOpen(false); setEditing(null); }}
          />
          <div style={{
            position: "relative",
            zIndex: 201,
            width: "min(600px, 95%)",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            padding: 32,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "scaleIn 0.3s ease-out"
          }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: 22, fontWeight: 800 }}>
              {editing.id ? "ویرایش نمونه‌کار" : "افزودن نمونه‌کار جدید"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <input
                placeholder="عنوان نمونه‌کار"
                value={editing.title}
                onChange={e => setEditing(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 12,
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 16,
                  outline: "none"
                }}
              />

              <textarea
                placeholder="توضیحات (اختیاری)"
                rows={4}
                value={editing.description}
                onChange={e => setEditing(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 12,
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  resize: "vertical"
                }}
              />

              <div>
                <label style={{ display: "block", marginBottom: 10, color: "#94a3b8", fontSize: 14 }}>
                  فایل (تصویر یا ویدیو)
                </label>
                <input
                  key={fileInputKey}
                  ref__={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={onFileChange}
                  style={{ color: "#fff" }}
                />
                {editing.filePreviewUrl && (
                  <div style={{
                    marginTop: 16,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    {editing.media_type === "video" ? (
                      <video src={editing.filePreviewUrl} controls style={{ width: "100%", maxHeight: 280 }} />
                    ) : (
                      <img src={editing.filePreviewUrl} alt="preview" style={{ width: "100%", maxHeight: 280, objectFit: "cover" }} />
                    )}
                  </div>
                )}
              </div>

              {uploadError && <div style={{ color: "#fca5a5", fontSize: 14 }}>{uploadError}</div>}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setUploadOpen(false); setEditing(null); }}
                  style={{
                    padding: "14px 24px",
                    borderRadius: 12,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  انصراف
                </button>
                <button
                  onClick={submitPortfolio}
                  disabled={saving}
                  style={{
                    padding: "14px 28px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  {saving ? "در حال ذخیره..." : (editing.id ? "ذخیره تغییرات" : "افزودن")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewerOpen && viewerItem && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)"
            }}
            onClick={closeViewer}
          />
          <div style={{
            position: "relative",
            zIndex: 201,
            width: "min(900px, 95%)",
            maxHeight: "90vh",
            background: "#0f172a",
            borderRadius: 24,
            overflow: "hidden",
            display: "flex",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "scaleIn 0.3s ease-out"
          }}>
            <div style={{
              flex: "0 0 55%",
              background: "#020617",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {viewerItem.media?.endsWith?.('.mp4') ? (
                <video src={viewerItem.media} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : viewerItem.media ? (
                <img src={viewerItem.media} alt={viewerItem.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ color: "#475569", fontSize: 80 }}>🖼️</div>
              )}
            </div>
            <div style={{ flex: 1, padding: 28, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: 22, fontWeight: 800, color: "#fff" }}>{viewerItem.title}</h3>
                  <div style={{ color: "#64748b", fontSize: 13 }}>
                    {viewerItem.created_at ? new Date(viewerItem.created_at).toLocaleDateString('fa-IR') : ''}
                  </div>
                </div>
                <button
                  onClick={closeViewer}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 18
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ color: "#94a3b8", lineHeight: 1.8, flex: 1 }}>
                {viewerItem.description || "بدون توضیحات"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subLabel, gradient, delay }) {
  return (
    <div
      className="stat-card"
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        padding: 24,
        border: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `fadeInUp ${delay} ease-out`
      }}
    >
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 100,
        height: 100,
        background: gradient,
        opacity: 0.1,
        borderRadius: "50%",
        transform: "translate(30%, -30%)",
        filter: "blur(20px)"
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 8 }}>{label}</div>
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {value}
          </div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>{subLabel}</div>
        </div>
        <div style={{
          padding: 14,
          borderRadius: 16,
          background: `${gradient.replace('linear-gradient(135deg,', 'linear-gradient(135deg, rgba(').replace(' 0%', ', 0.15) 0%').replace(' 100%)', ', 0.15) 100%)')}`,
          fontSize: 28
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SidebarButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="hover-lift"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        background: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        color: "#e2e8f0",
        cursor: "pointer",
        width: "100%",
        textAlign: "right",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontSize: 14,
        fontWeight: 600
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

/* ========== Helpers ========== */
function normalizeUser(user) {
  if (!user) return null;
  return user.user ?? user;
}

function computeCompletion(u) {
  if (!u) return 0;
  const userType = u.user_type;
  let score = 0;

  const hasAvatar = !!(u.avatar && (typeof u.avatar === "string" ? u.avatar.trim() : true));
  if (hasAvatar) score += 20;
  if (u.bio && String(u.bio).trim().length > 10) score += 20;
  if (u.phone && String(u.phone).trim().length > 5) score += 10;

  if (userType === "freelancer") {
    let skillsArr = [];
    if (Array.isArray(u.skills)) skillsArr = u.skills;
    else if (typeof u.skills === "string" && u.skills.trim()) {
      try { skillsArr = JSON.parse(u.skills); } catch { skillsArr = u.skills.split(/[\s,،]+/).filter(Boolean); }
    }
    if (skillsArr.length > 0) score += 30;

    let langsArr = [];
    if (Array.isArray(u.languages)) langsArr = u.languages;
    else if (typeof u.languages === "string" && u.languages.trim()) {
      try { langsArr = JSON.parse(u.languages); } catch { langsArr = u.languages.split(/[\s,،]+/).filter(Boolean); }
    }
    if (langsArr.length > 0) score += 15;

    if (Number(u.experience_years) > 0) score += 15;
  } else if (userType === "client") {
    let businessFieldsArr = [];
    if (Array.isArray(u.business_fields)) businessFieldsArr = u.business_fields;
    else if (typeof u.business_fields === "string" && u.business_fields.trim()) {
      try { businessFieldsArr = JSON.parse(u.business_fields); } catch { businessFieldsArr = u.business_fields.split(/[\s,،]+/).filter(Boolean); }
    }
    if (businessFieldsArr.length > 0) score += 30;
    if (u.company_size && String(u.company_size).trim()) score += 10;
    if (u.website && String(u.website).trim().length > 5) score += 10;
    if (u.company_description && String(u.company_description).trim().length > 10) score += 20;
  }

  return Math.min(100, score);
}