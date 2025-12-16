import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import { Paperclip, Send, Smile, X, FileText, Download, ExternalLink, Star, User, Shield, Building, Award, CheckCircle, Clock } from "lucide-react";
import * as MessagesAPI from "../api/messages";
import { formatDateIran } from "../utils/formatters";
import UserAvatar from "./UserAvatar";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";


const styles = {
  userProfileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    background: "rgba(17, 24, 39, 0.8)",
    borderBottom: "1px solid #1f2937",
    direction: "rtl"
  },
  
  userAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    overflow: "hidden",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid rgba(255, 255, 255, 0.1)"
  },
  
  userInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  
  userName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  
  userDetails: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  
  ratingStars: {
    display: "flex",
    alignItems: "center",
    gap: "2px"
  },
  
  roleBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
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
  },
  
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
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
  
  wrap: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#0f1115",
    borderRadius: 16,
    border: "1px solid #1f2937",
    overflow: "hidden",
    position: "relative",
    fontFamily: "inherit",
  },
  
  header: {
    padding: "16px 20px",
    background: "rgba(17, 24, 39, 0.8)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid #1f2937",
    color: "#fff",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    direction: "rtl",
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981",
  },
  
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "linear-gradient(180deg, #0f1115 0%, #13161c 100%)",
  },
  
  centerMsg: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 40,
  },
  
  rowRight: {
    display: "flex",
    justifyContent: "flex-end",
  },
  
  rowLeft: {
    display: "flex",
    justifyContent: "flex-start",
  },
  
  msgGroupRight: {
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
    flexDirection: "row",
  },
  
  msgGroupLeft: {
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
    flexDirection: "row-reverse",
  },
  
  bubbleMine: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "16px 16px 0 16px",
    maxWidth: "320px",
    boxShadow: "0 2px 5px rgba(37, 99, 235, 0.3)",
    textAlign: "right",
    position: "relative",
  },
  
  bubbleOther: {
    background: "#1f2937",
    color: "#f3f4f6",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 0",
    maxWidth: "320px",
    textAlign: "right",
    border: "1px solid #374151",
  },
  
  msgText: {
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  
  msgTime: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 6,
    textAlign: "left",
  },

  attachmentContainer: {
    marginBottom: 8,
  },
  
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 6,
  },
  
  attachmentImage: {
    width: "100%",
    maxWidth: 280,
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: 8,
    cursor: "pointer",
    display: "block",
  },
  
  downloadBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  fileBubble: {
    background: "rgba(0, 0, 0, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  
  fileIconBox: {
    width: 40,
    height: 40,
    background: "#374151",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  
  fileActionBtn: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 6,
    padding: "6px 10px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    transition: "background 0.2s",
    flex: 1,
    justifyContent: "center",
  },

  inputArea: {
    padding: "12px",
    background: "#111827",
    borderTop: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    gap: 8,
    direction: "rtl",
    position: "relative",
  },
  
  input: {
    flex: 1,
    background: "#1f2937",
    border: "none",
    borderRadius: 24,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    direction: "rtl",
    transition: "background 0.2s",
  },
  
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: 8,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s, background 0.2s",
  },
  
  sendBtn: {
    background: "#2563eb",
    border: "none",
    width: 42,
    height: 42,
    borderRadius: "50%",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
    transition: "transform 0.1s, opacity 0.2s",
  },

  filePreview: {
    position: "absolute",
    bottom: 70,
    right: 12,
    left: 12,
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: 12,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    direction: "rtl",
    zIndex: 5,
  },
  
  iconBox: {
    width: 48,
    height: 48,
    background: "#374151",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    flexShrink: 0,
  },
  
  previewImageBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
  },
  
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    padding: 4,
  },

  stickerPanel: {
    position: "absolute",
    bottom: 70,
    left: 20,
    width: 260,
    height: 200,
    background: "rgba(31, 41, 55, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid #374151",
    borderRadius: 12,
    padding: 12,
    overflowY: "auto",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  
  stickerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
  },
  
  stickerBtn: {
    background: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    padding: 4,
    borderRadius: 4,
    transition: "transform 0.1s",
  },
  
  spinner: {
    width: 18,
    height: 18,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 20,
  },
  
  modalContent: {
    position: "relative",
    maxWidth: "90%",
    maxHeight: "90%",
    background: "rgba(17,24,39,0.95)",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  
  modalImage: {
    maxWidth: "100%",
    maxHeight: "70vh",
    objectFit: "contain",
    borderRadius: 8,
  },
  
  modalCloseBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  
  modalActions: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  
  modalDownloadBtn: {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
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
      <span style={{ fontSize: "12px", color: "#e2e8f0", marginRight: "2px" }}>
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

export default function ChatBox({ projectId, autoRefresh = false, currentUserType, currentUserId }) {
  const { user } = useContext(AuthContext);
  const currentUser = user?.user ?? user ?? null;
  const myId = currentUser?.id ?? currentUser?.pk ?? null;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showStickers, setShowStickers] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [projectInfo, setProjectInfo] = useState(null);
  const [counterpartyInfo, setCounterpartyInfo] = useState(null);
  const [counterpartyRating, setCounterpartyRating] = useState({ rating: 0, count: 0 });
  const [loadingCounterparty, setLoadingCounterparty] = useState(true);

  const [imageViewer, setImageViewer] = useState({ open: false, url: null, name: null });

  const mountedRef = useRef(false);
  const pollRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const stickers = ["😀", "😂", "😍", "😎", "😭", "😡", "👍", "👎", "❤️", "🔥", "🎉", "💩", "👻", "🤖"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadProjectAndCounterpartyInfo = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoadingCounterparty(true);
      
      const projectRes = await api.get(`/market/projects/${projectId}/`);
      const projectData = projectRes.data;
      setProjectInfo(projectData);
      
      let counterpartyId = null;
      let counterpartyRole = "";
      
      if (currentUserType === "client") {
        counterpartyRole = "freelancer";
        if (projectData.hired_freelancer) {
          if (typeof projectData.hired_freelancer === "object") {
            counterpartyId = projectData.hired_freelancer.id || projectData.hired_freelancer.pk || null;
          } else {
            counterpartyId = projectData.hired_freelancer;
          }
        }
      } else {
        counterpartyRole = "employer";
        if (projectData.client) {
          if (typeof projectData.client === "object") {
            counterpartyId = projectData.client.id || projectData.client.pk || null;
          } else {
            counterpartyId = projectData.client;
          }
        }
      }
      
      if (counterpartyId) {
        try {
          const userRes = await api.get(`/users/${counterpartyId}/`);
          const userInfo = userRes.data;
          
          let avgRating = 0;
          let ratingsCount = 0;
          
          try {
            const ratingsRes = await api.get(`/market/users/${counterpartyId}/ratings/`);
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
              const altRes = await api.get(`/market/ratings/?user_to=${counterpartyId}`);
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
          
          setCounterpartyInfo({
            ...userInfo,
            role: counterpartyRole,
            isProjectOwner: currentUserType === "freelancer"
          });
          
          setCounterpartyRating({
            rating: avgRating,
            count: ratingsCount
          });
        } catch (err) {
          console.error("Error loading counterparty info:", err);
        }
      }
    } catch (err) {
      console.error("Error loading project info:", err);
    } finally {
      setLoadingCounterparty(false);
    }
  }, [projectId, currentUserType]);

  useEffect(() => {
    mountedRef.current = true;
    setMessages([]);
    setProjectInfo(null);
    setCounterpartyInfo(null);
    setCounterpartyRating({ rating: 0, count: 0 });
    
    loadMessages();
    loadProjectAndCounterpartyInfo();

    if (autoRefresh) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        loadMessages(false);
      }, 8000);
    }

    return () => {
      mountedRef.current = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [projectId]);

  const mapMessage = (m) => {
    if (!m) return null;
    const content = m.message ?? m.content ?? m.text ?? "";
    const created_at = m.created_at ?? m.createdAt ?? m.created ?? null;
    const attachment = m.attachment ?? m.file ?? null;
    const file_url = m.file_url ?? m.fileUrl ?? m.attachment_url ?? m.attachment_url ?? null;

    const project_id = m.project ?? m.project_id ?? m.projectId ?? (m.raw_project ? m.raw_project : null) ?? null;

    let senderId = null;
    if (typeof m.sender === "object" && m.sender != null) {
      senderId = m.sender.id ?? m.sender.pk ?? null;
    } else {
      senderId = m.sender ?? null;
    }

    const sender_avatar =
      m.sender_avatar ??
      (typeof m.sender === "object" && m.sender ? (m.sender.avatar ?? m.sender.profile_avatar ?? null) : null);

    return {
      id: m.id ?? m.pk ?? null,
      content,
      created_at,
      sender_id: senderId,
      sender_avatar: sender_avatar || null,
      attachment,
      file_url: file_url || attachment || null,
      project_id, 
      is_mine: !!(myId != null && senderId != null && Number(myId) === Number(senderId)),
      raw: m,
    };
  };

  const loadMessages = async (withLoading = true) => {
    if (!projectId) return;
    if (withLoading) setLoading(true);
    try {
      const res = await MessagesAPI.list(projectId);
      const data = Array.isArray(res) ? res : res?.results ?? res?.data ?? res;
      const mapped = (data || []).map(mapMessage).filter(Boolean);

      if (mountedRef.current) {
        setMessages((prev) => {
          const prevFiltered = (prev || []).filter((m) => {
            if (!m) return false;
            if (m.id == null) return true; 
            if (m.project_id == null) return false;
            return String(m.project_id) === String(projectId);
          });

          const byId = new Map();
          mapped.forEach((m) => {
            if (m?.id != null) byId.set(String(m.id), m);
          });
          prevFiltered.forEach((m) => {
            if (m?.id != null && !byId.has(String(m.id))) byId.set(String(m.id), m);
          });
          const noId = [];
          prevFiltered.concat(mapped).forEach((m) => {
            if (!m || m.id == null) noId.push(m);
          });

          const merged = Array.from(byId.values()).sort((a, b) => {
            const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return ta - tb;
          }).concat(noId);

          return merged;
        });
      }
    } catch (err) {
      console.error("loadMessages", err);
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        if (mountedRef.current) setMessages([]);
      }
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("حجم فایل انتخابی باید کمتر از ۱۰۰ مگابایت باشد.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const send = async (e) => {
    e?.preventDefault();
    if ((!text.trim() && !file) || !projectId) return;

    setSending(true);
    try {
      const res = await MessagesAPI.send(projectId, text.trim(), file);
      const serverMsg = res?.data ?? res;
      const newMsg = mapMessage(serverMsg) || mapMessage(res);

      const msgProjectId =
        newMsg?.project_id ?? newMsg?.raw?.project ?? newMsg?.raw?.project_id ?? null;

      if (newMsg && (msgProjectId == null || String(msgProjectId) === String(projectId))) {
        setMessages((prev) => {
          if (newMsg.id != null && prev.some((m) => m.id === newMsg.id)) return prev;
          return [...(prev || []), newMsg];
        });
      } else {
        loadMessages(false);
      }

      setText("");
      removeFile();
      setShowStickers(false);
    } catch (err) {
      console.error("send message", err);
      const status = err?.response?.status;
      if (status === 403) {
        alert("ارسال پیام قبل از استخدام مجاز نیست.");
      } else {
        const detail = err?.response?.data?.detail || err?.response?.data || err.message;
        alert(detail || "ارسال پیام موفق نبود.");
      }
    } finally {
      setSending(false);
    }
  };

  const sendSticker = (sticker) => {
    setText((prev) => prev + sticker);
  };

  const openImageViewer = (url, name) => {
    setImageViewer({ open: true, url, name });
  };

  const closeImageViewer = () => {
    setImageViewer({ open: false, url: null, name: null });
  };

  const getFileType = (fileName) => {
    if (!fileName) return "file";
    const ext = fileName.split(".").pop().toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
    const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm"];
    const audioExts = ["mp3", "wav", "ogg", "flac", "m4a"];

    if (imageExts.includes(ext)) return "image";
    if (videoExts.includes(ext)) return "video";
    if (audioExts.includes(ext)) return "audio";
    return "file";
  };

  const downloadFile = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "file";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderUserProfileHeader = () => {
    if (loadingCounterparty || !counterpartyInfo) {
      return (
        <div style={styles.userProfileHeader}>
          <div style={{ 
            ...styles.userAvatar,
            background: "rgba(30, 41, 59, 0.5)" 
          }}>
            <User size={24} color="#94a3b8" />
          </div>
          <div style={styles.userInfo}>
            <div style={{ ...styles.userName, color: "#94a3b8" }}>
              در حال بارگذاری اطلاعات...
            </div>
            <div style={styles.userDetails}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                لطفا صبر کنید
              </div>
            </div>
          </div>
        </div>
      );
    }

    const fullName = `${counterpartyInfo.first_name || ""} ${counterpartyInfo.last_name || ""}`.trim();
    const displayName = fullName || counterpartyInfo.username || counterpartyInfo.email || "کاربر";
    const avatarSrc = counterpartyInfo.avatar || counterpartyInfo.profile_picture || counterpartyInfo.photo_url;

    return (
      <div style={styles.userProfileHeader}>
        {/* آواتار کاربر مقابل */}
        <div style={styles.userAvatar}>
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt={displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = '<User size={24} color="#ffffff" />';
              }}
            />
          ) : (
            <User size={24} color="#ffffff" />
          )}
        </div>

        <div style={styles.userInfo}>
          <div style={styles.userName}>
            {displayName}
            
            {renderRoleBadge(counterpartyInfo.role, counterpartyInfo.isProjectOwner)}
            
            {projectInfo && renderStatusBadge(projectInfo.status)}
          </div>
          
          <div style={styles.userDetails}>
            {counterpartyRating.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {renderStars(counterpartyRating.rating, counterpartyRating.count)}
              </div>
            )}
            
            {counterpartyInfo.email && (
              <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>✉️</span>
                <span>{counterpartyInfo.email}</span>
              </div>
            )}
            
            {counterpartyInfo.role === 'freelancer' && projectInfo?.hired_freelancer && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#34d399" }}>
                <Award size={12} />
                <span>مجری پروژه</span>
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#10b981",
          boxShadow: "0 0 10px #10b981",
          flexShrink: 0
        }}></div>
      </div>
    );
  };

  return (
    <div style={styles.wrap}>
      {renderUserProfileHeader()}

      <div style={styles.messagesContainer}>
        {loading ? (
          <div style={styles.centerMsg}>در حال بارگذاری پیام‌ها...</div>
        ) : messages.length === 0 ? (
          <div style={styles.centerMsg}>
            <div style={{ marginBottom: "16px", fontSize: "48px", opacity: 0.3 }}>💬</div>
            <div>هنوز پیامی ارسال نشده است.</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              اولین پیام را ارسال کنید تا گفتگو را شروع کنید
            </div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const fileType = m.file_url ? getFileType(m.file_url) : null;
            const fileName = m.file_url ? String(m.file_url).split("/").pop() : "فایل";
            const key = m.id != null ? `msg-${m.id}` : `tmp-${idx}`;

            return (
              <div key={key} style={m.is_mine ? styles.rowRight : styles.rowLeft}>
                <div style={m.is_mine ? styles.msgGroupRight : styles.msgGroupLeft}>
                  {!m.is_mine && (
                    <div style={{ position: "relative" }}>
                      <UserAvatar src={m.sender_avatar} size={32} />
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid #0f1115"
                      }}></div>
                    </div>
                  )}

                  <div style={m.is_mine ? styles.bubbleMine : styles.bubbleOther}>
                    {m.file_url && (
                      <div style={styles.attachmentContainer}>
                        {fileType === "image" ? (
                          <div style={styles.imageContainer}>
                            <img
                              src={m.file_url}
                              alt="تصویر"
                              style={styles.attachmentImage}
                              onClick={() => openImageViewer(m.file_url, fileName)}
                            />
                            <button
                              onClick={() => downloadFile(m.file_url, fileName)}
                              style={styles.downloadBtn}
                              title="دانلود تصویر"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        ) : (
                          <div style={styles.fileBubble}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={styles.fileIconBox}>
                                <FileText size={20} color="#fff" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                                  {fileName.length > 30 ? fileName.slice(0, 27) + "..." : fileName}
                                </div>
                                <div style={{ fontSize: 11, opacity: 0.7 }}>فایل ضمیمه</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                              <button
                                onClick={() => downloadFile(m.file_url, fileName)}
                                style={styles.fileActionBtn}
                                title="دانلود"
                              >
                                <Download size={14} />
                                <span style={{ fontSize: 11 }}>دانلود</span>
                              </button>
                              <button
                                onClick={() => window.open(m.file_url, "_blank")}
                                style={styles.fileActionBtn}
                                title="باز کردن"
                              >
                                <ExternalLink size={14} />
                                <span style={{ fontSize: 11 }}>باز کردن</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {m.content && <div style={styles.msgText}>{m.content}</div>}
                    <div style={styles.msgTime}>{formatDateIran(m.created_at)}</div>
                  </div>

                  {m.is_mine && (
                    <div style={{ position: "relative" }}>
                      <UserAvatar src={m.sender_avatar || currentUser?.avatar} size={32} />
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid #0f1115"
                      }}></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {imageViewer.open && (
        <div style={styles.modalOverlay} onClick={closeImageViewer}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalCloseBtn} onClick={closeImageViewer} title="بستن">
              <X size={18} />
            </button>
            <img src={imageViewer.url} alt={imageViewer.name || "image"} style={styles.modalImage} />
            <div style={styles.modalActions}>
              <button
                style={styles.modalDownloadBtn}
                onClick={() => downloadFile(imageViewer.url, imageViewer.name)}
              >
                <Download size={16} /> <span style={{ marginLeft: 8 }}>دانلود</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div style={styles.filePreview}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {imagePreview ? (
              <div style={styles.previewImageBox}>
                <img src={imagePreview} alt="پیش‌نمایش" style={styles.previewImage} />
              </div>
            ) : (
              <div style={styles.iconBox}>
                <FileText size={16} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: 12,
                  color: "#fff",
                  maxWidth: 200,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {file.name}
              </span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button onClick={removeFile} style={styles.closeBtn}>
            <X size={14} />
          </button>
        </div>
      )}

      {showStickers && (
        <div style={styles.stickerPanel}>
          <div style={styles.stickerGrid}>
            {stickers.map((s, i) => (
              <button key={i} onClick={() => sendSticker(s)} style={styles.stickerBtn}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={send} style={styles.inputArea}>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={styles.iconBtn}
          title="افزودن فایل (زیر ۱۰۰ مگابایت)"
        >
          <Paperclip size={20} />
        </button>

        <button
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          style={{ ...styles.iconBtn, color: showStickers ? "#fbbf24" : "#9ca3af" }}
        >
          <Smile size={20} />
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ ...styles.input, direction: "rtl", textAlign: "right", minWidth: 0 }}
          placeholder="پیام خود را بنویسید..."
          disabled={sending || loading}
          dir="rtl"
        />

        <button
          type="submit"
          disabled={sending || loading || (!text.trim() && !file)}
          style={{
            ...styles.sendBtn,
            opacity: sending || loading || (!text.trim() && !file) ? 0.5 : 1,
            cursor: sending || loading || (!text.trim() && !file) ? "not-allowed" : "pointer",
          }}
        >
          {sending ? <div style={styles.spinner} /> : <Send size={18} style={{ transform: "rotate(180deg)" }} />}
        </button>
      </form>
      
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