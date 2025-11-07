import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  User,
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  PlusCircle,
  House,
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
    `flex items-center gap-1 hover:text-blue-500 transition ${
      isActive
        ? "text-blue-500 font-semibold border-b-2 border-blue-500 pb-1"
        : "text-gray-200"
    }`;

  // Base tabs for mobile
  const baseTabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/listings", label: "Rent", icon: House },
    { to: "/buy", label: "Buy", icon: Building2 },
  ];

  if (user?.role === "landlord") {
    baseTabs.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
  }
  if (user?.role === "agent") {
    baseTabs.push({ to: "/agent", label: "Agent", icon: LayoutDashboard });
  }
  if (user?.role === "admin") {
    baseTabs.push({ to: "/admin", label: "Admin", icon: LayoutDashboard });
  }

  baseTabs.push(
    user
      ? { to: "/profile", label: "Profile", icon: User }
      : { to: "/login", label: "Login", icon: LogIn }
  );

  const isRentActive = location.pathname.startsWith("/listings");
  const isBuyActive = location.pathname.startsWith("/buy");

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-gray-900 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          {/* Logo */}
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <NaijahomeLogoSVG />
          </div>

          {/* RENT & BUY Buttons on Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => navigate("/listings")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                isRentActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-500 text-blue-500 hover:bg-blue-500/10"
              }`}
            >
              <House size={16} /> Rent
            </button>
            <button
              onClick={() => navigate("/buy")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300 ${
                isBuyActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-500 text-blue-500 hover:bg-blue-500/10"
              }`}
            >
              <Building2 size={16} /> Buy
            </button>
          </div>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 text-white font-medium">
            <li>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/listings" className={navLinkClass}>
                For Rent
              </NavLink>
            </li>
            <li>
              <NavLink to="/buy" className={navLinkClass}>
                For Sale
              </NavLink>
            </li>

            {/* Role-Specific */}
            {user && (
              <>
                {user.role === "landlord" && (
                  <>
                    <li>
                      <NavLink to="/add-rent" className={navLinkClass}>
                        <PlusCircle size={18} /> List Rental
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                      </NavLink>
                    </li>
                  </>
                )}
                {user.role === "agent" && (
                  <>
                    <li>
                      <NavLink to="/add-sale" className={navLinkClass}>
                        <PlusCircle size={18} /> List Property
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/agent" className={navLinkClass}>
                        Agent Panel
                      </NavLink>
                    </li>
                  </>
                )}
                {user.role === "tenant" && (
                  <li>
                    <NavLink to="/favorites" className={navLinkClass}>
                      Saved Homes
                    </NavLink>
                  </li>
                )}
                {user.role === "admin" && (
                  <li>
                    <NavLink to="/admin" className={navLinkClass}>
                      Admin Panel
                    </NavLink>
                  </li>
                )}

                {/* Profile */}
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
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/signup" className={navLinkClass}>
                    Signup
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
        {baseTabs.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
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
                  className={`${isActive ? "text-blue-500" : "text-gray-400"} transition-colors`}
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
      </motion.div>
    </>
  );
}

/* Tailwind animation helper */
