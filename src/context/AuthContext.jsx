import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem("token") ||null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post(`${process.env.VITE_API_URL}/auth/login`, { email, password });
      setUser(response.data.user);
      console.log(response.data)
      setToken(response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await API.post(`${process.env.VITE_API_URL}/auth/signup`, { name, email, password, role });
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      console.log(user)
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup }}>
      {children}
    </AuthContext.Provider>
  );
  };


export function useAuth() {
  return useContext(AuthContext);
}
