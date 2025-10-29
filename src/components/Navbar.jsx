import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// ✅ Even Bigger Custom SVG Logo
const NaijahomeLogoSVG = ({ width = 200, height = 60 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 300 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="cursor-pointer transition-transform duration-300 hover:scale-105"
  >
    {/* House Icon */}
    <path d="M20 40 L40 20 L60 40 V70 H20 V40 Z" fill="url(#grad1)" />
    <path d="M40 70 V50 H50 V70 H40 Z" fill="#fff" />

    {/* Text */}
    <text x="70" y="55" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="36" fill="url(#grad1)">
      Naijahome
    </text>

    {/* Gradient */}
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="100%" y2="0">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
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
      isActive ? "text-blue-500 font-semibold border-b-2 border-blue-500 pb-1" : "text-gray-200"
    }`;

  const tabs = [
    { to: "/", label: "Home", icon: FaSearch },
    { to: "/listings", label: "Search", icon: FaSearch },
    ...(user?.role === "landlord" ? [{ to: "/dashboard", label: "Dashboard", icon: FaTachometerAlt }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin", icon: FaTachometerAlt }] : []),
    user ? { to: "/profile", label: "Profile", icon: FaUser } : { to: "/login", label: "Login", icon: FaSignInAlt },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-gray-900 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo clickable */}
          <div onClick={() => navigate("/")}>
            <NaijahomeLogoSVG />
          </div>

          <ul className="hidden md:flex items-center gap-8 text-white font-medium">
            <li>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/listings" className={navLinkClass}>
                Find House
              </NavLink>
            </li>

            {user && (
              <>
                {user.role === "landlord" && (
                  <li>
                    <NavLink to="/dashboard" className={navLinkClass}>
                      Dashboard
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

                <li className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-2 hover:text-blue-400 transition"
                  >
                    <img
                      src={
                        user?.profilePic ||
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0D8ABC&color=fff`
                      }
                      alt="profile"
                      className="w-10 h-10 rounded-full border border-gray-600 object-cover transition-transform duration-300 hover:scale-110"
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
                        <FaUser /> Profile
                      </Link>
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-700"
                      >
                        <FaSignOutAlt /> Logout
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

      {/* Mobile Bottom Tab Bar */}
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
                  className={`${isActive ? "text-blue-500" : "text-gray-400"} transition-colors`}
                />
              </motion.div>
              <span
                className={`text-xs mt-1 ${isActive ? "text-blue-500 font-medium" : "text-gray-400"}`}
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
            <FaSignOutAlt size={22} />
            <span className="text-xs mt-1">Logout</span>
          </button>
        )}
      </motion.div>
    </>
  );
}
