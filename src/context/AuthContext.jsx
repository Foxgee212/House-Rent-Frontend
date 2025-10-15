import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Set token in axios headers automatically
  useEffect(() => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Auto-fetch profile if token exists  but no user(on page reload)
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post(`/auth/login`, { email, password });
      setUser(res.data.user);
      setToken(res.data.token);

      // save to local storage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
                      profilePic: profilePic || "" });
      setUser(res.data.user);
      setToken(res.data.token);

      //save to local storage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);  
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Fetch user from backend (optional for profile refresh)
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
        setUser, // allow profile edits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
