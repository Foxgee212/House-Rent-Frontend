import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Pages
import HomePage from "./pages/Home";
import Listings from "./pages/Listings";
import HouseDetail from "./pages/HouseDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import DashBoard from "./pages/Dashbord";
import AdminDashboard from "./adminDashboard/AdminDashboard";
import VerifyLandlord from "./pages/VerifyLandlord";
import VerifyOtp from "./pages/OTPPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerificationDetails from "./pages/VerificationDetails";

// Components
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<HouseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        {/* 🔐 OTP & Password Recovery */}
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🧭 Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={["landlord", "tenant"]}>
              <DashBoard />
            </PrivateRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PrivateRoute roles={["landlord"]}>
              <VerifyLandlord />
            </PrivateRoute>
          }
        />

        {/* 🛠️ Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/verification/:id"
          element={
            <PrivateRoute roles={["admin"]}>
              <VerificationDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
