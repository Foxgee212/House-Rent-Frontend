import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Automatically set Authorization header
  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ✅ Keep user in sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ✅ Fetch user if token exists but user missing
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token]);

  // ✅ LOGIN
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post(`/auth/login`, { email, password });

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      return res.data; // ✅ Return success response for component to handle
    } catch (err) {
      const message =
        err.response?.data?.message || // ✅ use 'message' from backend
        err.response?.data?.msg ||
        "Login failed";
      setError(message);
      throw new Error(message); // ✅ rethrow for component to catch
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIGNUP
  const signup = async (name, email, password, role, location, bio, phone, profilePic) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post(`/auth/register`, {
        name,
        email,
        password,
        role,
        location: location || "",
        bio: bio || "",
        phone: phone || "",
        profilePic: profilePic || "",
      });

      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Signup failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Fetch user from backend (optional)
  const fetchUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        logout,
        fetchUser,
        setUser, // for profile updates
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
