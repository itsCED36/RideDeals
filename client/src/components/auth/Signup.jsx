import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import icons
import zxcvbn from "zxcvbn"; // Import zxcvbn
import "./Signup.css"; // Ensure Signup.css exists in the same directory

// Simple translation object
const translations = {
  en: {
    createAccount: "Create account",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordsDoNotMatch: "Passwords do not match.",
    fillAllFields: "Please fill in all fields.",
    accountCreationFailed: "Failed to create account. Please try again.",
    creating: "Creating...",
    alreadyHaveAccount: "Already have an account?",
    logIn: "Log in",
    or: "or",
    signUpWithGoogle: "Sign up with Google",
    english: "English (en)",
    arabic: "Arabic (ar)",
    emailInUse: "Email already in use.",
    accountCreatedSuccess: "Account created successfully!",
    wilaya: "Wilaya",
    selectWilaya: "Select Wilaya",
    gender: "Gender",
    selectGender: "Select Gender",
    male: "Male",
    female: "Female",
    age: "Age",
    ageRequirement: "Must be 18 or older",
  },
  ar: {
    createAccount: "إنشاء حساب",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة.",
    fillAllFields: "يرجى ملء جميع الحقول.",
    accountCreationFailed: "فشل إنشاء الحساب. حاول مرة اخرى.",
    creating: "جارٍ الإنشاء...",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    logIn: "تسجيل الدخول",
    or: "أو",
    signUpWithGoogle: "التسجيل باستخدام جوجل",
    english: "الإنجليزية (en)",
    arabic: "العربية (ar)",
    emailInUse: "البريد الإلكتروني قيد الاستخدام بالفعل.",
    accountCreatedSuccess: "تم إنشاء الحساب بنجاح!",
    wilaya: "الولاية",
    selectWilaya: "اختر الولاية",
    gender: "الجنس",
    selectGender: "اختر الجنس",
    male: "ذكر",
    female: "أنثى",
    age: "العمر",
    ageRequirement: "يجب أن يكون العمر 18 سنة أو أكثر",
  },
};

// Define the list of Algerian Wilayas for the dropdown
const algerianWilayas = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Algiers",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Meniaa",
];

