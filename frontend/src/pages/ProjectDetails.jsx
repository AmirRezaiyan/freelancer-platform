import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  DollarSign,
  Tag,
  MessageSquare,
  User,
  Briefcase,
  FileText,
  Send,
  X,
  Calendar,
  Award,
  Star,
  CheckCircle,
  Clock,
  ChevronLeft,
  Loader2,
  Shield,
  Building,
  Sparkles,
  Home,
  Grid,
  Mail,
  Settings,
  LogOut,
  Menu,
  X as XIcon,
  Bell,
  Search,
  BarChart3,
  CreditCard,
  Users,
  FileCode
} from "lucide-react";


const styles = {
    pageContainer: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    fontFamily: "'IRANSans-web', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    direction: "rtl",
    overflow: "auto",       
    position: "relative",   
  },

  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "20px 16px",
    width: "100%",
    height: "100%",
  },

  mainContent: {
    height: "calc(100vh - 200px)", 
    overflowY: "auto",
    paddingRight: "8px",
  },

  card: {
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(100, 116, 139, 0.2)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    overflow: "hidden",
    marginBottom: "24px" 
  },

  cardHeader: {
    padding: "16px 20px", 
    borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
    background: "linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)"
  },

  cardContent: {
    padding: "20px" 
  },

  heading1: {
    fontSize: "28px", 
    fontWeight: "900",
    color: "#ffffff",
    margin: "0 0 10px 0",
    lineHeight: "1.2"
  },

  heading2: {
    fontSize: "22px", 
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 6px 0"
  },

  heading3: {
    fontSize: "16px", 
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 4px 0"
  },

  bodyText: {
    fontSize: "13px", 
    color: "#cbd5e1",
    lineHeight: "1.5",
    margin: "0"
  },

  caption: {
    fontSize: "12px", 
    color: "#94a3b8",
    margin: "0"
  },

  primaryButton: {
    background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px", 
    borderRadius: "10px",
    fontSize: "13px", 
    fontWeight: "700",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.3)" 
  },

  secondaryButton: {
    background: "rgba(71, 85, 105, 0.3)",
    color: "#e2e8f0",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    padding: "10px 20px", 
    borderRadius: "10px",
    fontSize: "13px", 
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    transition: "all 0.3s ease"
  },

  statusBadge: {
    padding: "5px 12px", 
    borderRadius: "14px", 
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    border: "1px solid"
  },

  statusOpen: {
    background: "rgba(5, 150, 105, 0.15)",
    color: "#34d399",
    borderColor: "rgba(5, 150, 105, 0.3)"
  },

  statusProgress: {
    background: "rgba(249, 115, 22, 0.15)",
    color: "#fb923c",
    borderColor: "rgba(249, 115, 22, 0.3)"
  },

  statusCompleted: {
    background: "rgba(71, 85, 105, 0.15)",
    color: "#cbd5e1",
    borderColor: "rgba(100, 116, 139, 0.3)"
  },

  input: {
    width: "100%",
    padding: "12px", 
    borderRadius: "8px", 
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    color: "#f1f5f9",
    fontSize: "13px", 
    outline: "none",
    transition: "all 0.3s ease"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px", 
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    color: "#f1f5f9",
    fontSize: "13px", 
    outline: "none",
    minHeight: "100px", 
    resize: "vertical",
    transition: "all 0.3s ease"
  },

  priceBadge: {
    background: "linear-gradient(90deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
    color: "#34d399",
    padding: "10px 16px", 
    borderRadius: "14px", 
    border: "1px solid rgba(5, 150, 105, 0.3)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px" 
  },

  avatar: {
    width: "40px", 
    height: "40px", 
    borderRadius: "50%",
    overflow: "hidden",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid rgba(255, 255, 255, 0.1)"
  },

  proposalCard: {
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
    borderRadius: "14px", 
    padding: "16px", 
    marginBottom: "12px", 
    border: "1px solid rgba(100, 116, 139, 0.2)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" 
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px", 
    zIndex: 1000
  },

  modalContent: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "18px", 
    width: "100%",
    maxWidth: "480px", 
    maxHeight: "80vh", 
    overflow: "auto",
    border: "1px solid rgba(100, 116, 139, 0.3)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)" 
  },

  roleBadge: {
    padding: "5px 10px", 
    borderRadius: "14px", 
    fontSize: "12px", 
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    border: "1px solid"
  },

  freelancerBadge: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
    borderColor: "rgba(59, 130, 246, 0.3)"
  },

  employerBadge: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#a78bfa",
    borderColor: "rgba(139, 92, 246, 0.3)"
  },

  projectOwnerBadge: {
    background: "rgba(5, 150, 105, 0.2)",
    color: "#34d399",
    borderColor: "rgba(5, 150, 105, 0.3)"
  },

  hamburgerButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    color: "#ffffff",
    padding: "8px", 
    borderRadius: "8px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    fontSize: "12px", 
    fontWeight: "500",
    transition: "all 0.3s ease",
    zIndex: 1100
  },

  sidebarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 999,
    animation: "fadeIn 0.3s ease-out"
  },

  sidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "260px", 
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.3)", 
    zIndex: 1000,
    overflowY: "auto",
    borderLeft: "1px solid rgba(100, 116, 139, 0.2)",
    animation: "slideInRight 0.3s ease-out"
  },

  sidebarHeader: {
    padding: "20px 16px",
    borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },

  sidebarMenu: {
    padding: "16px 0" 
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px", 
    padding: "12px 16px", 
    color: "#cbd5e1",
    textDecoration: "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
    borderRight: "2px solid transparent"
  },

  menuItemActive: {
    background: "rgba(37, 99, 235, 0.1)",
    color: "#3b82f6",
    borderRight: "2px solid #3b82f6"
  },

  userInfo: {
    padding: "16px",
    borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "10px" 
  },

  userAvatar: {
    width: "40px", 
    height: "40px", 
    borderRadius: "10px", 
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px", 
    color: "#ffffff",
    fontWeight: "bold"
  },

  filterCard: {
    background: "rgba(17, 24, 39, 0.6)",
    border: "1px solid rgba(100, 116, 139, 0.12)",
    padding: "12px",
    borderRadius: "12px",
    width: "220px",
    color: "#e2e8f0"
  },

  sidebarLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    color: "#cbd5e1",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "all 0.15s ease"
  },
};


