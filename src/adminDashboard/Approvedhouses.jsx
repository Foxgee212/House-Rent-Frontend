import { useEffect, useState } from "react";
import API from "../Api/axios";
import AdminHouseCard from "../components/AdminHouseCard";

export default function ApprovedHouses() {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await API.get("/admin/approved");
        setHouses(res.data);
      } catch (err) {
        console.error("❌ Error fetching approved houses:", err);
      }
    };
    fetchHouses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        ✅ Approved Houses
      </h2>
      {houses.length === 0 ? (
        <p className="text-gray-500 text-center">No approved houses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <AdminHouseCard key={house._id} house={house} />
          ))}
        </div>
      )}
    </div>
  );
}
