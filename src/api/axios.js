import axios from "axios";

// ✅ Create a pre-configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // allows cookies / auth headers across domains
  timeout: 10000, // ⏳ prevents hanging requests
});

// ✅ Automatically attach JWT token to every request
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

// ✅ Global response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized or expired token globally
    if (error.response?.status === 401) {
      console.warn("⚠️ Session expired or unauthorized access.");

      // Clear token from storage
      localStorage.removeItem("token");

      // Optional: redirect to login page automatically
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    // Optionally handle forbidden access globally
    if (error.response?.status === 403) {
      console.error("🚫 Access denied: Admins only.");
      // You could also redirect:
      // window.location.replace("/not-authorized");
    }

    return Promise.reject(error);
  }
);

export default API;
