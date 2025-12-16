import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    skills: "",
    category: "other"
  });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : null;
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get(`/market/projects/${id}/`);
        if (!mounted) return;
        setProject(res.data);
        setForm({
          title: res.data.title || "",
          description: res.data.description || "",
          budget_min: res.data.budget_min || "",
          budget_max: res.data.budget_max || "",
          skills: Array.isArray(res.data.skills) ? res.data.skills.join(", ") : (res.data.skills || ""),
          category: res.data.category || "other"
        });
      } catch (err) {
        console.error("load project error", err);
        setMessage({ type: "error", text: "خطا در بارگذاری پروژه یا دسترسی ندارید." });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => mounted = false;
  }, [id]);

  function validateForm() {
    const errors = {};
    
    if (!form.title.trim()) {
      errors.title = "عنوان پروژه ضروری است";
    }
    
    if (!form.description.trim()) {
      errors.description = "توضیحات پروژه ضروری است";
    }
    
    const budgetMin = parseFloat(form.budget_min);
    const budgetMax = parseFloat(form.budget_max);
    
    if (isNaN(budgetMin) || budgetMin < 0) {
      errors.budget_min = "مقدار بودجه باید یک عدد معتبر و مثبت باشد";
    }
    
    if (isNaN(budgetMax) || budgetMax < 0) {
      errors.budget_max = "مقدار بودجه باید یک عدد معتبر و مثبت باشد";
    }
    
    if (!isNaN(budgetMin) && !isNaN(budgetMax) && budgetMin > budgetMax) {
      errors.budget_max = "حداکثر بودجه باید بیشتر از حداقل بودجه باشد";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: "error", text: "برای ویرایش باید وارد شوید." });
      return;
    }
    
    if (!validateForm()) {
      setMessage({ type: "error", text: "لطفا خطاهای فرم را برطرف کنید." });
      return;
    }
    
    setSubmitting(true);
    try {
      api.defaults.withCredentials = true;
      const csrftoken = getCookie("csrftoken");
      const headers = {};
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        budget_min: parseInt(form.budget_min) || 0,
        budget_max: parseInt(form.budget_max) || 0,
        category: form.category,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean)
      };

      await api.put(`/market/projects/${id}/`, payload, { headers });
      setMessage({ type: "success", text: "پروژه با موفقیت به‌روز شد." });
      
      setTimeout(() => {
        navigate(`/dashboard/projects/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error("update project error", err);
      let text = "خطا در به‌روزرسانی پروژه";
      const serverData = err?.response?.data;
      
      if (serverData) {
        if (serverData.detail) {
          text = serverData.detail;
        } else if (typeof serverData === 'object') {
          const errors = [];
          Object.keys(serverData).forEach(key => {
            if (Array.isArray(serverData[key])) {
              errors.push(...serverData[key]);
            } else {
              errors.push(serverData[key]);
            }
          });
          text = errors.join("، ");
        }
      }
      
      setMessage({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#000000"
    }}>
      در حال بارگذاری...
    </div>
  );

  if (!project) return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
      color: "#ff6b6b",
      backgroundColor: "#000000"
    }}>
      پروژه‌ای یافت نشد یا دسترسی ندارید.
    </div>
  );

  const clientId = typeof project.client === "number" ? project.client : project.client?.id;
  if (user?.id !== clientId) return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "18px",
      color: "#ff6b6b",
      backgroundColor: "#000000"
    }}>
      شما اجازهٔ ویرایش این پروژه را ندارید.
    </div>
  );

  return (
    <div style={{
      backgroundColor: "#000000",
      color: "#ffffff",
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#111111",
        borderRadius: "12px",
        padding: "32px",
        border: "1px solid #333333",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)"
      }}>
        <h2 style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: "24px",
          borderBottom: "2px solid #3b82f6",
          paddingBottom: "12px",
          textAlign: "right"
        }}>
          ویرایش پروژه
        </h2>
        
        {message && (
          <div style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "8px",
            backgroundColor: message.type === "error" ? "#450a0a" : "#052e16",
            color: message.type === "error" ? "#fca5a5" : "#86efac",
            border: `1px solid ${message.type === "error" ? "#7f1d1d" : "#14532d"}`,
            fontSize: "14px",
            textAlign: "center",
            direction: "rtl"
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ direction: "rtl" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#d1d5db",
              marginBottom: "8px",
              marginRight: "4px"
            }}>
              عنوان پروژه
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => {
                setForm({...form, title: e.target.value});
                if (formErrors.title) {
                  setFormErrors({...formErrors, title: ""});
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                border: `2px solid ${formErrors.title ? "#ef4444" : "#374151"}`,
                borderRadius: "8px",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                transition: "all 0.2s",
                outline: "none",
                boxSizing: "border-box",
                direction: "rtl"
              }}
              onFocus={e => e.target.style.borderColor = formErrors.title ? "#ef4444" : "#3b82f6"}
              onBlur={e => e.target.style.borderColor = formErrors.title ? "#ef4444" : "#374151"}
            />
            {formErrors.title && (
              <div style={{
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "6px",
                marginRight: "4px"
              }}>
                {formErrors.title}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#d1d5db",
              marginBottom: "8px",
              marginRight: "4px"
            }}>
              توضیحات پروژه
            </label>
            <textarea
              value={form.description}
              onChange={e => {
                setForm({...form, description: e.target.value});
                if (formErrors.description) {
                  setFormErrors({...formErrors, description: ""});
                }
              }}
              rows={6}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                border: `2px solid ${formErrors.description ? "#ef4444" : "#374151"}`,
                borderRadius: "8px",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                transition: "all 0.2s",
                outline: "none",
                resize: "vertical",
                minHeight: "120px",
                boxSizing: "border-box",
                fontFamily: "inherit",
                direction: "rtl"
              }}
              onFocus={e => e.target.style.borderColor = formErrors.description ? "#ef4444" : "#3b82f6"}
              onBlur={e => e.target.style.borderColor = formErrors.description ? "#ef4444" : "#374151"}
            />
            {formErrors.description && (
              <div style={{
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "6px",
                marginRight: "4px"
              }}>
                {formErrors.description}
              </div>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px"
          }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#d1d5db",
                marginBottom: "8px",
                marginRight: "4px"
              }}>
                حداقل بودجه (تومان)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.budget_min}
                onChange={e => {
                  setForm({...form, budget_min: e.target.value});
                  if (formErrors.budget_min || formErrors.budget_max) {
                    setFormErrors({
                      ...formErrors, 
                      budget_min: "",
                      budget_max: formErrors.budget_max?.includes("حداکثر") ? "" : formErrors.budget_max
                    });
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "14px",
                  border: `2px solid ${formErrors.budget_min ? "#ef4444" : "#374151"}`,
                  borderRadius: "8px",
                  backgroundColor: "#1f2937",
                  color: "#ffffff",
                  transition: "all 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right"
                }}
                onFocus={e => e.target.style.borderColor = formErrors.budget_min ? "#ef4444" : "#3b82f6"}
                onBlur={e => e.target.style.borderColor = formErrors.budget_min ? "#ef4444" : "#374151"}
              />
              {formErrors.budget_min && (
                <div style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  marginTop: "6px",
                  marginRight: "4px",
                  direction: "rtl"
                }}>
                  {formErrors.budget_min}
                </div>
              )}
            </div>
            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#d1d5db",
                marginBottom: "8px",
                marginRight: "4px"
              }}>
                حداکثر بودجه (تومان)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.budget_max}
                onChange={e => {
                  setForm({...form, budget_max: e.target.value});
                  if (formErrors.budget_max || formErrors.budget_min) {
                    setFormErrors({
                      ...formErrors, 
                      budget_max: "",
                      budget_min: formErrors.budget_min?.includes("حداکثر") ? "" : formErrors.budget_min
                    });
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "14px",
                  border: `2px solid ${formErrors.budget_max ? "#ef4444" : "#374151"}`,
                  borderRadius: "8px",
                  backgroundColor: "#1f2937",
                  color: "#ffffff",
                  transition: "all 0.2s",
                  outline: "none",
                  boxSizing: "border-box",
                  direction: "ltr",
                  textAlign: "right"
                }}
                onFocus={e => e.target.style.borderColor = formErrors.budget_max ? "#ef4444" : "#3b82f6"}
                onBlur={e => e.target.style.borderColor = formErrors.budget_max ? "#ef4444" : "#374151"}
              />
              {formErrors.budget_max && (
                <div style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  marginTop: "6px",
                  marginRight: "4px",
                  direction: "rtl"
                }}>
                  {formErrors.budget_max}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#d1d5db",
              marginBottom: "8px",
              marginRight: "4px"
            }}>
              مهارت‌های مورد نیاز (با کاما جدا کنید)
            </label>
            <input
              type="text"
              value={form.skills}
              onChange={e => setForm({...form, skills: e.target.value})}
              placeholder="مثال: React, JavaScript, طراحی UI"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                border: "2px solid #374151",
                borderRadius: "8px",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                transition: "all 0.2s",
                outline: "none",
                boxSizing: "border-box",
                direction: "rtl"
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#374151"}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#d1d5db",
              marginBottom: "8px",
              marginRight: "4px"
            }}>
              دسته‌بندی
            </label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                border: "2px solid #374151",
                borderRadius: "8px",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                transition: "all 0.2s",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d1d5db'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left 16px center",
                backgroundSize: "16px",
                paddingLeft: "45px",
                direction: "rtl"
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#374151"}
            >
              <option value="web" style={{ backgroundColor: "#1f2937", color: "#ffffff" }}>توسعه وب</option>
              <option value="mobile" style={{ backgroundColor: "#1f2937", color: "#ffffff" }}>توسعه موبایل</option>
              <option value="design" style={{ backgroundColor: "#1f2937", color: "#ffffff" }}>طراحی</option>
              <option value="other" style={{ backgroundColor: "#1f2937", color: "#ffffff" }}>سایر</option>
            </select>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            marginTop: "32px",
            borderTop: "1px solid #374151",
            paddingTop: "24px"
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#ffffff",
                backgroundColor: "#374151",
                border: "2px solid #4b5563",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                flex: 1
              }}
              onMouseOver={e => e.target.style.backgroundColor = "#4b5563"}
              onMouseOut={e => e.target.style.backgroundColor = "#374151"}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#ffffff",
                backgroundColor: submitting ? "#6b7280" : "#3b82f6",
                border: "none",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                flex: 1
              }}
              onMouseOver={e => !submitting && (e.target.style.backgroundColor = "#2563eb")}
              onMouseOut={e => !submitting && (e.target.style.backgroundColor = "#3b82f6")}
            >
              {submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}