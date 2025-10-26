import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export default function VerificationTable() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/verifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerifications(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/admin/verifications/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.msg);
      fetchVerifications();
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  const filtered = verifications.filter((v) =>
    filter === "all" ? true : v.verification.status === filter
  );

  if (loading)
    return (
      <p className="text-center text-gray-400 animate-pulse">Loading verifications...</p>
    );

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-400">Landlord Verifications</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-gray-200 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th className="px-4 py-2">Landlord</th>
              <th className="px-4 py-2">ID Type</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="px-4 py-2">{v.name || v.email}</td>
                <td className="px-4 py-2">{v.verification?.idData?.idType || "N/A"}</td>
                <td className="px-4 py-2">{v.verification?.score || "0"}%</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    v.verification.status === "verified"
                      ? "text-green-400"
                      : v.verification.status === "pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {v.verification.status}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => toast(`Viewing details for ${v.name}`)}
                    className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleAction(v._id, "approve")}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleAction(v._id, "reject")}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md"
                  >
                    <XCircle size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-4">No verifications found</p>
        )}
      </div>
    </div>
  );
}
