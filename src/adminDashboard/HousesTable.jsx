import { useEffect, useState, useMemo } from "react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";
import { Search } from "lucide-react";
import { useHouses } from "../context/HouseContext";

export default function AdminHouses() {
  const [houses, setHouses] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredHouses, setFilteredHouses] = useState([]);
  const { fetchApprovedHouses } = useHouses();

  // ✅ Fetch all houses
  const fetchHouses = async () => {
    try {
      const res = await API.get("/admin/approved");
      setHouses(res.data);
      setFilteredHouses(res.data);
    } catch (err) {
      console.error("❌ Error fetching houses:", err);
    }
  };

  // ✅ Approve / Delete handlers
  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/houses/${id}/approve`);
      fetchHouses();
      fetchApprovedHouses();
    } catch (err) {
      console.error("❌ Error approving house:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this house?")) return;
    try {
      await API.delete(`/admin/houses/${id}`);
      fetchHouses();
      fetchApprovedHouses();
    } catch (err) {
      console.error("❌ Error deleting house:", err);
    }
  };

  // ✅ Debounce search to prevent flicker
  useEffect(() => {
    const timeout = setTimeout(() => {
      const q = query.toLowerCase();
      setFilteredHouses(
        houses.filter(
          (h) =>
            h.title?.toLowerCase().includes(q) ||
            h.address?.toLowerCase().includes(q) ||
            h.ownerEmail?.toLowerCase().includes(q)
        )
      );
    }, 300); // wait 300ms before filtering
    return () => clearTimeout(timeout);
  }, [query, houses]);

  useEffect(() => {
    fetchHouses();
  }, []);

  return (
    <div className="p-4 bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">🏘️ All Listed Houses</h2>

        {/* 🔍 Search Input */}
        <div className="relative w-full sm:w-72 mt-3 sm:mt-0">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, address or owner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>

      {filteredHouses.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No houses found.</p>
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
