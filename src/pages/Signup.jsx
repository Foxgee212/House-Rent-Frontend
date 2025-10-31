import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { UserPlus, User, Mail, Lock, Building2, Globe, Facebook } from "lucide-react";

const sanitizeInput = (value) => value.replace(/[<>/'"`;(){}$]/g, "").trim();

export default function Signup() {
  const navigate = useNavigate();
  const { signup, verifyEmail, resendOtp } = useAuth();

  const [step, setStep] = useState("input"); // input | otp
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: sanitizeInput(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === "input") {
        await signup(form.name, form.email, form.password, form.role);
        toast.success("OTP sent to your email ✉️");
        setStep("otp");
        setResendTimer(60);
      } else if (step === "otp") {
        await verifyEmail(form.email, otp);
        toast.success("Registration complete! 🚀");
        navigate(form.role === "landlord" ? "/dashboard" : "/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await resendOtp(form.email);
      toast.success("OTP resent! ✉️");
      setResendTimer(60);
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  const handleGoogleSignup = () => toast("Google signup coming soon ⚙️", { icon: "⚡" });
  const handleFacebookSignup = () => toast("Facebook signup coming soon ⚙️", { icon: "💙" });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 p-4">
      <div className="relative bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-400/10 blur-2xl -z-10"></div>

        <div className="text-center mb-6">
          <div className="bg-blue-600/20 w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-3 shadow-[0_0_20px_3px_rgba(37,99,235,0.3)]">
            <UserPlus className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create an Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Join and find your perfect home today!</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-500/10 py-2 rounded-lg border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step === "input" ? (
            <>
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

              <button
                type="submit"
                disabled={loading}
                className={`py-2.5 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? "bg-blue-600/50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
                }`}
              >
                {loading ? "Sending OTP..." : "Register"}
              </button>

              {/* Social Login */}
              <div className="flex items-center justify-center mt-5 mb-2">
                <div className="h-px w-14 bg-gray-600"></div>
                <span className="mx-2 text-gray-400 text-xs">or</span>
                <div className="h-px w-14 bg-gray-600"></div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
                >
                  <Globe className="w-4 h-4 text-blue-600" /> Continue with Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookSignup}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1877F2] text-white rounded-lg font-semibold hover:bg-[#166FE5] transition text-sm"
                >
                  <Facebook className="w-4 h-4" /> Continue with Facebook
                </button>
              </div>

              <p className="mt-5 text-center text-gray-400 text-xs">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 font-medium hover:text-blue-400 transition">
                  Login here
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white mb-2">Verify Your Email</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Enter the 6-digit code sent to your email address.
                </p>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(sanitizeInput(e.target.value))}
                  placeholder="Enter OTP"
                  maxLength="6"
                  required
                  className="w-full text-center tracking-widest py-2.5 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 ${
                    loading
                      ? "bg-blue-600/50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30"
                  }`}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
