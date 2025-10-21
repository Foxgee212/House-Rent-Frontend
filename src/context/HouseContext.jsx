import { createContext, useContext, useState, useEffect } from "react";
import API from "../Api/axios";
import { toast } from "react-hot-toast";

const HouseContext = createContext();

export function HouseProvider({ children }) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch Approved houses houses
  const fetchApprovedHouses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/houses/approved");
      const fetched = Array.isArray(res.data.houses) ? res.data.houses : [];
      setHouses(fetched);
      localStorage.setItem("houses", JSON.stringify(fetched));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch houses");
      toast.error(err.response?.data?.error || "Failed to fetch houses");

      const stored = localStorage.getItem("houses");
      if (stored) setHouses(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const addHouse = async (formData, token) => {
    try {
      const res = await API.post(`${API_URL}/houses`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setHouses((prev) => [...prev, res.data.house]);
      return res.data.house;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add house");
      throw err;
    }
  };

  const deleteHouse = async (id, token) => {
    try {
      await API.delete(`${API_URL}/houses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete house");
      throw err;
    }
  };

  useEffect(() => {
    fetchApprovedHouses();
  }, []);

  return (
    <HouseContext.Provider value={{ houses, loading, error, fetchApprovedHouses, addHouse, deleteHouse }}>
      {children}
    </HouseContext.Provider>
  );
}

export function useHouses() {
  return useContext(HouseContext);
}
