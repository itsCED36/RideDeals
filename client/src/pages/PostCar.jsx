import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PostCar.css";

// List of 58 Algerian Wilayas
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

const PostCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]); // Changed to handle multiple previews
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    type: "sale", // Default value: 'sale' or 'rent'
    description: "",
    year: "",
    mileage: "",
    location: "", // Default location to empty string
    features: "",
    condition: "Good",
    rentLength: "", // Rent duration in days
  });
  // const [imageFile, setImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // Changed to handle multiple files

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to array
    if (files.length > 0) {
      setImageFiles(files); // Keep all selected files for upload

      // Create preview URL for the first selected image only
      const firstFilePreviewUrl = URL.createObjectURL(files[0]);
      setImagePreviews([firstFilePreviewUrl]); // Store as an array with one item
    } else {
      setImageFiles([]);
      setImagePreviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get auth token from local storage
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You must be logged in to post a car");
        setLoading(false);
        // Redirect to login page after a short delay
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // For debugging - log the token to ensure it's present
      console.log("Token found:", token ? "Yes" : "No");
      console.log("Token value:", token);

      // Format features as array
      const featuresArray = formData.features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature !== "");

      // Create FormData object for multipart/form-data (file upload)
      const carFormData = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "features") {
          // Add features as JSON string so it can be parsed on the server
          carFormData.append(key, JSON.stringify(featuresArray));
        } else {
          carFormData.append(key, formData[key]);
        }
      }); // Add numeric fields with proper conversion
      carFormData.set("price", Number(formData.price));
      carFormData.set("year", Number(formData.year || 0));
      carFormData.set("mileage", Number(formData.mileage || 0));

      // Add rentLength as a number if it's a rental
      if (formData.type === "rent" && formData.rentLength) {
        carFormData.set("rentLength", Number(formData.rentLength));
      }

      // Add image files if selected
      // if (imageFile) {
      //   carFormData.append("image", imageFile);
      // }
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          carFormData.append("carImages", file); // Changed from "image" to "carImages"
        });
      }

      // For debugging - log the request details
      console.log("Sending request to API with auth token");

      // Send POST request to backend with FormData
      const response = await axios.post(
        "http://localhost:5000/api/cars",
        carFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
            "x-auth-token": token,
            Authorization: `Bearer ${token}`, // Adding Authorization header as fallback
          },
        }
      );

      console.log("Car posted successfully:", response.data);
      setSuccess(true);
      setLoading(false);

      // Redirect to marketplace page after successful submission
      setTimeout(() => {
        navigate(`/marketplace`); // Changed from /cars/${response.data.data._id}
      }, 2000);
    } catch (err) {
      console.error("Error posting car:", err);

      if (err.response && err.response.status === 401) {
        setError("Authentication failed. Please log in again.");
        // Redirect to login page after a short delay
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to post your car. Please try again."
        );
      }

      setLoading(false);
    }
  };

  return (
    <div className="post-car-container">
      <h1 className="post-car-title">Post Your Car</h1>
      <p className="post-car-subtitle">
        Fill in the details to list your car for sale or rent
      </p>

      {success && (
        <div className="success-message">
          Your car has been posted successfully! Redirecting you to the car's
          page...
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="post-car-form">
        {" "}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Listing Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className={formData.type === "rent" ? "rent-type-selected" : ""}
            >
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Toyota, BMW, Mercedes"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Car Model</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Camry, X5, C-Class"
              required
            />
          </div>{" "}
        </div>
        <div className="form-row">
          {" "}
          <div className="form-group">
            <label htmlFor="price">
              {formData.type === "sale" ? "Price (DZD)" : "Price (DZD per day)"}
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price in DZD"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 2022"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>
        {formData.type === "rent" && (
          <div className="form-row rent-duration-row">
            <div className="form-group">
              <label htmlFor="rentLength">
                <span className="rent-label">Rent Duration (days)</span>
              </label>
              <input
                type="number"
                id="rentLength"
                name="rentLength"
                value={formData.rentLength}
                onChange={handleChange}
                placeholder="e.g. 7"
                min="1"
                required={formData.type === "rent"}
              />
              <p className="form-help-text">
                Number of days this car will be available for rent
              </p>
            </div>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mileage">Mileage (km)</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="e.g. 50000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="location">Location (Wilaya)</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required // Make selection required
          >
            <option value="" disabled>
              -- Select a Wilaya --
            </option>
            {algerianWilayas.map((wilaya) => (
              <option key={wilaya} value={wilaya}>
                {wilaya}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group image-upload-group">
          <label htmlFor="image">Car Images</label> {/* Changed label text */}
          <input
            type="file"
            id="carImages" // Changed id
            name="carImages" // Changed name to carImages
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple // Added multiple attribute
          />
          <p className="form-help-text">
            Upload one or more images of your car (JPG, PNG, WEBP). Max 10
            images.
          </p>
          {/* {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Car preview" />
            </div>
          )} */}
          {imagePreviews.length > 0 && (
            <div className="image-previews-container">
              {/* This will now only loop once, or render one item if accessed directly */}
              {imagePreviews.map((previewUrl, index) => (
                <div key={index} className="image-preview">
                  {/* Using a more generic alt text as it's the primary preview now */}
                  <img src={previewUrl} alt="Car preview" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="features">Features (comma separated)</label>
          <input
            type="text"
            id="features"
            name="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="e.g. Leather Seats, Navigation, Bluetooth"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your car in detail..."
            rows="5"
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Posting..." : "Post Car"}
        </button>
      </form>
    </div>
  );
};

export default PostCar;
