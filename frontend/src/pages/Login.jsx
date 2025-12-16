import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email.trim()) {
      newErrors.email = "ایمیل الزامی است.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "فرمت ایمیل نامعتبر است.";
    }
    
    if (!form.password) {
      newErrors.password = "رمز عبور الزامی است.";
    } else if (form.password.length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
    }
    
    return newErrors;
  };

  const checkAccountLock = () => {
    if (lockUntil && new Date() < new Date(lockUntil)) {
      const remainingTime = Math.ceil((new Date(lockUntil) - new Date()) / 1000 / 60);
      return `حساب شما به دلیل ورودهای ناموفق متوالی به مدت ${remainingTime} دقیقه قفل شده است.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const lockError = checkAccountLock();
    if (lockError) {
      setErrors({ general: lockError });
      return;
    }
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      await login(form.email, form.password);
      setAttempts(0);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      let errorMessage = "ایمیل یا رمز عبور اشتباه است.";
      
      if (newAttempts >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000); 
        setLockUntil(lockTime);
        errorMessage = "به دلیل ورودهای ناموفق متوالی، حساب شما به مدت ۱۵ دقیقه قفل شد.";
      } else if (newAttempts >= 3) {
        errorMessage = `ایمیل یا رمز عبور اشتباه است. ${5 - newAttempts} تلاش باقی مانده است.`;
      }
      
      setErrors({ 
        general: errorMessage,
        password: "رمز عبور اشتباه است."
      });
      
      setForm({ ...form, password: "" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body, html, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .login-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          overflow: hidden;
        }
        
        .blob-1 {
          position: absolute;
          top: 10%;
          left: 10%;
          width: 300px;
          height: 300px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          filter: blur(60px);
          animation: blob 7s infinite;
        }
        
        .blob-2 {
          position: absolute;
          top: 20%;
          right: 10%;
          width: 300px;
          height: 300px;
          background: rgba(168, 85, 247, 0.2);
          border-radius: 50%;
          filter: blur(60px);
          animation: blob 7s infinite 2s;
        }
        
        .blob-3 {
          position: absolute;
          bottom: 10%;
          left: 30%;
          width: 300px;
          height: 300px;
          background: rgba(236, 72, 153, 0.2);
          border-radius: 50%;
          filter: blur(60px);
          animation: blob 7s infinite 4s;
        }
        
        .card-wrapper {
          position: relative;
          width: 90%;
          max-width: 440px;
          z-index: 10;
          animation: fadeInUp 0.6s ease-out;
        }
        
        .login-card {
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .top-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
        }
        
        .icon-box {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
          margin: 0 auto 24px;
          animation: float 3s ease-in-out infinite;
        }
        
        .title {
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 32px;
          font-size: 14px;
        }
        
        .error-box {
          margin-bottom: 24px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 8px;
          animation: ${errors.general ? 'shake 0.5s ease-in-out' : 'none'};
        }
        
        .error-text {
          color: #fca5a5;
          font-size: 14px;
          font-weight: 500;
          text-align: right;
          margin: 0;
        }
        
        .input-group {
          position: relative;
          margin-bottom: 20px;
        }
        
        .input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          transition: color 0.2s;
          pointer-events: none;
          z-index: 2;
        }
        
        .input-field {
          width: 100%;
          padding: 12px 48px 12px 16px;
          border: 2px solid ${errors.email || errors.password ? '#ef4444' : '#334155'};
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
          font-size: 14px;
          text-align: right;
          font-family: inherit;
          background: rgba(30, 41, 59, 0.8);
          color: white;
        }
        
        .input-field::placeholder {
          color: #94a3b8;
        }
        
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }
        
        .field-error {
          color: #fca5a5;
          font-size: 12px;
          text-align: right;
          margin-top: 4px;
          margin-right: 4px;
        }
        
        .password-toggle {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        
        .password-toggle:hover {
          color: #6366f1;
        }
        
        .submit-btn {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border: none;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-family: inherit;
          margin-top: 8px;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
        }
        
        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        .submit-btn:disabled {
          background: #475569;
          box-shadow: none;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .register-link {
          margin-top: 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
        }
        
        .register-link a {
          color: #6366f1;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .register-link a:hover {
          text-decoration: underline;
          color: #8b5cf6;
        }
        
        .security-info {
          margin-top: 16px;
          padding: 8px 12px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 8px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        
        .attempts-counter {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
          margin-top: 12px;
        }
      `}</style>

      <div className="login-container">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>

        <div className="card-wrapper">
          <div className="login-card">
            <div className="top-gradient"></div>
            
            <div className="icon-box">
              <Sparkles style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>

            <h2 className="title">خوش آمدید</h2>
            <p className="subtitle">لطفاً وارد حساب خود شوید</p>

            {errors.general && (
              <div className="error-box">
                <p className="error-text">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <div className="input-icon" style={{ color: focusedField === 'email' ? '#6366f1' : '#94a3b8' }}>
                  <Mail style={{ width: '20px', height: '20px' }} />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="ایمیل"
                  required
                  className="input-field"
                  autoComplete="email"
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="input-group">
                <div className="input-icon" style={{ color: focusedField === 'password' ? '#6366f1' : '#94a3b8' }}>
                  <Lock style={{ width: '20px', height: '20px' }} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="رمز عبور"
                  required
                  className="input-field"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              {attempts > 0 && attempts < 5 && (
                <div className="attempts-counter">
                  تعداد تلاش‌های ناموفق: {attempts} از ۵
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  <>
                    <LogIn style={{ width: '20px', height: '20px' }} />
                    <span>ورود</span>
                  </>
                )}
              </button>
            </form>

            {/* <div className="security-info">
              برای امنیت بیشتر، پس از ۵ تلاش ناموفق، حساب به مدت ۱۵ دقیقه قفل می‌شود.
            </div> */}

            <div className="register-link">
              حساب نداری؟ <Link to="/register">ثبت‌نام کن</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}