import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  if (!email) navigate("/login"); // redirect if accessed directly

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters long.");

    setLoading(true);
    try {
      await resetPassword(email, password);
      toast.success("Password changed successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10"></div>

        <div className="text-center mb-6">
          <div className="bg-blue-600/20 w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-3 shadow-[0_0_20px_3px_rgba(37,99,235,0.3)]">
            <Lock className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Change Password
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter your new password below to continue.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              className="w-full pl-4 pr-12 py-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full pl-4 pr-12 py-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle confirm password visibility"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <p className="text-gray-400 text-xs text-center">
            Must be at least 8 characters long.
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            }`}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
