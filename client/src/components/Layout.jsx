import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // Adjust path if necessary

function Layout() {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
}

export default Layout;
