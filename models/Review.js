const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: function () {
      return this.reviewType === "car";
    }, // Required if it's a car review
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewee: {
    // The user being reviewed (e.g., car owner)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.reviewType === "user";
    }, // Required if it's a user review
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  reviewType: {
    type: String,
    required: true,
    enum: ["car", "user"], // To distinguish between car and user (owner) reviews
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes to improve query performance
reviewSchema.index(
  { car: 1, reviewer: 1 },
  { unique: true, partialFilterExpression: { reviewType: "car" } }
); // A user can review a car once
reviewSchema.index(
  { reviewee: 1, reviewer: 1 },
  { unique: true, partialFilterExpression: { reviewType: "user" } }
); // A user can review another user (e.g. owner) once per context (e.g. per rental - though rental context isn't here yet)

// Static method to calculate average rating for a car
reviewSchema.statics.calculateAverageRating = async function (carId) {
  const stats = await this.aggregate([
    { $match: { car: carId, reviewType: "car" } },
    {
      $group: {
        _id: "$car",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model("Car").findByIdAndUpdate(carId, {
        rating: parseFloat(stats[0].averageRating.toFixed(1)), // Keep one decimal place
        reviews: stats[0].reviewCount,
      });
    } else {
      // If no reviews, reset to defaults (or handle as needed)
      await mongoose.model("Car").findByIdAndUpdate(carId, {
        rating: 0, // Or some default like 0 or null
        reviews: 0,
      });
    }
  } catch (err) {
    console.error("Error updating car average rating:", err);
  }
};

// Static method to calculate average rating for a user
reviewSchema.statics.calculateUserAverageRating = async function (userId) {
  const stats = await this.aggregate([
    { $match: { reviewee: userId, reviewType: "user" } },
    {
      $group: {
        _id: "$reviewee",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }, // Or deals, if that's what 'deals' field represents
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model("User").findByIdAndUpdate(userId, {
        rating: parseFloat(stats[0].averageRating.toFixed(1)),
        // Assuming 'deals' field in User model can be used as review count for users
        // Or add a new field like 'userReviewCount'
        deals: stats[0].reviewCount, // Or update a specific user review count field
      });
    } else {
      await mongoose.model("User").findByIdAndUpdate(userId, {
        rating: 0, // Or null
        deals: 0, // Or userReviewCount: 0
      });
    }
  } catch (err) {
    console.error("Error updating user average rating:", err);
  }
};

// Call calculateAverageRating after save
reviewSchema.post("save", async function () {
  if (this.reviewType === "car" && this.car) {
    await this.constructor.calculateAverageRating(this.car);
  }
  if (this.reviewType === "user" && this.reviewee) {
    await this.constructor.calculateUserAverageRating(this.reviewee);
  }
});

// Call calculateAverageRating after remove (if a review is deleted)
// Need to handle this carefully, especially with findByIdAndRemove or deleteOne
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    if (doc.reviewType === "car" && doc.car) {
      await doc.constructor.calculateAverageRating(doc.car);
    }
    if (doc.reviewType === "user" && doc.reviewee) {
      await doc.constructor.calculateUserAverageRating(doc.reviewee);
    }
  }
});
reviewSchema.post("deleteMany", async function (condition) {
  // This hook is more complex for deleteMany as it doesn't directly give the docs
  // For simplicity, this might require a manual recalculation trigger or a more complex hook
  // For now, focusing on single save/delete.
  // Consider re-evaluating ratings periodically or after bulk operations if deleteMany is used for reviews.
});

module.exports = mongoose.model("Review", reviewSchema);
