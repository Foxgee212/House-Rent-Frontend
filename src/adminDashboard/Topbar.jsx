import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  ChevronDown,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function Topbar({ activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [houseMenuOpen, setHouseMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const { user } = useAuth()

  // ✅ Detect screen resize for mobile centering
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
        setHouseMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    setHouseMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
      {/* 🔹 App Name */}
      <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">
        SkyRent Admin
      </h1>

      {/* 🔹 Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <img
                      src={
                        user?.profilePic ||
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0D8ABC&color=fff`
                      }
                      alt="profile"
                      className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 object-cover transition-transform duration-300 hover:scale-110"
                    />
          <span className="font-medium text-gray-700 hidden sm:inline">
            Admin
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-600 transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 🌟 Animated Main Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute ${
                isMobile ? "left-1/2 -translate-x-1/2" : "right-0"
              } mt-2 w-56 bg-white/95 backdrop-blur-md shadow-xl rounded-xl border border-gray-100 overflow-hidden z-50`}
            >
              {/* 🏠 Houses Option */}
              <div className="relative">
                <button
                  onClick={() => setHouseMenuOpen(!houseMenuOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 transition text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <Home size={16} /> Houses
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      houseMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* 🏡 Animated Submenu */}
                <AnimatePresence>
                  {houseMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="w-full bg-white border-t border-gray-100 shadow-inner overflow-hidden"
                    >
                      <button
                        onClick={() => handleTabChange("houses")}
                        className={`flex items-center gap-2 w-full px-5 py-2 text-left hover:bg-gray-100 transition ${
                          activeTab === "houses"
                            ? "text-indigo-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <Home size={15} /> All Houses
                      </button>
                      <button
                        onClick={() => handleTabChange("approved")}
                        className={`flex items-center gap-2 w-full px-5 py-2 text-left hover:bg-gray-100 transition ${
                          activeTab === "approved"
                            ? "text-indigo-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <CheckCircle size={15} /> Approved Houses
                      </button>
                      <button
                        onClick={() => handleTabChange("pending")}
                        className={`flex items-center gap-2 w-full px-5 py-2 text-left hover:bg-gray-100 transition ${
                          activeTab === "pending"
                            ? "text-indigo-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        <Clock size={15} /> Pending Houses
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 👥 Users Option */}
              <button
                onClick={() => handleTabChange("users")}
                className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 transition ${
                  activeTab === "users"
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <Users size={16} /> Users
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
