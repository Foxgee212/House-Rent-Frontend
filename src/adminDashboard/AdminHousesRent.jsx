import { useEffect, useState } from "react";
import API from "../api/axios";
import AdminHouseCard from "./AdminHouseCard";
import { Search, Loader2 } from "lucide-react";

export default function AdminHousesRent({ onBack }) {
    const [houses, setHouses] = useState([]);
    const [filter, setFilter] = useState("approved"); // "approved" | "pending"
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch houses based on filter
    const fetchHouses = async () => {
     try {
        setLoading(true);
         const endpoint =
            filter === "approved"
            ? "/admin/houses/rent/approved"
            : "/admin/houses/rent/pending";
        const res = await API.get(endpoint);
        setHouses(res.data || []);
        console.log("Fetched houses:", res.data);
        } catch (err) {
        console.error("❌ Error fetching houses:", err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchHouses();
    }, [filter]);
    console.log("Houses state:", houses);

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

    // Filtered search
    const filteredHouses = houses.filter((house) =>
        house.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="mt-6">
        {/* Back button */}
        <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700"
        >
            ← Back
        </button>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
            <div className="flex gap-2">
            <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg ${
                filter === "approved"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
            >
                Approved
            </button>
            <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg ${
                filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
            >
                Pending
            </button>
            </div>

            <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 w-full bg-gray-800 text-gray-200 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            </div>
        </div>

        {/* House List */}
        {loading ? (
           <div className="flex items-center justify-center h-24">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
        ) : filteredHouses.length === 0 ? (
            <p className="text-gray-400">No houses found.</p>
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
