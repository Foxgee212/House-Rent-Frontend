import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Lazy Pages
const HomePage = lazy(() => import("./pages/Home"));
const Listings = lazy(() => import("./pages/Listings"));
const HouseDetail = lazy(() => import("./pages/HouseDetails"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const DashBoard = lazy(() => import("./pages/Dashbord"));
const AdminDashboard = lazy(() => import("./adminDashboard/AdminDashboard"));
const VerifyLandlord = lazy(() => import("./pages/VerifyLandlord"));
const VerifyOtp = lazy(() => import("./pages/OTPPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerificationDetails = lazy(() => import("./pages/VerificationDetails"));
const BuyPage = lazy(() => import("./pages/Buy"));
const BuyDetail = lazy(() => import("./pages/BuyDetails"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const AgentListings = lazy(() => import("./pages/SellerListing"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <>
      <Navbar />

      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <Routes>
          {/* 🌍 Public Routes */}
          <Route path="/" element={<BuyPage />} />
          <Route path="/rent" element={<HomePage />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/agent/listings" element={<AgentListings />} />
          <Route path="/listings/:id" element={<HouseDetail />} />
          <Route path="/buy/:id" element={<BuyDetail />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 🔐 Protected: All Users */}
          <Route
            path="/profile"
            element={
              <PrivateRoute roles={["tenant", "landlord", "agent", "admin"]}>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* 🔐 Landlord Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["landlord"]}>
                <DashBoard />
              </PrivateRoute>
            }
          />

          {/* 🔐 Agent Dashboard */}
          <Route
            path="/agent"
            element={
              <PrivateRoute roles={["agent"]}>
                <SellerDashboard />
              </PrivateRoute>
            }
          />

          {/* 🔐 Verification (Landlords & Agents) */}
          <Route
            path="/verify"
            element={
              <PrivateRoute roles={["landlord", "agent"]}>
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

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
