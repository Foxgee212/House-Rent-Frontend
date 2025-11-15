import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import SaleCard from "../components/cards/SaleCard";
import { useHouses } from "../context/HouseContext";
import { Search, MapPin, DollarSign, ArrowUpDown, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AgentListings() {
  const { user } = useAuth();
  const { mySales, fetchMySales, loading, hasMore, fetchMoreSales } = useHouses();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFullFilter, setShowFullFilter] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const observer = useRef();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch listings on mount
  useEffect(() => {
    if (user?.token) fetchMySales(user.token, 1);
  }, [user, fetchMySales]);

  // Mobile scroll detection to hide/show filter bar
  useEffect(() => {
    if (!isMobile) return;
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScrollY + 10) setShowFullFilter(false);
      else if (currentScroll < lastScrollY - 10) setShowFullFilter(true);
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Infinite scroll
  const lastHouseElementRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) fetchMoreSales(user.token);
    });
    if (node) observer.current.observe(node);
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = mySales.filter((house) => {
      const titleMatch = house.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const descMatch = house.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const locationMatch = house.location?.toLowerCase().includes(location.toLowerCase());
      const priceMatch = maxPrice === "" || Number(house.price) <= Number(maxPrice);
      return (debouncedSearch === "" || titleMatch || descMatch) &&
             (location === "" || locationMatch) &&
             priceMatch;
    });

    if (sortOrder === "asc") filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortOrder === "desc") filtered.sort((a, b) => Number(b.price) - Number(a.price));

    return filtered;
  }, [mySales, debouncedSearch, location, maxPrice, sortOrder]);

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setMaxPrice("");
    setSortOrder("");
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="bg-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-600 rounded w-3/4" />
        <div className="h-4 bg-gray-600 rounded w-1/2" />
        <div className="h-3 bg-gray-600 rounded w-1/3 mt-2" />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 p-6 sm:p-8 ${isMobile ? "pt-28" : ""}`}>
      <h1 className="text-3xl font-bold mb-6 text-gray-100">My Listings</h1>

      {/* Filter bar */}
      <div className={`${isMobile ? "fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] bg-gray-900/85 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl transition-all duration-400 ease-in-out" : "bg-gray-800/90 backdrop-blur-lg border border-gray-700/60 rounded-2xl shadow-lg p-4 mb-8"}`}>
        <div className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-500 overflow-hidden ${isMobile ? (showFullFilter ? "max-h-[500px] p-4 scale-100 opacity-100" : "max-h-[70px] p-2 scale-[0.98] opacity-90") : "max-h-none"}`}>
          
          {/* Search input */}
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
              {/* Location */}
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

              {/* Max price */}
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

              {/* Sort order */}
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

              {/* Clear filters */}
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

      {isMobile && <div className="h-28"></div>}

      {/* Listings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filteredListings.length === 0 && !loading ? (
          <p className="col-span-full text-center text-gray-400">
            No listings found for "{debouncedSearch || "any keyword"}" in "{location || "any location"}"
          </p>
        ) : (
          <>
            {filteredListings.map((h, idx) => {
              const ref = idx === filteredListings.length - 1 ? lastHouseElementRef : null;
              return (
                <Link key={h._id} to={`/agent/listings/${h._id}`} ref={ref}>
                  <SaleCard sale={h} />
                </Link>
              );
            })}

            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </>
        )}
      </div>
    </div>
  );
}
