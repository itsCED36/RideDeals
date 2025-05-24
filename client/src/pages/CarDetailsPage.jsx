import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeart,
  FaRegHeart,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGasPump,
  FaCar,
  FaTachometerAlt,
  FaUser,
  FaStar,
} from "react-icons/fa";
import "./CarDetailsPage.css";

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const [carReviewsList, setCarReviewsList] = useState([]);
  const [ownerReviewsList, setOwnerReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showCarReviewForm, setShowCarReviewForm] = useState(false);
  const [showOwnerReviewForm, setShowOwnerReviewForm] = useState(false);
  const [newCarRating, setNewCarRating] = useState(0);
  const [newCarComment, setNewCarComment] = useState("");
  const [newOwnerRating, setNewOwnerRating] = useState(0);
  const [newOwnerComment, setNewOwnerComment] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  const fetchCarReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/reviews/car/${id}`
      );
      if (data.success) {
        setCarReviewsList(data.data);
      } else {
        setReviewError("Failed to load car reviews.");
      }
    } catch (err) {
      console.error("Error fetching car reviews:", err);
      setReviewError(
        "Error fetching car reviews. " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);
  const fetchOwnerReviews = useCallback(async (ownerId) => {
    if (!ownerId) {
      console.log("No owner ID provided for fetching reviews");
      return;
    }

    // Validate if the ownerId is a valid MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(ownerId)) {
      console.error("Invalid owner ID format:", ownerId);
      setReviewError("Invalid owner ID format.");
      return;
    }

    setReviewsLoading(true);
    try {
      console.log("Fetching owner reviews for ID:", ownerId);
      const { data } = await axios.get(
        `http://localhost:5000/api/reviews/user/${ownerId}`
      );

      if (data.success) {
        setOwnerReviewsList(data.data);
        setReviewError(""); // Clear any previous errors
      } else {
        setReviewError(
          "Failed to load owner reviews: " + (data.error || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Error fetching owner reviews:", err);

      if (err.response?.status === 404) {
        // This might be normal if the user has no reviews yet
        console.log("No reviews found for this user (404 response)");
        setOwnerReviewsList([]); // Set empty array instead of error for 404
        setReviewError(""); // Don't show error for no reviews
      } else {
        setReviewError(
          "Error fetching owner reviews. " +
            (err.response?.data?.error || err.message)
        );
      }
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const handleDeleteReview = async (reviewId, reviewType) => {
    if (!currentUser) {
      alert("Please log in.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    setReviewsLoading(true);
    setReviewError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Review deleted successfully!");
      if (reviewType === "car") {
        setCarReviewsList((prev) => prev.filter((r) => r._id !== reviewId));
        const carRes = await axios.get(`http://localhost:5000/api/cars/${id}`);
        if (carRes.data.success) setCar(carRes.data.data);
      } else if (reviewType === "user") {
        setOwnerReviewsList((prev) => prev.filter((r) => r._id !== reviewId));
        const carRes = await axios.get(`http://localhost:5000/api/cars/${id}`);
        if (carRes.data.success) setCar(carRes.data.data);
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      setReviewError(
        "Error deleting review. " + (err.response?.data?.error || err.message)
      );
      alert("Failed to delete review.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/cars/${id}`
        );

        if (response.data && response.data.success) {
          const fetchedCar = response.data.data;
          setCar(fetchedCar);
          setIsFavorite(fetchedCar.isFavorite || false);
          fetchCarReviews();
          if (fetchedCar.user && fetchedCar.user._id) {
            console.log("Found car owner ID:", fetchedCar.user._id);
            fetchOwnerReviews(fetchedCar.user._id);
          } else {
            console.log(
              "Car owner information is missing or incomplete:",
              fetchedCar.user
            );
            setOwnerReviewsList([]); // Initialize with empty array if no owner
          }
        } else {
          throw new Error("Failed to fetch car details");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching car details:", err);
        let errorMessage = "Could not fetch car details. ";
        if (err.response) {
          errorMessage += `Server responded with ${err.response.status}: ${
            err.response.data.error || err.response.statusText
          }`;
        } else if (err.request) {
          errorMessage +=
            "No response from server. Please check your network connection.";
        } else {
          errorMessage += err.message;
        }
        setError(errorMessage);
        // setCar(null); // Fallback to mock data instead of nulling out car

        // Fallback to mock data for development if API fails
        console.warn("API call failed, using mock car data for development.");
        setCar({
          _id: "mock-id",
          brand: "Mock Brand",
          name: "Mock Model X",
          year: 2024,
          price: 5000000,
          type: "sale",
          images: [
            `http://localhost:5173/images/default-car.png`, // Updated to absolute URL for frontend asset
            "https://via.placeholder.com/800x600.png?text=Mock+Car+Image+2",
            "https://via.placeholder.com/800x600.png?text=Mock+Car+Image+3",
          ],
          description:
            "This is a mock description for a fantastic car. It has all the mock features you could imagine and is owned by a mock user.",
          features: [
            "Mock Feature 1",
            "Mock Feature 2",
            "Air Conditioning",
            "GPS",
          ],
          condition: "New",
          location: "Mock City, MS",
          mileage: 100,
          user: {
            _id: "mock-owner-id",
            firstName: "Mock",
            lastName: "Owner",
            rating: 4.5,
            deals: 10,
            email: "mockowner@example.com",
            phone: "123-456-7890",
          },
          createdAt: new Date().toISOString(),
          rating: 4.2,
          reviews: 5,
          isFavorite: false,
          reviewDocuments: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Error fetching current user from localStorage:", e);
      }
    }
  }, [id, fetchCarReviews, fetchOwnerReviews]);

  const handleStarClick = (rating, type) => {
    if (type === "car") setNewCarRating(rating);
    if (type === "owner") setNewOwnerRating(rating);
  };

  const handleCarReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to submit a review.");
      return;
    }
    if (newCarRating === 0) {
      alert("Please select a rating.");
      return;
    }
    setReviewsLoading(true);
    setReviewError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          carId: id,
          rating: newCarRating,
          comment: newCarComment,
          reviewType: "car",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Car review submitted successfully!");
        setCarReviewsList((prevReviews) =>
          [response.data.data, ...prevReviews].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        const carResponse = await axios.get(
          `http://localhost:5000/api/cars/${id}`
        );
        if (carResponse.data.success) setCar(carResponse.data.data);
        setShowCarReviewForm(false);
        setNewCarRating(0);
        setNewCarComment("");
      } else {
        setReviewError(response.data.error || "Failed to submit car review.");
        alert(response.data.error || "Failed to submit car review.");
      }
    } catch (err) {
      console.error("Error submitting car review:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error submitting car review.";
      setReviewError(errorMessage);
      alert(errorMessage);
    } finally {
      setReviewsLoading(false);
    }
  };
  const handleOwnerReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to submit a review.");
      return;
    }
    if (!car?.user?._id) {
      alert("Car owner information is not available.");
      return;
    }
    if (newOwnerRating === 0) {
      alert("Please select a rating.");
      return;
    }

    setReviewsLoading(true);
    setReviewError("");

    try {
      console.log("Submitting owner review for owner:", car.user._id);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      console.log(
        "Token available:",
        token ? "Yes (length: " + token.length + ")" : "No"
      );

      const reviewData = {
        revieweeId: car.user._id,
        rating: newOwnerRating,
        comment: newOwnerComment,
        reviewType: "user",
      };

      console.log("Owner review data:", reviewData);

      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        alert("Owner review submitted successfully!");
        setOwnerReviewsList((prevReviews) =>
          [response.data.data, ...prevReviews].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        const carResponse = await axios.get(
          `http://localhost:5000/api/cars/${id}`
        );
        if (carResponse.data.success) setCar(carResponse.data.data);
        setShowOwnerReviewForm(false);
        setNewOwnerRating(0);
        setNewOwnerComment("");
      } else {
        setReviewError(response.data.error || "Failed to submit owner review.");
        alert(response.data.error || "Failed to submit owner review.");
      }
    } catch (err) {
      console.error("Error submitting owner review:", err);
      // Log more detailed information about the error
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        console.error("Response headers:", err.response.headers);
      } else if (err.request) {
        console.error("Request was made but no response received");
        console.error("Request details:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }

      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error submitting owner review.";
      setReviewError(errorMessage);
      alert(errorMessage);
    } finally {
      setReviewsLoading(false);
    }
  };

  const nextImage = () => {
    if (car && car.images && car.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === car.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (car && car.images && car.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? car.images.length - 1 : prevIndex - 1
      );
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to add cars to your wishlist");
        return;
      }
      const url = `http://localhost:5000/api/cars/wishlist/${id}`;
      let response;
      if (!isFavorite) {
        response = await axios.post(
          url,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data && response.data.success) {
          setIsFavorite(true);
          alert("Car added to wishlist! Check your wishlist page.");
        } else {
          throw new Error(response.data.error || "Failed to add to wishlist");
        }
      } else {
        response = await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.success) {
          setIsFavorite(false);
          alert("Car removed from wishlist!");
        } else {
          throw new Error(
            response.data.error || "Failed to remove from wishlist"
          );
        }
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      alert(err.message || "Failed to update wishlist. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeleteListing = async () => {
    if (!car || !currentUser || car.user?._id !== currentUser?._id) {
      alert("You are not authorized to delete this listing.");
      return;
    }
    if (
      window.confirm(
        "Are you sure you want to delete this car listing? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/cars/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Listing deleted successfully!");
        navigate("/marketplace");
      } catch (err) {
        console.error("Error deleting car listing:", err);
        alert(
          "Failed to delete listing. " +
            (err.response?.data?.error || err.message)
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="car-details-loading">
        <div className="loader"></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="car-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-details-not-found">
        <h2>Car Not Found</h2>
        <p>The car you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  // Determine if the current user can review the car or owner
  const canReviewCar =
    currentUser && car.user && currentUser._id !== car.user._id;
  // For owner review, let's assume if they can review the car, they can review the owner if it's a rental.
  // More specific logic (e.g., based on past rental transaction) would be needed for higher precision.
  const canReviewOwner =
    currentUser &&
    car.user &&
    currentUser._id !== car.user._id &&
    car.type === "rent";

  return (
    <div className="car-details-page">
      <div className="car-details-container">
        <div className="car-details-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
          <h1 className="car-details-title">
            {car.brand} {car.name} {car.year && `(${car.year})`}
          </h1>
          <button
            className={`favorite-btn-large ${isFavorite ? "favorited" : ""}`}
            onClick={toggleFavorite}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
            <span>
              {isFavorite ? "Saved to Favorites" : "Add to Favorites"}
            </span>
          </button>
        </div>

        <div className="car-details-main">
          {/* Main Image Viewer */}
          {car.images && car.images.length > 0 ? (
            <div className="car-main-image-viewer">
              {" "}
              <img
                src={
                  car.images[currentImageIndex].startsWith("http") ||
                  car.images[currentImageIndex].startsWith("/images/")
                    ? car.images[currentImageIndex]
                    : `http://localhost:5000${car.images[currentImageIndex]}`
                }
                alt={`${car.brand} ${car.name} - Image ${
                  currentImageIndex + 1
                }`}
                className="car-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-car.png";
                }} // Fallback for broken image links
              />
              {car.images.length > 1 && (
                <div className="image-navigation-buttons">
                  <button
                    onClick={prevImage}
                    className="image-nav-btn prev-btn"
                  >
                    &#10094;
                  </button>
                  <button
                    onClick={nextImage}
                    className="image-nav-btn next-btn"
                  >
                    &#10095;
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="car-main-image-viewer">
              <img
                src="/images/default-car.png"
                alt={`${car.brand} ${car.name} - Default Image`}
                className="car-main-image"
              />
            </div>
          )}

          {/* Thumbnail Gallery */}
          {car.images && car.images.length > 1 && (
            <div className="car-thumbnail-gallery">
              {car.images.map((image, index) => (
                <img
                  key={index}
                  src={
                    image.startsWith("http") || image.startsWith("/images/")
                      ? image
                      : `http://localhost:5000${image}`
                  }
                  alt={`${car.brand} ${car.name} - Thumbnail ${index + 1}`}
                  className={`car-thumbnail-image ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/default-car.png";
                  }}
                />
              ))}
            </div>
          )}

          <div className="car-details-info">
            <div className="car-details-price-section">
              <div className="car-details-price">
                {car.price ? car.price.toLocaleString() : "N/A"} DZD
                {car.type === "rent" && (
                  <span className="per-day">per day</span>
                )}
              </div>
              {car.discount && (
                <div className="car-details-discount">
                  <span className="discount-label">Discount:</span>
                  <span className="discount-value">{car.discount}</span>
                </div>
              )}
            </div>
            <div className="car-details-meta">
              <div className="car-meta-item">
                <FaMapMarkerAlt />
                <span>{car.location || "N/A"}</span>
              </div>
              <div className="car-meta-item">
                <FaCar />
                <span>{car.condition || "N/A"}</span>
              </div>
              {car.mileage !== undefined && car.mileage !== null && (
                <div className="car-meta-item">
                  <FaTachometerAlt />
                  <span>{car.mileage.toLocaleString()} km</span>
                </div>
              )}
              <div className="car-meta-item">
                <FaUser />
                <span>
                  {car.user
                    ? `${car.user.firstName} ${car.user.lastName}`
                    : "Unknown Owner"}
                </span>
              </div>
            </div>
            <div className="car-details-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    color={
                      i < Math.round(car.rating || 0) ? "#ffc107" : "#e4e5e9"
                    }
                  />
                ))}
                <span className="rating-value">
                  {car.rating ? car.rating.toFixed(1) : "N/A"}
                </span>
              </div>
              <span className="reviews">({car.reviews || 0} reviews)</span>
            </div>

            <div className="car-details-listing-info">
              <p className="listing-type">
                Listed for:{" "}
                <strong>{car.type === "sale" ? "Sale" : "Rent"}</strong>
              </p>
              <p className="listing-date">
                Listed on: <strong>{formatDate(car.createdAt)}</strong>
              </p>
            </div>
            <div className="car-details-action-buttons">
              {currentUser && car.user && currentUser._id === car.user._id ? (
                <button
                  className="delete-listing-btn"
                  onClick={handleDeleteListing}
                >
                  Delete Listing
                </button>
              ) : (
                <>
                  <button className="contact-owner-btn">Contact Owner</button>
                  {car.type === "rent" ? (
                    <button className="rent-now-btn">Rent Now</button>
                  ) : (
                    <button className="buy-now-btn">Buy Now</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="car-details-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === "features" ? "active" : ""}`}
              onClick={() => setActiveTab("features")}
            >
              Features
            </button>
            <button
              className={`tab-btn ${activeTab === "owner" ? "active" : ""}`}
              onClick={() => setActiveTab("owner")}
            >
              Owner Info
            </button>
            <button
              className={`tab-btn ${
                activeTab === "carReviews" ? "active" : ""
              }`}
              onClick={() => setActiveTab("carReviews")}
            >
              Car Reviews ({carReviewsList.length})
            </button>
            {car?.user && (
              <button
                className={`tab-btn ${
                  activeTab === "ownerReviews" ? "active" : ""
                }`}
                onClick={() => setActiveTab("ownerReviews")}
              >
                Owner Reviews ({ownerReviewsList.length})
              </button>
            )}
          </div>

          <div className="tab-content">
            {activeTab === "description" && (
              <div className="description-tab">
                <h3>Description</h3>
                <p>{car.description || "No description provided."}</p>
              </div>
            )}
            {activeTab === "features" && (
              <div className="features-section">
                <h3>Features</h3>
                {car.features && car.features.length > 0 ? (
                  <ul className="features-list">
                    {car.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No features listed.</p>
                )}
              </div>
            )}
            {activeTab === "owner" && (
              <div className="car-details-owner-section">
                <h3>Owner Information</h3>
                {car.user ? (
                  <div className="owner-card">
                    <div className="owner-avatar">
                      {`${car.user.firstName.charAt(
                        0
                      )}${car.user.lastName.charAt(0)}`}
                    </div>
                    <div className="owner-info">
                      <h4 className="owner-name">
                        {`${car.user.firstName} ${car.user.lastName}`}
                      </h4>
                      <div className="owner-rating-display">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={
                                i < Math.round(car.user.rating || 0)
                                  ? "#ffc107"
                                  : "#e4e5e9"
                              }
                            />
                          ))}
                          <span className="rating-value">
                            {car.user.rating
                              ? car.user.rating.toFixed(1)
                              : "N/A"}
                          </span>
                        </div>
                        <span className="reviews">
                          ({car.user.deals || 0} reviews on them)
                        </span>
                      </div>
                      <p className="owner-contact">
                        {car.user.phone && (
                          <span className="owner-phone">{car.user.phone}</span>
                        )}
                        {car.user.email && (
                          <span className="owner-email">{car.user.email}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Owner information not available.</p>
                )}
                {canReviewOwner && (
                  <button
                    onClick={() => setShowOwnerReviewForm((prev) => !prev)}
                    className="review-btn submit-review-btn"
                  >
                    {showOwnerReviewForm ? "Cancel Review" : "Review Owner"}
                  </button>
                )}
                {showOwnerReviewForm && (
                  <form
                    onSubmit={handleOwnerReviewSubmit}
                    className="review-form"
                  >
                    <h4>
                      Review {car.user.firstName} {car.user.lastName}
                    </h4>
                    <div className="rating-input">
                      <span>Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`star-icon ${
                            star <= newOwnerRating
                              ? "star-selected"
                              : "star-empty"
                          }`}
                          onClick={() => handleStarClick(star, "owner")}
                        />
                      ))}
                    </div>
                    <textarea
                      value={newOwnerComment}
                      onChange={(e) => setNewOwnerComment(e.target.value)}
                      placeholder="Write your review for the owner..."
                      rows="3"
                      required
                    />
                    <button
                      type="submit"
                      className="submit-review-btn"
                      disabled={reviewsLoading || newOwnerRating === 0}
                    >
                      {reviewsLoading ? "Submitting..." : "Submit Owner Review"}
                    </button>
                    {reviewError && (
                      <p className="error-message">{reviewError}</p>
                    )}
                  </form>
                )}
              </div>
            )}
            {activeTab === "carReviews" && (
              <div className="car-reviews-section">
                <h3>Car Reviews</h3>
                {canReviewCar && (
                  <button
                    onClick={() => setShowCarReviewForm((prev) => !prev)}
                    className="review-btn submit-review-btn"
                  >
                    {showCarReviewForm
                      ? "Cancel Review"
                      : "Write a Review for this Car"}
                  </button>
                )}
                {showCarReviewForm && (
                  <form
                    onSubmit={handleCarReviewSubmit}
                    className="review-form"
                  >
                    <h4>Review this Car</h4>
                    <div className="rating-input">
                      <span>Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`star-icon ${
                            star <= newCarRating
                              ? "star-selected"
                              : "star-empty"
                          }`}
                          onClick={() => handleStarClick(star, "car")}
                        />
                      ))}
                    </div>
                    <textarea
                      value={newCarComment}
                      onChange={(e) => setNewCarComment(e.target.value)}
                      placeholder="Write your review for the car..."
                      rows="3"
                      required
                    />
                    <button
                      type="submit"
                      className="submit-review-btn"
                      disabled={reviewsLoading || newCarRating === 0}
                    >
                      {reviewsLoading ? "Submitting..." : "Submit Car Review"}
                    </button>
                    {reviewError && (
                      <p className="error-message">{reviewError}</p>
                    )}
                  </form>
                )}
                {reviewsLoading && <div className="loader-small"></div>}
                {!reviewsLoading && carReviewsList.length === 0 && (
                  <p>No reviews for this car yet.</p>
                )}
                {!reviewsLoading && carReviewsList.length > 0 && (
                  <ul className="reviews-list">
                    {carReviewsList.map((review) => (
                      <li key={review._id} className="review-item">
                        <div className="review-header">
                          <strong className="reviewer-name">
                            {review.reviewer
                              ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                              : "Anonymous"}
                          </strong>
                          <span className="review-date">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                            />
                          ))}
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        {currentUser &&
                          review.reviewer &&
                          currentUser._id === review.reviewer._id && (
                            <button
                              onClick={() =>
                                handleDeleteReview(review._id, "car")
                              }
                              className="delete-review-btn"
                              disabled={reviewsLoading}
                            >
                              Delete My Review
                            </button>
                          )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === "ownerReviews" && car?.user && (
              <div className="owner-reviews-section">
                <h3>
                  Reviews for {car.user.firstName} {car.user.lastName}
                </h3>
                {reviewsLoading && <div className="loader-small"></div>}
                {!reviewsLoading && ownerReviewsList.length === 0 && (
                  <p>
                    No reviews for this owner yet. Be the first to review them
                    if you've rented from them!
                  </p>
                )}
                {!reviewsLoading && ownerReviewsList.length > 0 && (
                  <ul className="reviews-list">
                    {ownerReviewsList.map((review) => (
                      <li key={review._id} className="review-item">
                        <div className="review-header">
                          <strong className="reviewer-name">
                            {review.reviewer
                              ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                              : "Anonymous"}
                          </strong>
                          <span className="review-date">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                            />
                          ))}
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        {currentUser &&
                          review.reviewer?._id &&
                          currentUser._id === review.reviewer._id && (
                            <button
                              onClick={() =>
                                handleDeleteReview(review._id, "user")
                              }
                              className="delete-review-btn"
                              disabled={reviewsLoading}
                            >
                              Delete My Review
                            </button>
                          )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="car-details-similar-section">
          <h3>Similar Cars</h3>
          <p className="similar-placeholder">
            Similar cars would be displayed here based on brand, price range,
            and type.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;
