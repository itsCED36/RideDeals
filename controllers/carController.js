const Car = require("../models/Car");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // Added mongoose import

// Get all cars (with optional filtering)
exports.getCars = async (req, res) => {
  try {
    const {
      type,
      brand,
      minPrice,
      maxPrice,
      year,
      condition,
      location,
      sort,
      search,
    } = req.query;

    // Build query
    const query = {};

    // Filter by type (sale or rent)
    if (type) query.type = type;

    // Filter by brand
    if (brand) query.brand = brand;

    // Filter by year
    if (year) query.year = Number(year);

    // Filter by condition
    if (condition) query.condition = condition;

    // Filter by location
    if (location) query.location = location;

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search filter (search in name, brand, and description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Create base query
    let carsQuery = Car.find(query).populate(
      "user",
      "firstName lastName _id email phone rating deals"
    );

    // Apply sorting
    if (sort) {
      const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
      const sortDirection = sort.startsWith("-") ? -1 : 1;
      carsQuery = carsQuery.sort({ [sortField]: sortDirection });
    } else {
      // Default sort by newest first
      carsQuery = carsQuery.sort({ createdAt: -1 });
    }

    // Execute query
    const cars = await carsQuery.exec();

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Error getting cars:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get cars for homepage (featured, new arrivals, etc.)
exports.getHomepageCars = async (req, res) => {
  try {
    // Get 8 cars for sale (marketplace)
    const marketplaceCars = await Car.find({ type: "sale" })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("user", "firstName lastName _id email phone rating deals");

    // Get 4 cars for rent
    const rentalCars = await Car.find({ type: "rent" })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("user", "firstName lastName _id email phone rating deals");

    res.status(200).json({
      success: true,
      data: {
        marketplaceCars,
        rentalCars,
      },
    });
  } catch (error) {
    console.error("Error getting homepage cars:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get single car
exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "user",
      "firstName lastName _id email phone rating deals"
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    // Add isFavorite flag if user is authenticated
    let isFavorite = false;

    // Check if Authorization header exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          const user = await User.findById(decoded.id);
          if (
            user &&
            user.wishlist &&
            user.wishlist.some((id) => id.toString() === car._id.toString())
          ) {
            isFavorite = true;
          }
        }
      } catch (err) {
        // Invalid token, ignore and continue
        // console.log("Error verifying token in getCar:", err.message);
      }
    }

    // Convert to object and add isFavorite
    const carData = car.toObject();
    carData.isFavorite = isFavorite;

    res.status(200).json({
      success: true,
      data: carData,
    });
  } catch (error) {
    console.error("Error getting car:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Create new car listing
exports.createCar = async (req, res) => {
  // console.log(
  //   "createCar: Received request body:",
  //   JSON.stringify(req.body, null, 2)
  // );
  // console.log("createCar: Received files:", req.files);
  try {
    // Add user ID to car data
    req.body.user = req.user.id;
    // console.log("createCar: User ID added:", req.body.user);

    // Parse features if it's a stringified JSON
    if (req.body.features && typeof req.body.features === "string") {
      // console.log("createCar: Parsing features string:", req.body.features);
      try {
        req.body.features = JSON.parse(req.body.features);
        // console.log("createCar: Features parsed:", req.body.features);
      } catch (parseError) {
        console.error("createCar: Error parsing features JSON:", parseError);
        return res.status(400).json({
          success: false,
          error:
            "Invalid format for features. Expected a comma-separated list or valid JSON array.",
        });
      }
    } else if (req.body.features && Array.isArray(req.body.features)) {
      // console.log("createCar: Features already an array:", req.body.features);
    } else {
      // console.log(
      //   "createCar: No features string to parse or features not an array."
      // );
      // If features are optional or can be empty, you might want to default it to an empty array
      // req.body.features = [];
    }

    // Process uploaded images if they exist
    if (req.files && req.files.length > 0) {
      // console.log("createCar: Processing uploaded files:", req.files.length);
      req.body.images = req.files.map((file) => {
        const imagePath = `/uploads/cars/${file.filename}`;
        // console.log("createCar: Mapped image path:", imagePath);
        return imagePath;
      });
    } else {
      // console.log("createCar: No files uploaded or req.files is empty.");
      // Optionally set a default image or handle as an error if no images are provided
      // For now, relying on schema default if present, or it will be empty
      req.body.images = []; // Or handle as per your application's requirements
      // console.log("createCar: Set req.body.images to empty array.");
    }

    // console.log(
    //   "createCar: Data before Car.create:",
    //   JSON.stringify(req.body, null, 2)
    // );

    // Create car
    const car = await Car.create(req.body);
    // console.log("createCar: Car created successfully:", car._id);

    res.status(201).json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error("createCar: Error during car creation:", error);
    console.error("createCar: Error name:", error.name);
    console.error("createCar: Error message:", error.message);
    if (error.errors) {
      console.error(
        "createCar: Validation errors:",
        JSON.stringify(error.errors, null, 2)
      );
    }

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error during car creation. Check logs for details.",
    });
  }
};

// Update car
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    // Make sure user owns the car
    if (car.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      });
    }

    // Parse features if it's a stringified JSON
    if (req.body.features && typeof req.body.features === "string") {
      try {
        req.body.features = JSON.parse(req.body.features);
      } catch (parseError) {
        console.error("Error parsing features JSON for update:", parseError);
        return res.status(400).json({
          success: false,
          error:
            "Invalid format for features. Expected a comma-separated list.",
        });
      }
    }

    // Process uploaded images if they exist
    if (req.files && req.files.length > 0) {
      // Create an array of URL paths for the uploaded images
      req.body.images = req.files.map(
        (file) => `/uploads/cars/${file.filename}`
      );
    } else if (req.body.images === undefined) {
      // If req.files is empty and req.body.images is not provided,
      // it means the user might not be updating images.
      // To prevent accidentally wiping existing images, remove 'images' from req.body
      // or ensure client sends existing images if they are not meant to be changed.
      // For simplicity here, if no new images are uploaded, we don't modify existing ones
      // unless explicitly an empty array or new image paths are sent in req.body.images.
      delete req.body.images; // This line ensures that if no new images are uploaded, the existing ones are not wiped out.
      // If you want to allow removing all images, the client should send `images: []`.
    }

    // Update car
    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error("Error updating car:", error);

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Delete car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    // Make sure user owns the car
    if (car.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      });
    }

    await car.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get cars listed by the authenticated user
