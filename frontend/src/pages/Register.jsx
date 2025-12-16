import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Sparkles, UserPlus, Briefcase, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    email: "", 
    username: "", 
    password: "", 
    confirmPassword: "", 
    user_type: "" 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    if ((name === 'confirmPassword' || name === 'password') && form.confirmPassword) {
      if (value && (name === 'password' ? form.confirmPassword !== value : form.password !== value)) {
        setErrors(prev => ({ ...prev, confirmPassword: "رمز عبور و تکرار آن مطابقت ندارند." }));
      } else if (form.password === (name === 'password' ? value : form.confirmPassword)) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return '#10b981';
    if (passwordStrength >= 50) return '#f59e0b';
    return '#ef4444';
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
    } else {
      if (form.password.length < 8) {
        newErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد.";
      }
      if (!/(?=.*[a-z])/.test(form.password)) {
        newErrors.password = "رمز عبور باید شامل حداقل یک حرف کوچک باشد.";
      }
      if (!/(?=.*[A-Z])/.test(form.password)) {
        newErrors.password = "رمز عبور باید شامل حداقل یک حرف بزرگ باشد.";
      }
      if (!/(?=.*\d)/.test(form.password)) {
        newErrors.password = "رمز عبور باید شامل حداقل یک عدد باشد.";
      }
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "تکرار رمز عبور الزامی است.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "رمز عبور و تکرار آن مطابقت ندارند.";
    }
    
    if (!form.user_type) {
      newErrors.user_type = "لطفاً نوع کاربری خود را انتخاب کنید.";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      const dataToSend = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        confirm_password: form.confirmPassword, 
        user_type: form.user_type,
        first_name: form.username.trim() 
      };

      console.log('Sending data:', dataToSend);

      const response = await api.post('/users/register/', dataToSend);
      
      console.log('Registration successful:', response.data);
      
      navigate("/login", { 
        state: { 
          successMessage: "ثبت‌نام موفقیت‌آمیز بود! لطفاً وارد شوید." 
        } 
      });
      
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = "ثبت‌نام ناموفق بود";
      let fieldErrors = {};
      
      if (err.response) {
        console.log('Error response:', err.response.data);
        
        if (err.response.data && typeof err.response.data === 'object') {
          Object.keys(err.response.data).forEach(key => {
            if (Array.isArray(err.response.data[key])) {
              fieldErrors[key] = err.response.data[key].join(' ');
            } else {
              fieldErrors[key] = err.response.data[key];
            }
          });
          
          if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.non_field_errors) {
            errorMessage = Array.isArray(err.response.data.non_field_errors) 
              ? err.response.data.non_field_errors.join(' ') 
              : err.response.data.non_field_errors;
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.request) {
        errorMessage = "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
      } else {
        errorMessage = "خطای ناشناخته رخ داده است.";
      }
      
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      {met ? (
        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
      ) : (
        <XCircle style={{ width: '16px', height: '16px', color: '#64748b' }} />
      )}
      <span style={{ color: met ? '#10b981' : '#94a3b8', fontSize: '12px' }}>{text}</span>
    </div>
  );

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
          top: 27px;
          transform: translateY(-50%);
          transition: color 0.2s;
          pointer-events: none;
          z-index: 2;
        }
        
        .input-field {
          width: 100%;
          padding: 12px 48px 12px 16px;
          border: 2px solid ${errors.email || errors.username || errors.password || errors.confirmPassword || errors.user_type ? '#ef4444' : '#334155'};
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
          font-size: 14px;
          text-align: right;
          font-family: inherit;
          background: rgba(30, 41, 59, 0.8);
          color: white;
          cursor: pointer;
        }
        
        .input-field::placeholder {
          color: #94a3b8;
        }
        
        select.input-field {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 12px center;
          background-size: 16px;
          padding-right: 48px;
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
          top: 25px;
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
        
        .password-strength {
          margin-top: 8px;
          margin-bottom: 16px;
        }
        
        .strength-bar {
          height: 4px;
          background: #334155;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .strength-fill {
          height: 100%;
          background: ${getPasswordStrengthColor()};
          width: ${passwordStrength}%;
          transition: width 0.3s, background 0.3s;
        }
        
        .strength-text {
          font-size: 12px;
          color: #94a3b8;
          text-align: right;
        }
        
        .password-requirements {
          margin-top: 8px;
          padding: 12px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 8px;
          border: 1px solid #334155;
        }
        
        .requirements-title {
          font-size: 12px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
          text-align: right;
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

            <h2 className="title">ثبت‌نام</h2>
            <p className="subtitle">حساب کاربری خود را بسازید</p>

            {errors.general && (
              <div className="error-box">
                <p className="error-text">{errors.general}</p>
              </div>
            )}

            {errors.non_field_errors && (
              <div className="error-box">
                <p className="error-text">{errors.non_field_errors}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
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
                <div className="input-icon" style={{ color: focusedField === 'username' ? '#6366f1' : '#94a3b8' }}>
                  <User style={{ width: '20px', height: '20px' }} />
                </div>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={onChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="نام نمایشی (اختیاری)"
                  className="input-field"
                  autoComplete="username"
                />
                {errors.first_name && <div className="field-error">{errors.first_name}</div>}
                {errors.username && <div className="field-error">{errors.username}</div>}
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
                  placeholder="رمز عبور (حداقل ۸ کاراکتر، حروف بزرگ و کوچک، عدد)"
                  required
                  className="input-field"
                  autoComplete="new-password"
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
                
                {form.password && (
                  <>
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div className="strength-fill"></div>
                      </div>
                      <div className="strength-text">
                        قدرت رمز عبور: {passwordStrength >= 75 ? 'قوی' : passwordStrength >= 50 ? 'متوسط' : 'ضعیف'}
                      </div>
                    </div>
                    
                    <div className="password-requirements">
                      <div className="requirements-title">نیازمندی‌های رمز عبور:</div>
                      <PasswordRequirement met={form.password.length >= 8} text="حداقل ۸ کاراکتر" />
                      <PasswordRequirement met={/[a-z]/.test(form.password)} text="حداقل یک حرف کوچک" />
                      <PasswordRequirement met={/[A-Z]/.test(form.password)} text="حداقل یک حرف بزرگ" />
                      <PasswordRequirement met={/\d/.test(form.password)} text="حداقل یک عدد" />
                    </div>
                  </>
                )}
              </div>

              <div className="input-group">
                <div className="input-icon" style={{ color: focusedField === 'confirmPassword' ? '#6366f1' : '#94a3b8' }}>
                  <Lock style={{ width: '20px', height: '20px' }} />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="تکرار رمز عبور"
                  required
                  className="input-field"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}
                {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
              </div>

              <div className="input-group">
                <div className="input-icon" style={{ color: focusedField === 'user_type' ? '#6366f1' : '#94a3b8' }}>
                  <Briefcase style={{ width: '20px', height: '20px' }} />
                </div>
                <select
                  name="user_type"
                  value={form.user_type}
                  onChange={onChange}
                  onFocus={() => setFocusedField('user_type')}
                  onBlur={() => setFocusedField(null)}
                  className="input-field"
                  required
                >
                  <option value="" disabled hidden>
                    شما کارفرما هستید یا فریلنسر؟
                  </option>
                  <option value="client">کارفرما</option>
                  <option value="freelancer">فریلنسر</option>
                </select>
                {errors.user_type && <div className="field-error">{errors.user_type}</div>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <>
                    <UserPlus style={{ width: '20px', height: '20px' }} />
                    <span>ثبت‌نام</span>
                  </>
                )}
              </button>
            </form>

            <div className="register-link">
              حساب داری؟{" "}
              <Link to="/login">
                ورود
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}