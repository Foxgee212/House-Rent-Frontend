import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { RefreshCcw } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyForgotPasswordOtp, verifyEmail, forgotPassword, resendOtp } = useAuth();

  const { email, redirectTo } = location.state || {};
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef([]);

  // Redirect if accessed without email
  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]*$/.test(value)) return;

    // Paste support
    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH).split("");
      setOtp([...digits, ...Array(OTP_LENGTH - digits.length).fill("")]);
      digits.forEach((_, i) => inputRefs.current[i]?.focus());
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) return setError("Please enter the full 6-digit OTP.");

    setLoading(true);
    try {
      // Decide which verification to use based on redirectTo
      if (redirectTo === "reset-password") {
        await verifyForgotPasswordOtp(email, otpString);
        toast.success("OTP verified! You can now reset your password.");
        navigate("/reset-password", { state: { email } });
      } else if (redirectTo === "home") {
        await verifyEmail(email, otpString);
        toast.success("OTP verified! Redirecting to home...");
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      if (redirectTo === "reset-password") {
        await forgotPassword(email);
      } else if (redirectTo === "home") {
        await resendOtp(email);
      }

      toast.success("OTP resent to your email!");
      setResendTimer(60);
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Verify OTP</h1>
        <p className="text-gray-400 text-center mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="text-blue-400 font-medium">{email}</span>.
        </p>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-center text-xl rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            ))}
          </div>

          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition ${
                resendTimer > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCcw size={16} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
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
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
