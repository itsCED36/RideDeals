require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth"); // We will create this file next
const carRoutes = require("./routes/cars"); // Add car routes
const reviewRoutes = require("./routes/review"); // Add review routes

const app = express();

// Middleware
// Configure CORS to allow requests from your frontend origin
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from the React frontend
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json()); // for parsing application/json

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes); // Add car routes
app.use("/api/reviews", reviewRoutes); // Add review routes

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Add your MongoDB connection string to .env file
const JWT_SECRET = process.env.JWT_SECRET; // Add your JWT Secret to .env file

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1); // Exit the process if MONGO_URI is not set
}

// Add check for JWT_SECRET
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1); // Exit the process if JWT_SECRET is not set
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {});
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit if cannot connect to DB
  });
