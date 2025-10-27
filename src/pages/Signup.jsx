import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { User, Mail, Lock, UserPlus, Building2, Globe, Facebook } from "lucide-react";

// Enhanced XSS sanitizer
const sanitizeInput = (value) => {
  return value.replace(/[<>/'"`;(){}$]/g, "").trim();
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  // Handle input with sanitization
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: sanitizeInput(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(form.name, form.email, form.password, form.role);

      toast.success("Registered successfully 🚀", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#2563EB",
          color: "#fff",
        },
      });

      setTimeout(() => {
        navigate(form.role === "landlord" ? "/dashboard" : "/");
      }, 600);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for social signup
  const handleGoogleSignup = () => {
    toast("Google signup coming soon ⚙️", { icon: "⚡" });
  };

  const handleFacebookSignup = () => {
    toast("Facebook signup coming soon ⚙️", { icon: "💙" });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600/20 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 shadow-[0_0_20px_3px_rgba(37,99,235,0.3)]">
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Join and find your perfect home today!
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`relative flex justify-center items-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            } text-white`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Signing up...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center mt-6 mb-2">
          <div className="h-px w-16 bg-gray-600"></div>
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="h-px w-16 bg-gray-600"></div>
        </div>

        {/* Social Signup */}
        <div className="flex flex-col gap-3 mt-3">
          <button
            onClick={handleGoogleSignup}
            className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <Globe className="w-5 h-5 text-blue-600" /> Continue with Google
          </button>
          <button
            onClick={handleFacebookSignup}
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#1877F2] text-white rounded-lg font-semibold hover:bg-[#166FE5] transition"
          >
            <Facebook className="w-5 h-5" /> Continue with Facebook
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 font-medium hover:text-blue-400 transition"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
