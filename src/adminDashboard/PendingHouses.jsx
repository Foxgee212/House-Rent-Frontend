import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";

export default function PendingHouses() {
  const [houses, setHouses] = useState([]);

  const fetchHouses = async () => {
    try {
      const res = await API.get("/admin/pending");
      setHouses(res.data);
    } catch (err) {
      console.error("❌ Error fetching pending houses:", err);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        ⏳ Pending Houses
      </h2>
      {houses.length === 0 ? (
        <p className="text-gray-500 text-center">No pending houses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <AdminHouseCard
              key={house._id}
              house={house}
              onApprove={() => fetchHouses()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
