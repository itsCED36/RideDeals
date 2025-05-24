const User = require("../models/User");
const Car = require("../models/Car"); // Add this line at the top with other requires
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// In-memory store for verification codes
const verificationStore = new Map();
// Helper function to clean up expired codes
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [email, data] of verificationStore.entries()) {
    if (data.expires < now) {
      verificationStore.delete(email);
    }
  }
};
// Run cleanup every hour
setInterval(cleanupExpiredCodes, 60 * 60 * 1000);

// Handle signup
exports.signup = async (req, res) => {
  // console.log("=== SIGNUP REQUEST RECEIVED ===");
  // console.log("Request body:", req.body);
  // console.log("Request file:", req.file); // Profile picture removed

  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    wilaya,
    gender,
    age,
  } = req.body;

  // Basic validation
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !wilaya ||
    !gender ||
    !age
  ) {
    // console.log("Missing fields detected:", {
    //   firstName: Boolean(firstName),
    //   lastName: Boolean(lastName),
    //   email: Boolean(email),
    //   password: Boolean(password),
    //   confirmPassword: Boolean(confirmPassword),
    //   wilaya: Boolean(wilaya),
    //   gender: Boolean(gender),
    //   age: Boolean(age),
    // });
    return res.status(400).json({ message: "All fields are required." });
  }

  // Additional validation for age
  if (parseInt(age) < 18) {
    return res
      .status(400)
      .json({ message: "You must be at least 18 years old." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      wilaya: String(wilaya),
      gender: String(gender),
      age: parseInt(age),
    });

    // Generate verification code for email verification
    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase(); // 6-character code

    // Store verification code in our in-memory store user model
    verificationStore.set(email, {
      code: verificationCode,
      expires: Date.now() + 10 * 60 * 1000, // Code expires in 10 minutes
    });

    // Update user to be verified
    newUser.isVerified = true; // Set isVerified to true upon successful signup for now
    // Save the user to the database
    await newUser.save();

    // Fetch the saved user to verify what's in the database
    const savedUser = await User.findOne({ email }).lean();
    // console.log("--- Saved User in Database ---");
    // console.log(JSON.stringify(savedUser, null, 2));

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: "Verify Your Email Address for Ride Deals",
      text: `Hello ${newUser.firstName},\n\nThank you for registering with Ride Deals.\nYour verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Ride Deals Team`,
      html: `<p>Hello ${newUser.firstName},</p><p>Thank you for registering with Ride Deals.</p><p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code will expire in 10 minutes.</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br>The Ride Deals Team</p>`,
    };

    await transporter.sendMail(mailOptions);

    // Respond (without token initially, user needs to verify first)
    res.status(201).json({
      message:
        "Signup successful! Please check your email for the verification code.",
      // Optionally send back some user info (excluding sensitive data)
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(" ") });
    }
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
};

// Handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Use the comparePassword method defined in the User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const jwt = require("jsonwebtoken");
    // console.log(
    //   "Login Controller: JWT_SECRET used for signing:",
    //   process.env.JWT_SECRET
    // ); // Debug log
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
    });

    // Exclude password from the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Handle forgot password request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // console.log("--- Forgot Password Request ---");
  // console.log("Received email:", email);

  if (!email) {
    // console.log("Email missing, sending 400");
    return res
      .status(400)
      .json({ message: "Please provide an email address." });
  }

  try {
    // console.log(`Searching for user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      // console.log(`User not found. Sending 404.`);
      return res.status(404).json({ message: "Email not found." });
    }

    // Generate a verification code
    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes

    // Store in our in-memory verification store
    verificationStore.set(email, {
      code: verificationCode,
      expires: expiresAt,
    });

    // console.log(
    //   `Code ${verificationCode} stored for ${email}, expires at ${new Date(
    //     expiresAt
    //   ).toISOString()}`
    // );

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Ride Deals" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Your Password Reset Code",
        text: `Your verification code is: ${verificationCode}. This code expires in 10 minutes.`,
        html: `<p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code expires in 10 minutes.</p>`,
      };

      let info = await transporter.sendMail(mailOptions);
      // console.log(
      //   `Email sent successfully to ${user.email}. Message ID: ${info.messageId}`
      // );

      return res.status(200).json({
        message:
          "Verification code sent successfully! Please check your email.",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Clean up if email fails to send
      verificationStore.delete(email);

      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Server error during password reset request." });
  }
};

