import React, { useContext, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import SearchBox from "./SearchBox";
import api from "../api/axios";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);


  useEffect(() => {
    loadUnreadMessages();
    loadNotifications(6);

    function handleMessagesRead() {
      setUnreadMessages(0);
    }
    window.addEventListener("messagesReadByEmployer", handleMessagesRead);
    return () => {
      window.removeEventListener("messagesReadByEmployer", handleMessagesRead);
    };
  }, [user]);

  async function loadNotifications(limit = 6) {
    setNotifLoading(true);
    try {
      const res = await api.get(`/market/activities/recent/?limit=${limit}`, { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data ?? [];
      setNotifications(data);
    } catch (err) {
      console.warn("load notifications error", err);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }

  async function loadUnreadMessages() {
    try {
      const res = await api.get("/market/messages/unread/", { withCredentials: true });
      const count = res.data?.unread ?? res.data?.count ?? 0;
      setUnreadMessages(count);
    } catch (err) {
      console.warn("load unread messages error", err);
      setUnreadMessages(0);
    }
  }

  const goProfile = () => {
    setMenuOpen(false);
    navigate("/dashboard/profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button onClick={onToggleSidebar} style={styles.hamburger} aria-label="toggle sidebar">☰</button>
        <Link to="/dashboard" style={styles.brand}>MyMarket</Link>
      </div>

      <div style={styles.center}>
        <SearchBox />
      </div>

      <div style={styles.right}>
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) loadNotifications(10); }}
            style={styles.iconBtn}
            aria-label="اعلان‌ها"
            title="اعلان‌ها"
          >
            {/* <div style={styles.notificationBadge}>
              🔔
              {(unreadMessages > 0) && <span style={styles.badge}>{unreadMessages}</span>}
            </div> */}
          </button>

          {notifOpen && (
            <div style={styles.notifMenu}>
              <div style={styles.notifHeader}>
                <strong>اعلان‌ها</strong>
                <button style={styles.notifClear} onClick={() => { setNotifications([]); setNotifOpen(false); }}>پاک</button>
              </div>

              <div style={styles.notifList}>
                {notifLoading ? (
                  <div style={{ padding: 10, color: "#94a3b8" }}>در حال بارگذاری...</div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: 12, color: "#94a3b8" }}>اعلانی موجود نیست.</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} style={styles.notifItem} onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link); }}>
                      <div style={{ fontSize: 13, color: "#e6eef8" }}>{n.title || n.message || n.description}</div>
                      <div style={{ fontSize: 12, color: "#9aa6b6", marginTop: 6 }}>
                        {n.created_at ? new Date(n.created_at).toLocaleString('fa-IR') : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={styles.notifFooter}>
                <Link to="/dashboard" style={styles.viewAll}>مشاهده همه</Link>
                <button style={styles.viewAllBtn} onClick={() => { loadNotifications(20); }}>بارگذاری بیشتر</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "relative" }} ref={menuRef}>
          <button onClick={() => setMenuOpen(s => !s)} style={styles.avatarBtn}>
            <UserAvatar src={user?.avatar} size={40} alt={user?.username || "user"} />
          </button>

          {menuOpen && (
            <div style={styles.menu}>
              <div style={styles.menuUser}>
                <UserAvatar src={user?.avatar} size={56} />
                <div style={{ textAlign: "right", marginRight: 8 }}>
                  <div style={{ fontWeight: 800 }}>{user?.username}</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>{user?.user_type}</div>
                </div>
              </div>

              <button onClick={goProfile} style={styles.menuItem}>پروفایل</button>
              <Link to="/dashboard/projects" style={{ ...styles.menuItem, textDecoration: "none" }}>پروژه‌ها</Link>
              <button onClick={handleLogout} style={{ ...styles.menuItem, background: "#ef4444", color: "#fff" }}>خروج</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    padding: "12px 18px",
    background: "linear-gradient(90deg,#081226,#0f1724)",
    gap: 12,
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 6px 18px rgba(2,6,23,0.6)"
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  brand: { color: "#fff", fontWeight: 900, fontSize: 18, textDecoration: "none" },
  hamburger: { fontSize: 18, padding: 8, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.02)", color: "#fff", cursor: "pointer" },
  center: { flex: 1, display: "flex", justifyContent: "center" },
  right: { display: "flex", alignItems: "center", gap: 12 },

  iconBtn: { background: "transparent", border: "none", fontSize: 20, color: "#fff", cursor: "pointer", position: "relative" },
  notificationBadge: { position: 'relative', display: 'inline-block' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    background: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
  },

  notifMenu: {
    position: "absolute",
    right: 0,
    top: 46,
    width: 320,
    maxHeight: 420,
    background: "#0b1b2b",
    boxShadow: "0 12px 40px rgba(2,6,23,0.7)",
    borderRadius: 10,
    padding: 10,
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.03)"
  },
  notifHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.02)" },
  notifClear: { background: "transparent", border: "none", color: "#9aa6b6", cursor: "pointer", fontSize: 13 },
  notifList: { overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 8 },
  notifItem: { padding: 10, borderRadius: 8, background: "linear-gradient(90deg, rgba(255,255,255,0.02), transparent)", cursor: "pointer" },
  notifFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.02)" },
  viewAll: { color: "#60a5fa", textDecoration: "none", fontWeight: 700 },
  viewAllBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "#cbd5e1", padding: "6px 10px", borderRadius: 8, cursor: "pointer" },

  avatarBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer" },

  menu: {
    position: "absolute",
    right: 0,
    top: 54,
    width: 220,
    background: "#081426",
    boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 12,
    zIndex: 60,
  },
  menuUser: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8, justifyContent: "flex-end" },
  menuItem: {
    display: "block",
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "8px 6px",
    textAlign: "right",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 8,
  },
};