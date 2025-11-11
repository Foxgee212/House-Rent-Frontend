import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ShieldCheck, Loader2 } from "lucide-react";
import API from "../api/axios";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const context = location.state?.context || "signup"; // "signup" or "forgot"

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0); // 👈 countdown in seconds
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ====== Handle OTP input ======
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^[0-9]+$/.test(pasted)) return;

    const digits = pasted.split("");
    const newOtp = [...otp];
    digits.forEach((d, i) => (newOtp[i] = d));
    setOtp(newOtp);
    inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
  };

  // ====== Submit handler ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      console.log("Verifying OTP for:", { email, code, context });
      const { data } = await API.post("/auth/verify-otp", { email, otp: code, context });

      toast.success("✅ OTP verified successfully!");

      if (context === "signup") navigate("/login");
      else if (context === "forgot")
        navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ====== Resend OTP ======
  const handleResend = async () => {
    setResending(true);
    try {
      await API.post("/auth/resend-otp", { email, context });
      toast.success("📩 A new OTP has been sent to your email!");
      setCountdown(60); // 👈 start 1 minute countdown
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg border border-gray-700/50 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-blue-600/20 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 shadow-[0_0_25px_3px_rgba(37,99,235,0.3)]">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter the 6-digit code sent to{" "}
            <span className="text-blue-400 font-medium">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <div
            className="flex justify-between w-full max-w-xs select-none"
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-12 text-center text-xl font-semibold text-white bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 hover:border-blue-500"
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? "bg-blue-600/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Code"
            )}
          </button>

          {/* Resend */}
          <p className="text-sm text-gray-400 mt-2 text-center">
            Didn’t get the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className={`text-blue-400 hover:text-blue-300 font-medium ml-1 transition-all ${
                (resending || countdown > 0) && "cursor-not-allowed opacity-60"
              }`}
            >
              {resending
                ? "Resending..."
                : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend OTP"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