const SidebarMenu = ({ isOpen, onClose, userData, navigate }) => {
  const menuItems = [
    { icon: <Home size={18} />, label: "داشبورد", path: "/dashboard" },
    { icon: <Grid size={18} />, label: "بازار کار", path: "/market" },
    { icon: <FileCode size={18} />, label: "پروژه‌های من", path: "/dashboard/projects" },
    { icon: <Briefcase size={18} />, label: "پیشنهادهای من", path: "/dashboard/proposals" },
    { icon: <MessageSquare size={18} />, label: "پیام‌ها", path: "/dashboard/messages" },
    { icon: <CreditCard size={18} />, label: "تراکنش‌ها", path: "/dashboard/transactions" },
    { icon: <Users size={18} />, label: "کاربران", path: "/dashboard/users" },
    { icon: <BarChart3 size={18} />, label: "آمار و گزارشات", path: "/dashboard/analytics" },
    { icon: <Bell size={18} />, label: "اعلان‌ها", path: "/dashboard/notifications" },
    { icon: <Settings size={18} />, label: "تنظیمات", path: "/dashboard/settings" },
    { icon: <LogOut size={18} />, label: "خروج", path: "/logout", isLogout: true }
  ];

  const handleNavigation = (path, isLogout = false) => {
    if (isLogout) {
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      navigate(path);
      onClose(); 
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={styles.sidebarOverlay} onClick={onClose} />
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Briefcase size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                MyMarket
              </h3>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: "3px 0 0 0" }}>
                پنل مدیریت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "5px",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#ffffff";
              e.target.style.background = "rgba(100, 116, 139, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#94a3b8";
              e.target.style.background = "none";
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {userData && (
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {userData.first_name?.[0] || userData.username?.[0] || "U"}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff", margin: "0 0 3px 0" }}>
                {userData.first_name && userData.last_name
                  ? `${userData.first_name} ${userData.last_name}`
                  : userData.username || "کاربر"}
              </h4>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                {userData.role === 'freelancer' ? 'فریلنسر' : 'کارفرما'}
              </p>
            </div>
          </div>
        )}

        <div style={styles.sidebarMenu}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.menuItem,
                ...(window.location.pathname === item.path ? styles.menuItemActive : {}),
                ...(item.isLogout ? { color: "#ef4444" } : {})
              }}
              onClick={() => handleNavigation(item.path, item.isLogout)}
              onMouseEnter={(e) => {
                if (!item.isLogout) {
                  e.target.style.background = "rgba(100, 116, 139, 0.1)";
                  e.target.style.color = "#e2e8f0";
                } else {
                  e.target.style.background = "rgba(239, 68, 68, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.isLogout) {
                  e.target.style.background = window.location.pathname === item.path
                    ? "rgba(37, 99, 235, 0.1)"
                    : "transparent";
                  e.target.style.color = window.location.pathname === item.path
                    ? "#3b82f6"
                    : "#cbd5e1";
                } else {
                  e.target.style.background = "transparent";
                }
              }}
            >
              {item.icon}
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          padding: "16px",
          borderTop: "1px solid rgba(100, 116, 139, 0.2)",
          marginTop: "auto"
        }}>
          <div style={{
            fontSize: "11px",
            color: "#64748b",
            textAlign: "center"
          }}>
            نسخه ۱.۰.۰
          </div>
        </div>
      </div>
    </>
  );
};


