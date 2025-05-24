import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./MyDealsPage.css"; // We'll create this CSS file next

const MyDealsPage = () => {
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchMyListedCars = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("/api/cars/my-listings/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyCars(response.data.data);
      setError("");
    } catch (err) {
      console.error("Error fetching user's listed cars:", err);
      setError(
        "Failed to fetch your listed cars. " +
          (err.response?.data?.error || err.message)
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMyListedCars();
  }, [fetchMyListedCars]);

  if (loading) {
    return <div className="my-deals-page-loading">Loading your deals...</div>;
  }

  if (error) {
    return <div className="my-deals-page-error">Error: {error}</div>;
  }

  return (
    <div className="my-deals-page">
      <h1>My Listed Cars</h1>
      {myCars.length === 0 ? (
        <div className="no-deals-message">
          <p>You haven't listed any cars yet.</p>
          <Link to="/post-car" className="btn btn-primary">
            List a Car Now
          </Link>
        </div>
      ) : (
        <div className="deals-grid">
          {myCars.map((car) => (
            <div key={car._id} className="deal-card">
              <Link to={`/cars/${car._id}`}>
                <img
                  src={car.image ? car.image : "/images/default-car.png"}
                  alt={car.name}
                  className="deal-card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/default-car.png";
                  }}
                />
                <div className="deal-card-content">
                  <h3>{car.name}</h3>
                  <p className="deal-card-price">
                    Price: ${car.price.toLocaleString()}
                  </p>
                  <p className="deal-card-type">
                    Type: {car.type === "sale" ? "For Sale" : "For Rent"}
                  </p>
                  <p className="deal-card-status">
                    Status: {car.status || "Available"}
                  </p>
                </div>
              </Link>
              {/* Add buttons for Edit/Delete if needed later */}
              {/* <div className="deal-card-actions">
                <Link to={`/edit-car/${car._id}`} className="btn btn-secondary">Edit</Link>
                <button onClick={() => handleDelete(car._id)} className="btn btn-danger">Delete</button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDealsPage;
