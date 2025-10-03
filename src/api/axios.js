import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change to deployed backend URL later
});

// ✅ Attach token dynamically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // we stored it at login
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
