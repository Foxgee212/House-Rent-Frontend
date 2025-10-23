import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";

export default function ApprovedHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/approved");
      setHouses(res.data);
    } catch (err) {
      console.error("❌ Error fetching approved houses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this house?")) return;
    try {
      await API.delete(`/admin/houses/${id}`);
      // Smooth removal animation
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("❌ Error deleting house:", err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin text-indigo-600" size={28} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-900">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        ✅ Approved Houses
      </h2>

      {houses.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No approved houses found.</p>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {houses.map((house, index) => (
              <motion.div
                key={house._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
              >
                <AdminHouseCard house={house} onDelete={() => handleDelete(house._id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
