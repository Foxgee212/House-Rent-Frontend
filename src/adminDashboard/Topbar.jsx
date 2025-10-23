import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, CheckCircle, Clock, Users } from "lucide-react";

export default function Topbar({ activeTab, setActiveTab }) {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 🧠 Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        setShowNav(false); // hide
      } else if (currentY < lastScrollY - 5) {
        setShowNav(true); // show
      }
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { id: "houses", label: "All Houses", icon: Home },
    { id: "approved", label: "Approved", icon: CheckCircle },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <motion.header
      animate={{ y: showNav ? 0 : -100 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="fixed top-0 left-0 w-full z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-500 tracking-tight">
          SkyRent Admin
        </h1>
      </div>

      {/* 🔹 Navigation Buttons */}
      <nav className="flex flex-wrap justify-center sm:justify-start gap-3 px-4 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-white" : "text-gray-300"}
              />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </motion.header>
  );
}