export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [form, setForm] = useState({ cover_letter: "", bid: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [isHovered, setIsHovered] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="14" fill="#0b0b0d"/>
      <g fill="#cbd5e1">
        <circle cx="60" cy="40" r="22"/>
        <path d="M18 100c0-23 20-34 42-34s42 11 42 34z"/>
      </g>
    </svg>`
  )}`;

  const resolveEntityId = (entity) => {
    if (!entity && entity !== 0) return null;
    if (typeof entity === "number") return entity;
    if (typeof entity === "string" && /^\d+$/.test(entity)) return Number(entity);
    if (typeof entity === "object") {
      return entity.id || entity.pk || entity.user_id || entity.user || entity.created_by || null;
    }
    return null;
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userRes = await api.get('/users/me/');
        const userData = userRes.data;
        setUserData(userData);

        if (userData.role) {
          setUserRole(userData.role);
        } else if (userData.is_freelancer) {
          setUserRole('freelancer');
        } else if (userData.is_employer) {
          setUserRole('employer');
        } else if (userData.user_type) {
          setUserRole(userData.user_type);
        } else {
          setUserRole(userData.is_staff ? 'employer' : 'freelancer');
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectRes = await api.get(`/market/projects/${id}/`);
        const projectData = projectRes.data;
        setProject(projectData);

        if (userData) {
          const clientFromProject = projectData.client ?? projectData.owner ?? projectData.created_by ?? projectData;

          const clientIdResolved =
            resolveEntityId(projectData.client) ||
            resolveEntityId(projectData.client_id) ||
            resolveEntityId(projectData.owner) ||
            resolveEntityId(projectData.owner_id) ||
            resolveEntityId(projectData.created_by) ||
            resolveEntityId(projectData.user) ||
            resolveEntityId(projectData.created_by_id);

          const currentUserId = userData.id || userData.pk || userData.user_id || userData.id_str || null;

          if (clientIdResolved != null && currentUserId != null) {
            setIsProjectOwner(String(clientIdResolved) === String(currentUserId));
          } else {
            setIsProjectOwner(false);
          }
        }

        if (projectData?.has_applied !== undefined) {
          setHasApplied(Boolean(projectData.has_applied));
        }

        try {
          let clientIdForFetch = null;
          if (projectData.client) {
            clientIdForFetch = resolveEntityId(projectData.client);
          }
          if (!clientIdForFetch && projectData.client_id) {
            clientIdForFetch = resolveEntityId(projectData.client_id);
          }
          if (!clientIdForFetch && projectData.owner) {
            clientIdForFetch = resolveEntityId(projectData.owner);
          }
          if (!clientIdForFetch && projectData.owner_id) {
            clientIdForFetch = resolveEntityId(projectData.owner_id);
          }
          if (!clientIdForFetch && projectData.created_by) {
            clientIdForFetch = resolveEntityId(projectData.created_by);
          }

          if (clientIdForFetch) {
            const clientRes = await api.get(`/users/${clientIdForFetch}/`);
            setClientInfo(clientRes.data);
          } else if (projectData.client && typeof projectData.client === "object") {
            setClientInfo(projectData.client);
          }
        } catch (err) {
          console.error("Error loading client info:", err);
        }

        const proposalsRes = await api.get(`/market/projects/${id}/proposals/`);
        const proposalsData = Array.isArray(proposalsRes.data)
          ? proposalsRes.data
          : (proposalsRes.data?.results || proposalsRes.data || []);

        const enrichedProposals = await Promise.all(
          proposalsData.map(async (proposal) => {
            const enriched = { ...proposal };
            let freelancerId = null;
            let freelancerDetails = null;

            if (proposal.freelancer && typeof proposal.freelancer === "object") {
              freelancerId = proposal.freelancer.id || proposal.freelancer.pk ||
                proposal.freelancer.user_id || proposal.freelancer.id;
            } else if (typeof proposal.freelancer === "number") {
              freelancerId = proposal.freelancer;
            } else if (typeof proposal.freelancer === "string") {
              const match = proposal.freelancer.match(/\d+/);
              freelancerId = match ? Number(match[0]) : null;
            } else {
              freelancerId = proposal.freelancer_id || proposal.user_id ||
                proposal.freelancerId || null;
            }

            if (freelancerId) {
              try {
                const userRes = await api.get(`/users/${freelancerId}/`);
                freelancerDetails = userRes.data;
              } catch (e1) {
                try {
                  const marketRes = await api.get(`/market/users/${freelancerId}/`);
                  freelancerDetails = marketRes.data;
                } catch (e2) {
                  freelancerDetails = null;
                }
              }
            }

            let avgRating = 0;
            let ratingsCount = 0;

            if (freelancerId) {
              try {
                const ratingsRes = await api.get(`/market/users/${freelancerId}/ratings/`);
                const ratingsData = Array.isArray(ratingsRes.data)
                  ? ratingsRes.data
                  : (ratingsRes.data?.results || ratingsRes.data || []);

                if (ratingsData.length > 0) {
                  const sum = ratingsData.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
                  ratingsCount = ratingsData.length;
                  avgRating = +(sum / ratingsCount).toFixed(1);
                }
              } catch (e1) {
                try {
                  const altRes = await api.get(`/market/ratings/?user_to=${freelancerId}`);
                  const altData = Array.isArray(altRes.data)
                    ? altRes.data
                    : (altRes.data?.results || altRes.data || []);

                  if (altData.length > 0) {
                    const sum = altData.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
                    ratingsCount = altData.length;
                    avgRating = +(sum / ratingsCount).toFixed(1);
                  }
                } catch (e2) {
                }
              }
            }

            enriched.freelancer_details = freelancerDetails;
            enriched.freelancer_id_resolved = freelancerId;
            enriched.avg_rating = avgRating;
            enriched.ratings_count = ratingsCount;

            return enriched;
          })
        );

        setProposals(enrichedProposals);
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("خطا در بارگذاری اطلاعات پروژه. لطفا دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [id, userData]);

  const formatPrice = (value) => {
    if (value == null || value === "") return "—";
    if (typeof value === "number") {
      return value.toLocaleString("fa-IR") + " تومان";
    }
    const cleaned = String(value).replace(/[^\d.-]/g, "");
    const number = Number(cleaned);
    if (isNaN(number)) return String(value);
    return number.toLocaleString("fa-IR") + " تومان";
  };

  const getProposalPrice = (proposal) => {
    if (!proposal) return null;

    const priceFields = [
      "price", "bid", "bid_amount", "amount", "amount_paid",
      "proposed_amount", "proposal_price"
    ];

    for (const field of priceFields) {
      if (proposal[field] != null && proposal[field] !== "") {
        return proposal[field];
      }
    }

    if (proposal?.data?.price) return proposal.data.price;
    if (proposal?.data?.bid) return proposal.data.bid;
    if (proposal?.data?.amount) return proposal.data.amount;
    if (proposal?.amounts?.bid) return proposal.amounts.bid;
    if (proposal?.amounts?.amount) return proposal.amounts.amount;

    return null;
  };

  const displayProposalPrice = (proposal) => {
    const price = getProposalPrice(proposal);
    return formatPrice(price);
  };

  const displayFreelancerName = (proposal) => {
    const details = proposal?.freelancer_details;

    if (details) {
      const firstName = details.first_name || details.name || details.username || "";
      const lastName = details.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName) return fullName;
      if (details.username) return details.username;
      if (details.email) return details.email;
    }

    return (
      proposal?.freelancer_name ||
      proposal?.freelancer?.username ||
      proposal?.freelancer?.name ||
      (typeof proposal?.freelancer === "number" ? `فریلنسر #${proposal.freelancer}` : proposal?.freelancer) ||
      "فریلنسر"
    );
  };

  const selectAvatar = (freelancerDetails) => {
    if (!freelancerDetails) return null;

    if (typeof freelancerDetails === "string") {
      return freelancerDetails;
    }

    if (typeof freelancerDetails === "object") {
      if (freelancerDetails.avatar) {
        if (typeof freelancerDetails.avatar === "string") {
          return freelancerDetails.avatar;
        } else if (freelancerDetails.avatar && typeof freelancerDetails.avatar.url === "string") {
          return freelancerDetails.avatar.url;
        }
      }

      if (freelancerDetails.avatar_url) return freelancerDetails.avatar_url;
      if (freelancerDetails.photo) return freelancerDetails.photo;
      if (freelancerDetails.photo_url) return freelancerDetails.photo_url;
      if (freelancerDetails.profile_picture) return freelancerDetails.profile_picture;
    }

    return null;
  };

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این پیشنهاد را قبول کنید؟")) {
      return;
    }

    setError(null);
    setSuccess(null);
    setActionLoading(prev => ({ ...prev, [proposalId]: true }));

    try {
      const res = await api.post(`/market/proposals/${proposalId}/hire/`);

      setProposals(prev => prev.map(proposal =>
        proposal.id === proposalId
          ? { ...proposal, status: "accepted" }
          : proposal
      ));

      const acceptedProposal = proposals.find(p => p.id === proposalId);
      if (acceptedProposal) {
        setProject(prev => ({
          ...prev,
          status: "in_progress",
          hired_freelancer: acceptedProposal.freelancer_details || prev.hired_freelancer
        }));
      }

      setSuccess("پیشنهاد با موفقیت قبول شد! فریلنسر استخدام شد.");
    } catch (err) {
      console.error("Hire error:", err);
      const errorData = err?.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || "خطا در قبول پیشنهاد";

      if (err.response?.status === 403) {
        setError("شما دسترسی لازم برای قبول این پیشنهاد را ندارید. فقط کارفرمای پروژه می‌تواند پیشنهادها را قبول کند.");
      } else if (err.response?.status === 401) {
        setError("لطفاً ابتدا وارد حساب کاربری خود شوید.");
        navigate('/login');
      } else {
        setError(errorMessage);
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const handleNavigateToMessages = (proposal) => {
    let freelancerId = null;

    if (proposal.freelancer && typeof proposal.freelancer === "object") {
      freelancerId = proposal.freelancer.id || proposal.freelancer.pk ||
        proposal.freelancer.user_id || proposal.freelancer.user;
    } else if (typeof proposal.freelancer === "number") {
      freelancerId = proposal.freelancer;
    } else if (typeof proposal.freelancer === "string") {
      const match = proposal.freelancer.match(/\d+/);
      freelancerId = match ? Number(match[0]) : null;
    }

    if (!freelancerId) {
      freelancerId = proposal.freelancer_id || proposal.user_id || proposal.freelancerId;
    }

    if (!freelancerId && proposal.freelancer_details) {
      freelancerId = proposal.freelancer_details.id || proposal.freelancer_details.pk;
    }

    navigate(`/dashboard/messages?${freelancerId ? `user=${freelancerId}&` : ""}project=${project?.id}`);
  };

  const handleSubmitProposal = async () => {
    if (userRole !== 'freelancer') {
      setError("فقط فریلنسرها می‌توانند پیشنهاد ارسال کنند.");
      return;
    }

    if (hasApplied) return;

    if (project?.status && project.status !== "open") {
      setError("این پروژه در وضعیت فعلی قابل پیشنهاددهی نیست.");
      return;
    }

    if (!form.cover_letter.trim() || !form.bid.trim()) {
      setError("لطفاً نامه معرفی و مبلغ پیشنهادی را وارد کنید.");
      return;
    }

    const bidAmount = Number(String(form.bid).replace(/[^\d]/g, ""));
    if (isNaN(bidAmount) || bidAmount <= 0) {
      setError("لطفاً مبلغ پیشنهادی معتبر وارد کنید.");
      return;
    }

    try {
      setApplyLoading(true);
      setError(null);
      const payload = {
        project: project.id,
        cover_letter: form.cover_letter.trim(),
        bid: bidAmount,
        freelancer: userData?.id
      };

      console.log("Sending proposal:", payload);

      const response = await api.post(`/market/proposals/`, payload);

      if (response.status === 201 || response.data?.id) {
        setHasApplied(true);
        setShowApplyForm(false);
        setForm({ cover_letter: "", bid: "" });

        const proposalsRes = await api.get(`/market/projects/${id}/proposals/`);
        const proposalsData = Array.isArray(proposalsRes.data)
          ? proposalsRes.data
          : (proposalsRes.data?.results || proposalsRes.data || []);

        setProposals(proposalsData);
        setSuccess("پیشنهاد شما با موفقیت ارسال شد!");
      }
    } catch (err) {
      console.error("Proposal submission error:", err);
      const errorData = err?.response?.data;

      let errorMessage = "خطا در ارسال پیشنهاد";
      if (errorData) {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          const firstErrorKey = Object.keys(errorData)[0];
          if (firstErrorKey) {
            errorMessage = `${firstErrorKey}: ${Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : errorData[firstErrorKey]}`;
          }
        }
      }

      setError(errorMessage);
    } finally {
      setApplyLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const baseStyle = { ...styles.statusBadge };

    switch (status) {
      case "open":
        return (
          <div style={{ ...baseStyle, ...styles.statusOpen }}>
            <div style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#34d399",
              animation: "pulse 2s infinite"
            }}></div>
            باز
          </div>
        );
      case "in_progress":
        return (
          <div style={{ ...baseStyle, ...styles.statusProgress }}>
            <Clock size={12} />
            در حال انجام
          </div>
        );
      case "completed":
        return (
          <div style={{ ...baseStyle, ...styles.statusCompleted }}>
            <CheckCircle size={12} />
            تکمیل شده
          </div>
        );
      default:
        return (
          <div style={{ ...baseStyle, ...styles.statusCompleted }}>
            وضعیت نامشخص
          </div>
        );
    }
  };

  const renderStars = (rating, count) => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            style={{
              color: star <= Math.round(rating) ? "#fbbf24" : "#475569",
              fill: star <= Math.round(rating) ? "#fbbf24" : "none"
            }}
          />
        ))}
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#e2e8f0", marginRight: "2px" }}>
          {rating.toFixed(1)}
        </span>
        <span style={{ fontSize: "10px", color: "#94a3b8" }}>
          ({count})
        </span>
      </div>
    );
  };

  const renderRoleBadge = () => {
    const baseStyle = { ...styles.roleBadge };

    if (isProjectOwner) {
      return (
        <div style={{ ...baseStyle, ...styles.projectOwnerBadge }}>
          <Shield size={12} />
          کارفرمای پروژه
        </div>
      );
    } else if (userRole === 'freelancer') {
      return (
        <div style={{ ...baseStyle, ...styles.freelancerBadge }}>
          <User size={12} />
          فریلنسر
        </div>
      );
    } else if (userRole === 'employer') {
      return (
        <div style={{ ...baseStyle, ...styles.employerBadge }}>
          <Building size={12} />
          کارفرما
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div style={{
            position: "relative",
            width: "50px",
            height: "50px"
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              border: "3px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "50%"
            }}></div>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "3px solid transparent",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <Briefcase
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#3b82f6"
              }}
              size={20}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f1f5f9", marginBottom: "5px" }}>
              در حال بارگذاری پروژه...
            </h3>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              لطفا چند لحظه صبر کنید
            </p>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.pageContainer}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
          padding: "12px"
        }}>
          <div style={{
            fontSize: "50px",
            marginBottom: "10px"
          }}>
            😕
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#f1f5f9", marginBottom: "8px" }}>
              پروژه یافت نشد
            </h1>
            <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "400px", marginBottom: "24px" }}>
              ممکن است پروژه حذف شده یا آدرس اشتباه باشد.
            </p>
            <button
              onClick={() => navigate("/market")}
              style={{
                ...styles.primaryButton,
                padding: "8px 20px"
              }}
            >
              <ChevronLeft size={16} />
              بازگشت به بازار کار
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 6px rgba(37, 99, 235, 0.5); }
          50% { box-shadow: 0 0 12px rgba(37, 99, 235, 0.8); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          overflow: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 5px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 2.5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>

      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userData={userData}
        navigate={navigate}
      />

      <div style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(90deg, #1d4ed8 0%, #7c3aed 50%, #db2777 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 6s ease infinite",
        borderRadius: "0 0 20px 20px",
        marginBottom: "20px"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(45deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)"
        }}></div>

        <div style={styles.container}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#ffffff",
                padding: "6px 10px",
                borderRadius: "8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              <ChevronLeft size={14} />
              بازگشت
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={styles.hamburgerButton}
                onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
              >
                {sidebarOpen ? <XIcon size={18} /> : <Menu size={18} />}
              </button>

              <button
                onClick={() => navigate("/dashboard/messages")}
                style={{
                  ...styles.hamburgerButton,
                  padding: "6px 10px"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
              >
                <MessageSquare size={16} />
              </button>

              <button
                onClick={() => navigate("/market")}
                style={{
                  ...styles.hamburgerButton,
                  padding: "6px 10px"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>

          {/* Project Header */}
          {/* <div style={{ margin: "8px 0 16px" }}>
            <div style={styles.filterCard}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/dashboard" style={styles.sidebarLink}><span>🏠</span> داشبورد</Link>
                <Link to="/dashboard/projects" style={{ ...styles.sidebarLink, background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}><span>📁</span> پروژه‌ها</Link>
                <Link to="/dashboard/proposals" style={styles.sidebarLink}><span>📄</span> پروپوزال‌ها</Link>
                <Link to="/dashboard/messages" style={styles.sidebarLink}><span>💬</span> پیام‌ها</Link>
                <Link to="/profile" style={styles.sidebarLink}><span>⚙️</span> حساب</Link>
              </div>
            </div>
          </div> */}
          <div style={{
            padding: "16px 0",
            position: "relative",
            zIndex: 1
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  {renderStatusBadge(project.status)}

                  {userData && renderRoleBadge()}

                  {project.hired_freelancer && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(255, 255, 255, 0.1)",
                      padding: "5px 10px",
                      borderRadius: "10px",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}>
                      <User size={12} color="#e2e8f0" />
                      <span style={{
                        fontSize: "12px",
                        color: "#e2e8f0",
                        fontWeight: "500"
                      }}>
                        مجری: {project.hired_freelancer?.username || project.hired_freelancer?.email || "انتخاب شده"}
                      </span>
                    </div>
                  )}

                  {hasApplied && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(5, 150, 105, 0.2)",
                      padding: "5px 10px",
                      borderRadius: "10px",
                      border: "1px solid rgba(5, 150, 105, 0.3)"
                    }}>
                      <Award size={12} color="#34d399" />
                      <span style={{
                        fontSize: "12px",
                        color: "#34d399",
                        fontWeight: "500"
                      }}>
                        شما پیشنهاد داده‌اید
                      </span>
                    </div>
                  )}
                </div>

                <h1 style={{
                  ...styles.heading1,
                  fontSize: "28px",
                  color: "#ffffff",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
                }}>
                  {project.title}
                </h1>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxWidth: "800px"
              }}>
                {error && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(220, 38, 38, 0.2)",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    animation: "shake 0.5s ease-in-out"
                  }}>
                    <div style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      animation: "pulse 2s infinite"
                    }}></div>
                    <span style={{
                      fontSize: "12px",
                      color: "#fca5a5",
                      fontWeight: "500"
                    }}>
                      {error}
                    </span>
                  </div>
                )}

                {success && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(5, 150, 105, 0.2)",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(5, 150, 105, 0.3)",
                    animation: "fadeIn 0.5s ease-out"
                  }}>
                    <div style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      backgroundColor: "#34d399",
                      animation: "pulse 2s infinite"
                    }}></div>
                    <span style={{
                      fontSize: "12px",
                      color: "#34d399",
                      fontWeight: "500"
                    }}>
                      {success}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "20px"
          }}>
            <div style={{
              ...styles.card,
              animation: "fadeIn 0.6s ease-out 0.1s both"
            }}>
              <div style={styles.cardContent}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <DollarSign size={18} color="#ffffff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      ...styles.heading3,
                      marginBottom: "3px"
                    }}>
                      بودجه پروژه
                    </h3>
                    <p style={styles.caption}>
                      محدوده پیشنهادی برای انجام پروژه
                    </p>
                  </div>
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "900",
                  color: "#10b981",
                  marginBottom: "5px"
                }}>
                  {project.budget_min?.toLocaleString("fa-IR")} - {project.budget_max?.toLocaleString("fa-IR")} تومان
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <div style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981"
                  }}></div>
                  قابل مذاکره
                </div>
              </div>
            </div>

            <div style={{
              ...styles.card,
              animation: "fadeIn 0.6s ease-out 0.2s both"
            }}>
              <div style={styles.cardContent}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Tag size={18} color="#ffffff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      ...styles.heading3,
                      marginBottom: "3px"
                    }}>
                      دسته‌بندی
                    </h3>
                    <p style={styles.caption}>
                      حوزه تخصصی مورد نیاز
                    </p>
                  </div>
                </div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#8b5cf6",
                  marginBottom: "5px"
                }}>
                  {project.category || "عمومی"}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "#94a3b8"
                }}>
                  مهارت و تخصص مورد نیاز برای این پروژه
                </div>
              </div>
            </div>

            <div style={{
              ...styles.card,
              animation: "fadeIn 0.6s ease-out 0.3s both"
            }}>
              <div style={styles.cardContent}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <MessageSquare size={18} color="#ffffff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      ...styles.heading3,
                      marginBottom: "3px"
                    }}>
                      پیشنهادها
                    </h3>
                    <p style={styles.caption}>
                      تعداد پیشنهادهای دریافتی
                    </p>
                  </div>
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "900",
                  color: "#f97316",
                  marginBottom: "5px"
                }}>
                  {proposals.length}
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <div style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#f97316",
                    animation: proposals.length > 0 ? "pulse 2s infinite" : "none"
                  }}></div>
                  {proposals.length > 0 ? "پیشنهاد جدید موجود" : "در انتظار اولین پیشنهاد"}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            ...styles.card,
            animation: "fadeIn 0.6s ease-out 0.4s both",
            marginBottom: "20px"
          }}>
            <div style={styles.cardHeader}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <FileText size={18} color="#ffffff" />
                </div>
                <div>
                  <h2 style={styles.heading2}>
                    شرح پروژه
                  </h2>
                  <p style={{
                    ...styles.caption,
                    fontSize: "13px",
                    color: "#cbd5e1"
                  }}>
                    توضیحات کامل و جزئیات پروژه
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.cardContent}>
              <div style={{
                ...styles.bodyText,
                fontSize: "13px",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
                marginBottom: "20px"
              }}>
                {project.description}
              </div>

              {clientInfo && (
                <div style={{
                  background: "linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "16px",
                  border: "1px solid rgba(139, 92, 246, 0.1)"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Building size={16} color="#ffffff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        ...styles.heading3,
                        marginBottom: "3px"
                      }}>
                        کارفرمای پروژه
                      </h3>
                      <p style={{
                        ...styles.bodyText,
                        fontSize: "13px",
                        marginBottom: "5px"
                      }}>
                        {clientInfo.first_name && clientInfo.last_name
                          ? `${clientInfo.first_name} ${clientInfo.last_name}`
                          : clientInfo.username || clientInfo.email}
                      </p>
                      {isProjectOwner && (
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "rgba(5, 150, 105, 0.1)",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          border: "1px solid rgba(5, 150, 105, 0.2)"
                        }}>
                          <Sparkles size={10} color="#34d399" />
                          <span style={{
                            fontSize: "10px",
                            color: "#34d399",
                            fontWeight: "500"
                          }}>
                            شما کارفرمای این پروژه هستید
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                padding: "16px",
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(37, 99, 235, 0.1)"
              }}>
                {project.status !== "open" ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <MessageSquare size={16} color="#94a3b8" />
                    <span style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      fontWeight: "500"
                    }}>
                      {project.status === "in_progress"
                        ? "این پروژه در حال اجرا است و ارسال پیشنهاد غیرفعال می‌باشد."
                        : project.status === "completed"
                          ? "این پروژه تکمیل شده و ارسال پیشنهاد بسته شده است."
                          : "ارسال پیشنهاد در این وضعیت امکان‌پذیر نیست."}
                    </span>
                  </div>
                ) : !userData ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}>
                    <div>
                      <h3 style={{
                        ...styles.heading3,
                        marginBottom: "5px"
                      }}>
                        برای ارسال پیشنهاد وارد شوید
                      </h3>
                      <p style={styles.caption}>
                        لطفاً برای ارسال پیشنهاد ابتدا وارد حساب کاربری خود شوید.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      style={styles.primaryButton}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 16px rgba(37, 99, 235, 0.3)";
                      }}
                    >
                      <User size={16} />
                      ورود به حساب کاربری
                    </button>
                  </div>
                ) : userRole !== 'freelancer' ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(100, 116, 139, 0.1)",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(100, 116, 139, 0.2)"
                  }}>
                    <Award size={16} color="#94a3b8" />
                    <span style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      fontWeight: "500"
                    }}>
                      فقط فریلنسرها می‌توانند برای پروژه‌ها پیشنهاد ارسال کنند.
                    </span>
                  </div>
                ) : !hasApplied ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "12px"
                  }}>
                    <div>
                      <h3 style={{
                        ...styles.heading3,
                        marginBottom: "5px"
                      }}>
                        آماده ارسال پیشنهاد هستید؟
                      </h3>
                      <p style={styles.caption}>
                        پیشنهاد خود را با قیمت و توضیحات مناسب ارسال کنید.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowApplyForm(true)}
                      style={styles.primaryButton}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 16px rgba(37, 99, 235, 0.3)";
                      }}
                    >
                      <MessageSquare size={16} />
                      ارسال پیشنهاد
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(5, 150, 105, 0.1)",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(5, 150, 105, 0.2)"
                  }}>
                    <Award size={16} color="#34d399" />
                    <span style={{
                      fontSize: "13px",
                      color: "#34d399",
                      fontWeight: "500"
                    }}>
                      شما قبلاً برای این پروژه پیشنهاد ارسال کرده‌اید.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            ...styles.card,
            animation: "fadeIn 0.6s ease-out 0.5s both"
          }}>
            <div style={styles.cardHeader}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <MessageSquare size={18} color="#ffffff" />
                  </div>
                  <div>
                    <h2 style={styles.heading2}>
                      پیشنهادهای ارسال شده
                    </h2>
                    <p style={{
                      ...styles.caption,
                      fontSize: "13px",
                      color: "#cbd5e1"
                    }}>
                      {proposals.length > 0
                        ? `${proposals.length} پیشنهاد ثبت شده`
                        : "در انتظار اولین پیشنهاد"}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <div style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981"
                    }}></div>
                    <span style={{
                      fontSize: "11px",
                      color: "#94a3b8"
                    }}>
                      قبول شده
                    </span>
                  </div>
                  {isProjectOwner && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(5, 150, 105, 0.1)",
                      padding: "5px 8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(5, 150, 105, 0.2)"
                    }}>
                      <Shield size={10} color="#34d399" />
                      <span style={{
                        fontSize: "10px",
                        color: "#34d399",
                        fontWeight: "500"
                      }}>
                        شما می‌توانید پیشنهادها را قبول کنید
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.cardContent}>
              {proposals.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "28px 12px"
                }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 16px",
                    borderRadius: "16px",
                    background: "rgba(30, 41, 59, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(100, 116, 139, 0.2)"
                  }}>
                    <MessageSquare size={32} color="#475569" />
                  </div>
                  <h3 style={{
                    ...styles.heading3,
                    fontSize: "18px",
                    marginBottom: "8px"
                  }}>
                    هنوز پیشنهادی ثبت نشده
                  </h3>
                  <p style={{
                    ...styles.bodyText,
                    maxWidth: "400px",
                    margin: "0 auto 20px",
                    color: "#94a3b8"
                  }}>
                    اولین نفری باشید که برای این پروژه پیشنهاد می‌دهد
                  </p>
                  {project.status === "open" && userRole === 'freelancer' && !hasApplied && (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      style={{
                        ...styles.primaryButton,
                        padding: "10px 20px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 16px rgba(37, 99, 235, 0.3)";
                      }}
                    >
                      <MessageSquare size={16} />
                      ارسال اولین پیشنهاد
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {proposals.map((proposal, index) => {
                    const isAccepted = proposal.status === "accepted";
                    const isRejected = proposal.status === "rejected";
                    const isLoading = actionLoading[proposal.id];
                    const avatarSrc = selectAvatar(proposal.freelancer_details);
                    const cardId = `proposal-${proposal.id || index}`;

                    return (
                      <div
                        key={proposal.id || index}
                        style={{
                          ...styles.proposalCard,
                          borderColor: isAccepted
                            ? "rgba(5, 150, 105, 0.3)"
                            : isRejected
                              ? "rgba(220, 38, 38, 0.3)"
                              : "rgba(100, 116, 139, 0.2)",
                          animation: `fadeIn 0.5s ease-out ${0.1 * index}s both`,
                          transform: isHovered[cardId] ? "translateY(-2px)" : "translateY(0)",
                          transition: "all 0.3s ease",
                          boxShadow: isHovered[cardId]
                            ? "0 12px 24px rgba(0, 0, 0, 0.3)"
                            : "0 6px 12px rgba(0, 0, 0, 0.2)"
                        }}
                        onMouseEnter={() => setIsHovered(prev => ({ ...prev, [cardId]: true }))}
                        onMouseLeave={() => setIsHovered(prev => ({ ...prev, [cardId]: false }))}
                      >
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          marginBottom: "16px"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "12px"
                          }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              flex: 1
                            }}>
                              <div style={{
                                ...styles.avatar,
                                position: "relative"
                              }}>
                                {avatarSrc ? (
                                  <img
                                    src={avatarSrc}
                                    alt={displayFreelancerName(proposal)}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover"
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = placeholderSvg;
                                    }}
                                  />
                                ) : (
                                  <User size={16} color="#ffffff" />
                                )}
                                {isAccepted && (
                                  <div style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    width: "16px",
                                    height: "16px",
                                    background: "#10b981",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid #1e293b"
                                  }}>
                                    <CheckCircle size={8} color="#ffffff" />
                                  </div>
                                )}
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px"
                                }}>
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "8px"
                                  }}>
                                    <h3 style={{
                                      ...styles.heading3,
                                      marginBottom: "0",
                                      fontSize: "15px"
                                    }}>
                                      {displayFreelancerName(proposal)}
                                    </h3>
                                    {proposal.avg_rating > 0 && renderStars(proposal.avg_rating, proposal.ratings_count)}
                                  </div>
                                  <div style={{
                                    fontSize: "12px",
                                    color: "#94a3b8"
                                  }}>
                                    فریلنسر حرفه‌ای • {proposal.ratings_count || 0} پروژه انجام شده
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div style={styles.priceBadge}>
                              <DollarSign size={16} color="#34d399" />
                              <div style={{ textAlign: "right" }}>
                                <div style={{
                                  fontSize: "16px",
                                  fontWeight: "900",
                                  color: "#ffffff",
                                  lineHeight: "1.2"
                                }}>
                                  {displayProposalPrice(proposal)}
                                </div>
                                <div style={{
                                  fontSize: "10px",
                                  color: "#34d399",
                                  marginTop: "2px"
                                }}>
                                  مبلغ پیشنهادی
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          background: "rgba(15, 23, 42, 0.5)",
                          borderRadius: "10px",
                          padding: "12px",
                          marginBottom: "16px",
                          border: "1px solid rgba(100, 116, 139, 0.1)",
                          maxHeight: "120px",
                          overflowY: "auto"
                        }}>
                          <div style={{
                            display: "flex",
                            gap: "8px"
                          }}>
                            <MessageSquare size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#e2e8f0",
                                marginBottom: "4px"
                              }}>
                                نامه معرفی
                              </h4>
                              <p style={{
                                ...styles.bodyText,
                                color: "#cbd5e1",
                                lineHeight: "1.5",
                                fontSize: "12px"
                              }}>
                                {proposal.message || proposal.cover_letter || proposal.text || "بدون توضیحات"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: "flex",
                          gap: "8px",
                          flexDirection: "row", 
                          flexWrap: "wrap"
                        }}>
                          {isProjectOwner && project.status === "open" && !isAccepted && !isRejected ? (
                            <button
                              onClick={() => handleAcceptProposal(proposal.id)}
                              disabled={isLoading}
                              style={{
                                ...styles.primaryButton,
                                flex: 1,
                                minWidth: "140px",
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                padding: "10px",
                                animation: isProjectOwner ? "glow 2s infinite" : "none"
                              }}
                              onMouseEnter={(e) => {
                                if (!isLoading) {
                                  e.target.style.transform = "translateY(-2px)";
                                  e.target.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.4)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isLoading) {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "0 4px 16px rgba(37, 99, 235, 0.3)";
                                }
                              }}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                                  در حال انجام...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={14} />
                                  قبول پیشنهاد و استخدام فریلنسر
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              style={{
                                ...styles.secondaryButton,
                                flex: 1,
                                minWidth: "140px",
                                padding: "10px",
                                opacity: 0.7,
                                cursor: "not-allowed",
                                fontSize: "12px"
                              }}
                            >
                              {isAccepted
                                ? "✅ پیشنهاد قبول شده"
                                : isRejected
                                  ? "❌ پیشنهاد رد شده"
                                  : project.status === "in_progress"
                                    ? "⏳ پروژه در حال انجام است"
                                    : project.status === "completed"
                                      ? "✅ پروژه تکمیل شده"
                                      : !isProjectOwner
                                        ? "👑 فقط کارفرمای پروژه می‌تواند قبول کند"
                                        : "غیرفعال"}
                            </button>
                          )}

                          <button
                            onClick={() => handleNavigateToMessages(proposal)}
                            style={{
                              ...styles.secondaryButton,
                              flex: 1,
                              minWidth: "120px",
                              padding: "10px"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "rgba(100, 116, 139, 0.3)";
                              e.target.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "rgba(71, 85, 105, 0.3)";
                              e.target.style.transform = "translateY(0)";
                            }}
                          >
                            <MessageSquare size={14} />
                            ارسال پیام
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApplyForm && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalContent,
              animation: "fadeIn 0.3s ease-out"
            }}
          >
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <MessageSquare size={18} color="#ffffff" />
                </div>
                <div>
                  <h2 style={{
                    ...styles.heading2,
                    fontSize: "18px",
                    marginBottom: "3px"
                  }}>
                    ارسال پیشنهاد
                  </h2>
                  <p style={{
                    ...styles.caption,
                    fontSize: "12px"
                  }}>
                    برای پروژه "{project.title}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowApplyForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.background = "rgba(100, 116, 139, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#94a3b8";
                  e.target.style.background = "none";
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              padding: "20px"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#e2e8f0",
                    marginBottom: "8px"
                  }}>
                    نامه معرفی
                    <span style={{ color: "#ef4444", marginRight: "3px" }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.cover_letter}
                    onChange={(e) => setForm(prev => ({ ...prev, cover_letter: e.target.value }))}
                    placeholder="در مورد مهارت‌ها و تجربیات مرتبط خود بنویسید..."
                    style={styles.textarea}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(100, 116, 139, 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <div style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginTop: "5px",
                    display: "flex",
                    justifyContent: "space-between"
                  }}>
                    <span>حداقل 100 کاراکتر توصیه می‌شود</span>
                    <span>{form.cover_letter.length} / 100</span>
                  </div>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#e2e8f0",
                    marginBottom: "8px"
                  }}>
                    مبلغ پیشنهادی (تومان)
                    <span style={{ color: "#ef4444", marginRight: "3px" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={form.bid}
                      onChange={(e) => setForm(prev => ({ ...prev, bid: e.target.value }))}
                      placeholder="مثال: 5000000"
                      style={{
                        ...styles.input,
                        paddingRight: "70px"
                      }}
                      onFocus={(e) => {
                        e.target.style.border = "1px solid rgba(59, 130, 246, 0.5)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.border = "1px solid rgba(100, 116, 139, 0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <div style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "12px",
                      color: "#94a3b8"
                    }}>
                      تومان
                    </div>
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginTop: "5px"
                  }}>
                    بودجه پیشنهادی پروژه: {project.budget_min?.toLocaleString("fa-IR")} - {project.budget_max?.toLocaleString("fa-IR")} تومان
                  </div>
                </div>

                {userData && (
                  <div style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid rgba(59, 130, 246, 0.2)"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <User size={14} color="#93c5fd" />
                      <div>
                        <div style={{
                          fontSize: "12px",
                          color: "#93c5fd",
                          marginBottom: "2px"
                        }}>
                          در حال ارسال پیشنهاد به عنوان:
                        </div>
                        <div style={{
                          fontSize: "13px",
                          color: "#e2e8f0",
                          fontWeight: "500"
                        }}>
                          {userData.first_name && userData.last_name
                            ? `${userData.first_name} ${userData.last_name}`
                            : userData.username || userData.email}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{
                    background: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    padding: "10px",
                    borderRadius: "8px",
                    animation: "shake 0.5s ease-in-out"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <div style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: "#ef4444"
                      }}></div>
                      <span style={{
                        fontSize: "12px",
                        color: "#fca5a5"
                      }}>
                        {error}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "5px",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(100, 116, 139, 0.2)"
                }}>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    style={{
                      ...styles.secondaryButton,
                      padding: "8px 16px"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(100, 116, 139, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(71, 85, 105, 0.3)";
                    }}
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSubmitProposal}
                    disabled={applyLoading}
                    style={{
                      ...styles.primaryButton,
                      padding: "8px 20px",
                      opacity: applyLoading ? 0.7 : 1,
                      cursor: applyLoading ? "not-allowed" : "pointer"
                    }}
                    onMouseEnter={(e) => {
                      if (!applyLoading) {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!applyLoading) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 4px 16px rgba(37, 99, 235, 0.3)";
                      }
                    }}
                  >
                    {applyLoading ? (
                      <>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        ارسال پیشنهاد
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}