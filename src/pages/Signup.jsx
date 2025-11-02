import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Building2,
  Globe,
  Facebook,
  Loader2,
} from "lucide-react";

// ✅ Safe sanitization (no trim — allows spaces)
const sanitizeInput = (value) => value.replace(/[<>/'"`;(){}$]/g, "");

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Clean handleChange (allows spaces)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  // ✅ Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      toast.success("✅ OTP sent to your email");

      navigate("/verify-otp", {
        state: { email: form.email, context: "signup" },
      });
    } catch (err) {
      toast.error(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () =>
    toast("Google signup coming soon ⚙️", { icon: "⚡" });

  const handleFacebookSignup = () =>
    toast("Facebook signup coming soon ⚙️", { icon: "💙" });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 shadow-2xl rounded-2xl p-6 w-full max-w-md">
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-blue-600/20 w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-3 shadow-[0_0_20px_3px_rgba(37,99,235,0.3)]">
            <UserPlus className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create an Account</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Join and find your perfect home today!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="w-full pl-9 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full pl-9 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full pl-9 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Role */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full pl-9 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center mt-5 mb-2">
            <div className="h-px w-14 bg-gray-600"></div>
            <span className="mx-2 text-gray-400 text-xs">or</span>
            <div className="h-px w-14 bg-gray-600"></div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-gray-400 text-xs">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 font-medium hover:text-blue-400 transition"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
