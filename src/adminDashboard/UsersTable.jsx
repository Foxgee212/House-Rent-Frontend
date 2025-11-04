import { useEffect, useState } from "react";
import { Trash2, AlertCircle, UserCircle, Search } from "lucide-react";
import API from "../api/axios";

export default function UsersTable({ onDataChange }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete user
  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      await fetchUsers();
      onDataChange?.();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  // ✅ Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const q = query.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q)
        )
      );
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Modern Loading Bar
  if (loading)
    return (
      <div className="relative h-40 flex items-center justify-center bg-gray-900">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 overflow-hidden">
          <div className="h-full w-1/2 bg-blue-500 animate-slide" />
        </div>
        <p className="text-blue-400 text-sm font-medium">Loading users...</p>

        <style>
          {`
            @keyframes slide {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(50%); }
              100% { transform: translateX(100%); }
            }
            .animate-slide {
              animation: slide 1.2s ease-in-out infinite;
              box-shadow: 0 0 10px rgba(59,130,246,0.8);
            }
          `}
        </style>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-40 text-red-400">
        <AlertCircle size={24} className="mb-2" />
        <p>{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          👥 User Management
        </h2>

        {/* 🔍 Search Input */}
        <div className="relative w-full sm:w-72 mt-3 sm:mt-0">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No users found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filtered.map((u) => {
            // Define badge colors and icons based on verification status
            const getStatusBadge = (status) => {
              switch (status) {
                case "verified":
                  return (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-full bg-blue-600/20 text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  );

                case "pending":
                  return (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v5.25a.75.75 0 001.5 0V6zm-.75 8.25a.75.75 0 100 1.5.75.75 0 000-1.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Pending
                    </span>
                  );

                case "rejected":
                  return (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-full bg-red-600/20 text-red-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.414-9.414a1 1 0 011.414 0L10 9.586l1.414-1.414a1 1 0 011.414 1.414L11.414 11l1.414 1.414a1 1 0 01-1.414 1.414L10 12.414l-1.414 1.414a1 1 0 01-1.414-1.414L8.586 11 7.172 9.586a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Rejected
                    </span>
                  );

                default:
                  return (
                    <span className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium rounded-full bg-gray-600/20 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 5h2v6H9V5zm0 8h2v2H9v-2z" />
                      </svg>
                      Unverified
                    </span>
                  );
              }
            };

            return (
              <div
                key={u._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg hover:border-blue-600 transition-all flex flex-col items-center text-center"
              >
                {u.profilePic ? (
                  <img
                    src={u.profilePic}
                    alt={u.name || "User"}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mb-3 border border-gray-600"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center mb-3">
                    <UserCircle className="text-gray-400" size={42} />
                  </div>
                )}

                {/* User Name */}
                <h3 className="font-semibold text-gray-100 truncate w-full">
                  {u.name || "Unnamed User"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate w-full">
                  {u.email}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate w-full">
                  📞 {u.phone || "No phone"}
                </p>

                {/* Verification Badge */}
                <div className="mt-2">{getStatusBadge(u.verification.status)}</div>

                {/* Role */}
                <span className="mt-2 inline-block px-3 py-1 text-[11px] sm:text-xs font-medium bg-blue-600/20 text-blue-400 rounded-full capitalize">
                  {u.role}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => deleteUser(u._id)}
                  className="mt-4 text-red-400 hover:text-red-500 flex items-center gap-1 transition text-sm"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
