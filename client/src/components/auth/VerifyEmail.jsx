import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./VerifyEmail.css"; // Will create this CSS file

// Simple translation object
const translations = {
  en: {
    title: "Verify Your Email",
    prompt:
      "A verification code has been sent to your email. Please enter the code below to verify your account:",
    confirmButton: "Verify Email",
    confirming: "Verifying...",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log in",
    or: "or",
    signInWithGoogle: "Sign in with Google",
    english: "English (en)",
    arabic: "Arabic (ar)",
    invalidCode: "Invalid or expired verification code.",
    verificationSuccess: "Email verified successfully!",
    genericError: "Verification failed. Please try again.",
    fillCode: "Please enter the 6-digit verification code.",
    resendCode: "Resend verification code",
    resending: "Resending...",
    codeSent: "Verification code has been resent to your email.",
  },
  ar: {
    title: "تحقق من بريدك الإلكتروني",
    prompt:
      "تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى إدخال الرمز أدناه للتحقق من حسابك:",
    confirmButton: "تحقق من البريد الإلكتروني",
    confirming: "جارٍ التحقق...",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    logIn: "تسجيل الدخول",
    or: "أو",
    signInWithGoogle: "تسجيل الدخول باستخدام جوجل",
    english: "الإنجليزية (en)",
    arabic: "العربية (ar)",
    invalidCode: "رمز التحقق غير صالح أو منتهي الصلاحية.",
    verificationSuccess: "تم التحقق من البريد الإلكتروني بنجاح!",
    genericError: "فشل التحقق. حاول مرة اخرى.",
    fillCode: "يرجى إدخال رمز التحقق المكون من 6 أرقام.",
    resendCode: "إعادة إرسال رمز التحقق",
    resending: "جارٍ إعادة الإرسال...",
    codeSent: "تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني.",
  },
};

const CODE_LENGTH = 6;

function VerifyEmail() {
  const [language, setLanguage] = useState("en");
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const t = translations[language];
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  // Removed unused variable 'firstName'

  useEffect(() => {
    console.log("Email received in VerifyEmail:", email); // Debug log
    document.title = "Ride Deals - Verify Email";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
    // Focus the first input on mount
    inputRefs.current[0]?.focus();

    // Redirect if no valid email is present
    if (!email) {
      navigate("/signup");
    }
  }, [language, email, navigate]);

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    const newCode = [...code];

    // Allow only single alphanumeric characters or empty string
    const isAlphanumericOrEmpty = /^[a-zA-Z0-9]$/.test(value) || value === "";

    if (isAlphanumericOrEmpty) {
      // Convert to uppercase for consistency
      const charToStore = value.toUpperCase();
      newCode[index] = charToStore;
      setCode(newCode);

      // Move focus to the next input if a character was entered
      if (value && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to the previous input on backspace if current input is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    // Allow pasting alphanumeric characters, limit to CODE_LENGTH
    const alphanumericPastedData = pastedData
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, CODE_LENGTH);

    if (alphanumericPastedData) {
      const newCode = [...code];
      let currentFocusIndex = 0;
      for (let i = 0; i < alphanumericPastedData.length; i++) {
        if (i < CODE_LENGTH) {
          // Convert to uppercase for consistency
          newCode[i] = alphanumericPastedData[i].toUpperCase();
          currentFocusIndex = i;
        }
      }
      // Fill remaining spots with empty strings if paste is shorter than CODE_LENGTH
      for (let i = alphanumericPastedData.length; i < CODE_LENGTH; i++) {
        newCode[i] = "";
      }

      setCode(newCode);
      // Focus the next empty input or the last input if full
      const nextFocusIndex = Math.min(currentFocusIndex + 1, CODE_LENGTH - 1);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const enteredCode = code.join("");

    if (enteredCode.length !== CODE_LENGTH) {
      setError(t.fillCode);
      return;
    }

    if (!email) {
      setError(t.genericError);
      console.error("Email missing in location state for verification");
      return;
    }

    setLoading(true);
    try {
      const payload = { code: enteredCode, email };
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-email",
        payload
      );

      console.log("Email verification successful:", response.data);
      setSuccessMessage(t.verificationSuccess);

      // Navigate to login page after successful verification
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(
        "Email verification error:",
        err.response ? err.response.data : err.message
      );
      if (err.response?.status === 400) {
        setError(t.invalidCode);
      } else {
        setError(err.response?.data?.message || t.genericError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError(t.genericError);
      return;
    }

    setResending(true);
    try {
      await axios.post("http://localhost:5000/api/auth/resend-verification", {
        email,
      });
      setSuccessMessage(t.codeSent);
    } catch (err) {
      console.error("Error resending verification code:", err);
      setError(err.response?.data?.message || t.genericError);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`verify-email-container lang-${language}`}>
      <div className="verify-email-form">
        <h2>{t.title}</h2>
        <p className="prompt-text">{t.prompt}</p>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                required
                autoComplete="off"
                aria-label={`Character ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || code.join("").length !== CODE_LENGTH}
          >
            {loading ? t.confirming : t.confirmButton}
          </button>
        </form>

        <button
          type="button"
          className="resend-button"
          onClick={handleResendCode}
          disabled={resending}
        >
          {resending ? t.resending : t.resendCode}
        </button>

        <div className="login-link">
          {t.alreadyHaveAccount} <Link to="/login">{t.logIn}</Link>
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

export default VerifyEmail;
