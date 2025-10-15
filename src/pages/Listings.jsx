import { useState } from "react";
import HouseCard from "../components/HouseCard";
import { Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";
import { Search, MapPin, DollarSign, ArrowUpDown, XCircle } from "lucide-react";

export default function Listings() {
  
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "asc" or "desc"

  const { houses, loading } = useHouses();

  // Filter houses
  let filtered = houses.filter((house) => {
    const titleMatch = house.title?.toLowerCase().includes(search.toLowerCase());
    const descMatch = house.description?.toLowerCase().includes(search.toLowerCase());
    const locationMatch = house.location?.toLowerCase().includes(location.toLowerCase());
    const priceMatch = maxPrice === "" || house.price <= Number(maxPrice);

    return (search === "" || titleMatch || descMatch) && (location === "" || locationMatch) && priceMatch;
  });

  // Sort houses
  if (sortOrder === "asc") filtered.sort((a, b) => a.price - b.price);
  if (sortOrder === "desc") filtered.sort((a, b) => b.price - a.price);

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setMaxPrice("");
    setSortOrder("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="loader border-blue-500 border-t-transparent border-4 w-12 h-12 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Available Houses
      </h1>

      {/* Sticky Filter Bar */}
      <div className="sticky top-4 z-20 bg-white/95 dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col sm:flex-row gap-4 mb-6 items-center">
        
        {/* Keyword */}
        <div className="relative w-full sm:w-1/4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 pl-10 border-blue-300 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Location */}
        <div className="relative w-full sm:w-1/4">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-3 pl-10 border-blue-300 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Max Price */}
        <div className="relative w-full sm:w-1/4">
          <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-3 pl-10 border-blue-300 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Sort */}
        <div className="relative w-full sm:w-1/4">
          <ArrowUpDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-3 pl-10 border w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">Sort by price</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          <XCircle size={18} /> Clear Filters
        </button>
      </div>

      {/* House Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
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
