// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // 🌀 While checking authentication, show loading animation
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 🚫 Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // 🔒 Logged in but role not authorized → redirect to home
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  // ✅ Smooth fade-in for protected pages
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
