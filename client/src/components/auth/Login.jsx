import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import icons
import "./Login.css"; // Create this CSS file

// Simple translation object (can be expanded or moved to a shared file)
const translations = {
  en: {
    logInTitle: "Log in",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    logInButton: "Log in",
    dontHaveAccount: "Don't have an account?",
    createOne: "Create one",
    or: "or",
    signInWithGoogle: "Sign in with Google",
    english: "English (en)",
    arabic: "Arabic (ar)",
    fillAllFields: "Please fill in both email and password.",
    loginFailed: "Login failed. Please check your credentials.",
    loggingIn: "Logging in...",
    loginSuccess: "Login successful!", // Optional success message
  },
  ar: {
    logInTitle: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    rememberMe: "تذكرنى",
    forgotPassword: "هل نسيت كلمة السر؟",
    logInButton: "تسجيل الدخول",
    dontHaveAccount: "ليس لديك حساب؟",
    createOne: "أنشئ حسابًا",
    or: "أو",
    signInWithGoogle: "تسجيل الدخول باستخدام جوجل",
    english: "الإنجليزية (en)",
    arabic: "العربية (ar)",
    fillAllFields: "يرجى ملء حقول البريد الإلكتروني وكلمة المرور.",
    loginFailed: "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.",
    loggingIn: "جارٍ تسجيل الدخول...",
    loginSuccess: "تم تسجيل الدخول بنجاح!", // Optional success message
  },
};

function Login() {
  const [language, setLanguage] = useState("en");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [formErrors, setFormErrors] = useState({}); // State for field-specific errors
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // Redirect to homepage if already logged in
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Ride Deals - Log In";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    // Clear general error message as well
    if (error && (name === "email" || name === "password")) {
      setError("");
    }
  };

  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormErrors({}); // Reset field errors

    let currentFormErrors = {};
    if (!formData.email) {
      currentFormErrors.email = t.fillAllFields; // Or a more specific "Email is required"
    }
    if (!formData.password) {
      currentFormErrors.password = t.fillAllFields; // Or a more specific "Password is required"
    }

    if (Object.keys(currentFormErrors).length > 0) {
      setFormErrors(currentFormErrors);
      // Set a general error message if needed, or rely on field highlighting
      setError(t.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Store token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/"); // Redirect to homepage after login
    } catch (err) {
      console.error(
        "Login error:",
        err.response ? err.response.data : err.message
      );
      setError(err.response?.data?.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container lang-${language}`}>
      <div className="login-form">
        <h2>{t.logInTitle}</h2>
        {error && !formErrors.email && !formErrors.password && (
          <p className="error-message">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={formErrors.email ? "input-error" : ""}
            />
            {formErrors.email && (
              <p className="field-error-message">{formErrors.email}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={formErrors.password ? "input-error" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {formErrors.password && (
              <p className="field-error-message">{formErrors.password}</p>
            )}
          </div>
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberChange}
              />
              <label htmlFor="rememberMe">{t.rememberMe}</label>
            </div>
            <Link to="/forgot-password" className="forgot-password-link">
              {t.forgotPassword}
            </Link>
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t.loggingIn : t.logInButton}
          </button>
        </form>
        <div className="signup-link">
          {t.dontHaveAccount} <Link to="/signup">{t.createOne}</Link>
        </div>
        <div className="divider">
          <hr />
          <span>{t.or}</span>
          <hr />
        </div>
        <button type="button" className="google-signin-button">
          {t.signInWithGoogle}
        </button>
        <div className="language-selector">
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">{t.english}</option>
            <option value="ar">{t.arabic}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Login;
