import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



export default function Signup() {

  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [error, setError] = useState("");
  const [ loading, setLoading ] = useState(false);
  const { name, email, password, role } = form;
  const { signup } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password, role);
      switch (role) {
        case "landlord":
          navigate("/dashboard");
          break;
        case "tenant":
        default:
          navigate("/");
      }
      alert("Signup successful!");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  

  }
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 shrink">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Signup</h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Fullname"
            value={form.name}
            onChange={handleChange}
            className="p-3 border rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-3 border rounded-lg"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3 border rounded-lg"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>

          <button
            type="submit"
            className={`bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 ${loading && "opacity-50 cursor-not-allowed"}`}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );

  };
