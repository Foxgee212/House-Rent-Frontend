import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { verifyLoginOtp, requestLoginOtp, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  // Redirect if email not provided
  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await verifyLoginOtp(email, otp);

      toast.success("OTP verified! Redirecting...", {
        duration: 2000,
        style: { borderRadius: "10px", background: "#16a34a", color: "#fff" },
      });

      // Redirect based on role
      if (data.user.role === "admin") navigate("/admin");
      else navigate("/dashboard"); // tenant or landlord
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await requestLoginOtp(email);
      toast.success("OTP resent successfully!");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Enter OTP</h1>
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
            className={`relative flex justify-center items-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            } text-white`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Didn’t receive the code?{" "}
          <button
            className="text-blue-500 font-medium hover:text-blue-400 transition underline"
            onClick={handleResend}
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}
