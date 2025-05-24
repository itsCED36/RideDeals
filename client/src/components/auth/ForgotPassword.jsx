import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./ForgotPassword.css"; // Create this CSS file

// Simple translation object
const translations = {
  en: {
    title: "Password reset",
    prompt: "Please enter your email address to receive a verification code.",
    email: "Email",
    sendCodeButton: "Send verification code",
    sending: "Sending...",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log in",
    or: "or",
    signInWithGoogle: "Sign in with Google",
    english: "English (en)",
    arabic: "Arabic (ar)",
    emailNotFound: "Email not found.",
    emailSentSuccess:
      "Verification code sent successfully! Please check your email.",
    genericError: "Failed to send verification code. Please try again.",
    fillEmail: "Please enter your email address.",
  },
  ar: {
    title: "إعادة تعيين كلمة المرور",
    prompt: "يرجى إدخال عنوان بريدك الإلكتروني لتلقي رمز التحقق.",
    email: "البريد الإلكتروني",
    sendCodeButton: "إرسال رمز التحقق",
    sending: "جارٍ الإرسال...",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    logIn: "تسجيل الدخول",
    or: "أو",
    signInWithGoogle: "تسجيل الدخول باستخدام جوجل",
    english: "الإنجليزية (en)",
    arabic: "العربية (ar)",
    emailNotFound: "البريد الإلكتروني غير موجود.",
    emailSentSuccess:
      "تم إرسال رمز التحقق بنجاح! يرجى التحقق من بريدك الإلكتروني.",
    genericError: "فشل إرسال رمز التحقق. حاول مرة اخرى.",
    fillEmail: "يرجى إدخال عنوان بريدك الإلكتروني.",
  },
};

function ForgotPassword() {
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate
  const t = translations[language];

  useEffect(() => {
    document.title = "Ride Deals - Password Reset";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setError(""); // Clear errors on language change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t.fillEmail);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      console.log("Forgot password request successful:", response.data);

      // Navigate to the verify code page on success
      // Pass email in state for the VerifyCode component to potentially use
      navigate("/verify-code", { state: { email: email } });
    } catch (err) {
      console.error(
        "Forgot password error:",
        err.response ? err.response.data : err.message
      );
      // Remove the specific 404 check.
      // Display the error message from the backend if available, otherwise show generic error.
      setError(err.response?.data?.message || t.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`forgot-password-container lang-${language}`}>
      <div className="forgot-password-form">
        <h2>{t.title}</h2>
        <p className="prompt-text">{t.prompt}</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t.sending : t.sendCodeButton}
          </button>
        </form>

        <div className="login-link">
          {t.alreadyHaveAccount} <Link to="/login">{t.logIn}</Link>
        </div>

        <div className="divider">
          <hr />
          <span>{t.or}</span>
          <hr />
        </div>

        {/* Basic button, functionality needs implementation */}
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

export default ForgotPassword;
