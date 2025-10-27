// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Logged in but not authorized → redirect to home
    return <Navigate to="/" replace />;
  }

  // ✅ If user is tenant or landlord and not verified, redirect to OTP
  if (
    (user.role === "landlord" || user.role === "tenant") &&
    !user.isVerified
  ) {
    return <Navigate to="/otp" replace state={{ email: user.email }} />;
  }

  return children;
}
