import React, { useContext, useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { formatDateIran } from "../utils/formatters";

function TagInput({ id, value = [], onChange, placeholder = "برای افزودن Enter بزن" }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {}, [value]);

  const addTag = (tag) => {
    const t = tag.trim();
    if (!t) return;
    if (!value.includes(t)) {
      onChange([...value, t]);
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim() !== "") addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, value.length - 1));
    }
  };

  const removeTag = (t) => {
    onChange(value.filter((x) => x !== t));
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => inputRef.current && inputRef.current.focus()}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: 12,
          minHeight: 48,
          background: "linear-gradient(145deg, #0a1a2f, #071023)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease",
        }}
      >
        {value.map((tag) => (
          <div
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))",
              color: "#e2e8f0",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))";
            }}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: 800,
                padding: "0 4px",
                lineHeight: 1,
                fontSize: 18,
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              aria-label={`remove ${tag}`}
            >
              ×
            </button>
          </div>
        ))}

        <input
          id={id}
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 140,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#fff",
            fontSize: 15,
            padding: "8px 6px",
            fontFamily: "inherit",
          }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8", textAlign: "right", paddingRight: 4 }}>
        برای افزودن یک مورد بنویسید و Enter بزنید — برای حذف روی × کلیک کنید.
      </div>
    </div>
  );
}

