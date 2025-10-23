import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  LogIn,
  UserPlus,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  const toggleProfile = () => setProfileOpen(!profileOpen);

  const onLogout = () => {
    logout();
    setProfileOpen(false);
    closeMenu();
    navigate("/login");
  };

  // ✅ Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1 hover:text-blue-500 transition ${
      isActive
        ? "text-blue-500 font-semibold border-b-2 border-blue-500 pb-1"
        : "text-gray-200"
    }`;

  // ✅ Haptic feedback
  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const mobileTabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/listings", label: "Find", icon: Search },
    user?.role === "landlord" && {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    user?.role === "admin" && {
      to: "/admin",
      label: "Admin",
      icon: LayoutDashboard,
    },
    { to: user ? "/profile" : "/login", label: user ? "Profile" : "Login", icon: User },
  ].filter(Boolean);

  return (
    <>
      {/* 💻 Desktop Navbar */}
      <nav className="hidden md:block bg-gray-900 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-blue-400 hover:scale-105 transition-transform"
          >
            🏠 RentHouse
          </Link>

          <ul className="flex items-center gap-8 text-white font-medium">
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

                <li className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-2 hover:text-blue-400 transition"
                    aria-label="Profile menu"
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

      {/* 📱 Floating Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="backdrop-blur-xl bg-gray-900/70 border border-gray-700/60 shadow-2xl rounded-3xl flex justify-around items-center py-2">
          {mobileTabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={triggerHaptic}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-xs transition ${
                  isActive
                    ? "text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-blue-300"
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    color: isActive ? "#60A5FA" : "#9CA3AF",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.8 : 2} />
                </motion.div>
              )}
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
