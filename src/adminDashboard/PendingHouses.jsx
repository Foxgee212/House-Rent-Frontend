import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Clock } from "lucide-react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";

export default function PendingHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/pending");
      setHouses(res.data);
    } catch (err) {
      console.error("❌ Error fetching pending houses:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve a house
  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/houses/${id}/approve`);
      fetchHouses(); // refresh list
    } catch (err) {
      console.error("❌ Error approving house:", err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-900">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="text-yellow-500" size={22} />
        <h2 className="text-2xl font-semibold text-gray-800">
          Pending Houses
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : houses.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center py-20"
        >
          No pending houses found.
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {houses.map((house, index) => (
              <motion.div
                key={house._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
              >
                <AdminHouseCard
                  house={house}
                  onApprove={() => handleApprove(house._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
