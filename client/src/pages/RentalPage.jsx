import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaCalendarAlt,
} from "react-icons/fa";
import "./RentalPage.css";

const RentalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  // State variables
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Filter states
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brand: "",
    year: "",
    condition: "",
    location: "",
    minRentLength: "",
    maxRentLength: "",
  });

  // Available filter options
  const brands = [
    "Toyota",
    "BMW",
    "Mercedes",
    "Audi",
    "Honda",
    "Ford",
    "Chevrolet",
    "Volkswagen",
    "Hyundai",
    "Kia",
  ];
  const conditions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"];
  const years = Array.from(
    { length: 31 },
    (_, i) => new Date().getFullYear() - i
  );
  const rentLengths = [1, 3, 7, 14, 30, 90, 180, 365];
  const locations = [
    "Algiers",
    "Oran",
    "Constantine",
    "Annaba",
    "Blida",
    "Batna",
    "Djelfa",
    "Sétif",
    "Sidi Bel Abbès",
    "Biskra",
    "Tlemcen",
    "Béjaïa",
    "Tiaret",
    "Tizi Ouzou",
    "Jijel",
    "Skikda",
    "El Oued",
    "Chlef",
    "Bordj Bou Arréridj",
    "Mostaganem",
    "Médéa",
    "Tébessa",
    "Souk Ahras",
    "Msila",
    "Mascara",
    "Relizane",
    "Laghouat",
    "Bechar",
    "Adrar",
    "Ghardaïa",
    "Ouargla",
    "Tamanrasset",
    "Boumerdès",
    "El Bayadh",
    "Khenchela",
    "Guelma",
    "Ain Defla",
    "Bouira",
    "Mila",
    "Tissemsilt",
    "Naama",
    "El Tarf",
    "Illizi",
    "Tindouf",
    "Saida",
    "Ain Témouchent",
    "Tipaza",
  ];

  // Fetch cars on component mount and when filters change
  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      let url = "http://localhost:5000/api/cars?type=rent";

      // Add query params from state
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      // Add filter params
      if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
      if (filters.brand) url += `&brand=${encodeURIComponent(filters.brand)}`;
      if (filters.year) url += `&year=${filters.year}`;
      if (filters.condition)
        url += `&condition=${encodeURIComponent(filters.condition)}`;
      if (filters.location)
        url += `&location=${encodeURIComponent(filters.location)}`;
      if (filters.minRentLength)
        url += `&minRentLength=${filters.minRentLength}`;
      if (filters.maxRentLength)
        url += `&maxRentLength=${filters.maxRentLength}`;

      const response = await axios.get(url);

      if (response.data && response.data.success) {
        setCars(response.data.data);
      } else {
        throw new Error("Failed to fetch rental cars");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching rental cars:", err);
      setError("Failed to load rental cars. Please try again later.");
      setLoading(false);

      // Set some mockup data if API fails
      setCars([
        {
          _id: "1",
          name: "Toyota Camry",
          brand: "Toyota",
          price: 2500,
          year: 2022,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=Toyota+Camry",
          condition: "Excellent",
          location: "Algiers",
          rating: 4.8,
          reviews: 15,
          rentLength: 30,
          description: "Comfortable sedan for daily commute or family trips.",
          user: { firstName: "Ahmed", lastName: "Bensalem" },
          isFavorite: false,
        },
        {
          _id: "2",
          name: "Mercedes C-Class",
          brand: "Mercedes",
          price: 4000,
          year: 2021,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=Mercedes+C-Class",
          condition: "Like New",
          location: "Oran",
          rating: 4.9,
          reviews: 23,
          rentLength: 14,
          description: "Luxury sedan with premium features and comfort.",
          user: { firstName: "Karim", lastName: "Hadj" },
          isFavorite: true,
        },
        {
          _id: "3",
          name: "Audi Q5",
          brand: "Audi",
          price: 5500,
          year: 2020,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=Audi+Q5",
          condition: "Good",
          location: "Constantine",
          rating: 4.6,
          reviews: 9,
          rentLength: 7,
          description: "Spacious SUV perfect for family vacations and trips.",
          user: { firstName: "Sarah", lastName: "Williams" },
          isFavorite: false,
        },
      ]);
    }
  }, [filters, searchQuery]);

  // Fetch cars when component mounts or URL changes
  useEffect(() => {
    fetchCars();
  }, [fetchCars, location.search]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // Update URL with search query
    const params = new URLSearchParams(location.search);
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }

    // Push new URL with search query
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });

    // Fetch cars with new query
    fetchCars();
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Update URL with all filters
    const params = new URLSearchParams(location.search);

    // Set or remove each filter param
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Keep search query if it exists
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    // Push new URL with filters
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });

    // Close filter panel on mobile
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }

    // Fetch cars with new filters
    fetchCars();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      brand: "",
      year: "",
      condition: "",
      location: "",
      minRentLength: "",
      maxRentLength: "",
    });

    // Update URL by removing all filter params but keeping search query
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });

    // Fetch cars without filters
    fetchCars();
  };

  return (
    <div className="rental-page">
      <div className="rental-header">
        <h1>Car Rental Service</h1>
        <p>Find the perfect car to rent for your needs</p>
      </div>

      <div className="rental-search">
        <form className="search-input-container" onSubmit={handleSearchSubmit}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by brand, model, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
            >
              <FaTimes />
            </button>
          )}
        </form>
        <button
          type="submit"
          className="search-btn"
          onClick={handleSearchSubmit}
        >
          Search
        </button>
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filters
        </button>
      </div>

      <div className="rental-content">
        {/* Filter panel */}
        <div className={`filter-panel ${showFilters ? "show" : ""}`}>
          <div className="filter-header">
            <h2>Filters</h2>
            <button
              className="close-filters-btn"
              onClick={() => setShowFilters(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="filter-group">
            <h3>Price Range (per day)</h3>
            <div className="price-range">
              <input
                type="number"
                name="minPrice"
                placeholder="Min DZD"
                value={filters.minPrice}
                onChange={handleFilterChange}
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max DZD"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <h3>Rental Duration (days)</h3>
            <div className="rent-length-range">
              <select
                name="minRentLength"
                value={filters.minRentLength}
                onChange={handleFilterChange}
              >
                <option value="">Min Days</option>
                {rentLengths.map((days) => (
                  <option key={`min-${days}`} value={days}>
                    {days} {days === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
              <span>to</span>
              <select
                name="maxRentLength"
                value={filters.maxRentLength}
                onChange={handleFilterChange}
              >
                <option value="">Max Days</option>
                {rentLengths.map((days) => (
                  <option key={`max-${days}`} value={days}>
                    {days} {days === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <h3>Brand</h3>
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Year</h3>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Condition</h3>
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
            >
              <option value="">All Conditions</option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Location</h3>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="apply-filters-btn" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        {/* Cars grid */}
        <div className="cars-container">
          {loading ? (
            <div className="loading">Loading rental cars...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : cars.length === 0 ? (
            <div className="no-cars">
              <h3>No rental cars found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="cars-grid">
              {cars.map((car) => (
                <div key={car._id} className="car-card rental-card">
                  <div className="car-image">
                    <img
                      src={
                        car.images && car.images.length > 0 // Check if images array exists and is not empty
                          ? car.images[0].startsWith("http") // Use the first image
                            ? car.images[0]
                            : `http://localhost:5000${car.images[0]}`
                          : "/uploads/cars/default-car.png" // Fallback if no images
                      }
                      alt={`${car.brand} ${car.name}`}
                    />
                    {car.rentLength && (
                      <div className="rental-duration">
                        <FaCalendarAlt />
                        <span>
                          {car.rentLength}{" "}
                          {car.rentLength === 1 ? "day" : "days"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="car-info">
                    <h3 className="car-title">
                      {car.brand} {car.name} {car.year && `(${car.year})`}
                    </h3>
                    <div className="car-price">
                      {car.price.toLocaleString()} DZD{" "}
                      <span className="per-day">per day</span>
                    </div>
                    <div className="car-meta">
                      {car.condition && (
                        <span className="car-condition">{car.condition}</span>
                      )}
                      {car.location && (
                        <span className="car-location">{car.location}</span>
                      )}
                    </div>
                    <div className="car-rating">
                      <span className="stars">★ {car.rating}</span>
                      <span className="reviews">({car.reviews} reviews)</span>
                    </div>
                    <div className="car-seller">
                      Owner:{" "}
                      {car.user
                        ? `${car.user.firstName} ${car.user.lastName}`
                        : "Unknown"}
                    </div>
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/cars/${car._id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalPage;
