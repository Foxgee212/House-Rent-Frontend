import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { User, Mail, Lock, UserPlus, Building2 } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
    location: "",
    bio: "",
    phone: "",
    profilePic: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { name, email, password, role, location, bio, phone, profilePic } = form;
  const { signup } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        switch (role) {
          case "landlord":
            navigate("/dashboard");
            break;
          case "tenant":
          default:
            navigate("/");
        }
      }, 600);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-blue-100">
        {/* Header */}
        <div className="text-center mb-6">
          <UserPlus className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-blue-700">Create an Account</h1>
          <p className="text-gray-500 mt-1">Join and find your perfect home today!</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3 bg-red-50 py-2 rounded-lg border border-red-100">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={name}
              onChange={handleChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={handleChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          {/* Role */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <select
              name="role"
              value={role}
              onChange={handleChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <Spinner size={20} /> Signing up...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
