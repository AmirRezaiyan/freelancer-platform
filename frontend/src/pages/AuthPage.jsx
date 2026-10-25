import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpLeft, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { AuthContext } from "../context/auth-context";
import { registrationRole } from "../utils/landingRoutes";
import "../styles/auth.css";

function normalizeErrors(error) {
  if (typeof error === "string") return { general: error };
  if (!error || typeof error !== "object") return { general: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید." };

  const normalized = {};
  for (const [field, value] of Object.entries(error)) {
    normalized[field] = Array.isArray(value) ? value.join(" ") : String(value);
  }
  if (normalized.detail || normalized.non_field_errors) {
    normalized.general = normalized.detail || normalized.non_field_errors;
  }
  return normalized;
}

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    email: "",
    password: "",
    confirmPassword: "",
    userType: isLogin ? "" : registrationRole(location.search),
  }));
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, general: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = {};
    if (!form.email.trim()) {
      validationErrors.email = "ایمیل الزامی است.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      validationErrors.email = "فرمت ایمیل نامعتبر است.";
    }
    if (!form.password) {
      validationErrors.password = "رمز عبور الزامی است.";
    } else if (isLogin && form.password.length < 6) {
      validationErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    } else if (!isLogin && form.password.length < 8) {
      validationErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد.";
    } else if (!isLogin && !/[a-z]/.test(form.password)) {
      validationErrors.password = "رمز عبور باید شامل حداقل یک حرف کوچک باشد.";
    } else if (!isLogin && !/[A-Z]/.test(form.password)) {
      validationErrors.password = "رمز عبور باید شامل حداقل یک حرف بزرگ باشد.";
    } else if (!isLogin && !/\d/.test(form.password)) {
      validationErrors.password = "رمز عبور باید شامل حداقل یک عدد باشد.";
    }
    if (!isLogin && !form.confirmPassword) {
      validationErrors.confirmPassword = "تکرار رمز عبور الزامی است.";
    } else if (!isLogin && form.password !== form.confirmPassword) {
      validationErrors.confirmPassword = "رمزهای عبور با هم یکسان نیستند.";
    }
    if (!isLogin && !form.userType) {
      validationErrors.user_type = "لطفاً نوع کاربری خود را انتخاب کنید.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const result = isLogin
        ? await login(form.email.trim(), form.password)
        : await register(form.email.trim(), form.password, form.userType);

      if (!result?.success) {
        setErrors(normalizeErrors(result?.error));
        return;
      }

      if (isLogin) {
        const requestedDestination = location.state?.from;
        const destination = requestedDestination
          ? `${requestedDestination.pathname}${requestedDestination.search || ""}${requestedDestination.hash || ""}`
          : "/dashboard";
        navigate(destination, { replace: true });
      } else {
        navigate("/login", {
          replace: true,
          state: { successMessage: "حساب شما ساخته شد. حالا می‌توانید وارد شوید." },
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) => errors[name] && (
    <span className="auth-field-error" id={`${name}-error`}>
      {errors[name]}
    </span>
  );

  return (
    <main className={`auth-screen ${isLogin ? "auth-screen-login" : "auth-screen-register"}`} dir="rtl">
      <section className="auth-form-panel" aria-labelledby="auth-title">
        <Link className="auth-wordmark" to="/login" aria-label="همکار، صفحه ورود">
          <span className="auth-wordmark-mark">م</span>
          <span>Hamkar</span>
        </Link>

        <div className="auth-form-content">
          <p className="auth-eyebrow">بازار کار مستقل‌ها</p>
          <h1 id="auth-title">{isLogin ? "خوش برگشتید" : "شروع یک همکاری خوب"}</h1>
          <p className="auth-description">
            {isLogin
              ? "برای ادامهٔ همکاری‌ها و دیدن پروژه‌های خود وارد حساب شوید."
              : "برای ارتباط مستقیم میان کارفرماها و متخصصان، حساب خود را بسازید."}
          </p>

          {!isLogin && (
            <fieldset className="auth-role-fieldset">
              <legend>نقش شما در بازار کار</legend>
              <div className="auth-role-options">
                <label className={form.userType === "freelancer" ? "auth-role-option selected" : "auth-role-option"}>
                  <input type="radio" name="userType" value="freelancer" checked={form.userType === "freelancer"} onChange={update} />
                  <span className="auth-role-title">فریلنسر</span>
                  <span className="auth-role-copy">پروژه پیدا کنید و پیشنهاد بفرستید</span>
                </label>
                <label className={form.userType === "client" ? "auth-role-option selected" : "auth-role-option"}>
                  <input type="radio" name="userType" value="client" checked={form.userType === "client"} onChange={update} />
                  <span className="auth-role-title">کارفرما</span>
                  <span className="auth-role-copy">پروژه منتشر کنید و پیشنهادها را ببینید</span>
                </label>
              </div>
              {fieldError("user_type")}
            </fieldset>
          )}

          {location.state?.successMessage && (
            <div className="auth-notice auth-notice-success" role="status">
              {location.state.successMessage}
            </div>
          )}
          {errors.general && (
            <div className="auth-notice auth-notice-error" role="alert">
              {errors.general}
            </div>
          )}

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label htmlFor="auth-email">ایمیل</label>
              <div className="auth-input-wrap" dir="ltr">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={update}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
              </div>
              {fieldError("email")}
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">رمز عبور</label>
              <div className="auth-input-wrap" dir="ltr">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="auth-password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "رمز عبور حساب" : "حداقل ۸ کاراکتر"}
                  value={form.password}
                  onChange={update}
                  minLength={isLogin ? undefined : 8}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  required
                />
                <button
                  className="auth-visibility-button"
                  type="button"
                  aria-label={passwordVisible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldError("password")}
              {!isLogin && <span className="auth-field-hint">حداقل ۸ کاراکتر، شامل حروف کوچک و بزرگ و یک عدد.</span>}
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="auth-confirm-password">تکرار رمز عبور</label>
                <div className="auth-input-wrap" dir="ltr">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={confirmationVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={form.confirmPassword}
                    onChange={update}
                    aria-invalid={Boolean(errors.confirmPassword || errors.confirm_password)}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : errors.confirm_password ? "confirm_password-error" : undefined}
                    required
                  />
                  <button
                    className="auth-visibility-button"
                    type="button"
                    aria-label={confirmationVisible ? "پنهان کردن تکرار رمز" : "نمایش تکرار رمز"}
                    aria-pressed={confirmationVisible}
                    onClick={() => setConfirmationVisible((visible) => !visible)}
                  >
                    {confirmationVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldError("confirmPassword")}
                {fieldError("confirm_password")}
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "در حال بررسی..." : isLogin ? "ورود به حساب" : "ساخت حساب"}
              {!submitting && <ArrowUpLeft size={18} aria-hidden="true" />}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "حساب کاربری ندارید؟" : "قبلاً حساب ساخته‌اید؟"}{" "}
            <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "ثبت‌نام" : "ورود"}</Link>
          </p>
        </div>
      </section>

      <aside className="auth-visual" aria-label="فضای کاری حرفه‌ای و همکاری تیمی">
        <img
          className="auth-visual-image"
          src={isLogin ? "/images/collaboration.jpg" : "/images/developer.jpg"}
          alt={isLogin ? "متخصصان در حال همکاری پیرامون یک میز کار" : "فضای کاری توسعه‌دهنده با لپ‌تاپ و کد"}
          fetchPriority="high"
        />
        <div className="auth-visual-shade" />
        <div className="auth-visual-content">
          <span className="auth-visual-label">کار حرفه‌ای، ارتباط مستقیم</span>
          <p>{isLogin ? "همکاری بعدی‌تان را از جایی ادامه دهید که متوقف شد." : "مهارت‌ها و فرصت‌ها را در یک فضای کاری روشن به هم وصل کنید."}</p>
          <span className="auth-visual-index">HAMKAR <span>۰{isLogin ? "۱" : "۲"}</span></span>
        </div>
      </aside>
    </main>
  );
}