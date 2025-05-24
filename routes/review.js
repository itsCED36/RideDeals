const express = require("express");
const router = express.Router();
const {
  createReview,
  getCarReviews,
  getUserReviews,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth"); // Auth middleware

// Add simple logging directly to the POST route
router.post(
  "/",
  function (req, res, next) {
    console.log("Review POST route - Request received");
    next();
  },
  protect,
  function (req, res, next) {
    console.log("After auth middleware - User authenticated");
    next();
  },
  createReview
);

// GET all reviews for a specific car
router.get("/car/:carId", getCarReviews);

// GET all reviews for a specific user (reviews they received)
router.get("/user/:userId", getUserReviews);

// DELETE a review (requires authentication, user must be reviewer)
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
