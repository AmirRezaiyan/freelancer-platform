import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ChatBox from "../components/ChatBox";
import { AuthContext } from "../context/AuthContext";
import { Star, User, Shield, Building, Sparkles, CheckCircle, Award } from "lucide-react";

const styles = {
  userBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(59, 130, 246, 0.1)",
    padding: "6px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    fontSize: "12px",
    fontWeight: "500"
  },
  
  ratingStars: {
    display: "flex",
    alignItems: "center",
    gap: "2px"
  },
  
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  
  statusOpen: {
    background: "rgba(5, 150, 105, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(5, 150, 105, 0.3)"
  },
  
  statusProgress: {
    background: "rgba(249, 115, 22, 0.15)",
    color: "#fb923c",
    border: "1px solid rgba(249, 115, 22, 0.3)"
  },
  
  statusCompleted: {
    background: "rgba(71, 85, 105, 0.15)",
    color: "#cbd5e1",
    border: "1px solid rgba(100, 116, 139, 0.3)"
  },
  
  roleBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
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
  }
};

const renderStars = (rating, count) => {
  if (!rating || rating === 0) return null;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", marginRight: "6px" }}>
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
      <span style={{ fontSize: "11px", color: "#e2e8f0", marginRight: "2px" }}>
        {rating.toFixed(1)}
      </span>
      {count > 0 && (
        <span style={{ fontSize: "10px", color: "#94a3b8" }}>
          ({count})
        </span>
      )}
    </div>
  );
};

const renderStatusBadge = (status) => {
  const baseStyle = { ...styles.statusBadge };
  
  switch (status) {
    case "open":
      return (
        <div style={{ ...baseStyle, ...styles.statusOpen }}>
          <div style={{
            width: "6px",
            height: "6px",
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
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#fb923c"
          }}></div>
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
          {status || "وضعیت"}
        </div>
      );
  }
};

