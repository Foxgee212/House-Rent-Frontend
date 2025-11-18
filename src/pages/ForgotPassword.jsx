import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success("OTP sent to your email ✉️");

      // ✅ Redirect to Verify OTP page (instead of ResetPassword)
      navigate("/verify-otp", {
        state: { email, context: "forgot" },
      });
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
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
            <Mail className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Forgot Password
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter your registered email to receive a reset OTP.
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="Email Address"
              required
              className="w-full p-3 pl-4 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-center text-gray-400 text-xs mt-4">
            Remembered your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 font-medium cursor-pointer hover:text-blue-400 transition"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}