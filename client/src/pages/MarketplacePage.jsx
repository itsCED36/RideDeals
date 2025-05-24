import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import "./MarketplacePage.css";

const MarketplacePage = () => {
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
      let url = "http://localhost:5000/api/cars?type=sale";

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

      const response = await axios.get(url);

      if (response.data && response.data.success) {
        setCars(response.data.data);
      } else {
        throw new Error("Failed to fetch cars");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Failed to load cars. Please try again later.");
      setLoading(false);

      // Set some mockup data if API fails
      setCars([
        {
          _id: "1",
          name: "BMW X5",
          brand: "BMW",
          price: 35000,
          year: 2020,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=BMW+X5",
          condition: "Excellent",
          location: "Algiers",
          rating: 4.7,
          reviews: 42,
          description: "Luxury SUV with great features and comfort.",
          user: { firstName: "John", lastName: "Doe" },
          isFavorite: false,
        },
        {
          _id: "2",
          name: "Mercedes GLE",
          brand: "Mercedes",
          price: 48000,
          year: 2021,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=Mercedes",
          condition: "New",
          location: "Oran",
          rating: 4.9,
          reviews: 28,
          description: "Brand new luxury SUV with all premium features.",
          user: { firstName: "Jane", lastName: "Smith" },
          isFavorite: false,
        },
        {
          _id: "3",
          name: "Audi Q7",
          brand: "Audi",
          price: 52000,
          year: 2019,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=Audi+Q7",
          condition: "Good",
          location: "Constantine",
          rating: 4.8,
          reviews: 35,
          description: "Well-maintained luxury SUV with great performance.",
          user: { firstName: "Mark", lastName: "Johnson" },
          isFavorite: false,
        },
        {
          _id: "4",
          name: "Toyota Camry",
          brand: "Toyota",
          price: 25000,
          year: 2022,
          image:
            "https://via.placeholder.com/300x200/f5f5f5/000000?text=Toyota+Camry",
          condition: "New",
          location: "Annaba",
          rating: 4.6,
          reviews: 51,
          description: "Reliable sedan with excellent fuel economy.",
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
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1>Cars Marketplace</h1>
        <p>Find the best deals on cars for sale</p>

        {/* Search bar */}
        <form className="marketplace-search" onSubmit={handleSearchSubmit}>
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by brand, model or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </form>
      </div>

      <div className="marketplace-content">
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
            <h3>Price Range</h3>
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
            <div className="loading">Loading cars...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : cars.length === 0 ? (
            <div className="no-cars">
              <h3>No cars found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="cars-grid">
              {cars.map((car) => (
                <div key={car._id} className="car-card">
                  <div className="car-image">
                    <img
                      src={
                        car.images && car.images.length > 0
                          ? `http://localhost:5000${car.images[0]}`
                          : `http://localhost:5000/uploads/cars/default-car.png`
                      } // Use images[0] or a default
                      alt={`${car.brand} ${car.name}`}
                    />
                  </div>
                  <div className="car-info">
                    <h3 className="car-title">
                      {car.brand} {car.name} {car.year && `(${car.year})`}
                    </h3>
                    <div className="car-price">
                      {car.price.toLocaleString()} DZD
                    </div>
                    <div className="car-meta">
                      {car.condition && (
                        <span className="car-condition">{car.condition}</span>
                      )}
                      {car.location && (
                        <span className="car-location">{car.location}</span>
                      )}
                    </div>{" "}
                    <div className="car-rating">
                      <span className="stars">★ {car.rating}</span>
                    </div>
                    <div className="car-seller">
                      Seller:{" "}
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

export default MarketplacePage;
