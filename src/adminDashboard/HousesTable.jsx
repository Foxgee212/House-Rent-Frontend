import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminHouseCard from "../components/AdminHouseCard";
import { Search } from "lucide-react";

export default function AdminHouses() {
  const [rentalHouses, setRentalHouses] = useState([]);
  const [saleHouses, setSaleHouses] = useState([]);
  const [query, setQuery] = useState("");

  const fetchHouses = async () => {
    try {
      const resRent = await API.get("/admin/approved-rent");
      const resSale = await API.get("/admin/approved-sales");
      setRentalHouses(resRent.data);
      setSaleHouses(resSale.data);
    } catch (err) {
      console.error("❌ Error fetching houses:", err);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      await API.patch(`/admin/houses/${id}/approve`);
      fetchHouses();
    } catch (err) {
      console.error("❌ Error approving house:", err);
    }
  };

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
  }, []);

  const filterHouses = (houses) =>
    houses.filter(
      (h) =>
        h.title?.toLowerCase().includes(query.toLowerCase()) ||
        h.address?.toLowerCase().includes(query.toLowerCase()) ||
        h.ownerEmail?.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="p-4 bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">🏘️ Admin Dashboard</h2>

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

      {/* Rental Houses */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-200 mb-4">Rental Houses</h3>
        {filterHouses(rentalHouses).length === 0 ? (
          <p className="text-gray-500 text-center py-10">No rental houses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterHouses(rentalHouses).map((house) => (
              <AdminHouseCard
                key={house._id}
                house={house}
                onApprove={() => handleApprove(house._id, "rent")}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Houses for Sale */}
      <div>
        <h3 className="text-xl font-bold text-gray-200 mb-4">Houses for Sale</h3>
        {filterHouses(saleHouses).length === 0 ? (
          <p className="text-gray-500 text-center py-10">No houses for sale found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterHouses(saleHouses).map((house) => (
              <AdminHouseCard
                key={house._id}
                house={house}
                onApprove={() => handleApprove(house._id, "sale")}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
