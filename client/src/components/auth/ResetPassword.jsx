import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css"; // We'll create this CSS file next

// Simple translation object (can be expanded)
const translations = {
  en: {
    title: "Password reset",
    prompt: "Enter your new password below:",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    confirmButton: "Confirm",
    confirming: "Confirming...",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log in",
    or: "or",
    signInWithGoogle: "Sign in with Google",
    english: "English (en)",
    arabic: "Arabic (ar)",
    passwordMismatch: "Passwords do not match.",
    passwordLengthError: "Password must be at least 6 characters long.",
    resetSuccess: "Password reset successfully! You can now log in.",
    genericError: "Password reset failed. Please try again.",
    missingEmail: "Could not identify user. Please restart the process.",
  },
  // Add 'ar' translations if needed
};

function ResetPassword() {
  const [language, setLanguage] = useState("en"); // Add language state if needed
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const t = translations[language];
  const location = useLocation();
  const navigate = useNavigate();

  // Get email passed from VerifyCode component or from localStorage fallback
  const [email, setEmail] = useState(location.state?.email || "");

  useEffect(() => {
    document.title = "Ride Deals - Reset Password";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
    // If email is missing, try to get it from localStorage
    if (!email) {
      const storedEmail = localStorage.getItem("resetEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setError(t.missingEmail);
      }
    } else {
      // Store email for refresh/navigation safety
      localStorage.setItem("resetEmail", email);
    }
    // Check if code was verified
    const codeVerified = localStorage.getItem("codeVerified");
    if (codeVerified !== "true") {
      navigate("/forgot-password");
    } else {
      setVerified(true);
    }
  }, [language, email, t.missingEmail, navigate]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError(t.missingEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordLengthError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const payload = { email, newPassword: password };
      await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        payload
      );
      setSuccessMessage(t.resetSuccess);
      setPassword("");
      setConfirmPassword("");
      localStorage.removeItem("resetEmail");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t.genericError);
    } finally {
      setLoading(false);
    }
  };

  if (!verified) return null;

  return (
    <div className={`reset-password-container lang-${language}`}>
      <div className="reset-password-form">
        <h2>{t.title}</h2>
        <p className="prompt-text">{t.prompt}</p>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">{t.newPassword}</label>
            <input
              type="password"
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">{t.confirmPassword}</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={
              loading || !password || !confirmPassword || !!successMessage
            }
          >
            {loading ? t.confirming : t.confirmButton}
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

        {/* Google Sign in might not be relevant here, but kept for layout consistency */}
        <button type="button" className="google-signin-button" disabled>
          {t.signInWithGoogle}
        </button>

        {/* Language Selector - Reuse if you have a shared component */}
        <div className="language-selector">
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">{t.english}</option>
            {/* <option value="ar">{t.arabic}</option> */}
          </select>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
