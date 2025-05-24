import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import api from "../utils/api"; // Import our configured axios instance
// Import icons for search
import {
  FaSearch,
  FaClock,
  FaTag,
  FaInfoCircle,
  FaArrowRight,
  FaArrowUp,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// Mock data for search history (we'll keep this for now)
const mockSearchHistory = [
  { id: 1, term: "clio4", icon: <FaClock /> },
  { id: 2, term: "bmw", icon: <FaSearch /> },
  { id: 3, term: "Golf8", icon: <FaSearch /> },
  { id: 4, term: "Fiat", details: "FIAT DOBLO > 23025", icon: <FaTag /> },
  { id: 5, term: "car rental", icon: <FaTag /> },
  { id: 6, term: "transport", icon: <FaTag /> },
  { id: 7, term: "Renault", details: "MEGANE > 2015", icon: <FaInfoCircle /> },
];

// Basic translations
const translations = {
  en: {
    searchPlaceholder: "Search for cars...",
    search: "Search",
    yourSearches: "Your Searches",
    deals: "Deals",
    seeResults: "See results in: Marketplace",
    rentalCars: "Rental Cars",
    loading: "Loading...",
    error: "Error loading data. Please try again.",
  },
  ar: {
    searchPlaceholder: "ابحث عن سيارات...",
    search: "بحث",
    yourSearches: "عمليات البحث الخاصة بك",
    deals: "عروض",
    seeResults: "عرض النتائج في: السوق",
    rentalCars: "سيارات للإيجار",
    loading: "جاري التحميل...",
    error: "خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.",
  },
};

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // State for real car data
  const [marketplaceCars, setMarketplaceCars] = useState([]);
  const [rentalCars, setRentalCars] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assuming language state comes from context or props later, default to 'en'
  const language = "en"; // Or get from context/props
  const t = translations[language];

  // Function to fetch car data from API
  const fetchCars = async () => {
    setLoading(true);
    try {
      // Use relative URL instead of hardcoded localhost
      const response = await api.get("/api/cars/homepage");

      if (response.data && response.data.success) {
        setMarketplaceCars(response.data.data.marketplaceCars || []);
        setRentalCars(response.data.data.rentalCars || []);
      } else {
        throw new Error("Failed to fetch car data");
      }

      // Fetch verified users with proper error handling
      try {
        const usersResponse = await api.get("/api/auth/verified-users");
        if (usersResponse.data && usersResponse.data.success) {
          setVerifiedUsers(usersResponse.data.data || []);
        }
      } catch (userError) {
        console.error("Error fetching verified users:", userError);
        // Fall back to mock data for verified users only
        setVerifiedUsers([
          { id: 1, name: "Ana Belkadi", image: null, rating: 4.8, deals: 24 },
          {
            id: 2,
            name: "Shihab Senouci",
            image: null,
            rating: 4.9,
            deals: 32,
          },
          {
            id: 3,
            name: "Jalil Boukrouh",
            image: null,
            rating: 4.7,
            deals: 19,
          },
          { id: 4, name: "Amine Hadj", image: null, rating: 5.0, deals: 41 },
          { id: 5, name: "Mohamed Ali", image: null, rating: 4.9, deals: 28 },
          {
            id: 6,
            name: "Houssam Benmoussa",
            image: null,
            rating: 4.8,
            deals: 35,
          },
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
      setLoading(false);

      // Temporarily use mock data if API fails
      // This will ensure your UI works even if backend is not ready
      setMarketplaceCars([
        {
          _id: "1",
          name: "BMW X5",
          brand: "BMW",
          price: 35000,
          image:
            "https://via.placeholder.com/250x150/f5f5f5/000000?text=BMW+X5",
          rating: 4.7,
          reviews: 42,
          isNewArrival: true,
          isFavorite: false,
        },
        {
          _id: "2",
          name: "Mercedes GLE",
          brand: "Mercedes",
          price: 48000,
          image:
            "https://via.placeholder.com/250x150/f5f5f5/000000?text=Mercedes",
          rating: 4.9,
          reviews: 28,
          isFavorite: false,
        },
        {
          _id: "3",
          name: "Audi Q7",
          brand: "Audi",
          price: 52000,
          image:
            "https://via.placeholder.com/250x150/f5f5f5/000000?text=Audi+Q7",
          rating: 4.8,
          reviews: 35,
          discount: "-10% OFF",
          isFavorite: false,
        },
        {
          _id: "4",
          name: "Tesla Model Y",
          brand: "Tesla",
          price: 58000,
          image: "https://via.placeholder.com/250x150/f5f5f5/000000?text=Tesla",
          rating: 5.0,
          reviews: 53,
          isFavorite: false,
        },
      ]);

      setRentalCars([
        {
          _id: "5",
          name: "Toyota Camry",
          brand: "Toyota",
          price: 65,
          image:
            "https://via.placeholder.com/250x150/f5f5f5/000000?text=Toyota",
          rating: 4.6,
          reviews: 89,
          isFavorite: false,
        },
        {
          _id: "6",
          name: "Honda Accord",
          brand: "Honda",
          price: 72,
          image: "https://via.placeholder.com/250x150/f5f5f5/000000?text=Honda",
          rating: 4.5,
          reviews: 62,
          isFavorite: false,
        },
      ]);

      // Mock verified users data in case API call fails
      setVerifiedUsers([
        { id: 1, name: "Ana Belkadi", image: null, rating: 4.8, deals: 24 },
        { id: 2, name: "Shihab Senouci", image: null, rating: 4.9, deals: 32 },
        { id: 3, name: "Jalil Boukrouh", image: null, rating: 4.7, deals: 19 },
        { id: 4, name: "Amine Hadj", image: null, rating: 5.0, deals: 41 },
        { id: 5, name: "Mohamed Ali", image: null, rating: 4.9, deals: 28 },
        {
          id: 6,
          name: "Houssam Benmoussa",
          image: null,
          rating: 4.8,
          deals: 35,
        },
      ]);
    }
  };

  // Fetch cars when component mounts
  useEffect(() => {
    fetchCars();
  }, []);

  // Effect to handle clicks outside the search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchDropdown(e.target.value.length > 0);
  };

  const handleSearchFocus = () => {
    setShowSearchDropdown(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    if (searchTerm.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  const handleHistoryItemClick = (term) => {
    setSearchTerm(term);
    setShowSearchDropdown(false);
    navigate(`/marketplace?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <div className="home-container">
        <div className="home-hero">
          <h1>Welcome to Ride Deals!</h1>
          <p>Your one-stop marketplace for buying and renting cars.</p>

          {/* Search Bar Area */}
          <div className="search-area" ref={searchContainerRef}>
            <form className="search-container" onSubmit={handleSearchSubmit}>
              <FaSearch className="search-input-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
              />
              <button type="submit" className="search-button">
                {t.search}
              </button>
            </form>

            {showSearchDropdown && (
              <div className="search-dropdown">
                <div className="search-section history-section">
                  <h5>{t.yourSearches}</h5>
                  <ul>
                    {mockSearchHistory.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleHistoryItemClick(item.term)}
                      >
                        <span className="history-icon">{item.icon}</span>
                        <div className="history-text">
                          <span>{item.term}</span>
                          {item.details && <small>{item.details}</small>}
                        </div>
                        <FaArrowUp className="history-action-icon" />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="search-section deals-section">
                  <h5>{t.deals}</h5>
                  <div className="deals-grid">
                    {marketplaceCars.slice(0, 4).map((deal) => (
                      <div key={deal._id} className="deal-item">
                        <img
                          src={
                            deal.images && deal.images.length > 0
                              ? deal.images[0].startsWith("http")
                                ? deal.images[0]
                                : `http://localhost:5000${deal.images[0]}`
                              : "/images/default-car.png" // Fallback image
                          }
                          alt={deal.name}
                        />
                        {deal.isNewArrival && (
                          <span className="deal-tag new-arrival">
                            NEW ARRIVAL
                          </span>
                        )}
                        {deal.discount && (
                          <span className="deal-tag discount">
                            {deal.discount}
                          </span>
                        )}
                        <div className="deal-info">
                          <span className="deal-brand">{deal.brand}</span>
                          <h6>{deal.name}</h6>
                          <p>
                            {deal.user
                              ? `${deal.user.firstName} ${deal.user.lastName}`
                              : "Seller"}
                          </p>
                          <span className="deal-price">
                            {deal.price.toLocaleString()} DZD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="see-results-button"
                  onClick={handleSearchSubmit}
                >
                  {t.seeResults} ({marketplaceCars.length})
                </button>
              </div>
            )}
          </div>

          {/* Ad Section - Market News */}
          <section className="ad-section">
            <h2 className="ad-section-title">
              <span className="ad-section-icon" />
              Market News
            </h2>
            <h3 className="ad-section-headline">Latest Offers & Updates</h3>
            <div className="ad-grid">
              <div className="ad-large ad-image-container">
                <img
                  src="/Ads/7959bf67-2599-4c74-b8e2-5e54884d20b5.avif"
                  alt="Ad 1"
                  className="ad-image"
                />
              </div>
              <div className="ad-right">
                <div className="ad-medium ad-image-container">
                  <img
                    src="/Ads/engine-oil-advertising-banner-3d-260nw-2419747347.webp"
                    alt="Ad 2"
                    className="ad-image"
                  />
                </div>
                <div className="ad-small-row">
                  <div className="ad-small ad-image-container">
                    <img
                      src="/Ads/Hatchback-Car-Wrap-Mockup.jpg"
                      alt="Ad 3"
                      className="ad-image"
                    />
                  </div>
                  {/* You can add a fourth small ad here if needed, or adjust layout */}
                  {/* <div className="ad-small ad-image-container">
                    <img src="/path/to/your/fourth-ad.jpg" alt="Ad 4" className="ad-image" />
                  </div> */}
                </div>
              </div>
            </div>
          </section>
          {/* End Ad Section */}

          {/* Marketplace Section */}
          <section className="marketplace-section">
            <div className="marketplace-header">
              <span className="marketplace-icon" />
              <span className="marketplace-title">Cars marketplace</span>
            </div>
            <h2 className="marketplace-headline">Browse More Vehicles</h2>

            {loading ? (
              <div className="loading-message">{t.loading}</div>
            ) : error ? (
              <div className="error-message">{t.error}</div>
            ) : (
              <div className="marketplace-grid">
                {marketplaceCars.map((car) => (
                  <div className="marketplace-card" key={car._id}>
                    {" "}
                    <div className="marketplace-card-image">
                      <img
                        src={
                          car.images && car.images.length > 0
                            ? car.images[0].startsWith("http")
                              ? car.images[0]
                              : `http://localhost:5000${car.images[0]}`
                            : "/images/default-car.png" // Fallback image
                        }
                        alt={car.name}
                      />
                      {car.isNewArrival && (
                        <span className="marketplace-badge-new">NEW</span>
                      )}
                    </div>
                    <div className="marketplace-card-info">
                      <div className="marketplace-card-title">{car.name}</div>{" "}
                      <div className="marketplace-card-price">
                        {car.price.toLocaleString()} DZD{" "}
                        <span className="marketplace-card-rating">
                          ★ {car.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {marketplaceCars.length === 0 && (
                  <div className="no-cars-message">No cars found for sale</div>
                )}
              </div>
            )}

            <button
              className="marketplace-viewall-btn"
              onClick={() => navigate("/marketplace")}
            >
              View All Products
            </button>
          </section>
          {/* End Marketplace Section */}

          {/* Feature Ad Panel */}
          <section className="feature-ad-panel">
            <div className="feature-ad-content">
              <div className="feature-ad-left">
                <div className="feature-ad-text-container">
                  <h2 className="feature-ad-title">Premium Auto Service</h2>
                  <p className="feature-ad-description">
                    Experience our comprehensive maintenance service with
                    factory-trained technicians and genuine parts
                  </p>
                  <div className="feature-ad-stats">
                    <div className="feature-ad-stat">
                      <span className="feature-ad-stat-number">15+</span>
                      <span className="feature-ad-stat-label">
                        Years Experience
                      </span>
                    </div>
                    <div className="feature-ad-stat">
                      <span className="feature-ad-stat-number">2,500+</span>
                      <span className="feature-ad-stat-label">
                        Happy Clients
                      </span>
                    </div>
                    <div className="feature-ad-stat">
                      <span className="feature-ad-stat-number">30+</span>
                      <span className="feature-ad-stat-label">
                        Expert Mechanics
                      </span>
                    </div>
                  </div>
                  <button className="feature-ad-cta-btn">
                    Schedule Service
                  </button>
                </div>
              </div>
              <div className="feature-ad-right">
                <div className="feature-ad-image-container">
                  <img
                    src="https://images.unsplash.com/photo-1625047509254-166a0accb25c?q=80&w=1000&auto=format&fit=crop"
                    alt="Premium Auto Service"
                    className="feature-ad-image"
                  />
                </div>
                <div className="feature-ad-badge">
                  <span className="feature-ad-badge-text">30% OFF</span>
                  <span className="feature-ad-badge-subtext">
                    First Service
                  </span>
                </div>
              </div>
            </div>
          </section>
          {/* End Feature Ad Panel */}

          {/* Rental Cars Section */}
          <section className="rental-section">
            <div className="rental-header">
              <span className="rental-icon" />
              <span className="rental-title">{t.rentalCars}</span>
            </div>
            <h2 className="rental-headline">Find Your Next Rental</h2>

            {loading ? (
              <div className="loading-message">{t.loading}</div>
            ) : error ? (
              <div className="error-message">{t.error}</div>
            ) : (
              <div className="rental-grid">
                {rentalCars.map((car) => (
                  <div className="rental-card" key={car._id}>
                    {" "}
                    <div className="rental-card-image">
                      <img
                        src={
                          car.images && car.images.length > 0
                            ? car.images[0].startsWith("http")
                              ? car.images[0]
                              : `http://localhost:5000${car.images[0]}`
                            : "/images/default-car.png" // Fallback image
                        }
                        alt={car.name}
                      />
                    </div>
                    <div className="rental-card-info">
                      <div className="rental-card-title">{car.name}</div>
                      <div className="rental-card-price">
                        {car.price.toLocaleString()} DZD{" "}
                        <span className="rental-card-rating">
                          ★ {car.rating}
                        </span>{" "}
                        <span className="rental-card-reviews">
                          ({car.reviews})
                        </span>
                      </div>
                      <div className="rental-card-seller">
                        {car.user
                          ? `${car.user.firstName} ${car.user.lastName}`
                          : "Seller"}
                      </div>
                    </div>
                  </div>
                ))}

                {rentalCars.length === 0 && (
                  <div className="no-cars-message">No cars found for rent</div>
                )}
              </div>
            )}

            <button className="rental-viewall-btn">View All Rentals</button>
          </section>
          {/* End Rental Cars Section */}

          {/* Verified Users Section */}
          <section className="verified-users-section">
            <div className="verified-users-header">
              <span className="verified-users-icon" />
              <span className="verified-users-title">
                Trusted Collaborators
              </span>
            </div>
            <h2 className="verified-users-headline">Our Verified Users</h2>

            {loading ? (
              <div className="loading-message">{t.loading}</div>
            ) : error ? (
              <div className="error-message">{t.error}</div>
            ) : (
              <div className="verified-users-grid">
                {verifiedUsers.map((user) => {
                  // Add a check for user and user.name
                  if (!user || !user.name) {
                    // Optionally, render a placeholder or return null
                    console.warn(
                      "Verified user or user.name is undefined",
                      user
                    );
                    return null;
                  }
                  return (
                    <div className="verified-user-card" key={user.id}>
                      <div className="verified-user-image">
                        <img
                          src={
                            user.image
                              ? `http://localhost:5000${user.image}`
                              : `https://via.placeholder.com/120x120/f5f5f5/0c4f91?text=${encodeURIComponent(
                                  user.name.split(" ")[0]
                                )}`
                          }
                          alt={user.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/120x120/f5f5f5/0c4f91?text=${encodeURIComponent(
                              user.name.split(" ")[0]
                            )}`;
                          }}
                        />
                        <div className="verified-badge">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                      </div>
                      <div className="verified-user-info">
                        <div className="verified-user-name">{user.name}</div>
                        <div className="verified-user-stats">
                          <span className="verified-user-rating">
                            {/* Add a check for user.rating before calling toFixed */}
                            ★ {user.rating ? user.rating.toFixed(1) : "N/A"}
                          </span>
                          <span className="verified-user-deals">
                            {user.deals} deals
                          </span>
                        </div>
                        <button className="view-profile-btn">
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="verified-users-description">
              <p>
                Our verified users are trusted car providers who have completed
                identity verification and maintained excellent customer
                satisfaction. Rent with confidence knowing you're working with
                the best in the community.
              </p>
            </div>
          </section>
          {/* End Verified Users Section */}
        </div>
        {/* Add more content here - featured cars, etc. */}
      </div>

      {/* Footer Section - Moved outside of home-container */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section brand">
            <h3>RIDEDEALS</h3>
            <p>
              Adresse: CITÉ GROVE <br />
              STREET AIN-ELKEBIRA <br />
              SÉTIF
            </p>
            <p>Allridedeals@gmail.com</p>
            <p>+213 673 45 54 10</p>
          </div>

          <div className="footer-section support">
            <h3>Support</h3>
            <ul>
              <li>
                <a href="#">My Account</a>
              </li>
              <li>
                <a href="/login">Login / Register</a>
              </li>
              <li>
                <a href="#">Saved deals</a>
              </li>
              <li>
                <a href="#">Our Trusted Collaborators</a>
              </li>
              <li>
                <a href="/marketplace">Marketplace</a>
              </li>
              <li>
                <a href="#">Rental space</a>
              </li>
            </ul>
          </div>

          <div className="footer-section account">
            <h3>Account</h3>
            <ul>
              <li>
                <a href="#">My Account</a>
              </li>
              <li>
                <a href="/login">Login / Register</a>
              </li>
              <li>
                <a href="#">Saved deals</a>
              </li>
              <li>
                <a href="#">Our Trusted Collaborators</a>
              </li>
              <li>
                <a href="/marketplace">Marketplace</a>
              </li>
              <li>
                <a href="#">Rental space</a>
              </li>
            </ul>
          </div>

          <div className="footer-section quick-links">
            <h3>Quick Link</h3>
            <ul>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms Of Use</a>
              </li>
              <li>
                <a href="#">FAQ</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© Copyright RIDEDEALS 2025. All right reserved.</p>
        </div>
      </footer>
      {/* End Footer Section */}
    </>
  );
}

export default HomePage;
