import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";

export default function AdminHouses() {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch houses based on filter
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

  // Approve house
  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/houses/${id}/approve`);
      fetchHouses();
    } catch (err) {
      console.error("❌ Error approving house:", err);
    }
  };

  // Delete house
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

  // Search filter
  useEffect(() => {
    const filtered = houses.filter((house) =>
      house.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredHouses(filtered);
  }, [search, houses]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 transition-all">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-semibold">
          {filter === "approved"
            ? "✅ Approved Houses"
            : filter === "pending"
            ? "🕓 Pending Houses"
            : "🏘️ All Houses"}
        </h2>

        <div className="flex gap-3 flex-wrap">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="all">All Houses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-gray-200 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-400 text-center">Loading houses...</p>
      ) : filteredHouses.length === 0 ? (
        <p className="text-gray-400 text-center">No houses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => (
            <AdminHouseCard
              key={house._id}
              house={house}
              onApprove={handleApprove}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
