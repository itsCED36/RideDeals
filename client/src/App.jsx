import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout"; // Import Layout
import HomePage from "./pages/HomePage";
import PostCar from "./pages/PostCar"; // Import PostCar component
import MarketplacePage from "./pages/MarketplacePage"; // Import MarketplacePage
import RentalPage from "./pages/RentalPage"; // Import RentalPage
import CarDetailsPage from "./pages/CarDetailsPage"; // Import CarDetailsPage
import WishlistPage from "./pages/WishlistPage"; // Import WishlistPage
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyCode from "./components/auth/VerifyCode";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyEmail from "./components/auth/VerifyEmail"; // Import the new VerifyEmail component
import ProfileSettingsPage from "./pages/ProfileSettingsPage"; // Import ProfileSettingsPage
import MyDealsPage from "./pages/MyDealsPage"; // Import MyDealsPage
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Routes WITH Navbar */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/post-car" element={<PostCar />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/rental" element={<RentalPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          {/* Add other non-auth routes here */}
          {/* <Route path="/cart" element={<CartPage />} /> */}
          <Route
            path="/profile-settings"
            element={<ProfileSettingsPage />}
          />{" "}
          {/* Add ProfileSettingsPage route */}
          <Route path="/my-deals" element={<MyDealsPage />} />{" "}
          {/* Add MyDealsPage route */}
        </Route>

        {/* Routes WITHOUT Navbar (Auth Pages) */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </div>
  );
}

export default App;
