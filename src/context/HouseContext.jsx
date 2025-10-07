import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const HouseContext = createContext();

export function HouseProvider({ children }) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL 
  // ✅ Fetch all houses from backend
  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/houses`);
      setHouses(res.data.houses || []);
      localStorage.setItem("houses", JSON.stringify(res.data.houses || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch houses");
      console.warn("Using local storage fallback");
      const stored = localStorage.getItem("houses");
      if (stored) setHouses(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add a new house (Landlord only)
  const addHouse = async (formData, token) => {
    try {
      const res = await axios.post(`${API_URL}/houses`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      // Add new house to state
      setHouses((prev) => [...prev, res.data.house]);
      return res.data.house;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add house");
      throw err;
    }
  };

  // ✅ Delete a house by ID
  const deleteHouse = async (id, token) => {
    try {
      await axios.delete(`${API_URL}/houses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete house");
      throw err;
    }
  };

  // Fetch houses on mount
  useEffect(() => {
    fetchHouses();
  }, []);

  return (
    <HouseContext.Provider
      value={{ houses, loading, error, fetchHouses, addHouse, deleteHouse }}
    >
      {children}
    </HouseContext.Provider>
  );
}

// ✅ Hook to use house context
export function useHouses() {
  return useContext(HouseContext);
}
