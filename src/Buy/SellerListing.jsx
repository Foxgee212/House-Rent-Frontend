import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HouseCard from "../components/HouseCard";
import { useHouses } from "../context/HouseContext";
import { Search, MapPin, DollarSign, ArrowUpDown, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AgentListings() {
  const { user } = useAuth();
  const { mySales, fetchMySales, loading } = useHouses();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFullFilter, setShowFullFilter] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch agent listings on mount
  useEffect(() => {
    if (user?.token) fetchMySales(user.token);
  }, [user]);

  // Mobile scroll detection to hide/show filter bar
  useEffect(() => {
    if (!isMobile) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScrollY + 10) {
        setShowFullFilter(false); // hide on scroll down
      } else if (currentScroll < lastScrollY - 10) {
        setShowFullFilter(true); // show on scroll up
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
  }, [isMobile]);

  // Filtering and sorting
  let filtered = mySales.filter((house) => {
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

  // ✅ Loading screen
  if (loading)
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-blue-400">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 overflow-hidden">
          <div className="h-full w-1/2 bg-blue-500 animate-slide" />
        </div>
        <div className="flex flex-col items-center mt-6">
          <MapPin size={36} className="text-blue-400 animate-pulse mb-4" />
          <h2 className="text-lg font-medium text-gray-100">Loading your listings...</h2>
        </div>
        <style>
          {`
            @keyframes slide {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(50%); }
              100% { transform: translateX(100%); }
            }
            .animate-slide {
              animation: slide 1.2s ease-in-out infinite;
              box-shadow: 0 0 12px rgba(59,130,246,0.7);
            }
          `}
        </style>
      </div>
    );

  return (
    <div
      className={`min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 p-6 sm:p-8 transition-colors duration-300 ${
        isMobile ? "pt-28" : ""
      }`}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-100">My Listings</h1>

      {/* Filter bar */}
      <div
        className={`${
          isMobile
            ? `fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] bg-gray-900/85 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl 
               transition-all duration-400 ease-in-out ${showFullFilter ? "p-4 scale-100 opacity-100" : "p-2 scale-[0.98] opacity-90"}`
            : `bg-gray-800/90 backdrop-blur-lg border border-gray-700/60 rounded-2xl shadow-lg p-4 mb-8`
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-500 overflow-hidden ${
            isMobile ? (showFullFilter ? "max-h-[500px]" : "max-h-[70px]") : "max-h-none"
          }`}
        >
          <div className="relative w-full sm:w-1/4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 pl-10 ring-1 ring-gray-600/70 text-gray-200 bg-gray-900/70 w-full rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {(!isMobile || showFullFilter) && (
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

      {/* Spacer for mobile filter */}
      {isMobile && <div className="h-28"></div>}

      {/* Agent house listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">
            No listings found for "{search || "any keyword"}" in "{location || "any location"}"
          </p>
        ) : (
          filtered.map((h) => (
            <Link key={h._id} to={`/agent/listings/${h._id}`}>
              <HouseCard house={h} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
