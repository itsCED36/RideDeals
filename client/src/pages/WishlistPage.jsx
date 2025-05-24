import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaMapMarkerAlt, FaCar, FaCalendarAlt } from "react-icons/fa";
import "./WishlistPage.css";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistCars, setWishlistCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch wishlist cars
  useEffect(() => {
    const fetchWishlistCars = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You need to be logged in to view your wishlist");
          setLoading(false);
          return;
        }

        console.log(
          "Fetching wishlist with token:",
          token.substring(0, 10) + "..."
        );

        // Include token in the request headers
        const response = await axios.get(
          "http://localhost:5000/api/cars/wishlist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Wishlist API response:",
          response.status,
          response.statusText
        );

        if (response.data && response.data.success) {
          console.log("Wishlist data received:", response.data);
          setWishlistCars(response.data.data || []);
        } else {
          throw new Error("Failed to fetch wishlist");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching wishlist:", err);

        // Enhanced error logging for debugging
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }

        setError(`Failed to load wishlist: ${err.message}`);
        setLoading(false);
      }
    };

    fetchWishlistCars();
  }, []);

  const removeFromWishlist = async (carId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You need to be logged in to remove items from your wishlist");
        return;
      }

      // Call the API to remove from wishlist
      const response = await axios.delete(
        `http://localhost:5000/api/cars/wishlist/${carId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update local state
        setWishlistCars(wishlistCars.filter((car) => car._id !== carId));
        // Show confirmation message (could use a toast notification library in a real app)
        alert("Car removed from wishlist!");
      } else {
        throw new Error("Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Failed to remove car from wishlist. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="loader"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>Cars you've saved to your wishlist</p>
      </div>

      {wishlistCars.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-wishlist-content">
            <FaHeart className="empty-heart-icon" />
            <h2>Your wishlist is empty</h2>
            <p>
              Browse our marketplace and rental section to find cars you love.
            </p>
            <div className="empty-wishlist-actions">
              <button
                onClick={() => navigate("/marketplace")}
                className="browse-marketplace-btn"
              >
                Browse Marketplace
              </button>
              <button
                onClick={() => navigate("/rental")}
                className="browse-rentals-btn"
              >
                Browse Rentals
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="wishlist-content">
          <div className="wishlist-count">
            <span>
              {wishlistCars.length} {wishlistCars.length === 1 ? "car" : "cars"}{" "}
              in your wishlist
            </span>
          </div>

          <div className="wishlist-grid">
            {wishlistCars.map((car) => (
              <div key={car._id} className="wishlist-card">
                <div className="wishlist-card-image">
                  <img
                    src={
                      car.images && car.images.length > 0
                        ? car.images[0].startsWith("http")
                          ? car.images[0]
                          : `http://localhost:5000${car.images[0]}`
                        : "/uploads/cars/default-car.png" // Fallback image
                    }
                    alt={`${car.brand} ${car.name}`}
                  />
                  {car.type === "rent" && car.rentLength && (
                    <div className="wishlist-card-badge rent">
                      <FaCalendarAlt />
                      <span>
                        {car.rentLength} {car.rentLength === 1 ? "day" : "days"}
                      </span>
                    </div>
                  )}
                  <div className="wishlist-card-badge type">
                    {car.type === "sale" ? "FOR SALE" : "FOR RENT"}
                  </div>
                  <button
                    className="remove-wishlist-btn"
                    onClick={() => removeFromWishlist(car._id)}
                    title="Remove from wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="wishlist-card-info">
                  <h3 className="wishlist-card-title">
                    {car.brand} {car.name} {car.year && `(${car.year})`}
                  </h3>
                  <div className="wishlist-card-price">
                    {car.price.toLocaleString()} DZD
                    {car.type === "rent" && (
                      <span className="per-day">per day</span>
                    )}
                  </div>

                  <div className="wishlist-card-meta">
                    {car.condition && (
                      <div className="wishlist-meta-item">
                        <FaCar />
                        <span>{car.condition}</span>
                      </div>
                    )}
                    {car.location && (
                      <div className="wishlist-meta-item">
                        <FaMapMarkerAlt />
                        <span>{car.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="wishlist-card-seller">
                    Seller:{" "}
                    {car.user
                      ? `${car.user.firstName} ${car.user.lastName}`
                      : "Unknown"}
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/cars/${car._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
