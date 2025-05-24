const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["sale", "rent"],
    default: "sale",
  },
  name: {
    type: String,
    required: [true, "Car name is required"],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "Car brand is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  images: [
    {
      type: String,
      default: "https://via.placeholder.com/250x150/f5f5f5/000000?text=Car",
    },
  ],
  description: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
  },
  mileage: {
    type: Number,
  },
  location: {
    type: String,
    trim: true,
  },
  features: [String],
  condition: {
    type: String,
    enum: ["New", "Like New", "Excellent", "Good", "Fair", "Poor"],
    default: "Good",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  // Add a field to store review documents
  reviewDocuments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: String,
    default: null,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  rentLength: {
    type: Number,
    required: function () {
      return this.type === "rent";
    },
    min: 1,
    validate: {
      validator: function (value) {
        // Only validate if type is rent
        if (this.type === "rent") {
          return value && value > 0;
        }
        return true;
      },
      message: "Rent length must be greater than 0 for rental cars",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Car", CarSchema);
