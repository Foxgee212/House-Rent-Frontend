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

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition ${
      isActive ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1" : "text-gray-700 dark:text-gray-200"
    }`;

  return (
    <nav className="bg-white/90 dark:bg-gray-900 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-blue-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform"
        >
          🏠 RentHouse
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-gray-700 dark:text-gray-200 font-medium">
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

              {/* Profile Dropdown */}
              <li className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  aria-label="Profile menu"
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

                  <span className="font-medium hidden lg:block">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fade-in">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={18} /> Profile
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
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

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 dark:text-gray-200"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 animate-slide-down">
          <ul className="flex flex-col gap-4 text-gray-700 dark:text-gray-200">
            <li>
              <NavLink
                to="/"
                onClick={closeMenu}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Home size={18} /> Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/listings"
                onClick={closeMenu}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Search size={18} /> Find House
              </NavLink>
            </li>

            {user ? (
              <>
                {user.role === "landlord" && (
                  <li>
                    <NavLink
                      to="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-2 hover:text-blue-600"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </NavLink>
                  </li>
                )}
                <li>
                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <User size={18} /> {user.name?.split(" ")[0] || "Profile"}
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <LogIn size={18} /> Login
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/signup"
                    onClick={closeMenu}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <UserPlus size={18} /> Signup
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