function Signup() {
  const [language, setLanguage] = useState("en");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    wilaya: "",
    gender: "",
    age: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [passwordStrength, setPasswordStrength] = useState(0); // State for password strength score
  const [formErrors, setFormErrors] = useState({}); // State for field-specific errors

  const navigate = useNavigate();
  const t = translations[language]; // Get translations for the current language

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // Redirect to homepage if already logged in
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Ride Deals - Sign Up"; // Set the page title
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      const strength = zxcvbn(value).score; // Score from 0 to 4
      setPasswordStrength(strength);
    }
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    // Clear general error message if it's related to the field being changed
    if (
      error &&
      (name === "firstName" ||
        name === "lastName" ||
        name === "email" ||
        name === "password" ||
        name === "confirmPassword" ||
        name === "wilaya" ||
        name === "gender" ||
        name === "age") // Removed profilePicture
    ) {
      setError("");
    }
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    // else if (!/\S+@\S+\.\S+/.test(formData.email))
    //   newErrors.email = "Email is invalid.";
    // Use a more comprehensive regex for email validation
    else if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        formData.email
      )
    )
      newErrors.email = "Email is invalid.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t.passwordsDoNotMatch;
    if (!formData.wilaya) newErrors.wilaya = "Wilaya is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";
    if (!formData.age) newErrors.age = "Age is required.";
    else if (parseInt(formData.age) < 18) newErrors.age = t.ageRequirement;
    // No validation needed for profilePicture as it's removed

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous general errors
    setFormErrors({}); // Clear previous field-specific errors

    if (!validateForm()) {
      // setError(t.fillAllFields); // Optionally set a general message or rely on field errors
      return;
    }

    setLoading(true);

    // const data = new FormData(); // FormData is no longer needed unless other files are uploaded
    // data.append("firstName", formData.firstName);
    // data.append("lastName", formData.lastName);
    // data.append("email", formData.email);
    // data.append("password", formData.password);
    // data.append("confirmPassword", formData.confirmPassword);
    // data.append("wilaya", formData.wilaya);
    // data.append("gender", formData.gender);
    // data.append("age", formData.age);
    // if (formData.profilePicture) { // Removed profilePicture
    //   data.append("profilePicture", formData.profilePicture);
    // }

    // Send as JSON since profile picture is removed
    const dataToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      wilaya: formData.wilaya,
      gender: formData.gender,
      age: formData.age,
    };

    try {
      const response = await axios.post("/api/auth/signup", dataToSend, {
        // headers: { // No longer multipart/form-data
        //   "Content-Type": "multipart/form-data",
        // },
      });
      console.log("Signup successful:", response.data);
      // Handle successful signup (e.g., redirect to login or verify email page)
      // For example, redirect to a page that says "Please check your email to verify"
      // navigate("/verify-email-prompt"); // Or a route that shows this message
      navigate("/verify-email", { state: { email: formData.email } }); // Navigate to /verify-email and pass email in state
    } catch (err) {
      console.error(
        "Signup error:",
        err.response ? err.response.data : err.message
      );
      let errorMessage = t.accountCreationFailed;
      if (err.response?.data?.message) {
        if (err.response.data.message.includes("Email already in use")) {
          errorMessage = t.emailInUse;
        } else if (
          err.response.data.message.includes("Please fill in all fields")
        ) {
          errorMessage = t.fillAllFields;
        } else if (
          err.response.data.message.includes("Passwords do not match")
        ) {
          errorMessage = t.passwordsDoNotMatch;
        } else {
          errorMessage = err.response.data.message; // Fallback to original message
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`signup-container lang-${language}`}>
      <div className="signup-form">
        <h2>{t.createAccount}</h2>
        {error && Object.keys(formErrors).length === 0 && (
          <p className="error-message">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="firstName">{t.firstName}</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={formErrors.firstName ? "input-error" : ""}
              />
              {formErrors.firstName && (
                <p className="field-error-message">{formErrors.firstName}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">{t.lastName}</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={formErrors.lastName ? "input-error" : ""}
              />
              {formErrors.lastName && (
                <p className="field-error-message">{formErrors.lastName}</p>
              )}
            </div>
          </div>
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
            <label htmlFor="wilaya">{t.wilaya}</label>
            <select
              id="wilaya"
              name="wilaya"
              value={formData.wilaya}
              onChange={handleChange}
              required
              className={formErrors.wilaya ? "input-error" : ""}
            >
              <option value="" disabled>
                {t.selectWilaya}
              </option>
              {algerianWilayas.map((wilayaName) => (
                <option key={wilayaName} value={wilayaName}>
                  {wilayaName}
                </option>
              ))}
            </select>
            {formErrors.wilaya && (
              <p className="field-error-message">{formErrors.wilaya}</p>
            )}
          </div>
          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="gender">{t.gender}</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={formErrors.gender ? "input-error" : ""}
              >
                <option value="" disabled>
                  {t.selectGender}
                </option>
                <option value="Male">{t.male}</option>
                <option value="Female">{t.female}</option>
              </select>
              {formErrors.gender && (
                <p className="field-error-message">{formErrors.gender}</p>
              )}
            </div>
            <div className="form-group form-group-half">
              <label htmlFor="age">{t.age}</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder={t.age}
                className={formErrors.age ? "input-error" : ""}
              />
              {formErrors.age && (
                <p className="error-message">{formErrors.age}</p>
              )}
            </div>
          </div>
          {error && <p className="error-message general-error">{error}</p>}
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
                minLength="6"
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
            {formErrors.password && !formErrors.confirmPassword && (
              <p className="field-error-message">{formErrors.password}</p>
            )}
            <div className="password-strength-meter">
              <div className={`strength-bar strength-${passwordStrength}`} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className={formErrors.confirmPassword ? "input-error" : ""}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-btn"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="field-error-message">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t.creating : t.createAccount}
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
        <button type="button" className="google-signup-button">
          {t.signUpWithGoogle}
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

export default Signup;