const renderRoleBadge = (role, isProjectOwner = false) => {
  const baseStyle = { ...styles.roleBadge };
  
  if (isProjectOwner) {
    return (
      <div style={{ ...baseStyle, ...styles.projectOwnerBadge }}>
        <Shield size={10} />
        کارفرما
      </div>
    );
  } else if (role === 'freelancer') {
    return (
      <div style={{ ...baseStyle, ...styles.freelancerBadge }}>
        <User size={10} />
        فریلنسر
      </div>
    );
  } else if (role === 'employer') {
    return (
      <div style={{ ...baseStyle, ...styles.employerBadge }}>
        <Building size={10} />
        کارفرما
      </div>
    );
  }
  
  return null;
};

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: rawUser } = useContext(AuthContext);
  const user = rawUser?.user ?? rawUser ?? null;
  const userId = user?.id ?? user?.pk ?? null;
  const userType = user?.user_type ?? user?.type ?? null;

  const queryProject = useMemo(() => {
    const v = searchParams.get("project");
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  const [conversations, setConversations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(queryProject);
  const [error, setError] = useState(null);
  const [userRatings, setUserRatings] = useState({}); 

  useEffect(() => {
    if (queryProject) setSelectedProjectId(queryProject);
  }, [queryProject]);

  const fetchUserInfoAndRating = useCallback(async (userId) => {
    if (!userId) return null;
    
    if (userRatings[userId]) {
      return userRatings[userId];
    }
    
    try {
      let userInfo = null;
      let avgRating = 0;
      let ratingsCount = 0;
      
      try {
        const userRes = await api.get(`/users/${userId}/`);
        userInfo = userRes.data;
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
      
      try {
        const ratingsRes = await api.get(`/market/users/${userId}/ratings/`);
        const ratingsData = Array.isArray(ratingsRes.data) 
          ? ratingsRes.data 
          : (ratingsRes.data?.results || ratingsRes.data || []);
        
        if (ratingsData.length > 0) {
          const sum = ratingsData.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
          ratingsCount = ratingsData.length;
          avgRating = +(sum / ratingsCount).toFixed(1);
        }
      } catch (err) {
        try {
          const altRes = await api.get(`/market/ratings/?user_to=${userId}`);
          const altData = Array.isArray(altRes.data) 
            ? altRes.data 
            : (altRes.data?.results || altRes.data || []);
          
          if (altData.length > 0) {
            const sum = altData.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
            ratingsCount = altData.length;
            avgRating = +(sum / ratingsCount).toFixed(1);
          }
        } catch (err2) {
          console.error("Error fetching ratings:", err2);
        }
      }
      
      const result = {
        userInfo,
        rating: avgRating,
        ratingsCount
      };
      
      // ذخیره در کش
      setUserRatings(prev => ({
        ...prev,
        [userId]: result
      }));
      
      return result;
    } catch (err) {
      console.error("Error in fetchUserInfoAndRating:", err);
      return null;
    }
  }, [userRatings]);

  const resolveCounterpartyId = useCallback((project, currentUserType, currentUserId) => {
    if (currentUserType === "client") {
      if (project.hired_freelancer) {
        if (typeof project.hired_freelancer === "object") {
          return project.hired_freelancer.id || project.hired_freelancer.pk || null;
        }
        return project.hired_freelancer;
      }
      
      return null;
    } else {
      if (project.client) {
        if (typeof project.client === "object") {
          return project.client.id || project.client.pk || null;
        }
        return project.client;
      }
      
      if (project.client_id) {
        return project.client_id;
      }
      
      return null;
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let projectList = [];

      if (!userId) {
        setConversations([]);
        setLoading(false);
        return;
      }

      if (userType === "client") {
        const res = await api.get("/market/projects/");
        const all = Array.isArray(res.data) ? res.data : (res.data?.results || res.data || []);
        projectList = all.filter(p => {
          if (!p) return false;
          if (typeof p.client === "number") return Number(p.client) === Number(userId);
          if (typeof p.client === "object") return (p.client.id ?? p.client.pk) === userId;
          return false;
        });
      } else {
        const pr = await api.get("/market/proposals/mine/");
        const proposals = Array.isArray(pr.data) ? pr.data : (pr.data?.results || pr.data || []);
        const projectIds = Array.from(new Set(proposals.map(p => {
          if (!p) return null;
          if (typeof p.project === "number") return p.project;
          if (typeof p.project === "object") return (p.project.id ?? p.project.pk);
          if (p.projectId) return p.projectId;
          return null;
        }).filter(Boolean)));

        const projectsFetched = await Promise.allSettled(projectIds.map(pid => api.get(`/market/projects/${pid}/`)));
        projectList = projectsFetched
          .filter(r => r.status === "fulfilled" && r.value?.data)
          .map(r => r.value.data);
      }

      const convPromises = projectList.map(async (proj) => {
        try {
          const msgsRes = await api.get(`/market/projects/${proj.id}/user_messages/`);
          const msgs = Array.isArray(msgsRes.data) ? msgsRes.data : (msgsRes.data?.results || msgsRes.data || []);
          const last = msgs.length ? msgs[msgs.length - 1] : null;
          
          const counterpartyId = resolveCounterpartyId(proj, userType, userId);
          let counterpartyInfo = null;
          
          if (counterpartyId) {
            counterpartyInfo = await fetchUserInfoAndRating(counterpartyId);
          }
          
          return { 
            project: proj, 
            lastMessage: last,
            counterpartyInfo 
          };
        } catch (err) {
          console.error("Error loading conversation:", err);
          return { project: proj, lastMessage: null, counterpartyInfo: null };
        }
      });

      const convs = await Promise.allSettled(convPromises);
      const convItems = convs
        .filter(r => r.status === "fulfilled")
        .map(r => r.value)
        .filter(Boolean);

      convItems.sort((a, b) => {
        const ta = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : (a.project?.created_at ? new Date(a.project.created_at).getTime() : 0);
        const tb = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : (b.project?.created_at ? new Date(b.project.created_at).getTime() : 0);
        return tb - ta;
      });

      setConversations(convItems);
    } catch (err) {
      console.error("loadConversations error", err);
      setError("خطا در بارگذاری گفتگوها");
    } finally {
      setLoading(false);
    }
  }, [userId, userType, fetchUserInfoAndRating, resolveCounterpartyId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = (projId) => {
    setSelectedProjectId(projId);
    navigate(`/dashboard/messages?project=${projId}`, { replace: false });
  };

  const renderSnippet = (lastMessage) => {
    if (!lastMessage) return <span style={{ color: "#9ca3af" }}>تاکنون پیامی ثبت نشده است</span>;
    const text = lastMessage.message ?? lastMessage.content ?? lastMessage.text ?? "";
    const short = text.length > 80 ? text.slice(0, 78) + "…" : text;
    const time = lastMessage.created_at ? new Date(lastMessage.created_at).toLocaleString("fa-IR") : "";
    return (
      <div>
        <div style={{ color: "#cbd5e1", fontSize: 13 }}>{short}</div>
        <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 6 }}>{time}</div>
      </div>
    );
  };

  const renderCounterpartyInfo = (conversation) => {
    const { counterpartyInfo, project, lastMessage } = conversation;
    const proj = project;
    
    let counterpartyName = "";
    let counterpartyRole = "";
    
    if (userType === "client") {
      counterpartyRole = "freelancer";
      counterpartyName = proj.hired_freelancer_name || proj.freelancer_name || proj.freelancer || `فریلنسر #${proj.id}`;
    } else {
      counterpartyRole = "employer";
      if (proj.client) {
        if (typeof proj.client === "object") {
          counterpartyName = proj.client.username || proj.client.name || `کارفرما #${proj.client.id}`;
        } else {
          counterpartyName = `کارفرما #${proj.client}`;
        }
      } else {
        counterpartyName = `کارفرما #${proj.id}`;
      }
    }
    
    if (counterpartyInfo?.userInfo) {
      const user = counterpartyInfo.userInfo;
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      counterpartyName = fullName || user.username || user.email || counterpartyName;
    }
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            <div style={{ 
              fontWeight: 700, 
              fontSize: 14, 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap",
              color: "#e5e7eb"
            }}>
              {proj.title || counterpartyName}
            </div>
            
            {renderRoleBadge(counterpartyRole)}
            
            {renderStatusBadge(proj.status)}
          </div>
          
          <div style={{ 
            color: "#9ca3af", 
            fontSize: 10, 
            flexShrink: 0,
            fontWeight: 500
          }}>
            { lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleTimeString("fa-IR", {hour: '2-digit', minute: '2-digit'}) : "" }
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <User size={12} color="#94a3b8" />
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {counterpartyName}
            </span>
          </div>
          
          {counterpartyInfo?.rating && counterpartyInfo.rating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {renderStars(counterpartyInfo.rating, counterpartyInfo.ratingsCount)}
            </div>
          )}
          
          {proj.hired_freelancer && userType === "client" && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Award size={12} color="#34d399" />
              <span style={{ fontSize: "11px", color: "#34d399" }}>مجری پروژه</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ color: "#fff", display: "flex", gap: 20, padding: 16, height: "calc(100vh - 100px)" }}>
      <aside style={{ 
        width: 400, 
        minWidth: 320, 
        height: "100%",
        overflowY: "auto", 
        background: "#071029", 
        borderRadius: 12, 
        padding: 12, 
        border: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: 12,
          padding: "8px 0",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>پیام‌ها</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              onClick={() => loadConversations()} 
              style={{ 
                background: "transparent", 
                border: "1px solid rgba(255,255,255,0.08)", 
                color: "#9ca3af", 
                padding: "8px 12px", 
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s",
                fontSize: 16,
                fontWeight: "bold"
              }}
              title="بازنشانی"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              ⟳
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ 
            color: "#9ca3af", 
            padding: 20,
            textAlign: "center",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div>
              <div style={{ fontSize: 14, marginBottom: 8 }}>در حال بارگذاری گفتگوها...</div>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: "3px solid rgba(255,255,255,0.1)",
                borderTop: "3px solid #3b82f6",
                borderRadius: "50%",
                margin: "0 auto",
                animation: "spin 1s linear infinite"
              }}></div>
            </div>
          </div>
        ) : error ? (
          <div style={{ 
            color: "#fca5a5", 
            padding: 20,
            textAlign: "center",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: 8,
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ 
            color: "#9ca3af", 
            padding: 20,
            textAlign: "center",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>💬</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                هنوز گفتگویی وجود ندارد.<br/>
                برای شروع گفتگو به صفحه پروژه مراجعه کنید<br/>
                و روی «ارسال پیام» کلیک کنید.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: 8,
            flex: 1,
            overflowY: "auto"
          }}>
            {conversations.map((c) => {
              const proj = c.project;
              const isActive = selectedProjectId && Number(selectedProjectId) === Number(proj.id);
              
              return (
                <div
                  key={proj.id}
                  onClick={() => openConversation(proj.id)}
                  style={{
                    cursor: "pointer",
                    padding: 16,
                    borderRadius: 12,
                    background: isActive ? "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))" : "transparent",
                    border: isActive ? "1px solid rgba(96,165,250,0.2)" : "1px solid rgba(255,255,255,0.02)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    transition: "all 0.2s",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.02)";
                    }
                  }}
                >
                  <div style={{ 
                    width: 52, 
                    height: 52, 
                    minWidth: 52,
                    borderRadius: 12, 
                    background: isActive ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#0b1220",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontWeight: 800, 
                    fontSize: 18,
                    color: isActive ? "#fff" : "#9ca3af",
                    transition: "all 0.2s",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    {c.counterpartyInfo?.userInfo?.avatar ? (
                      <img 
                        src={c.counterpartyInfo.userInfo.avatar} 
                        alt="آواتار"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ 
                        width: "100%", 
                        height: "100%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        background: isActive ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "linear-gradient(135deg, #0f172a, #1e293b)"
                      }}>
                        {proj.title?.charAt(0) || "پ"}
                      </div>
                    )}
                    
                    {c.lastMessage && (
                      <div style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid #071029"
                      }}></div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renderCounterpartyInfo(c)}
                    
                    <div style={{ marginTop: 8 }}>
                      {renderSnippet(c.lastMessage)}
                    </div>
                  </div>
                  
                  {c.lastMessage && !c.lastMessage.is_read && c.lastMessage.sender_id !== userId && (
                    <div style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#3b82f6",
                      boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)"
                    }}></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
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
      </aside>

      <main style={{ 
        flex: 1, 
        height: "100%",
        background: "#071029", 
        borderRadius: 12, 
        padding: 12, 
        border: "1px solid rgba(255,255,255,0.04)", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        {selectedProjectId ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <ChatBox 
              projectId={selectedProjectId} 
              autoRefresh={true}
              currentUserType={userType}
              currentUserId={userId}
            />
          </div>
        ) : (
          <div style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#9ca3af" 
          }}>
            <div style={{ textAlign: "center", maxWidth: 400 }}>
              <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.2 }}>💬</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: "#e5e7eb" }}>
                یک گفتگو انتخاب کنید
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#9ca3ab8" }}>
                لیست گفتگوها در سمت چپ نمایش داده می‌شود.<br/>
                برای شروع گفتگو به صفحه پروژه بروید و روی «ارسال پیام» کلیک کنید.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}