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

  // ✅ Fetch approved houses on mount
  useEffect(() => {
    fetchApprovedHouses();
  }, []);

  // ✅ More sensitive scroll detection with smoother transition
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentScroll = window.scrollY;

      // Smaller threshold → more sensitive scroll
      if (currentScroll > lastScrollY + 10) {
        // Scrolling down fast
        setShowFullFilter(false);
      } else if (currentScroll < lastScrollY - 10) {
        // Scrolling up slightly → reveal quickly
        setShowFullFilter(true);
      }

      lastScrollY = currentScroll;
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

  // ✅ Filtering logic
  let filtered = houses.filter((house) => {
    const titleMatch = house.title?.toLowerCase().includes(search.toLowerCase());
    const descMatch = house.description?.toLowerCase().includes(search.toLowerCase());
    const locationMatch = house.location?.toLowerCase().includes(location.toLowerCase());
    const priceMatch = maxPrice === "" || house.price <= Number(maxPrice);

    return (search === "" || titleMatch || descMatch) &&
           (location === "" || locationMatch) &&
           priceMatch;
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

      {/* ✅ Modern Smart Filter Bar */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] md:w-[80%] 
          bg-gray-900/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl 
          transition-all duration-400 ease-in-out 
          ${showFullFilter ? "p-4 scale-100 opacity-100" : "p-2 scale-[0.98] opacity-90"} `}
      >
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-500 overflow-hidden ${
            showFullFilter ? "max-h-[500px]" : "max-h-[70px]"
          }`}
        >
          {/* 🔍 Always visible search */}
          <div className="relative w-full sm:w-1/4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              placeholder="Search houses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 pl-10 ring-1 ring-gray-600/70 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* 📍 Other filters only visible when expanded */}
          {showFullFilter && (
            <>
              <div className="relative w-full sm:w-1/4">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-3 pl-10 ring-1 ring-gray-600/70 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>

              <div className="relative w-full sm:w-1/4">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
                <input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="p-3 pl-10 ring-1 ring-gray-600/70 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>

              <div className="relative w-full sm:w-1/4">
                <ArrowUpDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="p-3 pl-10 ring-1 ring-gray-600/70 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                >
                  <option value="">Sort by price</option>
                  <option value="asc">Low → High</option>
                  <option value="desc">High → Low</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="flex items-center gap-1 bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-red-500/20"
              >
                <XCircle size={18} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Spacer for fixed bar */}
      <div className="h-28"></div>

      {/* 🏠 House listings */}
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
