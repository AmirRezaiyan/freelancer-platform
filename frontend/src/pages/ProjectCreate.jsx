import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function ProjectCreate() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    skills: "",
    category: "web", 
    deadline: "",
    project_type: "fixed",
    experience_level: "intermediate",
    duration: "",
    location: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [categories] = useState([
    { value: "web", label: "توسعه وب", icon: "🌐" },
    { value: "mobile", label: "توسعه موبایل", icon: "📱" },
    { value: "design", label: "طراحی", icon: "🎨" },
    { value: "other", label: "سایر", icon: "📦" }
  ]);

  const [skillSuggestions] = useState([
    "React", "JavaScript", "Python", "Django", "Node.js",
    "UI/UX", "Mobile", "Web Design", "Backend", "Frontend",
    "DevOps", "Machine Learning", "Database", "API", "Graphic Design"
  ]);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [success, setSuccess] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors && errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 8) {
      setSelectedSkills([...selectedSkills, skill]);
      setForm({
        ...form,
        skills: [...selectedSkills, skill].join(", ")
      });
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    setForm({
      ...form,
      skills: newSkills.join(", ")
    });
  };

  const handleSkillInput = (e) => {
    const value = e.target.value;
    setForm({ ...form, skills: value });

    const skillsArray = value.split(",").map(s => s.trim()).filter(Boolean);
    setSelectedSkills(skillsArray);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    setSuccess(null);

    try {
      console.log("داده‌های فرم:", form);
      console.log("دسته‌بندی انتخاب شده:", form.category);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        budget_min: form.budget_min ? parseInt(form.budget_min.replace(/,/g, '')) : 0,
        budget_max: form.budget_max ? parseInt(form.budget_max.replace(/,/g, '')) : 0,
        category: form.category, 
        skills: selectedSkills.length > 0 ? selectedSkills :
          form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      };

      if (form.deadline) payload.deadline = form.deadline;
      if (form.project_type) payload.project_type = form.project_type;
      if (form.experience_level) payload.experience_level = form.experience_level;
      if (form.duration) payload.duration = form.duration;
      if (form.location) payload.location = form.location;

      console.log("Payload ارسالی به /market/projects/:", payload);

      const response = await api.post("/market/projects/", payload);
      console.log("پاسخ سرور:", response.data);

      setSuccess("✅ پروژه با موفقیت ایجاد شد!");

      setTimeout(() => {
        navigate("/dashboard/projects");
      }, 2000);

    } catch (err) {
      console.error("خطا در ایجاد پروژه:", err);

      if (err.response) {
        const errorData = err.response.data;
        console.error("داده‌های خطا:", errorData);

        if (typeof errorData === 'string') {
          setErrors({ general: errorData });
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else if (errorData.message) {
          setErrors({ general: errorData.message });
        } else {
          const formattedErrors = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              formattedErrors[key] = errorData[key].join(", ");
            } else if (typeof errorData[key] === 'string') {
              formattedErrors[key] = errorData[key];
            } else {
              formattedErrors[key] = JSON.stringify(errorData[key]);
            }
          });

          setErrors(formattedErrors);
        }

        if (err.response.status === 400) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (err.request) {
        setErrors({ general: "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید." });
      } else {
        setErrors({ general: "خطای ناشناخته ای رخ داده است." });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^\d]/g, '');
    setForm({ ...form, [name]: numericValue });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f1419 100%)',
      color: '#fff',
      padding: '20px',
      maxWidth: '100%', 
      margin: '0',
      width: '100%', 
      boxSizing: 'border-box',
    },
    header: {
      background: 'rgba(17, 24, 39, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },

    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      color: '#94a3b8',
      fontSize: '14px',
    },

    breadcrumbButton: {
      background: 'none',
      border: 'none',
      color: '#60a5fa',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      padding: 0,
    },

    breadcrumbSeparator: {
      opacity: 0.5,
    },

    breadcrumbCurrent: {
      color: '#cbd5e1',
    },

    title: {
      fontSize: '32px',
      fontWeight: '900',
      margin: '0 0 10px 0',
      background: 'linear-gradient(135deg, #fff 0%, #a0aec0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },

    card: {
      background: 'rgba(17, 24, 39, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },

    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },

    cardIcon: {
      fontSize: '40px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      width: '60px',
      height: '60px',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cardTitle: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '800',
      color: '#fff',
    },

    cardSubtitle: {
      margin: '8px 0 0 0',
      color: '#94a3b8',
      fontSize: '15px',
      lineHeight: '1.6',
    },

    errorCard: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '25px',
    },

    errorTitle: {
      margin: '0 0 10px 0',
      color: '#fca5a5',
      fontSize: '16px',
    },

    errorItem: {
      marginBottom: '8px',
      fontSize: '14px',
      color: '#fca5a5',
    },

    errorField: {
      fontWeight: '700',
    },

    successCard: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '25px',
      color: '#a7f3d0',
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },

    label: {
      color: '#e2e8f0',
      fontSize: '16px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    labelHint: {
      color: '#94a3b8',
      fontSize: '13px',
      fontWeight: '400',
    },

    input: {
      padding: '15px',
      borderRadius: '10px',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.3s ease',
      width: '100%',
      boxSizing: 'border-box',
    },

    textarea: {
      padding: '15px',
      borderRadius: '10px',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      transition: 'all 0.3s ease',
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '150px',
      fontFamily: 'inherit',
    },

    select: {
      padding: '15px',
      borderRadius: '10px',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
      cursor: 'pointer',
      width: '100%',
    },

    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginTop: '10px',
    },

    categoryOption: {
      padding: '15px',
      borderRadius: '10px',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '2px solid rgba(255, 255, 255, 0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    },

    categoryIcon: {
      fontSize: '24px',
      marginBottom: '8px',
    },

    categoryLabel: {
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
    },

    selectedCategory: {
      borderColor: '#3b82f6',
      background: 'rgba(59, 130, 246, 0.1)',
    },

    charCounter: {
      textAlign: 'left',
      color: '#94a3b8',
      fontSize: '13px',
      marginTop: '5px',
    },

    textareaTips: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
    },

    tip: {
      color: '#60a5fa',
      fontSize: '13px',
      fontWeight: '600',
    },

    budgetContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
    },

    budgetInputGroup: {
      flex: 1,
      minWidth: '200px',
    },

    budgetLabel: {
      color: '#94a3b8',
      fontSize: '14px',
      marginBottom: '8px',
      display: 'block',
    },

    currencyInput: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      overflow: 'hidden',
    },

    budgetInput: {
      flex: 1,
      padding: '15px',
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '15px',
      outline: 'none',
    },

    currency: {
      padding: '0 15px',
      color: '#94a3b8',
      fontSize: '14px',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    },

    budgetSeparator: {
      color: '#94a3b8',
      fontSize: '14px',
      fontWeight: '600',
    },

    selectedSkills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '15px',
    },

    skillTag: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
      color: '#fff',
      padding: '8px 15px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    removeSkillBtn: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      color: '#fff',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    skillSuggestions: {
      marginTop: '15px',
    },

    suggestionsLabel: {
      color: '#94a3b8',
      fontSize: '14px',
      marginBottom: '10px',
      display: 'block',
    },

    suggestionTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },

    suggestionTag: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#cbd5e1',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '25px',
    },

    radioGroup: {
      display: 'flex',
      gap: '20px',
      marginTop: '8px',
    },

    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      color: '#cbd5e1',
      fontSize: '15px',
    },

    radio: {
      margin: 0,
    },

    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      marginTop: '30px',
      paddingTop: '25px',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    },

    cancelButton: {
      background: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#94a3b8',
      padding: '15px 30px',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '120px',
    },

    submitButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      border: 'none',
      color: '#fff',
      padding: '15px 40px',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
      minWidth: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.breadcrumb}>
          <button
            onClick={() => navigate("/dashboard/projects")}
            style={styles.breadcrumbButton}
          >
            ← بازگشت به پروژه‌ها
          </button>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>ایجاد پروژه جدید</span>
        </div>

        <h1 style={styles.title}>ایجاد پروژه جدید</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          پروژه خود را ایجاد کنید تا فریلنسرهای مناسب برای آن درخواست دهند
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardIcon}>🚀</div>
          <div>
            <h2 style={styles.cardTitle}>جزئیات پروژه</h2>
            <p style={styles.cardSubtitle}>
              اطلاعات پروژه خود را با دقت وارد کنید تا فریلنسرهای مناسب را جذب نمایید
            </p>
          </div>
        </div>

        {success && (
          <div style={styles.successCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{success}</span>
              <button
                onClick={() => setSuccess(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {errors && (
          <div style={styles.errorCard}>
            <h4 style={styles.errorTitle}>لطفاً خطاهای زیر را اصلاح کنید:</h4>
            {Object.entries(errors).map(([field, message]) => (
              <div key={field} style={styles.errorItem}>
                <span style={styles.errorField}>
                  {field === 'general' ? 'خطا:' : `${field}:`}
                </span>
                <span> {message}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              عنوان پروژه *
              <span style={styles.labelHint}>(حداکثر 255 کاراکتر)</span>
            </label>
            <input
              name="title"
              placeholder="مثال: توسعه وب‌سایت فروشگاهی با React و Django"
              value={form.title}
              onChange={onChange}
              maxLength={255}
              style={styles.input}
              required
            />
            <div style={styles.charCounter}>
              {form.title.length}/255 کاراکتر
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              توضیحات پروژه *
              <span style={styles.labelHint}>(شرح کامل و دقیق پروژه)</span>
            </label>
            <textarea
              name="description"
              placeholder="پروژه خود را به طور کامل شرح دهید. شامل اهداف، ویژگی‌های مورد نیاز، نکات فنی و هر مورد دیگری که فریلنسر باید بداند..."
              value={form.description}
              onChange={onChange}
              rows={8}
              style={styles.textarea}
              required
            />
            <div style={styles.textareaTips}>
              <span style={styles.tip}>💡 نکته: توضیحات کامل شانس موفقیت پروژه را ۴۰٪ افزایش می‌دهد</span>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>بودجه پروژه (تومان) *</label>
            <div style={styles.budgetContainer}>
              <div style={styles.budgetInputGroup}>
                <label style={styles.budgetLabel}>حداقل بودجه *</label>
                <div style={styles.currencyInput}>
                  <input
                    name="budget_min"
                    placeholder="مثال: 1000000"
                    value={formatNumber(form.budget_min)}
                    onChange={handleBudgetChange}
                    style={styles.budgetInput}
                    required
                  />
                  <span style={styles.currency}>تومان</span>
                </div>
              </div>

              <div style={styles.budgetSeparator}>تا</div>

              <div style={styles.budgetInputGroup}>
                <label style={styles.budgetLabel}>حداکثر بودجه *</label>
                <div style={styles.currencyInput}>
                  <input
                    name="budget_max"
                    placeholder="مثال: 5000000"
                    value={formatNumber(form.budget_max)}
                    onChange={handleBudgetChange}
                    style={styles.budgetInput}
                    required
                  />
                  <span style={styles.currency}>تومان</span>
                </div>
              </div>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '5px' }}>
              بودجه حداقل و حداکثر باید عدد مثبت باشند
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>دسته‌بندی پروژه *</label>
            <div style={styles.categoryGrid}>
              {categories.map((category) => (
                <div
                  key={category.value}
                  style={{
                    ...styles.categoryOption,
                    ...(form.category === category.value ? styles.selectedCategory : {})
                  }}
                  onClick={() => setForm({ ...form, category: category.value })}
                >
                  <div style={styles.categoryIcon}>{category.icon}</div>
                  <div style={styles.categoryLabel}>{category.label}</div>
                </div>
              ))}
            </div>
            <input
              type="hidden"
              name="category"
              value={form.category}
              onChange={onChange}
              required
            />
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '5px' }}>
              انتخاب شده: {categories.find(c => c.value === form.category)?.label}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              مهارت‌های مورد نیاز
              <span style={styles.labelHint}>(حداکثر ۸ مهارت، با کاما جدا کنید)</span>
            </label>

            {selectedSkills.length > 0 && (
              <div style={styles.selectedSkills}>
                {selectedSkills.map((skill, index) => (
                  <div key={index} style={styles.skillTag}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      style={styles.removeSkillBtn}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              name="skills"
              placeholder="مثال: React, JavaScript, Python, Django"
              value={form.skills}
              onChange={handleSkillInput}
              style={styles.input}
            />

            <div style={styles.skillSuggestions}>
              <span style={styles.suggestionsLabel}>پیشنهادهای سریع:</span>
              <div style={styles.suggestionTags}>
                {skillSuggestions.map((skill, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    disabled={selectedSkills.includes(skill)}
                    style={{
                      ...styles.suggestionTag,
                      opacity: selectedSkills.includes(skill) ? 0.5 : 1
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px' }}>
              ⚙️ تنظیمات پیشرفته (اختیاری)
            </h3>

            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>نوع پروژه</label>
                <select
                  name="project_type"
                  value={form.project_type}
                  onChange={onChange}
                  style={styles.select}
                >
                  <option value="fixed">قیمت ثابت</option>
                  <option value="hourly">ساعتی</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>سطح تجربه مورد نیاز</label>
                <select
                  name="experience_level"
                  value={form.experience_level}
                  onChange={onChange}
                  style={styles.select}
                >
                  <option value="beginner">مبتدی</option>
                  <option value="intermediate">متوسط</option>
                  <option value="expert">حرفه‌ای</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>مدت زمان تخمینی</label>
                <input
                  name="duration"
                  placeholder="مثال: ۲ هفته"
                  value={form.duration}
                  onChange={onChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>مهلت تحویل</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={onChange}
                  style={styles.input}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>موقعیت مکانی</label>
                <input
                  name="location"
                  placeholder="مثال: تهران، ایران"
                  value={form.location}
                  onChange={onChange}
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          <div style={styles.actionButtons}>
            <button
              type="button"
              onClick={() => navigate("/dashboard/projects")}
              style={styles.cancelButton}
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  در حال ایجاد پروژه...
                </>
              ) : (
                '🚀 ایجاد پروژه'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}