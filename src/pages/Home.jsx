import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";
import LoadingBar from "react-top-loading-bar";
import { Search, MapPin, Home } from "lucide-react";
import { motion } from "framer-motion";
import HouseCard from "../components/HouseCard";

// Memoized HouseCard with lazy load and blur effect
const LazyHouseCard = ({ house }) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{visible && <HouseCard house={house} />}</div>;
};

export default function HomePage() {
  const { houses, fetchApprovedHouses, loading } = useHouses();
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const loadingBarRef = useRef(null);

  // Fetch houses on mount
  useEffect(() => {
    const fetchData = async () => {
      loadingBarRef.current?.continuousStart();
      await fetchApprovedHouses();
      loadingBarRef.current?.complete();
    };
    fetchData();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtered houses
  const filtered = useMemo(() => {
    if (!Array.isArray(houses)) return [];
    if (!search.trim()) return houses;
    return houses.filter((house) =>
      house.location?.toLowerCase().includes(search.toLowerCase())
    );
  }, [houses, search]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
        <LoadingBar color="#3b82f6" height={3} ref={loadingBarRef} />
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute w-28 h-28 rounded-full border-4 border-transparent"
            style={{
              background:
                "conic-gradient(from 0deg, #3b82f6, #7c3aed, #06b6d4, #3b82f6)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "destination-out",
              padding: "4px",
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-blue-500 blur-2xl opacity-50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.25, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
          >
            <Home size={62} strokeWidth={2.5} color="#60a5fa" />
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-300 mt-6 text-sm tracking-widest uppercase"
        >
          Loading houses...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 transition-colors duration-300">
      <LoadingBar color="#3b82f6" height={3} ref={loadingBarRef} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-center text-white overflow-hidden py-16 sm:py-24 md:py-32">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3 sm:space-y-4 px-4 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Home size={48} className="text-white drop-shadow-2xl sm:text-[56px]" />
            </motion.div>
            <motion.h1
              className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-cyan-200 leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Find Your Dream Home
            </motion.h1>
          </div>

          <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Explore affordable and luxurious houses available for rent near you
          </p>

          {/* Search Bar */}
          <div className="mt-6 flex justify-center w-full">
            <div className="relative w-full max-w-md backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/30">
              <Search className="absolute left-4 top-3 text-white/70" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by location..."
                className="w-full py-2.5 sm:py-3 pl-10 pr-4 rounded-2xl bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm sm:text-base"
              />
            </div>
          </div>

          <Link
            to="/listings"
            className="mt-4 inline-block bg-white text-blue-600 font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Browse All Listings
          </Link>
        </div>
      </section>

      {/* Houses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-center mb-8 sm:mb-10">
          <MapPin size={24} className="text-blue-600 mr-2" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-200">
            Available Houses
          </h2>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-6 sm:mt-10">
            No houses found for “{search || "all locations"}”
          </p>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((house) => (
              <Link key={house._id} to={`/listings/${house._id}`}>
                <LazyHouseCard
                  house={{
                    ...house,
                    primaryImage: house.primaryImage || house.images?.[0],
                  }}
                />
              </Link>
            ))}
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-6 mt-10">
        <p className="text-sm opacity-90 mb-2">
          © {new Date().getFullYear()} RentHouse — Find comfort where you belong.
        </p>
        <p className="text-xs sm:text-sm opacity-80">
          <Link to="/about" className="underline hover:text-white/80 mx-1">
            About
          </Link>
          |
          <Link to="/contact" className="underline hover:text-white/80 mx-1">
            Contact
          </Link>
          |
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/80 mx-1"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
