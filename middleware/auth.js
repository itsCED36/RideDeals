const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token = null; // Initialize token variable

  try {
    // Get token from header - check both x-auth-token and Authorization header
    token = req.header("x-auth-token");

    // If no x-auth-token, check for Authorization header
    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // console.log("Auth Middleware: Token found in Authorization header.");
      } else {
        // console.log(
        //   "Auth Middleware: No token found in x-auth-token or Authorization header."
        // );
      }
    } else {
      // console.log("Auth Middleware: Token found in x-auth-token header.");
    }

    // Check if token exists after attempting extraction
    if (!token) {
      // console.log("Auth Middleware: Denying access - No token provided.");
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // Check if the JWT_SECRET environment variable is set
    if (!process.env.JWT_SECRET) {
      console.error(
        "AUTH MIDDLEWARE CRITICAL ERROR: JWT_SECRET is not defined in environment variables"
      );
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // console.log(
    //   "Auth Middleware: Attempting to verify token:",
    //   token.substring(0, 10) + "..."
    // ); // Log first 10 chars

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(
    //   "Auth Middleware: Token verified successfully. Decoded payload:",
    //   decoded
    // );

    // Find user by id
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      // console.log(
      //   "Auth Middleware: Denying access - User not found for decoded ID:",
      //   decoded.id
      // );
      return res.status(401).json({ message: "User not found" });
    }

    // console.log("Auth Middleware: User authenticated:", user.email);
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.name, "-", error.message); // Log specific error details
    // Log token details if available during error
    if (token) {
      // console.error(
      //   "Auth Middleware: Token that failed verification (first 10 chars):",
      //   token.substring(0, 10) + "..."
      // );
    } else {
      // console.error(
      //   "Auth Middleware: No token was available when the error occurred."
      // );
    }
    // Provide specific messages based on error type
    if (error.name === "JsonWebTokenError") {
      res
        .status(401)
        .json({ message: "Token is invalid. Please log in again." });
    } else if (error.name === "TokenExpiredError") {
      res
        .status(401)
        .json({ message: "Token has expired. Please log in again." });
    } else {
      res
        .status(401)
        .json({ message: "Token verification failed. Please log in again." });
    }
  }
};
