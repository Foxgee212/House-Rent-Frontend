import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatically set Authorization header
  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Fetch user if token exists but user missing
  useEffect(() => {
    if (token && !user) fetchUser();
  }, [token]);

  // LOGIN (password)
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post(`/auth/login`, { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.msg || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const signup = async (name, email, password, role, location, bio, phone, profilePic) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post(`/auth/register`, { name, email, password, role, location, bio, phone, profilePic });
      setUser(res.data.user);
      setToken(res.data.token);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.msg || "Signup failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // FETCH USER
  const fetchUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user || res.data); // adjust based on backend
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // OTP LOGIN
  // --------------------------
  const requestLoginOtp = async (email) => {
    try {
      await API.post("/auth/login/request-otp", { email });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.msg || "Failed to send OTP");
    }
  };

  const verifyLoginOtp = async (email, otp) => {
    try {
      const res = await API.post("/auth/login/verify-otp", { email, otp });
      setUser(res.data.user);
      setToken(res.data.token);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.msg || "Invalid OTP");
    }
  };

  // --------------------------
  // FORGOT PASSWORD
  // --------------------------
  const requestForgotPasswordOtp = async (email) => {
    try {
      await API.post("/auth/forgot-password/request-otp", { email });
      return true; // OTP sent
    } catch (err) {
      throw new Error(err.response?.data?.msg || "Failed to send OTP");
    }
  };

  const verifyForgotPasswordOtp = async (email, otp) => {
    try {
      await API.post("/auth/forgot-password/verify-otp", { email, otp });
      return true; // OTP verified
    } catch (err) {
      throw new Error(err.response?.data?.msg || "Invalid OTP");
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await API.post("/auth/forgot-password/verify-otp", { email, otp, newPassword });
      return true; // Password reset successfully
    } catch (err) {
      throw new Error(err.response?.data?.msg || "Failed to reset password");
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
        requestLoginOtp,
        verifyLoginOtp,
        requestForgotPasswordOtp,
        verifyForgotPasswordOtp,
        resetPassword,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
