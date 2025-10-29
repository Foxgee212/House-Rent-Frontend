import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Attach Authorization header
  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Sync user with localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Fetch user if token exists but user is missing
  useEffect(() => {
    if (token && !user) fetchUser();
  }, [token]);

  // ================= LOGIN =================
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/login", { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Login failed. Please check your credentials.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= SIGNUP =================
  const signup = async (name, email, password, role, location, bio, phone, profilePic) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        role,
        location: location || "",
        bio: bio || "",
        phone: phone || "",
        profilePic: profilePic || "",
      });
      return res.data; // { success: true, msg: "Check your email for OTP" }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Signup failed. Please try again.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY EMAIL =================
  const verifyEmail = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/verify-email", { email, otp });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Email verification failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ================= FETCH USER =================
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

  // ================= FORGOT PASSWORD =================
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      return res.data; // { success: true, msg: "OTP sent to email" }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Failed to send reset email.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const resendOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/resend-otp", { email });
      return res.data; // { success: true, msg: "OTP resent to email" }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Failed to resend OTP.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async (email, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/reset-password", { email, newPassword });
      return res.data; // { success: true, msg: "Password reset successful" }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Password reset failed.";
      setError(message);
      throw new Error(message);
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
        verifyEmail,
        logout,
        fetchUser,
        forgotPassword,
        resendOtp,
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
