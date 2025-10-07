import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";





export default function Login() {

  const [form, setForm] = useState({ email: "", password: ""});
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [ loading, setLoading ] = useState(false);

  const { email, password } = form;
  const { login, user } = useAuth();
  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
       // ✅ Success toast
      toast.success("Login Successful!", {
        icon: "🚀",
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#4CAF50",
          color: "#fff",
        },
      });

      // Wait a second before navigating
      setTimeout(() => {
        switch (user?.role) {
          case "landlord":
            navigate("/dashboard");
            break;
          case "tenant":
          default:
            navigate("/");
        }
      }, 600);

    } catch (err) {
      setError(err.message || "Login failed");
    }
    finally {
      setLoading(false);
    } 

  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            className="p-3 border rounded-lg"
            required
          />
        {/* ✅ Spinner with loading animation */}
          <button
            type="submit"
            disabled={loading}
            className={`flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Spinner />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
