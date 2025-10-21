import { useEffect, useState } from "react";
import API from "../Api/axios";
import AdminHouseCard from "../components/AdminHouseCard"; // ✅ your house card component

export default function AdminHouses({ filterType = "all" }) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch houses based on filter
  const fetchHouses = async () => {
    try {
      setLoading(true);
      let endpoint = "/admin/houses"; // default: all houses

      if (filterType === "approved") endpoint = "/admin/houses/approved";
      if (filterType === "pending") endpoint = "/admin/houses/pending";

      const res = await API.get(endpoint);
      setHouses(res.data || []);
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
  }, [filterType]); // 🔁 refetch when filter changes

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {filterType === "approved"
          ? "✅ Approved Houses"
          : filterType === "pending"
          ? "🕓 Pending Houses"
          : "🏘️ All Houses"}
      </h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading houses...</p>
      ) : houses.length === 0 ? (
        <p className="text-gray-500 text-center">No houses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
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