function SelectInput({ id, value, onChange, options, placeholder }) {
  return (
    <select
      id={id}
      value={value || ""}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(145deg, #0a1a2f, #071023)",
        color: value ? "#fff" : "#94a3b8",
        fontSize: 15,
        outline: "none",
        cursor: "pointer",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left 16px center",
        backgroundSize: "16px",
        paddingLeft: 40,
        transition: "all 0.2s ease",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#3b82f6";
        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.08)";
        e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.3)";
      }}
    >
      <option value="" style={{ color: "#94a3b8", background: "#0f172a" }}>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value} style={{ background: "#0f172a", color: "#fff" }}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function Profile() {
  console.log("🔷 Profile rendered", new Date().toISOString());

  const { user, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    skills: [],
    languages: [],
    experience_years: "",
    business_fields: [],
    company_size: "",
    website: "",
    company_description: "",
    phone: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const prevBlobRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(null);

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [cropNatural, setCropNatural] = useState({ w: 0, h: 0 });
  const [cropScaleBase, setCropScaleBase] = useState(1);
  const [cropScale, setCropScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const CROP_BOX = 260;
  const OUTPUT_SIZE = 400;

  const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="14" fill="#0b0b0d"/>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
      <g fill="url(#grad1)">
        <circle cx="60" cy="40" r="22"/>
        <path d="M18 100c0-23 20-34 42-34s42 11 42 34z"/>
      </g>
    </svg>`
  )}`;

  const getUserDisplayName = (userDetails) => {
    if (!userDetails) return "کاربر";
    
    if (typeof userDetails === "object") {
      const firstName = userDetails.first_name || userDetails.name || userDetails.username || "";
      const lastName = userDetails.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      
      if (fullName) return fullName;
      if (userDetails.username) return userDetails.username;
      if (userDetails.email) return userDetails.email;
    }
    
    return "کاربر";
  };

  const selectAvatar = (userDetails) => {
    if (!userDetails) return null;
    
    if (typeof userDetails === "string") {
      return userDetails;
    }
    
    if (typeof userDetails === "object") {
      if (userDetails.avatar) {
        if (typeof userDetails.avatar === "string") {
          return userDetails.avatar;
        } else if (userDetails.avatar && typeof userDetails.avatar.url === "string") {
          return userDetails.avatar.url;
        }
      }
      
      if (userDetails.avatar_url) return userDetails.avatar_url;
      if (userDetails.photo) return userDetails.photo;
      if (userDetails.photo_url) return userDetails.photo_url;
      if (userDetails.profile_picture) return userDetails.profile_picture;
      if (userDetails.image) return userDetails.image;
      if (userDetails.image_url) return userDetails.image_url;
    }
    
    return null;
  };

  const extractUserAvatar = (review) => {
    if (review.from_user_details) {
      const avatar = selectAvatar(review.from_user_details);
      if (avatar) return avatar;
    }
    
    if (review.from_user && typeof review.from_user === "object") {
      const avatar = selectAvatar(review.from_user);
      if (avatar) return avatar;
    }
    
    if (review.created_by && typeof review.created_by === "object") {
      const avatar = selectAvatar(review.created_by);
      if (avatar) return avatar;
    }
    
    if (review.user && typeof review.user === "object") {
      const avatar = selectAvatar(review.user);
      if (avatar) return avatar;
    }
    
    return null;
  };

  const extractUserName = (review) => {
    if (review.from_user_details) {
      const name = getUserDisplayName(review.from_user_details);
      if (name && name !== "کاربر") return name;
    }
    
    if (review.from_user && typeof review.from_user === "object") {
      const name = getUserDisplayName(review.from_user);
      if (name && name !== "کاربر") return name;
    }
    
    if (review.created_by && typeof review.created_by === "object") {
      const name = getUserDisplayName(review.created_by);
      if (name && name !== "کاربر") return name;
    }
    
    if (review.user && typeof review.user === "object") {
      const name = getUserDisplayName(review.user);
      if (name && name !== "کاربر") return name;
    }
    
    if (review.from_user_name) return review.from_user_name;
    if (review.user_name) return review.user_name;
    if (review.creator_name) return review.creator_name;
    
    return "کاربر";
  };

  const extractUserType = (review) => {
    if (review.from_user_details) {
      if (review.from_user_details.user_type === "client") return "کارفرما";
      if (review.from_user_details.user_type === "freelancer") return "فریلنسر";
      if (review.from_user_details.is_client) return "کارفرما";
      if (review.from_user_details.is_freelancer) return "فریلنسر";
    }
    
    if (review.from_user && typeof review.from_user === "object") {
      if (review.from_user.user_type === "client") return "کارفرما";
      if (review.from_user.user_type === "freelancer") return "فریلنسر";
      if (review.from_user.is_client) return "کارفرما";
      if (review.from_user.is_freelancer) return "فریلنسر";
    }
    
    if (review.user_type === "client") return "کارفرما";
    if (review.user_type === "freelancer") return "فریلنسر";
    
    return "کاربر";
  };

  const normalizedUser = (u) => {
    if (!u) return null;
    return u.user ?? u;
  };

  useEffect(() => {
    const u = normalizedUser(user);
    if (!u) return;
    
    const userType = u.user_type;
    
    setForm((f) => ({
      ...f,
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      bio: u.bio || "",
      phone: u.phone || "",
      ...(userType === "freelancer" && {
        skills: u.skills && Array.isArray(u.skills)
          ? u.skills
          : typeof u.skills === "string" && u.skills.trim() !== ""
          ? (function () {
              try {
                const parsed = JSON.parse(u.skills);
                return Array.isArray(parsed) ? parsed : u.skills.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
              } catch (e) {
                return u.skills.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
              }
            })()
          : [],
        languages: u.languages && Array.isArray(u.languages)
          ? u.languages
          : typeof u.languages === "string" && u.languages.trim() !== ""
          ? (function () {
              try {
                const parsed = JSON.parse(u.languages);
                return Array.isArray(parsed) ? parsed : u.languages.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
              } catch (e) {
                return u.languages.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
              }
            })()
          : [],
        experience_years: u.experience_years ?? "",
      }),
      ...(userType === "client" && {
        business_fields: u.business_fields && Array.isArray(u.business_fields)
          ? u.business_fields
          : typeof u.business_fields === "string" && u.business_fields.trim() !== ""
          ? (function () {
              try {
                const parsed = JSON.parse(u.business_fields);
                return Array.isArray(parsed) ? parsed : u.business_fields.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
              } catch (e) {
                return u.business_fields.split(/[\s,،]+/).map((s) => s.trim()).filter(Boolean);
              }
            })()
          : [],
        company_size: u.company_size || "",
        website: u.website || "",
        company_description: u.company_description || "",
      }),
    }));
    setPreview(u?.avatar || null);
  }, [user]);

  useEffect(() => {
    const u = normalizedUser(user);
    if (!u || !u.id) return;

    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        try {
          const res = await api.get(`/market/users/${u.id}/ratings/`);
          const data = Array.isArray(res.data) ? res.data : res.data.results || [];
          
          const reviewsWithDetails = await Promise.all(
            data.map(async (review) => {
              let enrichedReview = { ...review };
              
              if (review.from_user && typeof review.from_user === "number") {
                try {
                  const userRes = await api.get(`/users/${review.from_user}/`);
                  enrichedReview.from_user_details = userRes.data;
                } catch (err) {
                  console.error(`Error loading user details for user ${review.from_user}:`, err);
                }
              }
              
              if (review.from_user && typeof review.from_user === "string" && review.from_user.includes("/users/")) {
                try {
                  const userId = review.from_user.split("/").filter(Boolean).pop();
                  const userRes = await api.get(`/users/${userId}/`);
                  enrichedReview.from_user_details = userRes.data;
                } catch (err) {
                  console.error(`Error loading user details from URL ${review.from_user}:`, err);
                }
              }
              
              try {
                if (review.project && typeof review.project === "number") {
                  const projectRes = await api.get(`/market/projects/${review.project}/`);
                  enrichedReview.project_title = projectRes.data?.title || `پروژه #${review.project}`;
                  enrichedReview.project_budget = projectRes.data?.budget_min
                    ? `${projectRes.data.budget_min.toLocaleString("fa-IR")} - ${projectRes.data.budget_max.toLocaleString("fa-IR")} تومان`
                    : null;
                } else if (review.project && review.project.title) {
                  enrichedReview.project_title = review.project.title;
                  enrichedReview.project_budget = review.project.budget_min
                    ? `${review.project.budget_min.toLocaleString("fa-IR")} - ${review.project.budget_max.toLocaleString("fa-IR")} تومان`
                    : null;
                }
              } catch (err) {
                console.error(`Error loading project details for review ${review.id}:`, err);
                enrichedReview.project_title = `پروژه #${review.project}`;
              }
              
              return enrichedReview;
            })
          );

          setReviews(reviewsWithDetails);

          if (reviewsWithDetails.length > 0) {
            const sum = reviewsWithDetails.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
            setAverageRating((sum / reviewsWithDetails.length).toFixed(1));
          } else {
            setAverageRating(0);
          }
        } catch (err) {
          console.log("Using fallback endpoint for reviews");
          const res = await api.get(`/market/ratings/?user_to=${u.id}`);
          const data = Array.isArray(res.data) ? res.data : res.data.results || [];
          
          const reviewsWithDetails = await Promise.all(
            data.map(async (review) => {
              let enrichedReview = { ...review };
              
              if (review.from_user && typeof review.from_user === "number") {
                try {
                  const userRes = await api.get(`/users/${review.from_user}/`);
                  enrichedReview.from_user_details = userRes.data;
                } catch (err) {
                  console.error(`Error loading user details for user ${review.from_user}:`, err);
                }
              }
              
              try {
                if (review.project && typeof review.project === "number") {
                  const projectRes = await api.get(`/market/projects/${review.project}/`);
                  enrichedReview.project_title = projectRes.data?.title || `پروژه #${review.project}`;
                  enrichedReview.project_budget = projectRes.data?.budget_min
                    ? `${projectRes.data.budget_min.toLocaleString("fa-IR")} - ${projectRes.data.budget_max.toLocaleString("fa-IR")} تومان`
                    : null;
                }
              } catch (err) {
                console.error(`Error loading project details for review ${review.id}:`, err);
                enrichedReview.project_title = `پروژه #${review.project}`;
              }
              
              return enrichedReview;
            })
          );

          setReviews(reviewsWithDetails);

          if (reviewsWithDetails.length > 0) {
            const sum = reviewsWithDetails.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
            setAverageRating((sum / reviewsWithDetails.length).toFixed(1));
          } else {
            setAverageRating(0);
          }
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setReviews([]);
        setAverageRating(0);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [user]);

  useEffect(() => {
    return () => {
      if (prevBlobRef.current && prevBlobRef.current.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(prevBlobRef.current);
        } catch (e) {}
        prevBlobRef.current = null;
      }
      if (cropImageUrl) {
        try {
          URL.revokeObjectURL(cropImageUrl);
        } catch (e) {}
      }
    };
  }, []);


  const openCropForFile = (file) => {
    const obj = URL.createObjectURL(file);
    if (cropImageUrl) {
      try {
        URL.revokeObjectURL(cropImageUrl);
      } catch {}
    }
    setCropImageUrl(obj);
    setCropOpen(true);
    setCropNatural({ w: 0, h: 0 });
    setCropScaleBase(1);
    setCropScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const onFileSelected = (file) => {
    if (!file) return;
    const maxBytes = 6 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessageType("error");
      setMessage("اندازه فایل باید کمتر از 6MB باشد.");
      return;
    }
    openCropForFile(file);
  };

  const onFileInputChange = (e) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    onFileSelected(files[0]);
    e.target.value = "";
  };

  const onCropImageLoad = (ev) => {
    const img = ev.target;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return;
    setCropNatural({ w: nw, h: nh });

    const scaleCover = Math.max(CROP_BOX / nw, CROP_BOX / nh);
    setCropScaleBase(scaleCover);
    setCropScale(1);

    const displayedW = nw * scaleCover;
    const displayedH = nh * scaleCover;

    const startX = (CROP_BOX - displayedW) / 2;
    const startY = (CROP_BOX - displayedH) / 2;
    setOffset({ x: startX, y: startY });
  };

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const pageY = e.touches ? e.touches[0].pageY : e.pageY;
    dragStartRef.current = { x: pageX, y: pageY, offsetX: offset.x, offsetY: offset.y };
  };

  const onDragMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const pageY = e.touches ? e.touches[0].pageY : e.pageY;
    const dx = pageX - dragStartRef.current.x;
    const dy = pageY - dragStartRef.current.y;
    let nx = dragStartRef.current.offsetX + dx;
    let ny = dragStartRef.current.offsetY + dy;

    const scaleTotal = cropScaleBase * cropScale;
    const dispW = cropNatural.w * scaleTotal;
    const dispH = cropNatural.h * scaleTotal;

    const minX = Math.min(0, CROP_BOX - dispW);
    const maxX = 0;
    const minY = Math.min(0, CROP_BOX - dispH);
    const maxY = 0;

    if (nx < minX) nx = minX;
    if (nx > maxX) nx = maxX;
    if (ny < minY) ny = minY;
    if (ny > maxY) ny = maxY;

    setOffset({ x: nx, y: ny });
  };

  const endDrag = (e) => {
    setDragging(false);
    dragStartRef.current = null;
  };

  useEffect(() => {
    if (!cropOpen) return;
    const onUp = () => endDrag();
    const onMove = (ev) => onDragMove(ev);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, [cropOpen, dragging, cropNatural, cropScale, cropScaleBase, offset]);

  const onZoomChange = (value) => {
    const oldScaleTotal = cropScaleBase * cropScale;
    const newCropScale = Number(value);
    const newScaleTotal = cropScaleBase * newCropScale;

    const centerXInImage = (CROP_BOX / 2 - offset.x) / oldScaleTotal;
    const centerYInImage = (CROP_BOX / 2 - offset.y) / oldScaleTotal;

    const newOffsetX = CROP_BOX / 2 - centerXInImage * newScaleTotal;
    const newOffsetY = CROP_BOX / 2 - centerYInImage * newScaleTotal;

    const dispW = cropNatural.w * newScaleTotal;
    const dispH = cropNatural.h * newScaleTotal;
    const minX = Math.min(0, CROP_BOX - dispW);
    const maxX = 0;
    const minY = Math.min(0, CROP_BOX - dispH);
    const maxY = 0;
    let nx = newOffsetX;
    let ny = newOffsetY;
    if (nx < minX) nx = minX;
    if (nx > maxX) nx = maxX;
    if (ny < minY) ny = minY;
    if (ny > maxY) ny = maxY;

    setCropScale(newCropScale);
    setOffset({ x: nx, y: ny });
  };

  const performCropAndUse = async () => {
    if (!cropImageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = cropImageUrl;
    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("failed to load crop image"));
    });

    const scaleTotal = cropScaleBase * cropScale;
    const sx = Math.max(0, (0 - offset.x) / scaleTotal);
    const sy = Math.max(0, (0 - offset.y) / scaleTotal);
    const sWidth = Math.min(cropNatural.w - sx, CROP_BOX / scaleTotal);
    const sHeight = Math.min(cropNatural.h - sy, CROP_BOX / scaleTotal);

    const dpr = window.devicePixelRatio || 1;
    const canvasSize = OUTPUT_SIZE * dpr;
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
    if (!blob) {
      setMessageType("error");
      setMessage("خطا در پردازش تصویر.");
      return;
    }

    const file = new File([blob], "avatar.png", { type: "image/png" });

    if (prevBlobRef.current && prevBlobRef.current.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(prevBlobRef.current);
      } catch {}
    }

    const blobUrl = URL.createObjectURL(blob);
    prevBlobRef.current = blobUrl;

    setForm((s) => ({ ...s, avatar: file }));
    setPreview(blobUrl);

    try {
      if (cropImageUrl) {
        URL.revokeObjectURL(cropImageUrl);
      }
    } catch {}
    setCropImageUrl(null);
    setCropOpen(false);
    setCropNatural({ w: 0, h: 0 });
    setCropScaleBase(1);
    setCropScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const cancelCrop = () => {
    if (cropImageUrl) {
      try {
        URL.revokeObjectURL(cropImageUrl);
      } catch {}
    }
    setCropImageUrl(null);
    setCropOpen(false);
    setCropNatural({ w: 0, h: 0 });
    setCropScaleBase(1);
    setCropScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      onFileSelected(files[0]);
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const removeSelectedAvatar = () => {
    if (prevBlobRef.current && prevBlobRef.current.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(prevBlobRef.current);
      } catch (e) {}
      prevBlobRef.current = null;
    }
    setForm((s) => ({ ...s, avatar: null }));
    setPreview(normalizedUser(user)?.avatar || null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setMessageType(null);

    if (!form.first_name || !String(form.first_name).trim()) {
      setMessageType("error");
      setMessage("لطفاً نام خود را وارد کنید.");
      setSaving(false);
      return;
    }

    try {
      const fd = new FormData();
      const u = normalizedUser(user);
      const userType = u?.user_type;
      
      fd.append("first_name", form.first_name || "");
      fd.append("last_name", form.last_name || "");
      fd.append("bio", form.bio || "");
      fd.append("phone", form.phone || "");

      if (userType === "freelancer") {
        const skillsArray = Array.isArray(form.skills) ? form.skills.map((s) => String(s).trim()).filter(Boolean) : [];
        const languagesArray = Array.isArray(form.languages) ? form.languages.map((s) => String(s).trim()).filter(Boolean) : [];

        fd.append("skills", JSON.stringify(skillsArray));
        fd.append("skills_json", JSON.stringify(skillsArray));
        fd.append("languages", JSON.stringify(languagesArray));
        fd.append("languages_json", JSON.stringify(languagesArray));

        if (form.experience_years !== "" && form.experience_years !== null && form.experience_years !== undefined) {
          const parsed = parseInt(String(form.experience_years).replace(/[^\d]/g, ""), 10);
          if (!Number.isNaN(parsed)) {
            fd.append("experience_years", String(parsed));
          }
        }
      }

      if (userType === "client") {
        const businessFieldsArray = Array.isArray(form.business_fields) ? form.business_fields.map((s) => String(s).trim()).filter(Boolean) : [];
        
        fd.append("business_fields", JSON.stringify(businessFieldsArray));
        fd.append("business_fields_json", JSON.stringify(businessFieldsArray));
        fd.append("company_size", form.company_size || "");
        
        let website = form.website || "";
        if (website.trim()) {
          website = website.trim();
          if (!website.startsWith('http://') && !website.startsWith('https://')) {
            website = 'https://' + website;
          }
        } else {
          website = ""; 
        }
        fd.append("website", website);
        
        fd.append("company_description", form.company_description || "");
      }

      if (form.avatar) fd.append("avatar", form.avatar);

      const res = await api.put("/users/me/", fd);

      const returnedUser = res?.data?.user ?? res?.data ?? null;
      console.log("Profile PUT response:", res?.data);

      if (returnedUser && setUser) {
        setUser(returnedUser);
      }

      setMessageType("success");
      setMessage("اطلاعات با موفقیت ذخیره شد.");

      const avatarUrl = returnedUser?.avatar ?? res?.data?.avatar ?? null;
      if (avatarUrl) {
        if (prevBlobRef.current && prevBlobRef.current.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(prevBlobRef.current);
          } catch (e) {}
          prevBlobRef.current = null;
        }
        setPreview(avatarUrl);
      } else {
        setPreview(returnedUser?.avatar || null);
      }
    } catch (err) {
      console.error("Profile submit error:", err);
      const serverData = err?.response?.data;
      let errorMessage = "ذخیره‌سازی ناموفق بود.";
      
      if (serverData) {
        if (typeof serverData === 'string') {
          errorMessage = serverData;
        } else if (serverData.detail) {
          errorMessage = serverData.detail;
        } else if (typeof serverData === 'object') {
          if (serverData.website && Array.isArray(serverData.website)) {
            errorMessage = serverData.website.join(' ');
          } else {
            const errors = [];
            for (const key in serverData) {
              if (Array.isArray(serverData[key])) {
                errors.push(...serverData[key]);
              }
            }
            if (errors.length > 0) {
              errorMessage = errors.join(' ');
            }
          }
        }
      }
      
      setMessageType("error");
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!normalizedUser(user)) return <div style={{ color: "#fff" }}>ابتدا وارد شوید.</div>;

  const u = normalizedUser(user);
  const isFreelancer = u?.user_type === "freelancer";
  const isClient = u?.user_type === "client";

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? "#ffd166" : "#475569", fontSize: 18 }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <h2 style={pageStyles.title}>پروفایل من</h2>
        <div style={pageStyles.userTypeBadge}>
          {isFreelancer ? "👨‍💻 فریلنسر" : isClient ? "👔 کارفرما" : "👤 کاربر"}
        </div>
      </div>

      <form onSubmit={submit} style={pageStyles.form} dir="rtl">
        <div style={pageStyles.leftCol}>
          <div style={pageStyles.avatarCard}>
            <div style={pageStyles.avatarWrap}>
              <img src={preview || placeholderSvg} alt="avatar" style={pageStyles.avatar} />
            </div>

            <div style={pageStyles.avatarActions}>
              <label style={pageStyles.uploadLabel}>
                <span>📁 انتخاب آواتار</span>
                <input type="file" name="avatar" accept="image/*" onChange={onFileInputChange} style={{ display: "none" }} />
              </label>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", width: "100%" }}>
                <button type="button" onClick={removeSelectedAvatar} style={pageStyles.secondaryBtn}>
                  🔄 بازنشانی
                </button>
                <div style={pageStyles.hint}>فرمت: JPG/PNG · حداکثر 6MB</div>
              </div>
            </div>
          </div>

          <div style={pageStyles.infoCard}>
            <div style={pageStyles.infoRow}>
              <div style={pageStyles.infoLabel}>📧 ایمیل</div>
              <div style={pageStyles.infoValue}>{u.email}</div>
            </div>
            <div style={pageStyles.infoRow}>
              <div style={pageStyles.infoLabel}>👤 نوع کاربر</div>
              <div style={pageStyles.infoValue}>{u.user_type === "client" ? "کارفرما" : "فریلنسر"}</div>
            </div>
            <div style={pageStyles.infoRow}>
              <div style={pageStyles.infoLabel}>📅 عضویت از</div>
              <div style={pageStyles.infoValue}>{formatDateIran(u.created_at)}</div>
            </div>
            {isClient && form.company_size && (
              <div style={pageStyles.infoRow}>
                <div style={pageStyles.infoLabel}>🏢 اندازه شرکت</div>
                <div style={pageStyles.infoValue}>
                  {form.company_size === "small" && "کوچک (1-10 نفر)"}
                  {form.company_size === "medium" && "متوسط (11-50 نفر)"}
                  {form.company_size === "large" && "بزرگ (50+ نفر)"}
                </div>
              </div>
            )}
            {isFreelancer && form.experience_years && (
              <div style={pageStyles.infoRow}>
                <div style={pageStyles.infoLabel}>📊 سال‌های تجربه</div>
                <div style={pageStyles.infoValue}>{form.experience_years} سال</div>
              </div>
            )}
          </div>

          <div style={pageStyles.reviewsCard}>
            <div style={pageStyles.reviewsHeader}>
              <h3 style={pageStyles.reviewsTitle}>⭐ نظرات و امتیازها</h3>
              {averageRating > 0 && (
                <div style={pageStyles.averageRating}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#ffd166" }}>{averageRating}</span>
                  <div style={{ display: "flex", gap: 2 }}>{renderStars(Math.round(averageRating))}</div>
                  <span style={{ fontSize: 12, color: "#64748b" }}>از {reviews.length} نظر</span>
                </div>
              )}
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>📥 در حال بارگذاری نظرات...</div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div>هنوز نظری ثبت نشده است</div>
              </div>
            ) : (
              <div style={pageStyles.reviewsList}>
                {reviews.map((review, idx) => {
                  const reviewerName = extractUserName(review);
                  const userType = extractUserType(review);
                  const avatarSrc = extractUserAvatar(review);
                  
                  return (
                    <div key={idx} style={pageStyles.reviewItem}>
                      <div style={pageStyles.reviewHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={avatarSrc || placeholderSvg}
                            alt="avatar"
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(255,255,255,0.1)',
                              backgroundColor: 'rgba(255,255,255,0.05)'
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = placeholderSvg;
                            }}
                          />
                          <div>
                            <div style={pageStyles.reviewerName}>
                              {reviewerName}
                              <span style={{ 
                                fontSize: 12, 
                                color: userType === "کارفرما" ? "#8b5cf6" : userType === "فریلنسر" ? "#3b82f6" : "#64748b", 
                                marginRight: 8, 
                                display: "inline-block",
                                fontWeight: 600
                              }}>
                                ({userType})
                              </span>
                            </div>
                            <div style={pageStyles.reviewDate}>{formatDateIran(review.created_at)}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>{renderStars(review.rating)}</div>
                      </div>
                      {review.review && <p style={pageStyles.reviewText}>{review.review}</p>}
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                        <div>
                          پروژه: <strong>{review.project_title || `پروژه #${review.project}`}</strong>
                        </div>
                        {review.project_budget && <div style={{ marginTop: 2 }}>بودجه: {review.project_budget}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={pageStyles.rightCol}>
          <div style={pageStyles.card}>
            <div style={pageStyles.sectionTitle}>👤 اطلاعات شخصی</div>
            
            <div style={pageStyles.rowTwo}>
              <div style={{ flex: 1 }}>
                <label style={pageStyles.label}>نام</label>
                <input 
                  id="first_name" 
                  name="first_name" 
                  value={form.first_name} 
                  onChange={handleInputChange} 
                  style={pageStyles.input} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={pageStyles.label}>نام خانوادگی</label>
                <input 
                  id="last_name" 
                  name="last_name" 
                  value={form.last_name} 
                  onChange={handleInputChange} 
                  style={pageStyles.input} 
                />
              </div>
            </div>

            <label style={pageStyles.label}>📱 شماره تماس</label>
            <input 
              id="phone" 
              name="phone" 
              value={form.phone} 
              onChange={handleInputChange} 
              style={pageStyles.input} 
              placeholder="مثال: 09123456789" 
            />

            <label style={pageStyles.label}>📝 بیوگرافی / درباره من</label>
            <textarea 
              name="bio" 
              value={form.bio} 
              onChange={handleInputChange} 
              rows={3} 
              style={pageStyles.textarea} 
              placeholder="درباره خود و تخصص‌هایتان توضیح دهید..."
            />

            {isFreelancer && (
              <>
                <div style={pageStyles.sectionTitle}>💼 اطلاعات فریلنسری</div>
                
                <div style={pageStyles.rowTwo}>
                  <div style={{ flex: 1 }}>
                    <label style={pageStyles.labelSmall}>🛠️ مهارت‌های تخصصی</label>
                    <TagInput 
                      id="skills-input" 
                      value={form.skills} 
                      onChange={(arr) => setForm((s) => ({ ...s, skills: arr }))} 
                      placeholder="مثال: React, Python, طراحی UI — Enter برای افزودن" 
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={pageStyles.labelSmall}>📅 سال‌های تجربه</label>
                    <input 
                      name="experience_years" 
                      value={form.experience_years} 
                      onChange={handleInputChange} 
                      style={pageStyles.input} 
                      placeholder="مثال: 3" 
                    />
                  </div>
                </div>

                <label style={pageStyles.label}>🌐 زبان‌های مسلط</label>
                <TagInput 
                  id="languages-input" 
                  value={form.languages} 
                  onChange={(arr) => setForm((s) => ({ ...s, languages: arr }))} 
                  placeholder="مثال: فارسی، انگلیسی — Enter برای افزودن" 
                />
              </>
            )}

            {isClient && (
              <>
                <div style={pageStyles.sectionTitle}>🏢 اطلاعات شرکت</div>
                
                <label style={pageStyles.label}>🏷️ زمینه‌های فعالیت</label>
                <TagInput 
                  id="business-fields-input" 
                  value={form.business_fields} 
                  onChange={(arr) => setForm((s) => ({ ...s, business_fields: arr }))} 
                  placeholder="مثال: فناوری، بازاریابی، طراحی — Enter برای افزودن" 
                />

                <div style={pageStyles.rowTwo}>
                  <div style={{ flex: 1 }}>
                    <label style={pageStyles.labelSmall}>📏 اندازه شرکت</label>
                    <SelectInput
                      id="company-size"
                      name="company_size"
                      value={form.company_size}
                      onChange={(e) => setForm((s) => ({ ...s, company_size: e.target.value }))}
                      options={[
                        { value: "small", label: "کوچک (1-10 نفر)" },
                        { value: "medium", label: "متوسط (11-50 نفر)" },
                        { value: "large", label: "بزرگ (50+ نفر)" }
                      ]}
                      placeholder="انتخاب اندازه شرکت"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={pageStyles.labelSmall}>🌐 وبسایت شرکت</label>
                    <input 
                      name="website" 
                      value={form.website} 
                      onChange={handleInputChange} 
                      style={pageStyles.input} 
                      placeholder="مثال: example.com یا https://example.com" 
                    />
                  </div>
                </div>

                <label style={pageStyles.label}>📋 درباره شرکت</label>
                <textarea 
                  name="company_description" 
                  value={form.company_description} 
                  onChange={handleInputChange} 
                  rows={3} 
                  style={pageStyles.textarea} 
                  placeholder="در مورد فعالیت‌ها و اهداف شرکت توضیح دهید..."
                />
              </>
            )}

            <div style={pageStyles.actions}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                <button 
                  type="submit" 
                  disabled={saving} 
                  style={{
                    ...pageStyles.primaryBtn,
                    ...(saving && pageStyles.primaryBtnDisabled)
                  }}
                >
                  {saving ? "💾 درحال ذخیره..." : "💾 ذخیره تغییرات"}
                </button>
                {message && (
                  <div
                    style={{
                      ...pageStyles.message,
                      background: messageType === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      borderColor: messageType === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
                      color: messageType === "success" ? "#10b981" : "#ef4444",
                    }}
                  >
                    {messageType === "success" ? "✅ " : "❌ "}{message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {cropOpen && cropImageUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ width: "100%", maxWidth: 920, display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ background: "#0f172a", padding: 20, borderRadius: 16, flex: "0 0 auto", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div
                style={{
                  width: CROP_BOX,
                  height: CROP_BOX,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  border: "4px solid rgba(255,255,255,0.1)",
                  background: "#0b1220",
                }}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
              >
                <img
                  src={cropImageUrl}
                  alt="crop"
                  onLoad={onCropImageLoad}
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: offset.x,
                    top: offset.y,
                    width: cropNatural.w * cropScaleBase * cropScale || "auto",
                    height: cropNatural.h * cropScaleBase * cropScale || "auto",
                    userSelect: "none",
                    touchAction: "none",
                    cursor: dragging ? "grabbing" : "grab",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    boxShadow: "inset 0 0 0 9999px rgba(0,0,0,0.4)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600 }}>🔍 بزرگ‌نمایی</label>
                <input
                  type="range"
                  min={0.6}
                  max={3}
                  step={0.01}
                  value={cropScale}
                  onChange={(e) => onZoomChange(Number(e.target.value))}
                  style={{ 
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                    outline: "none",
                    appearance: "none",
                  }}
                />
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, minWidth: 40 }}>{(cropScale * 100).toFixed(0)}%</div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
                <button
                  onClick={cancelCrop}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  ❌ لغو
                </button>
                <button
                  onClick={performCropAndUse}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 800,
                    transition: "all 0.2s",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  ✅ استفاده از تصویر
                </button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, marginBottom: 12 }}>✂️ ویرایش عکس پروفایل</div>
              <div style={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: 15 }}>
                <p>• عکس را با کشیدن به اطراف جابجا کنید</p>
                <p>• از اسلایدر برای زوم استفاده کنید</p>
                <p>• بخش درون دایره به عنوان عکس آواتار ذخیره می‌شود</p>
                <p>• پس از تایید، تصویر بریده‌شده به صورت آواتار نمایش داده می‌شود</p>
                <p style={{ marginTop: 16, padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 14 }}>
                  💡 <strong>توصیه:</strong> از عکس‌های شفاف و با کیفیت با پس‌زمینه ساده استفاده کنید
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up { 
          from { opacity: 0; transform: translateY(-15px); } 
          to { opacity: 1; transform: translateY(0); } 
        } 
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        
        input:focus, textarea:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

const pageStyles = {
  container: {
    color: "#fff",
    maxWidth: "100%", 
    margin: "0",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: "24px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #0b0b0d 0%, #0f172a 100%)",
    minHeight: "100vh",
    width: "100%", 
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { 
    margin: 0, 
    fontSize: 32, 
    fontWeight: 900,
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  userTypeBadge: {
    padding: "8px 16px",
    borderRadius: 20,
    background: "linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: 700,
  },
  form: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap",
    width: "100%",
    boxSizing: "border-box",
  },
  leftCol: {
    flexBasis: 340,
    maxWidth: 380,
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxSizing: "border-box",
  },
  rightCol: { 
    flex: 1, 
    minWidth: 300, 
    boxSizing: "border-box",
    animation: "fade-in-up 0.6s ease-out",
  },

  avatarCard: {
    background: "linear-gradient(145deg, #0f1724, #0a0e1a)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
    boxSizing: "border-box",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  avatarWrap: {
    width: 160,
    height: 160,
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #071023, #050a16)",
    boxSizing: "border-box",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  avatar: { 
    width: "100%", 
    height: "100%", 
    objectFit: "cover", 
    display: "block",
    transition: "transform 0.3s ease",
  },
  avatarActions: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 12, 
    width: "100%", 
    alignItems: "center", 
    boxSizing: "border-box" 
  },
  uploadLabel: { 
    display: "inline-block", 
    padding: "12px 20px", 
    borderRadius: 10, 
    background: "linear-gradient(90deg,#2563eb,#7c3aed)", 
    color: "#fff", 
    textAlign: "center", 
    cursor: "pointer", 
    fontWeight: 800,
    width: "100%",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  hint: { 
    fontSize: 13, 
    color: "#94a3b8", 
    textAlign: "center",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    width: "100%",
  },
  secondaryBtn: { 
    padding: "10px 16px", 
    borderRadius: 10, 
    border: "1px solid rgba(255,255,255,0.1)", 
    background: "rgba(255,255,255,0.05)", 
    color: "#cbd5e1", 
    cursor: "pointer", 
    fontWeight: 700,
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  infoCard: { 
    background: "linear-gradient(145deg, #0f1724, #0a0e1a)", 
    padding: 16, 
    borderRadius: 16, 
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  infoRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    padding: "12px 0", 
    borderBottom: "1px dashed rgba(255,255,255,0.05)", 
    gap: 12,
  },
  infoLabel: { 
    color: "#94a3b8", 
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  infoValue: { 
    color: "#fff", 
    fontWeight: 700,
    fontSize: 14,
  },

  reviewsCard: {
    background: "linear-gradient(145deg, #0f1724, #0a0e1a)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    boxSizing: "border-box",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  reviewsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 16,
  },
  reviewsTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#fff",
    background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  averageRating: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: 400,
    overflowY: "auto",
    paddingRight: 8,
  },
  reviewItem: {
    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(10, 14, 26, 0.8))",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.05)",
    transition: "all 0.3s ease",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 16,
  },
  reviewerName: {
    color: "#e2e8f0",
    fontWeight: 800,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
  },
  reviewDate: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  reviewText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
    padding: "12px 0",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  card: { 
    background: "linear-gradient(145deg, #0b0b0d, #0a0e1a)", 
    padding: 24, 
    borderRadius: 20, 
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "2px solid rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  label: { 
    display: "block", 
    marginBottom: 8, 
    fontWeight: 700, 
    color: "#e2e8f0", 
    textAlign: "right",
    fontSize: 14,
  },
  labelSmall: { 
    display: "block", 
    marginBottom: 8, 
    fontWeight: 700, 
    color: "#e2e8f0", 
    textAlign: "right", 
    fontSize: 13,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(145deg, #0a1a2f, #071023)",
    color: "#fff",
    textAlign: "right",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 15,
    transition: "all 0.3s ease",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
  },
  textarea: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "linear-gradient(145deg, #0a1a2f, #071023)",
    color: "#fff",
    textAlign: "right",
    minHeight: 120,
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 15,
    lineHeight: 1.6,
    transition: "all 0.3s ease",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
  },
  rowTwo: { 
    display: "flex", 
    gap: 16, 
    marginTop: 16, 
    alignItems: "flex-start", 
    boxSizing: "border-box" 
  },

  actions: { 
    display: "flex", 
    justifyContent: "flex-end", 
    alignItems: "center", 
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  primaryBtn: { 
    padding: "14px 28px", 
    borderRadius: 12, 
    border: "none", 
    background: "linear-gradient(90deg, #10b981, #059669)", 
    color: "#fff", 
    cursor: "pointer", 
    fontWeight: 800,
    fontSize: 15,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  message: { 
    padding: "12px 20px", 
    borderRadius: 12, 
    border: "1px solid transparent", 
    color: "#fff", 
    fontWeight: 700,
    fontSize: 14,
    animation: "fade-in-up 0.4s ease-out",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
};