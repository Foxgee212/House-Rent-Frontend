import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard"; // ✅ use the modern card we designed earlier
import { useHouses } from "../context/HouseContext";

export default function AdminHouses() {
  const [houses, setHouses] = useState([]);
  const { fetchApprovedHouses } = useHouses()

  // ✅ Fetch all houses
  const fetchHouses = async () => {
    try {
      const res = await API.get("/admin/approved");
      setHouses(res.data);
    } catch (err) {
      console.error("❌ Error fetching houses:", err);
    }
  };

  // ✅ Approve a house
  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/houses/${id}/approve`);
      fetchHouses(); // refresh data
      fetchApprovedHouses()
    } catch (err) {
      console.error("❌ Error approving house:", err);
    }
  };

  // ✅ Delete a house
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this house?")) return;
    try {
      await API.delete(`/admin/houses/${id}`);
      fetchHouses();
      fetchApprovedHouses()
    } catch (err) {
      console.error("❌ Error deleting house:", err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">🏘️ All Listed Houses</h2>

      {houses.length === 0 ? (
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
