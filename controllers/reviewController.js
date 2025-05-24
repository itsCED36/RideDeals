const Review = require("../models/Review");
const Car = require("../models/Car");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    // console.log("createReview: Request body", req.body);
    // console.log("createReview: Authenticated user", req.user);

    const { carId, revieweeId, rating, comment, reviewType } = req.body;
    if (!req.user || !req.user.id) {
      console.error("createReview: Missing authenticated user");
      return res.status(401).json({
        success: false,
        error: "Authentication error. Please login again.",
      });
    }

    const reviewerId = req.user.id; // From auth middleware

    if (!rating || !reviewType) {
      return res.status(400).json({
        success: false,
        error: "Rating and review type are required.",
      });
    }

    if (reviewType === "car" && !carId) {
      return res
        .status(400)
        .json({ success: false, error: "Car ID is required for car reviews." });
    }

    if (reviewType === "user" && !revieweeId) {
      return res.status(400).json({
        success: false,
        error: "Reviewee ID is required for user reviews.",
      });
    }

    let existingReview;
    if (reviewType === "car") {
      if (!mongoose.Types.ObjectId.isValid(carId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid Car ID." });
      }
      const carExists = await Car.findById(carId);
      if (!carExists) {
        return res
          .status(404)
          .json({ success: false, error: "Car not found." });
      }
      existingReview = await Review.findOne({
        car: carId,
        reviewer: reviewerId,
        reviewType: "car",
      });
    } else if (reviewType === "user") {
      if (!mongoose.Types.ObjectId.isValid(revieweeId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid Reviewee ID." });
      }
      const revieweeExists = await User.findById(revieweeId);
      if (!revieweeExists) {
        return res
          .status(404)
          .json({ success: false, error: "Reviewee (user) not found." });
      }
      existingReview = await Review.findOne({
        reviewee: revieweeId,
        reviewer: reviewerId,
        reviewType: "user",
      });
    }

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this " + reviewType + ".",
      });
    }

    const reviewData = {
      reviewer: reviewerId,
      rating: Number(rating),
      comment,
      reviewType,
    };

    if (reviewType === "car") {
      reviewData.car = carId;
    } else {
      // reviewType === 'user'
      reviewData.reviewee = revieweeId;
    }

    const review = new Review(reviewData);
    await review.save();

    // The post-save hook in Review.js will handle updating average ratings.

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error("Error creating review:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    res
      .status(500)
      .json({ success: false, error: "Server error while creating review." });
  }
};

// @desc    Get all reviews for a specific car
// @route   GET /api/reviews/car/:carId
// @access  Public
exports.getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ success: false, error: "Invalid Car ID." });
    }
    const reviews = await Review.find({ car: carId, reviewType: "car" })
      .populate("reviewer", "firstName lastName _id") // Include reviewer ID
      .sort({ createdAt: -1 });

    if (!reviews) {
      return res
        .status(404)
        .json({ success: false, error: "No reviews found for this car." });
    }

    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error("Error fetching car reviews:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching car reviews.",
    });
  }
};

// @desc    Get all reviews for a specific user (reviews they received)
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid User ID." });
    }

    // Check if user exists first
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const reviews = await Review.find({ reviewee: userId, reviewType: "user" })
      .populate("reviewer", "firstName lastName _id") // Include reviewer ID
      .sort({ createdAt: -1 });

    // Note: find() returns an empty array if no documents match, not null
    // So we don't need to check for !reviews, just return the empty array

    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching user reviews.",
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (only reviewer or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Review ID." });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found." });
    }

    // Check if the logged-in user is the one who wrote the review
    // TODO: Add admin role check if needed
    if (review.reviewer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "User not authorized to delete this review.",
      });
    }

    await Review.findByIdAndDelete(reviewId); // findOneAndDelete to trigger post hook

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("Error deleting review:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error while deleting review." });
  }
};
