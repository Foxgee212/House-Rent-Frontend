import axios from "axios";

// ✅ Create a pre-configured axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000, // ⏳ prevent hanging requests (10s max)
});

// ✅ Automatically attach JWT token to all outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global response interceptor (optional but recommended)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized or expired token globally
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized access.");
      localStorage.removeItem("token");
      // Optional: redirect to login page
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
