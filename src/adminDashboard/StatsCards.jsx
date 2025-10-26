import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import { Home, CheckCircle, Clock, Users, ShieldCheck } from "lucide-react";

export default function StatsCards({ setActiveTab, activeTab }) {
  const [stats, setStats] = useState({
    totalHouses: 0,
    approvedHouses: 0,
    pendingHouses: 0,
    totalUsers: 0,
    totalVerifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // ✅ Fetch stats (auto refresh)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Hide on scroll down, show on scroll up (optimized)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          if (diff > 25 && currentScrollY > 100) setHidden(true);
          else if (diff < -25) setHidden(false);

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Updated cards list (added Verifications)
  const cards = [
    {
      label: "Total Houses",
      value: stats.totalHouses,
      icon: <Home className="text-indigo-500" size={22} />,
      tab: "houses",
    },
    {
      label: "Approved",
      value: stats.approvedHouses,
      icon: <CheckCircle className="text-green-500" size={22} />,
      tab: "approved",
    },
    {
      label: "Pending",
      value: stats.pendingHouses,
      icon: <Clock className="text-yellow-500" size={22} />,
      tab: "pending",
    },
    {
      label: "Users",
      value: stats.totalUsers,
      icon: <Users className="text-blue-500" size={22} />,
      tab: "users",
    },
    {
      label: "Verifications",
      value: stats.totalVerifications,
      icon: <ShieldCheck className="text-purple-500" size={22} />,
      tab: "verifications",
    },
  ];

  return (
    <motion.div
      animate={{
        y: hidden ? -90 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 26,
      }}
      className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-700 px-3 py-3 sm:px-5 sm:py-4 shadow-md"
    >
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 ${
          loading ? "animate-pulse" : ""
        }`}
      >
        {cards.map((c) => {
          const isActive = activeTab === c.tab;
          return (
            <motion.div
              key={c.label}
              onClick={() => setActiveTab(c.tab)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`cursor-pointer p-4 rounded-2xl border flex flex-col items-start sm:items-center sm:text-center transition-all shadow-sm
                ${
                  isActive
                    ? "bg-gray-800 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:shadow-md"
                }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {c.icon}
                <h3
                  className={`text-sm font-medium ${
                    isActive ? "text-indigo-400" : "text-gray-200"
                  }`}
                >
                  {c.label}
                </h3>
              </div>
              <p
                className={`text-2xl font-bold ${
                  isActive ? "text-indigo-400" : "text-indigo-500"
                }`}
              >
                {c.value ?? 0}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
