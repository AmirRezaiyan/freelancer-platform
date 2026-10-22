import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, CodeXml, Layers, LoaderCircle, Palette, Smartphone, X } from "lucide-react";
import api from "../api/axios";

const categories = [
  { value: "web", label: "توسعه وب", icon: CodeXml },
  { value: "mobile", label: "توسعه موبایل", icon: Smartphone },
  { value: "design", label: "طراحی", icon: Palette },
  { value: "other", label: "سایر", icon: Layers },
];

const skillSuggestions = [
  "React", "JavaScript", "Python", "Django", "Node.js",
  "UI/UX", "Mobile", "Web Design", "Backend", "Frontend",
  "DevOps", "Machine Learning", "Database", "API", "Graphic Design",
];

const toAsciiDigits = (value) => value.replace(/[۰-۹٠-٩]/g, (digit) => {
  const code = digit.charCodeAt(0);
  return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
});

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    category: "web"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [success, setSuccess] = useState(null);
  const errorLabels = {
    general: "خطا",
    title: "عنوان پروژه",
    description: "توضیحات پروژه",
    budget_min: "حداقل بودجه",
    budget_max: "حداکثر بودجه",
    category: "دسته‌بندی",
    skills: "مهارت‌ها",
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));

    setErrors((current) => {
      if (!current?.[name]) return current;
      const next = { ...current };
      delete next[name];
      return Object.keys(next).length ? next : null;
    });
  };

  const addSkills = (skills) => {
    const candidates = skills.map((skill) => skill.trim()).filter(Boolean);
    const existingNames = new Set(selectedSkills.map((skill) => skill.toLocaleLowerCase()));
    const candidateNames = new Set();
    const additions = candidates.filter((skill) => {
      const normalizedName = skill.toLocaleLowerCase();
      if (existingNames.has(normalizedName) || candidateNames.has(normalizedName)) return false;
      candidateNames.add(normalizedName);
      return true;
    });
    const acceptedSkills = additions.slice(0, Math.max(0, 8 - selectedSkills.length));
    const exceededLimit = acceptedSkills.length < additions.length;
    setSelectedSkills((current) => [...current, ...acceptedSkills]);
    setErrors((current) => {
      const next = { ...current };
      if (exceededLimit) next.skills = "حداکثر ۸ مهارت انتخاب کنید.";
      else delete next.skills;
      return Object.keys(next).length ? next : null;
    });
  };

  const handleSkillSelect = (skill) => addSkills([skill]);

  const removeSkill = (skillToRemove) => {
    setSelectedSkills((current) => current.filter((skill) => skill !== skillToRemove));
    setErrors((current) => {
      if (!current?.skills) return current;
      const next = { ...current };
      delete next.skills;
      return Object.keys(next).length ? next : null;
    });
  };

  const handleSkillInput = (e) => {
    const value = e.target.value;
    const parts = value.split(",");
    if (parts.length > 1) addSkills(parts.slice(0, -1));
    setSkillInput(parts.at(-1));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkills([skillInput]);
        setSkillInput("");
      }
    }
    if (e.key === "Backspace" && !skillInput && selectedSkills.length) {
      removeSkill(selectedSkills.at(-1));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!form.title.trim()) validationErrors.title = "عنوان پروژه را وارد کنید.";
    if (!form.description.trim()) validationErrors.description = "توضیحات پروژه را وارد کنید.";
    const budgetMin = Number(form.budget_min);
    const budgetMax = Number(form.budget_max);
    if (!Number.isInteger(budgetMin) || budgetMin < 1) {
      validationErrors.budget_min = "حداقل بودجه باید عدد صحیح و مثبت باشد.";
    }
    if (!Number.isInteger(budgetMax) || budgetMax < 1 || (Number.isInteger(budgetMin) && budgetMax < budgetMin)) {
      validationErrors.budget_max = "حداکثر بودجه باید عدد صحیح و برابر یا بیشتر از حداقل بودجه باشد.";
    }
    if (skillInput.trim()) validationErrors.skills = "برای ثبت مهارت، کلید Enter یا ویرگول را بزنید.";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);
    setErrors(null);
    setSuccess(null);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        budget_min: Number(form.budget_min),
        budget_max: Number(form.budget_max),
        category: form.category, 
        skills: selectedSkills,
      };

      await api.post("/market/projects/", payload);

      setSuccess("پروژه با موفقیت ایجاد شد.");

      setTimeout(() => {
        navigate("/dashboard/projects");
      }, 2000);

    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;

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
    return new Intl.NumberFormat("fa-IR").format(Number(num));
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    const numericValue = toAsciiDigits(value).replace(/[^\d]/g, "");
    setForm((current) => ({ ...current, [name]: numericValue }));
    setErrors((current) => {
      if (!current?.budget_min && !current?.budget_max) return current;
      const next = { ...current };
      delete next.budget_min;
      delete next.budget_max;
      return Object.keys(next).length ? next : null;
    });
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
    <div className="project-create-page" style={styles.container}>
      <header className="project-create-header" style={styles.header}>
        <div className="project-create-breadcrumb" style={styles.breadcrumb}>
          <button
            type="button"
            className="project-create-back"
            onClick={() => navigate("/dashboard/projects")}
            style={styles.breadcrumbButton}
          >
            <ArrowRight size={16} aria-hidden="true" />
            بازگشت به پروژه‌ها
          </button>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbCurrent}>ساخت پروژه</span>
        </div>

        <h1 className="project-create-title" style={styles.title}>ساخت پروژه</h1>
        <p className="project-create-lede" style={{ color: '#94a3b8', margin: 0 }}>
          جزئیات پروژه را ثبت کنید تا فریلنسرها بتوانند پیشنهاد ارسال کنند.
        </p>
      </header>

      <section className="project-create-card" style={styles.card}>
        <div className="project-create-card-header" style={styles.cardHeader}>
          <div className="project-create-card-icon" style={styles.cardIcon}>
            <BriefcaseBusiness size={21} aria-hidden="true" />
          </div>
          <div>
            <h2 className="project-create-card-title" style={styles.cardTitle}>جزئیات پروژه</h2>
            <p className="project-create-card-subtitle" style={styles.cardSubtitle}>
              اطلاعات پروژه را روشن و کامل ثبت کنید تا پیشنهادهای دقیق‌تری دریافت کنید.
            </p>
          </div>
        </div>

        {success && (
          <div className="project-create-success" style={styles.successCard} role="status">
            <div className="project-create-message">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{success}</span>
              <button
                type="button"
                className="project-create-dismiss"
                onClick={() => setSuccess(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                aria-label="بستن پیام موفقیت"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {errors && (
          <div className="project-create-errors" style={styles.errorCard} role="alert">
            <h4 style={styles.errorTitle}>لطفاً خطاهای زیر را اصلاح کنید:</h4>
            {Object.entries(errors).map(([field, message]) => (
              <div key={field} style={styles.errorItem}>
                <span style={styles.errorField}>
                  {`${errorLabels[field] || field}:`}
                </span>
                <span> {message}</span>
              </div>
            ))}
          </div>
        )}

        <form className="project-create-form" onSubmit={submit} style={styles.form} noValidate>
          <div className="project-create-field" style={styles.formGroup}>
            <label htmlFor="create-project-title" style={styles.label}>
              عنوان پروژه *
              <span style={styles.labelHint}>(حداکثر 255 کاراکتر)</span>
            </label>
            <input
              id="create-project-title"
              name="title"
              placeholder="مثال: توسعه وب‌سایت فروشگاهی با React و Django"
              value={form.title}
              onChange={onChange}
              maxLength={255}
              style={styles.input}
              aria-invalid={Boolean(errors?.title)}
              aria-describedby={errors?.title ? "create-project-title-error" : undefined}
              required
            />
            {errors?.title && <span id="create-project-title-error" className="project-form-error">{errors.title}</span>}
            <div style={styles.charCounter}>
              {form.title.length.toLocaleString("fa-IR")}/۲۵۵ کاراکتر
            </div>
          </div>

          <div className="project-create-field" style={styles.formGroup}>
            <label htmlFor="create-project-description" style={styles.label}>
              توضیحات پروژه *
              <span style={styles.labelHint}>(شرح کامل و دقیق پروژه)</span>
            </label>
            <textarea
              id="create-project-description"
              name="description"
              placeholder="پروژه خود را به طور کامل شرح دهید. شامل اهداف، ویژگی‌های مورد نیاز، نکات فنی و هر مورد دیگری که فریلنسر باید بداند..."
              value={form.description}
              onChange={onChange}
              rows={8}
              style={styles.textarea}
              aria-invalid={Boolean(errors?.description)}
              aria-describedby={errors?.description ? "create-project-description-error" : undefined}
              required
            />
            {errors?.description && <span id="create-project-description-error" className="project-form-error">{errors.description}</span>}
            <div style={styles.textareaTips}>
              <span className="project-create-tip" style={styles.tip}>شرح روشن، نیازها و خروجی مورد انتظار را مشخص می‌کند.</span>
            </div>
          </div>

          <div className="project-create-field project-create-budget-field" style={styles.formGroup}>
            <label style={styles.label}>بودجه پروژه (تومان) *</label>
            <div className="project-create-budget-grid" style={styles.budgetContainer}>
              <div style={styles.budgetInputGroup}>
                <label htmlFor="create-project-budget-min" style={styles.budgetLabel}>حداقل بودجه *</label>
                <div className="project-create-currency-input" style={styles.currencyInput}>
                  <input
                    id="create-project-budget-min"
                    name="budget_min"
                    inputMode="numeric"
                    placeholder="مثال: ۱٬۰۰۰٬۰۰۰"
                    value={formatNumber(form.budget_min)}
                    onChange={handleBudgetChange}
                    style={styles.budgetInput}
                    aria-invalid={Boolean(errors?.budget_min)}
                    aria-describedby={errors?.budget_min ? "create-project-budget-min-error" : undefined}
                    required
                  />
                  <span className="project-create-currency" style={styles.currency}>تومان</span>
                </div>
                {errors?.budget_min && <span id="create-project-budget-min-error" className="project-form-error">{errors.budget_min}</span>}
              </div>

              <div style={styles.budgetSeparator}>تا</div>

              <div style={styles.budgetInputGroup}>
                <label htmlFor="create-project-budget-max" style={styles.budgetLabel}>حداکثر بودجه *</label>
                <div className="project-create-currency-input" style={styles.currencyInput}>
                  <input
                    id="create-project-budget-max"
                    name="budget_max"
                    inputMode="numeric"
                    placeholder="مثال: ۵٬۰۰۰٬۰۰۰"
                    value={formatNumber(form.budget_max)}
                    onChange={handleBudgetChange}
                    style={styles.budgetInput}
                    aria-invalid={Boolean(errors?.budget_max)}
                    aria-describedby={errors?.budget_max ? "create-project-budget-max-error" : undefined}
                    required
                  />
                  <span className="project-create-currency" style={styles.currency}>تومان</span>
                </div>
                {errors?.budget_max && <span id="create-project-budget-max-error" className="project-form-error">{errors.budget_max}</span>}
              </div>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '5px' }}>
              بودجه حداقل و حداکثر باید عدد مثبت باشند
            </div>
          </div>

          <div className="project-create-field" style={styles.formGroup}>
            <div style={styles.label} id="project-category-label">دسته‌بندی پروژه *</div>
            <div className="project-create-category-grid" style={styles.categoryGrid} role="group" aria-labelledby="project-category-label">
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                <button
                  key={category.value}
                  type="button"
                  className="project-create-category-option"
                  aria-pressed={form.category === category.value}
                  style={{
                    ...styles.categoryOption,
                    ...(form.category === category.value ? styles.selectedCategory : {})
                  }}
                  onClick={() => setForm((current) => ({ ...current, category: category.value }))}
                >
                  <CategoryIcon size={20} aria-hidden="true" />
                  <div style={styles.categoryLabel}>{category.label}</div>
                </button>
                );
              })}
            </div>
          </div>

          <div className="project-create-field" style={styles.formGroup}>
            <label htmlFor="create-project-skills" style={styles.label}>
              مهارت‌های مورد نیاز
              <span style={styles.labelHint}>(حداکثر ۸ مهارت)</span>
            </label>

            <div className="project-create-skill-picker">
              {selectedSkills.map((skill) => (
                <span key={skill} className="project-create-skill-tag">
                  {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="project-create-skill-remove"
                      aria-label={`حذف مهارت ${skill}`}
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                </span>
              ))}
              <input
                id="create-project-skills"
                placeholder="نام مهارت را وارد کنید و Enter بزنید"
                value={skillInput}
                onChange={handleSkillInput}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => {
                  if (skillInput.trim()) {
                    addSkills([skillInput]);
                    setSkillInput("");
                  }
                }}
                aria-invalid={Boolean(errors?.skills)}
                aria-describedby={errors?.skills ? "create-project-skills-error" : undefined}
              />
            </div>
            {errors?.skills && <span id="create-project-skills-error" className="project-form-error">{errors.skills}</span>}

            <div className="project-create-suggestions" style={styles.skillSuggestions}>
              <span style={styles.suggestionsLabel}>پیشنهادهای مهارت:</span>
              <div className="project-create-suggestion-list" style={styles.suggestionTags}>
                {skillSuggestions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    disabled={selectedSkills.some((item) => item.toLocaleLowerCase() === skill.toLocaleLowerCase()) || selectedSkills.length >= 8}
                    className="project-create-suggestion"
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

          <div className="project-create-actions" style={styles.actionButtons}>
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
                  <LoaderCircle className="project-create-spinner" size={17} aria-hidden="true" />
                  در حال ساخت پروژه...
                </>
              ) : (
                <>
                  <BriefcaseBusiness size={17} aria-hidden="true" />
                  ساخت پروژه
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}