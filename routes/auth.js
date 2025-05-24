const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const { protect } = require("../middleware/auth"); // Import auth middleware

// Authentication routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-code", authController.verifyCode);

// Route to get verified users
router.get("/verified-users", authController.getVerifiedUsers);

// Get user profile (requires auth)
router.get("/me", protect, authController.getMe);

// Update user profile (requires auth)
router.put("/me/update", protect, authController.updateMe);

// Change password (requires auth)
router.put("/me/change-password", protect, authController.changePassword);

// Delete Account Route (Protected by middleware)
router.delete("/me/delete", protect, authController.deleteMe);

module.exports = router;
