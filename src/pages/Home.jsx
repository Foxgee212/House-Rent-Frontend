import { useState } from "react";
import HouseCard from "../components/HouseCard";
import { useHouses } from "../context/HouseContext";

export default function Home() {
  const { houses = [], loading } = useHouses(); // fallback to empty array
  const [search, setSearch] = useState("");

  // 🔍 Filter houses by location safely
  const filtered = houses.filter((h) =>
    h.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <p className="text-center text-gray-600 mt-10">Loading houses...</p>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-50 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Find Your Next Home</h1>
        <p className="mt-4 text-gray-600">Search Houses for rent near you</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter location..."
          className="mt-6 p-3 w-80 border rounded-lg"
        />
      </section>

      {/* Houses Section */}
      <section className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">
            No houses found for "{search || "all locations"}"
          </p>
        ) : (
          filtered.map((h) => <HouseCard key={h._id} house={h} />)
        )}
      </section>
    </div>
  );
}
