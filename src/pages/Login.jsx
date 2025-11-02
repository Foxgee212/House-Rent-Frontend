import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Mail, Lock, LogIn, Globe, Facebook } from "lucide-react";

const sanitizeInput = (value) => value.replace(/[<>/'"`;(){}$]/g, "").trim();

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Login successful 🚀", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#2563EB",
          color: "#fff",
        },
      });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role) {
      if (user.role === "landlord") navigate("/dashboard");
      else if (user.role === "tenant") navigate("/");
      else if (user.role === "admin") navigate("/admin");
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => toast("Google login coming soon ⚙️", { icon: "⚡" });
  const handleFacebookLogin = () => toast("Facebook login coming soon ⚙️", { icon: "💙" });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-3 sm:p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border border-gray-700/50">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10"></div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-blue-600/20 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full mx-auto mb-3 sm:mb-4 shadow-[0_0_20px_3px_rgba(37,99,235,0.3)]">
            <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm">
            Log in to continue your journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-xs sm:text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full pl-9 sm:pl-10 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm sm:text-base"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full pl-9 sm:pl-10 py-2.5 sm:py-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm sm:text-base"
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`relative flex justify-center items-center gap-2 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            } text-white text-sm sm:text-base`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center mt-5 sm:mt-6 mb-2">
          <div className="h-px w-14 sm:w-16 bg-gray-600"></div>
          <span className="mx-2 sm:mx-3 text-gray-400 text-xs sm:text-sm">or</span>
          <div className="h-px w-14 sm:w-16 bg-gray-600"></div>
        </div>
      
        <p className="mt-5 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 font-medium hover:text-blue-400 transition"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
