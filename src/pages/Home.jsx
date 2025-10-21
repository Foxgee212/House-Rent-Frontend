import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHouses } from "../context/HouseContext";
import HouseCard from "../components/HouseCard";
import Spinner from "../components/Spinner";
import { Search, MapPin, Home } from "lucide-react";

export default function HomePage() {
  const { houses, fetchApprovedHouses, loading } = useHouses();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  // Fetch approved houses on mount
  useEffect(() => {
    fetchApprovedHouses();
  }, []);

  // Filter houses based on search input
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

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-500 py-24 text-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1560185127-6ed189bf02b9?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"></div>

        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold flex justify-center items-center gap-2 drop-shadow-lg">
            <Home size={44} className="text-white drop-shadow-md" />
            Find Your Dream Home
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-xl mx-auto leading-relaxed">
            Explore affordable and luxurious houses available for rent near you
          </p>

          {/* Search Bar */}
          <div className="mt-10 flex justify-center px-4">
            <div className="relative w-full max-w-md backdrop-blur-md bg-white/20 rounded-2xl shadow-lg border border-white/30">
              <Search
                className="absolute left-4 top-3 text-white/70"
                size={22}
              />
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
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
            Available Houses
          </h2>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 mt-10">
            No houses found for “{search || "all locations"}”
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((house) => (
              <Link key={house._id} to={`/listings/${house._id}`} className="transition-transform duration-300 hover:scale-[1.02]">
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
