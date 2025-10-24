import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";
import HouseCard from "../components/HouseCard";
import LoadingBar from "react-top-loading-bar";
import { Search, MapPin, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { houses, fetchApprovedHouses, loading } = useHouses();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const loadingBarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      loadingBarRef.current?.continuousStart();
      await fetchApprovedHouses();
      loadingBarRef.current?.complete();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(houses)) return;
    if (!search.trim()) {
      setFiltered(houses);
      return;
    }
    const filteredHouses = houses.filter((house) =>
      house.location?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredHouses);
  }, [search, houses]);

  // 🌈 Neon Home Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
        <LoadingBar color="#3b82f6" height={3} ref={loadingBarRef} />

        <div className="relative flex items-center justify-center">
          {/* Animated gradient ring */}
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

          {/* Glowing blur */}
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-blue-500 blur-2xl opacity-40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Central icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.7)]"
          >
            <Home size={60} />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400 mt-6 text-sm tracking-widest uppercase"
        >
          Loading houses...
        </motion.p>
      </div>
    );
  }

  // ✅ Main Page
  return (
    <div className="min-h-screen bg-gray-900 transition-colors duration-300">
      <LoadingBar color="#3b82f6" height={3} ref={loadingBarRef} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-500 py-24 text-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1560185127-6ed189bf02b9?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"></div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {/* Home Icon + Title perfectly aligned */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Home size={56} className="text-white drop-shadow-2xl" />
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-cyan-200 leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Find Your Dream Home
            </motion.h1>
          </div>

          <p className="text-blue-100 text-lg max-w-xl mx-auto leading-relaxed px-4">
            Explore affordable and luxurious houses available for rent near you
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex justify-center px-4">
            <div className="relative w-full max-w-md backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/30">
              <Search className="absolute left-4 top-3 text-white/70" size={22} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by location..."
                className="w-full py-3 pl-12 pr-4 rounded-2xl bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Houses Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center mb-10">
          <MapPin size={24} className="text-blue-600 mr-2" />
          <h2 className="text-3xl font-semibold text-gray-200">
            Available Houses
          </h2>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            No houses found for “{search || "all locations"}”
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((house) => (
              <Link
                key={house._id}
                to={`/listings/${house._id}`}
                className="transition-transform duration-300 hover:scale-[1.02]"
              >
                <HouseCard house={house} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-6 mt-10">
        <p className="text-sm opacity-90">
          © {new Date().getFullYear()} RentHouse — Find comfort where you belong.
        </p>
      </footer>
    </div>
  );
}
