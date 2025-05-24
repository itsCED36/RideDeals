import React, { useState, useEffect } from "react"; // Removed useRef
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
// Keep original icon imports
import wishlistIcon from "../assets/icons/Wishlist.png";
import profileIcon from "../assets/icons/user.png";
// Removed cart icon import

const translations = {
  en: {
    home: "Home",
    marketplace: "Marketplace",
    rentalService: "Rental service",
    login: "Log In",
    english: "English",
    arabic: "Arabic",
    logout: "Logout",
    postCar: "Post Car", // Add translation for Post Car
    profileSettings: "Profile Settings", // New
    helpCenter: "Help Center", // New
    myDeals: "My Deals", // New
    // Removed search translations
  },
  ar: {
    home: "الرئيسية",
    marketplace: "السوق",
    rentalService: "خدمة التأجير",
    login: "تسجيل الدخول",
    english: "الإنجليزية",
    arabic: "العربية",
    logout: "تسجيل الخروج",
    postCar: "أضف سيارة", // Add translation for Post Car in Arabic
    profileSettings: "إعدادات الملف الشخصي", // New
    helpCenter: "مركز المساعدة", // New
    myDeals: "صفقاتي", // New
    // Removed search translations
  },
};

function Navbar() {
  const [language, setLanguage] = useState("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    document.body.dir = e.target.value === "ar" ? "rtl" : "ltr";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Still remove user data from local storage
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      {/* Blue band above navbar */}
      <div className="top-blue-band">
        <div className="band-content"></div>
      </div>

      <nav className={`navbar lang-${language}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            Ride Deals
          </Link>

          {/* Removed Search Bar Area */}

          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-links">
                {t.home}
              </Link>
            </li>{" "}
            <li className="nav-item">
              <Link to="/marketplace" className="nav-links">
                {t.marketplace}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/rental" className="nav-links">
                {t.rentalService}
              </Link>
            </li>
            {isLoggedIn && (
              <li className="nav-item">
                <Link to="/post-car" className="nav-links">
                  {t.postCar}
                </Link>
              </li>
            )}
          </ul>

          <div className="nav-right">
            <Link to="/wishlist" className="nav-icon-button">
              <img src={wishlistIcon} alt="Wishlist" className="nav-icon" />
            </Link>

            {isLoggedIn ? (
              <div className="profile-section">
                <button
                  onClick={toggleDropdown}
                  className="nav-icon-button profile-icon"
                >
                  <img
                    src={profileIcon} // Always use default profile icon
                    alt="Profile"
                    className="nav-icon"
                  />
                </button>
                {showDropdown && (
                  <div className="profile-dropdown">
                    <Link
                      to="/profile-settings"
                      className="profile-dropdown-item"
                    >
                      {t.profileSettings}
                    </Link>
                    <Link to="/my-deals" className="profile-dropdown-item">
                      {t.myDeals}
                    </Link>
                    <Link to="/help-center" className="profile-dropdown-item">
                      {t.helpCenter}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="profile-dropdown-item"
                    >
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-button">
                {t.login}
              </Link>
            )}

            <div className="language-selector">
              <select value={language} onChange={handleLanguageChange}>
                <option value="en">{t.english}</option>
                <option value="ar">{t.arabic}</option>
              </select>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
