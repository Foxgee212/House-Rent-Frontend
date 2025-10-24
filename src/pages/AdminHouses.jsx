import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";
import { Loader2, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHouses() {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ✅ Fetch houses
  const fetchHouses = async () => {
    try {
      setLoading(true);
      let endpoint = "/admin/houses";

      if (filter === "approved") endpoint = "/admin/houses/approved";
      if (filter === "pending") endpoint = "/admin/houses/pending";

      const res = await API.get(endpoint);
      setHouses(res.data || []);
      setFilteredHouses(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching houses:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve house
  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/houses/${id}/approve`);
      fetchHouses();
    } catch (err) {
      console.error("❌ Error approving house:", err);
    }
  };

  // ✅ Delete house
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this house?")) return;
    try {
      await API.delete(`/admin/houses/${id}`);
      fetchHouses();
    } catch (err) {
      console.error("❌ Error deleting house:", err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [filter]);

  // ✅ Search filter
  useEffect(() => {
    const filtered = houses.filter((house) =>
      house.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredHouses(filtered);
  }, [search, houses]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 transition-all">
      {/* ===== Header & Filters ===== */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 p-4 rounded-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
          <Filter size={20} />
          {filter === "approved"
            ? "Approved Houses"
            : filter === "pending"
            ? "Pending Houses"
            : "All Houses"}
        </h2>

        <div className="flex gap-3 flex-wrap">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-gray-200 px-4 py-2 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">All Houses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800 text-gray-200 px-4 py-2 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <Loader2 size={48} className="text-blue-500" />
          </motion.div>
          <p className="text-gray-400 mt-4 tracking-wider">Loading houses...</p>
        </div>
      ) : filteredHouses.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No houses found.</p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredHouses.map((house) => (
              <motion.div
                key={house._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AdminHouseCard
                  house={house}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
