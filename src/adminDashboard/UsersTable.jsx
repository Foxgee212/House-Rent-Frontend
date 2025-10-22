import { useEffect, useState } from "react";
import { Trash2, Loader2, AlertCircle, UserCircle } from "lucide-react";
import API from "../api/axios";

export default function UsersTable({ onDataChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch users. Please check admin privileges."
      );
    } finally {
      setLoading(false);
    }
  };
  console.log(users)

  // ✅ Delete user
  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      await fetchUsers();
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Loading state
  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-indigo-600" size={28} />
      </div>
    );

  // ✅ Error state
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-40 text-red-600">
        <AlertCircle size={24} className="mb-2" />
        <p>{error}</p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-6">👥 User Management</h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((u) => (
            <div
              key={u._id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              {/* Profile Image */}
              {u.profilePic ? (
                <img
                  src={u.profilePic}
                  alt={u.name || "User"}
                  className="w-20 h-20 rounded-full object-cover mb-3 border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <UserCircle className="text-gray-400" size={50} />
                </div>
              )}

              {/* User Info */}
              <h3 className="font-semibold text-gray-800">
                {u.name || "Unnamed User"}
              </h3>
              <p className="text-sm text-gray-500">{u.email}</p>
              <p className="text-sm text-gray-600 mt-1">
                📞 {u.phone || "No phone"}
              </p>

              <span className="mt-2 inline-block px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full capitalize">
                {u.role}
              </span>

              {/* Actions */}
              <button
                onClick={() => deleteUser(u._id)}
                className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
