// context/HouseContext.js
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";

const HouseContext = createContext();

export function HouseProvider({ children }) {
  const [houses, setHouses] = useState([]); // 🏠 Rentals
  const [housesForSale, setHousesForSale] = useState([]); // 🏡 Sales
  const [mySales, setMySales] = useState([]); // 👤 Seller's own listings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didFetch = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
  const buildUrl = (path) => `${API_URL}/${path.replace(/^\//, "")}`;

  // ===============================
  // ✅ FETCHING FUNCTIONS
  // ===============================

  const fetchApprovedHouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(buildUrl("/houses/approved"));
      const fetched = Array.isArray(res.data.houses) ? res.data.houses : [];
      setHouses(fetched);
      localStorage.setItem("houses", JSON.stringify(fetched));
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to fetch houses";
      setError(msg);
      toast.error(msg);
      const stored = localStorage.getItem("houses");
      if (stored) setHouses(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchApprovedSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(buildUrl("/houses/approved-sales"));
      const fetched = Array.isArray(res.data.houses) ? res.data.houses : [];
      setHousesForSale(fetched);
      localStorage.setItem("housesForSale", JSON.stringify(fetched));
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to fetch homes for sale";
      setError(msg);
      toast.error(msg);
      const stored = localStorage.getItem("housesForSale");
      if (stored) setHousesForSale(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchMySales = useCallback(async (token) => {
    setLoading(true);
    try {
      const res = await API.get(buildUrl("/houses/my-sales"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMySales(res.data.houses || []);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load your sales";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // ===============================
  // 🏗️ CRUD OPERATIONS
  // ===============================

  const addHouse = useCallback(async (formData, token) => {
    try {
      const res = await API.post(buildUrl("/houses"), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setHouses((prev) => [...prev, res.data.house]);
      toast.success("Rental house added!");
      return res.data.house;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add house";
      setError(msg);
      throw err;
    }
  }, [API_URL]);

  const addSale = useCallback(async (formData, token) => {
    try {
      const res = await API.post(buildUrl("/houses/sales"), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const newSale = res.data.house;
      setHousesForSale((prev) => [...prev, newSale]);
      setMySales((prev) => [...prev, newSale]);
      toast.success("House listed for sale!");
      return newSale;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add sale house";
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, [API_URL]);

  const updateSale = useCallback(async (id, formData, token) => {
    try {
      const res = await API.put(buildUrl(`/houses/sales/${id}`), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = res.data.house;
      setHousesForSale((prev) => prev.map((h) => (h._id === id ? updated : h)));
      setMySales((prev) => prev.map((h) => (h._id === id ? updated : h)));
      toast.success("House updated successfully!");
      return updated;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update sale";
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, [API_URL]);

  const deleteHouseById = useCallback(async (id, token) => {
    try {
      await API.delete(buildUrl(`/houses/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHouses((prev) => prev.filter((h) => h._id !== id));
      setHousesForSale((prev) => prev.filter((h) => h._id !== id));
      setMySales((prev) => prev.filter((h) => h._id !== id));
      toast.success("House deleted successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete house";
      setError(msg);
      toast.error(msg);
      throw err;
    }
  }, [API_URL]);

  // ===============================
  // 🧠 AUTO LOAD DATA
  // ===============================
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchApprovedHouses();
    fetchApprovedSales();
  }, [fetchApprovedHouses, fetchApprovedSales]);

  // ===============================
  // 🧩 PROVIDER EXPORT
  // ===============================
  return (
    <HouseContext.Provider
      value={{
        houses,
        housesForSale,
        mySales,
        loading,
        error,
        fetchApprovedHouses,
        fetchApprovedSales,
        fetchMySales,
        addHouse,
        addSale,
        updateSale,
        deleteHouse: deleteHouseById,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
}

export function useHouses() {
  return useContext(HouseContext);
}
