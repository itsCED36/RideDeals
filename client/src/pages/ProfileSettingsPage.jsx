import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./ProfileSettingsPage.css";
import { useNavigate } from "react-router-dom";

const ProfileSettingsPage = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    wilaya: "",
    age: "",
    gender: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState(""); // State for delete confirmation password
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false); // Track deletion in progress
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      // Assuming you have an endpoint to get current user's data
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        wilaya: user.wilaya || "",
        age: user.age || "",
        gender: user.gender || "",
      });
    } catch (err) {
      setError(
        "Failed to fetch user data. " +
          (err.response?.data?.message || err.message)
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        wilaya: userData.wilaya,
        age: userData.age,
        gender: userData.gender,
      };

      const response = await axios.put("/api/auth/me/update", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Profile updated successfully!");
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
    } catch (err) {
      setError(
        "Failed to update profile. " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Assuming you have an endpoint to change password
      await axios.put(
        "/api/auth/me/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(
        "Failed to change password. " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!deletePassword) {
      setError("Password is required to delete your account.");
      return;
    }

    // Show a confirmation dialog with clear messaging
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone. After deletion, you will be redirected to the login page."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true); // Show loading state
      const token = localStorage.getItem("token");
      await axios.delete("/api/auth/me/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword }, // Send password in the request body
      });
      setSuccessMessage(
        "Account deleted successfully. You will be redirected to login page..."
      );
      // Clear local storage for user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Shorter timeout for better user experience (1 second)
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setIsDeleting(false); // Reset loading state on error
      setError(
        "Failed to delete account. " +
          (err.response?.data?.message || err.message)
      );
      setDeletePassword(""); // Clear password field on error
    }
  };

  return (
    <div className="profile-settings-page">
      <h1>Profile Settings</h1>
      {error && (
        <p className="error-message" style={{ color: "red" }}>
          {error}
        </p>
      )}
      {successMessage && (
        <p className="success-message" style={{ color: "green" }}>
          {successMessage}
        </p>
      )}

      <form onSubmit={handleUpdateProfile} className="profile-section">
        <h2>Update Profile Information</h2>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={userData.firstName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={userData.lastName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="wilaya">Wilaya</label>
          <input
            type="text"
            id="wilaya"
            name="wilaya"
            value={userData.wilaya}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={userData.age}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={userData.gender}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="profile-section">
        <h2>Change Password</h2>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Change Password
        </button>
      </form>

      {/* Delete Account Section */}
      <form
        onSubmit={handleDeleteAccount}
        className="profile-section delete-account-section"
      >
        <h2>Delete Account</h2>
        <p className="warning-text">
          Warning: Deleting your account is permanent and cannot be undone. All
          your data, including listings and profile information, will be
          removed.
        </p>
        <div className="form-group">
          <label htmlFor="deletePassword">Enter Your Password to Confirm</label>
          <input
            type="password"
            id="deletePassword"
            name="deletePassword"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
            disabled={isDeleting} // Disable input during deletion
          />
        </div>
        <button
          type="submit"
          className="btn btn-danger"
          disabled={isDeleting} // Disable button during deletion
        >
          {isDeleting ? "Deleting Account..." : "Delete My Account"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
