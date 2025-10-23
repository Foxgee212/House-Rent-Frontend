import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HouseCard from "../components/HouseCard";
import { useHouses } from "../context/HouseContext";
import { Search, MapPin, DollarSign, ArrowUpDown, XCircle } from "lucide-react";
import Spinner from "../components/Spinner";

export default function Listings() {
  const { houses, fetchApprovedHouses, loading } = useHouses();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFullFilter, setShowFullFilter] = useState(true);

  // Fetch data
  useEffect(() => {
    fetchApprovedHouses();
  }, []);

  // ✅ Smooth scroll detection with debounce
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      if (window.scrollY > lastScrollY + 30) {
        // scrolling down
        setShowFullFilter(false);
      } else if (window.scrollY < lastScrollY - 30) {
        // scrolling up
        setShowFullFilter(true);
      }
      lastScrollY = window.scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Filtering and sorting
  let filtered = houses.filter((house) => {
    const titleMatch = house.title?.toLowerCase().includes(search.toLowerCase());
    const descMatch = house.description?.toLowerCase().includes(search.toLowerCase());
    const locationMatch = house.location?.toLowerCase().includes(location.toLowerCase());
    const priceMatch = maxPrice === "" || house.price <= Number(maxPrice);

    return (search === "" || titleMatch || descMatch) && (location === "" || locationMatch) && priceMatch;
  });

  if (sortOrder === "asc") filtered.sort((a, b) => a.price - b.price);
  if (sortOrder === "desc") filtered.sort((a, b) => b.price - a.price);

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setMaxPrice("");
    setSortOrder("");
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Available Houses</h1>

      {/* ✅ Animated Filter Bar */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[80%] 
          bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700 
          transition-all duration-500 ease-in-out 
          ${showFullFilter ? "p-4" : "p-2"} `}
      >
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-500 overflow-hidden ${
            showFullFilter ? "max-h-[500px] opacity-100" : "max-h-[80px] opacity-95"
          }`}
        >
          {/* Search (always visible) */}
          <div className="relative w-full sm:w-1/4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search houses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 pl-10 ring-1 ring-gray-500 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Show others only when expanded */}
          {showFullFilter && (
            <>
              {/* Location */}
              <div className="relative w-full sm:w-1/4">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-3 pl-10 ring-1 ring-gray-500 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
                  className="p-3 pl-10 ring-1 ring-gray-500 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Sort */}
              <div className="relative w-full sm:w-1/4">
                <ArrowUpDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="p-3 pl-10 ring-1 ring-gray-500 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Sort by price</option>
                  <option value="asc">Low → High</option>
                  <option value="desc">High → Low</option>
                </select>
              </div>

              {/* Clear */}
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <XCircle size={18} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Spacer for fixed filter */}
      <div className="h-28"></div>

      {/* Houses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">
            No houses found for "{search || "any keyword"}" in "{location || "any location"}"
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
