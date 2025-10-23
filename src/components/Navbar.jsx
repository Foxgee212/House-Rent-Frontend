import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  LogIn,
  UserPlus,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const lastScrollY = useRef(0);
  const profileRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const toggleProfile = () => setProfileOpen(!profileOpen);

  const onLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  // 🧠 Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 💨 Detect scroll direction to show/hide bottom bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowBottomBar(false); // hide on scroll down
      } else {
        setShowBottomBar(true); // show on scroll up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🎯 Haptic feedback
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition ${
      isActive
        ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
        : "text-gray-200 dark:text-gray-200"
    }`;

  // 📱 Tabs for mobile bottom nav
  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/listings", label: "Search", icon: Search },
    ...(user?.role === "landlord"
      ? [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Admin", icon: LayoutDashboard }]
      : []),
    user
      ? { to: "/profile", label: "Profile", icon: User }
      : { to: "/login", label: "Login", icon: LogIn },
  ];

  return (
    <>
      {/* 🧭 Desktop Navbar */}
      <nav className="bg-gray-900 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-blue-400 hover:scale-105 transition-transform"
          >
            🏠 RentHouse
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 text-white font-medium">
            <li>
              <NavLink to="/" className={navLinkClass}>
                <Home size={18} /> Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/listings" className={navLinkClass}>
                <Search size={18} /> Find House
              </NavLink>
            </li>

            {user ? (
              <>
                {user.role === "landlord" && (
                  <li>
                    <NavLink to="/dashboard" className={navLinkClass}>
                      <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                  </li>
                )}
                {user.role === "admin" && (
                  <li>
                    <NavLink to="/admin" className={navLinkClass}>
                      <LayoutDashboard size={18} /> Admin Panel
                    </NavLink>
                  </li>
                )}

                {/* Profile dropdown */}
                <li className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-2 hover:text-blue-400 transition"
                  >
                    <img
                      src={
                        user?.profilePic ||
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name || "User"
                        )}&background=0D8ABC&color=fff`
                      }
                      alt="profile"
                      className="w-9 h-9 rounded-full border border-gray-600 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <span className="font-medium hidden lg:block">
                      {user.name?.split(" ")[0] || "User"}
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 animate-fade-in">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-gray-200"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User size={18} /> Profile
                      </Link>
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-700"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={navLinkClass}>
                    <LogIn size={18} /> Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className={navLinkClass}>
                    <UserPlus size={18} /> Signup
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* 📱 Animated Bottom Tab Bar (Mobile only) */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: showBottomBar ? 0 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex justify-around items-center py-2 z-50 md:hidden"
      >
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <button
              key={to}
              onClick={() => {
                triggerHaptic();
                navigate(to);
              }}
              className="flex flex-col items-center justify-center text-gray-400 hover:text-blue-400 transition"
            >
              <motion.div
                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`${
                    isActive ? "text-blue-500" : "text-gray-400"
                  } transition-colors`}
                />
              </motion.div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? "text-blue-500 font-medium" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}

        {user && (
          <button
            onClick={() => {
              triggerHaptic();
              onLogout();
            }}
            className="flex flex-col items-center justify-center text-red-500"
          >
            <LogOut size={22} />
            <span className="text-xs mt-1">Logout</span>
          </button>
        )}
      </motion.div>
    </>
  );
}