exports.getMyListedCars = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user.id }).populate(
      "user",
      "firstName lastName _id email phone rating deals"
    );

    if (!cars) {
      // Even if the user has no cars, an empty array is a valid response
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    console.error("Error getting user's listed cars:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching your listed cars.",
    });
  }
};

// Wishlist Controllers
// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    // console.log("Getting wishlist for user:", req.user.id);

    // Get the current user
    const user = await User.findById(req.user.id);

    if (!user) {
      // console.log("User not found:", req.user.id);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // If wishlist doesn't exist, return empty array
    if (!user.wishlist || !Array.isArray(user.wishlist)) {
      // console.log(
      //   "No wishlist found or not an array, returning empty wishlist"
      // );
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // console.log("Wishlist found with", user.wishlist.length, "items");

    // Filter out invalid ObjectIds from the wishlist
    const validWishlistIds = [];
    for (const id of user.wishlist) {
      try {
        if (id && mongoose.Types.ObjectId.isValid(String(id))) {
          validWishlistIds.push(String(id));
        } else {
          // console.warn(`Skipping invalid wishlist ID: ${id}`);
        }
      } catch (err) {
        // console.warn(`Error processing wishlist ID: ${err.message}`);
      }
    }

    // console.log("Valid wishlist IDs:", validWishlistIds.length);

    if (validWishlistIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Find all cars that are in the user's valid wishlist
    const wishlistCars = await Car.find({
      _id: { $in: validWishlistIds },
    }).populate("user", "firstName lastName _id email phone rating deals");

    // console.log("Found", wishlistCars.length, "cars in wishlist");

    res.status(200).json({
      success: true,
      count: wishlistCars.length,
      data: wishlistCars,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error.message, error.stack);
    res.status(500).json({
      success: false,
      error: "Server error while fetching wishlist",
    });
  }
};

// Add a car to user's wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const carId = req.params.id;
    // console.log(`Attempting to add car ${carId} to wishlist for user ${req.user.id}`);

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // console.log(`User ${req.user.id} not found while adding to wishlist.`);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
      // console.log(`Initialized wishlist for user ${user._id}`);
    }

    // Check if car is already in wishlist
    if (user.wishlist.includes(carId)) {
      // console.log(`Car ${carId} already in wishlist for user ${user._id}.`);
      return res.status(400).json({
        success: false,
        error: "Car already in wishlist",
      });
    }

    // Add car to wishlist
    user.wishlist.push(carId);
    await user.save();
    // console.log(`Car ${carId} added to wishlist for user ${user._id}.`);

    res.status(200).json({
      success: true,
      message: "Car added to wishlist",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Remove a car from user's wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const carId = req.params.id;
    // console.log(`Attempting to remove car ${carId} from wishlist for user ${req.user.id}`);

    const user = await User.findById(req.user.id);
    if (!user || !user.wishlist) {
      // console.log(`User ${req.user.id} or their wishlist not found.`);
      return res.status(404).json({
        success: false,
        error: "User or wishlist not found",
      });
    }

    // Check if car is in wishlist
    if (!user.wishlist.includes(carId)) {
      // console.log(`Car ${carId} not found in wishlist for user ${user._id}.`);
      return res.status(404).json({
        success: false,
        error: "Car not in wishlist",
      });
    }

    // Remove car from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== carId);
    await user.save();
    // console.log(`Car ${carId} removed from wishlist for user ${user._id}.`);

    res.status(200).json({
      success: true,
      message: "Car removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
