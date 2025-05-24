const express = require("express");
const router = express.Router();
const {
  getCars,
  getHomepageCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getMyListedCars,
} = require("../controllers/carController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.get("/homepage", getHomepageCars);
router.get("/", getCars);

// Debug route for token testing
router.get("/auth-test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

// Wishlist routes (require authentication)
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:id", protect, addToWishlist);
router.delete("/wishlist/:id", protect, removeFromWishlist);

// Get car by ID route (must be after the specific routes to avoid conflicts)
router.get("/:id", getCar);

// Car management routes (require authentication)
router.post("/", protect, upload.array("carImages", 10), createCar); // Allow up to 10 images for field 'carImages'
router.put("/:id", protect, upload.array("carImages", 10), updateCar);
router.delete("/:id", protect, deleteCar);

// Route to get cars listed by the authenticated user
router.get("/my-listings/all", protect, getMyListedCars);

module.exports = router;
