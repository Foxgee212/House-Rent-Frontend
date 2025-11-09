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

  const [page, setPage] = useState(1); // current page
  const [totalPages, setTotalPages] = useState(1); // total pages for pagination
  const itemsPerPage = 12; // items per page
  const didFetch = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
  const buildUrl = (path) => `${API_URL}/${path.replace(/^\//, "")}`;

  // ===============================
  // ✅ FETCHING FUNCTIONS
  // ===============================

  const fetchApprovedHouses = useCallback(
    async (pageNum = 1, limit = itemsPerPage, append = false) => {
      setLoading(true);
      try {
        const res = await API.get(buildUrl(`/rentals/approved?page=${pageNum}&limit=${limit}`));

        const fetched = Array.isArray(res.data.houses) ? res.data.houses : [];
        const totalCount = res.data.totalCount || fetched.length * pageNum; // fallback if API doesn't return totalCount

        setHouses((prev) => (append ? [...prev, ...fetched] : fetched));
        localStorage.setItem(
          "houses",
          JSON.stringify(append ? [...houses, ...fetched] : fetched)
        );

        setTotalPages(Math.max(1, Math.ceil(totalCount / limit))); // update total pages
        setPage(pageNum);
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
    },
    [API_URL, houses]
  );

 
  const fetchApprovedSales = useCallback(
  async (page = 1, limit = 12) => {
    setLoading(true);
    try {
      const url = buildUrl(`sales/approved?page=${page}&limit=${limit}`);
      console.log("Fetching from:", url);

      const res = await API.get(url);
  
      // Safety check
      if (!res || !res.data) {
        throw new Error("Empty response from server");
      }

      const fetched = Array.isArray(res.data.houses) ? res.data.houses : [];
      setHousesForSale(fetched);
localStorage.setItem("housesForSale", JSON.stringify(fetched));
setError(null);

// ✅ return full data for pages & houses
return {
  houses: fetched,
  totalPages: res.data.totalPages || 1,
  total: res.data.total || fetched.length,
  page: res.data.page || 1,
};

    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to fetch homes for sale";
      console.error("Fetch approved sales error:", msg);
      setError(msg);
      toast.error(msg);

      const stored = localStorage.getItem("housesForSale");
      if (stored) setHousesForSale(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  },
  [API_URL]
);


  const fetchMySales = useCallback(
    async (token) => {
      setLoading(true);
      try {
        const res = await API.get(buildUrl("/sales/my"), {
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
    },
    [API_URL]
  );

  // ===============================
  // 🏗️ CRUD OPERATIONS
  // ===============================

  const addHouse = useCallback(
    async (formData, token) => {
      try {
        const res = await API.post(buildUrl("rentals"), formData, {
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
    },
    [API_URL]
  );

 const addSale = useCallback(
  async (formData, token) => {
    // Required fields validation
    const requiredFields = ["title", "price", "location", "description"];
    for (let field of requiredFields) {
      if (!formData.get(field)) {
        toast.error(`Field "${field}" is required`);
        throw new Error(`Field "${field}" is required`);
      }
    }

    // Optional: limit image size to 5MB per file
    const images = formData.getAll("images");
    for (let file of images) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be smaller than 5MB");
        throw new Error("Image size too large");
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await API.post(buildUrl("/sales"), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const newSale = res.data.house;
      setHousesForSale((prev) => [...prev, newSale]);
      setMySales((prev) => [...prev, newSale]);
      toast.success("House listed for sale!");
      return newSale;
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        const msg = err.response?.data?.error || "Failed to add sale house";
        toast.error(msg);
      }
      throw err;
    }
  },
  [API_URL]
);


  const updateSale = useCallback(
    async (id, formData, token) => {
      try {
        const res = await API.put(buildUrl(`/sales/${id}`), formData, {
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
    },
    [API_URL]
  );

  const deleteHouseById = useCallback(
    async (id, token, type = "rental") => {
      try {
        const endpoint = type === "sale" ? `/sales/${id}` : `/rentals/${id}`;
        await API.delete(buildUrl(endpoint), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHouses((prev) => prev.filter((h) => h._id !== id));
        setHousesForSale((prev) => prev.filter((h) => h._id !== id));
        setMySales((prev) => prev.filter((h) => h._id !== id));
        toast.success(`${type === "sale" ? "Sale" : "Rental"} house deleted!`);
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to delete house";
        setError(msg);
        toast.error(msg);
        throw err;
      }
    },
    [API_URL]
  );

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
  // 🏁 LOAD MORE / PAGINATION
  // ===============================
  const loadMoreHouses = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      fetchApprovedHouses(nextPage, itemsPerPage, true);
    }
  };

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
        totalPages,
        page,
        loadMoreHouses,
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
