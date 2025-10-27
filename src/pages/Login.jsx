import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, requestLoginOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form.email, form.password);

      toast.success("Login successful 🚀", {
        duration: 2000,
        style: { borderRadius: "10px", background: "#2563EB", color: "#fff" },
      });

      // SPA redirect: landlord/tenant → OTP, admin → dashboard
      if (res.user.role === "landlord" || res.user.role === "tenant") {
        // Send OTP
        await requestLoginOtp(form.email);
        navigate("/otp", { state: { email: form.email } });
      } else if (res.user.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10"></div>
        <div className="text-center mb-8">
          <div className="bg-blue-600/20 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 shadow-[0_0_20px_3px_rgba(37,99,235,0.3)]">
            <LogIn className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-gray-400 mt-2 text-sm">Log in to continue your journey</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`relative flex justify-center items-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            } text-white`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
          <Link
            to="/signup"
            className="text-blue-500 font-medium hover:text-blue-400 transition"
          >
            Create Account
          </Link>
          <Link
            to="/forgot-password"
            className="text-blue-500 font-medium hover:text-blue-400 transition"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
