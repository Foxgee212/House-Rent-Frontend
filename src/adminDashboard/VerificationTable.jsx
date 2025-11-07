import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  RefreshCw,
} from "lucide-react";

export default function VerificationTable() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;
  const navigate = useNavigate();

  // Fetch verifications
  const fetchVerifications = async (showToast = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/verifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerifications(res.data || []);
      if (showToast) toast.success("Data refreshed");
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.msg || "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
    const interval = setInterval(() => fetchVerifications(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Admin actions
  const handleAction = async (id, action) => {
    const confirmMsg =
      action === "approve"
        ? "Approve this verification?"
        : "Reject this verification?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/admin/verifications/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.msg || "Action successful");
      fetchVerifications();
    } catch (err) {
      console.error("Action error:", err);
      toast.error(err.response?.data?.msg || "Action failed");
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "ID Type", "Score", "Status"];
    const rows = verifications.map((v) => [
      v.name || "N/A",
      v.email || "N/A",
      v.role || "N/A",
      v.verification?.idData?.idType || "N/A",
      v.verification?.score || 0,
      v.verification?.status || "unknown",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "verifications.csv";
    link.click();
  };

  // Filter + Search + Pagination
  const filtered = useMemo(() => {
    return verifications.filter((v) => {
      const matchesFilter =
        filter === "all" ? true : v?.verification?.status === filter;
      const matchesSearch =
        v?.name?.toLowerCase().includes(search.toLowerCase()) ||
        v?.email?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [verifications, filter, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / perPage);

  // UI
  return (
    <div className="bg-gray-900 rounded-2xl p-5 shadow-xl text-gray-300 border border-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-3">
        <h2 className="text-xl font-semibold text-blue-400 tracking-wide">
          Verifications
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-gray-200 pl-8 pr-3 py-1.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 text-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => fetchVerifications(true)}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1 text-sm transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md flex items-center gap-1 transition"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-800/40 animate-pulse rounded-md"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">ID Type</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-2">{v.name || "N/A"}</td>
                    <td className="px-4 py-2">{v.email || "N/A"}</td>
                    <td className="px-4 py-2">
                      {v.role || "N/A"}
                      {v.role === "agent" && (
                        <span className="ml-2 px-1.5 py-0.5 bg-purple-600 text-xs rounded text-white">
                          Agent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {v.verification?.idData?.idType || "N/A"}
                    </td>
                    <td className="px-4 py-2">{v.verification?.score || 0}%</td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        v.verification?.status === "verified"
                          ? "text-green-400"
                          : v.verification?.status === "pending"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {v.verification?.status || "unknown"}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/verification/${v._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-md transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleAction(v._id, "approve")}
                        className="bg-green-600 hover:bg-green-700 px-2.5 py-1.5 rounded-md transition"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleAction(v._id, "reject")}
                        className="bg-red-600 hover:bg-red-700 px-2.5 py-1.5 rounded-md transition"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-4">
                No verifications found
              </p>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-5 text-sm text-gray-400">
            <p>
              Page {page} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md bg-gray-800 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-md bg-gray-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
