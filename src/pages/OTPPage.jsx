import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function OTPPage({ isForgot = false }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { verifyLoginOtp, verifyForgotPasswordOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (!email) navigate("/login"); // Redirect if accessed directly

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isForgot) {
        await verifyForgotPasswordOtp(email, otp);
        toast.success("OTP verified! Reset your password.");
        navigate("/reset-password", { state: { email } });
      } else {
        await verifyLoginOtp(email, otp);
        toast.success("OTP verified! Redirecting to dashboard...");
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Enter OTP
        </h1>
        <p className="text-gray-400 text-center mb-6">
          We sent a 6-digit code to <span className="text-blue-400">{email}</span>
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            required
            className="w-full p-3 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-xl tracking-widest"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