// Handle verification code submission
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  // console.log("--- Verify Code Request ---");
  // console.log(`Received email: ${email}, code: ${code}`);

  if (!email || !code) {
    // console.log("Email or code missing, sending 400");
    return res
      .status(400)
      .json({ message: "Please provide email and verification code." });
  }

  if (code.length !== 6) {
    // Assuming 6-digit code based on crypto.randomBytes(3)
    // console.log("Invalid code format, sending 400");
    return res
      .status(400)
      .json({ message: "Invalid verification code format." });
  }

  try {
    // Check if the verification code exists and is valid in our in-memory store
    const verification = verificationStore.get(email);

    if (
      !verification ||
      verification.code !== code ||
      verification.expires < Date.now()
    ) {
      // console.log("Invalid or expired code, sending 400");
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // console.log("User not found for verification, sending 404");
      return res.status(404).json({ message: "User not found." });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Optionally, remove the code from the store after successful verification
    verificationStore.delete(email);

    // console.log(`User ${email} verified successfully.`);
    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verification code error:", error);
    res.status(500).json({ message: "Server error during code verification." });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by the authMiddleware
    const user = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

// Update current user profile
exports.updateMe = async (req, res) => {
  const { firstName, lastName, email, wilaya, age, gender } = req.body;
  const userId = req.user.id; // From authMiddleware

  // console.log("--- Update Profile Request ---");
  // console.log("User ID:", userId);
  // console.log("Request body:", req.body);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update fields if they are provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (wilaya) user.wilaya = String(wilaya);
    if (age) user.age = parseInt(age);
    if (gender) user.gender = String(gender);

    // Special handling for email change:
    // If email is being changed, we might want to re-verify it.
    // For simplicity now, we'll allow direct change.
    // Consider adding email verification flow if email changes.
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use." });
      }
      user.email = email;
      // user.isEmailVerified = false; // Optionally mark as unverified
    }

    const updatedUser = await user.save();

    // Exclude password from the response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Profile updated successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(" ") });
    }
    res.status(500).json({ message: "Server error updating profile." });
  }
};

// Change current user password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user.id;

  // console.log("--- Change Password Request ---");
  // console.log("User ID:", userId);

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ message: "All password fields are required." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New passwords do not match." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error changing password." });
  }
};

// Delete current user account
exports.deleteMe = async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  // console.log("--- Delete Account Request ---");
  // console.log("User ID:", userId);

  if (!password) {
    return res
      .status(400)
      .json({ message: "Password is required to delete account." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password. Account deletion failed." });
    }

    // Delete user's cars first
    await Car.deleteMany({ user: userId });
    // console.log(`Deleted cars for user ${userId}`);

    // Delete the user
    await User.findByIdAndDelete(userId);
    // console.log(`Deleted user ${userId}`);

    // Optionally: Invalidate JWT token here if you have a blacklist or similar mechanism

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Server error deleting account." });
  }
};

// Get verified users for homepage (example, adjust as needed)
exports.getVerifiedUsers = async (req, res) => {
  try {
    // console.log("Fetching verified users for homepage display");
    // Example: Fetch users who are marked as verified and have a good rating or many deals
    // This is a placeholder. Adjust the query based on your actual criteria.
    const users = await User.find({
      isEmailVerified: true, // Example: only verified users
      // rating: { $gte: 4.5 }, // Example: rating >= 4.5
      // dealsCount: { $gte: 10 } // Example: if you add a dealsCount field
    })
      .select("firstName lastName profilePicture rating dealsCount") // Select relevant fields
      .limit(6); // Limit the number of users

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching verified users:", error);
    // Fallback to mock data if API fails or no users found, to ensure UI stability
    const mockUsers = [
      { id: 1, name: "Ana Belkadi", image: null, rating: 4.8, deals: 24 },
      { id: 2, name: "Shihab Senouci", image: null, rating: 4.9, deals: 32 },
      { id: 3, name: "Jalil Boukrouh", image: null, rating: 4.7, deals: 19 },
      { id: 4, name: "Amine Hadj", image: null, rating: 5.0, deals: 41 },
      { id: 5, name: "Mohamed Ali", image: null, rating: 4.9, deals: 28 },
      { id: 6, name: "Houssam Benmoussa", image: null, rating: 4.8, deals: 35 },
    ];
    res.status(200).json({
      success: true,
      data: mockUsers,
      message: "Error fetching users, mock data returned.",
    });
  }
};
