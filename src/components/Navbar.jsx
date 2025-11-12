import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  UserPlus,
  House,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const NaijahomeLogoSVG = ({ width = 180, height = 55 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 300 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="cursor-pointer transition-transform duration-300 hover:scale-105"
  >
    <path d="M20 40 L40 20 L60 40 V70 H20 V40 Z" fill="url(#grad1)" />
    <path d="M40 70 V50 H50 V70 H40 Z" fill="#fff" />
    <text
      x="70"
      y="55"
      fontFamily="Poppins, sans-serif"
      fontWeight="700"
      fontSize="30"
      fill="url(#grad1)"
    >
      Naijahome
    </text>
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="100%" y2="0">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
  </svg>
);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBottomBar(currentScrollY <= lastScrollY.current || currentScrollY <= 60);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1 px-2 py-1 rounded transition-colors ${
      isActive
        ? "text-blue-500 font-semibold border-b-2 border-blue-500"
        : "text-gray-200 hover:text-blue-500 hover:bg-gray-800"
    }`;

  const isRentActive = location.pathname.startsWith("/rent");
  const isBuyActive = location.pathname === "/";

  // Mobile bottom bar icons
  const mobileTabs = user
    ? [
        { to: "/", label: "Home", icon: Home, action: () => navigate("/") },
        {
          to: isBuyActive ? "/" : "/rent",
          label: "Search",
          icon: Search,
          action: () => navigate(isBuyActive ? "/" : "/rent"),
        },
        ...(user.role === "landlord"
          ? [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, action: () => navigate("/dashboard") }]
          : user.role === "agent"
          ? [{ to: "/agent", label: "Agent Panel", icon: LayoutDashboard, action: () => navigate("/agent") }]
          : user.role === "admin"
          ? [{ to: "/admin", label: "Admin Panel", icon: LayoutDashboard, action: () => navigate("/admin") }]
          : []),
        { to: "/profile", label: "Profile", icon: User, action: () => navigate("/profile") },
        { to: "/logout", label: "Logout", icon: LogOut, action: onLogout, isLogout: true },
      ]
    : [
        { to: "/", label: "Home", icon: Home, action: () => navigate("/") },
        { to: "/rent", label: "Search", icon: Search, action: () => navigate("/rent") },
        { to: "/login", label: "Login", icon: LogIn, action: () => navigate("/login") },
        { to: "/signup", label: "Signup", icon: UserPlus, action: () => navigate("/signup") },
      ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-gray-900 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16 ">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer translate-x-[-8px] sm:translate-x-0"
          >
            <NaijahomeLogoSVG width={150} height={50} />
          </div>

          {/* Top Rent & Buy Buttons for Mobile */}
          <div className="flex md:hidden items-center justify-center gap-2 px-2 sm:px-4 mr-1 sm:mr-2 shrink-0">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                isBuyActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-500 text-blue-500 hover:bg-blue-500/10"
              }`}
            >
              <Building2 size={16} /> Buy
            </button>
            <button
              onClick={() => navigate("/rent")}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                isRentActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-500 text-blue-500 hover:bg-blue-500/10"
              }`}
            >
              <House size={16} /> Rent
            </button>
          </div>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-6 text-white font-medium">
            <li>
              <NavLink to="/" className={navLinkClass}>
                <Building2 size={16} /> <span className="hidden lg:inline">For Sale</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/rent" className={navLinkClass}>
                <House size={16} /> <span className="hidden lg:inline">For Rent</span>
              </NavLink>
            </li>

            {user && (
              <>
                {user.role === "landlord" && (
                  <li>
                    <NavLink to="/dashboard" className={navLinkClass}>
                      <LayoutDashboard size={16} /> <span className="hidden lg:inline">Dashboard</span>
                    </NavLink>
                  </li>
                )}
                {user.role === "agent" && (
                  <li>
                    <NavLink to="/agent" className={navLinkClass}>
                      <LayoutDashboard size={16} /> <span className="hidden lg:inline">Agent Panel</span>
                    </NavLink>
                  </li>
                )}
                {user.role === "tenant" && (
                  <li>
                    <NavLink to="/favorites" className={navLinkClass}>
                      <User size={16} /> <span className="hidden lg:inline">Saved Homes</span>
                    </NavLink>
                  </li>
                )}
                {user.role === "admin" && (
                  <li>
                    <NavLink to="/admin" className={navLinkClass}>
                      <LayoutDashboard size={16} /> <span className="hidden lg:inline">Admin Panel</span>
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
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-gray-200"
                      >
                        <User /> Profile
                      </Link>
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-700"
                      >
                        <LogOut /> Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            )}

            {!user && (
              <>
                <li>
                  <NavLink to="/login" className={navLinkClass}>
                    <LogIn size={16} /> <span className="hidden lg:inline">Login</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className={navLinkClass}>
                    <UserPlus size={16} /> <span className="hidden lg:inline">Signup</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: showBottomBar ? 0 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex justify-around items-center py-2 z-50 md:hidden"
      >
        {mobileTabs.map(({ label, icon: Icon, action, isLogout }) => {
          const isActive =
            label === "Dashboard" || label === "Agent Panel" || label === "Admin Panel"
              ? location.pathname.includes("dashboard") ||
                location.pathname.includes("agent") ||
                location.pathname.includes("admin")
              : location.pathname.startsWith("/" + label.toLowerCase());

          return (
            <button
              key={label}
              onClick={() => {
                triggerHaptic();
                action();
              }}
              className="flex flex-col items-center justify-center transition"
            >
              <motion.div
                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Icon
                  size={22}
                  className={`transition-colors ${
                    isLogout ? "text-red-500" : isActive ? "text-blue-500" : "text-gray-400"
                  }`}
                />
              </motion.div>
              <span
                className={`text-xs mt-1 ${
                  isLogout
                    ? "text-red-500 font-medium"
                    : isActive
                    ? "text-blue-500 font-medium"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </motion.div>
    </>
  );
}
