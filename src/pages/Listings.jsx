import { useState } from "react";
import HouseCard from "../components/HouseCard";
import { Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";

export default function Listings() {

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { houses } = useHouses();

  // 🔍 Filter houses
  const filtered = houses.filter((house) => {
    const titleMatch = house.title?.toLowerCase().includes(search.toLowerCase());
    const descMatch = house.description?.toLowerCase().includes(search.toLowerCase());
    const locationMatch = house.location?.toLowerCase().includes(location.toLowerCase());
    const priceMatch = maxPrice === "" || house.price <= Number(maxPrice);

    return (search === "" || titleMatch || descMatch) && (location === "" || locationMatch) && priceMatch;
  });

  if (loading) {
    return <p className="text-center text-gray-600 mt-10">Loading houses...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Available Houses</h1>

      {/* Search inputs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border w-full sm:w-1/3 rounded-lg"
        />
        <input
          type="text"
          placeholder="Search by location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-3 border w-full sm:w-1/3 rounded-lg"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-3 border w-full sm:w-1/3 rounded-lg"
        />
      </div>

      {/* House listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">
            No houses found for "{search || "any keyword"}" in "{location || "any location"}" under ₦{maxPrice || "any price"}
          </p>
        ) : (
          filtered.map((h) => (
            <Link key={h._id} to={`/listings/${h._id}`}>
              <HouseCard house={h} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
