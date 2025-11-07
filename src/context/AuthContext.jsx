import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ✅ User data in sessionStorage (clears when tab closes)
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );

  // ✅ Token in localStorage (persists across sessions)
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const [loading, setLoading] = useState(false); // API call loading
  const [checkingAuth, setCheckingAuth] = useState(true); // initial auth check
  const [error, setError] = useState(null);

  // ============================================================
  // Automatically attach Authorization header
  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ============================================================
  // Keep user synced with sessionStorage
  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");
  }, [user]);

  // ============================================================
  // Clear session on tab close
  useEffect(() => {
    const handleUnload = () => sessionStorage.removeItem("user");
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ============================================================
  // Fetch user info if token exists but user missing
  const fetchUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    const initializeUser = async () => {
      if (token && !user) {
        await fetchUser();
      }
      setCheckingAuth(false); // ✅ done checking
    };
    initializeUser();
  }, []);

  // ============================================================
  // LOGIN
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { user, token } = res.data;

      setUser(user);
      setToken(token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SIGNUP
  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/register", formData);
      return res.data; // wait for verification before setting user/token
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Signup failed. Please try again.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VERIFY EMAIL
  const verifyEmail = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      const { user, token } = res.data;

      setUser(user);
      setToken(token);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Email verification failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
  };

  // ============================================================
  // PASSWORD FLOWS
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Failed to send reset OTP.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/resend-otp", { email });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Failed to resend OTP.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/reset-password", {
        email,
        newPassword,
      });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.msg ||
        err.response?.data?.message ||
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
        checkingAuth,
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
