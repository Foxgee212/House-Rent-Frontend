import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../api/axios";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function VerificationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ==========================================================
     🚀 Fetch Verification Details
  ========================================================== */
  const fetchUserVerification = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/admin/verifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ Error fetching verification:", err);
      toast.error("Failed to load verification details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVerification();
  }, [id]);

  /* ==========================================================
     ✅ Handle Approve / Reject
  ========================================================== */
  const handleAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this verification?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");

      // Use PATCH to match backend routes
      const res = await API.patch(
        `/admin/verifications/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.msg || `Verification ${action}d successfully`);
      navigate("/admin"); // ✅ back to dashboard
    } catch (err) {
      console.error("❌ Action error:", err);
      toast.error(err.response?.data?.msg || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ==========================================================
     🧱 UI Rendering
  ========================================================== */
  if (loading)
    return (
      <div className="text-center text-gray-400 py-10 animate-pulse">
        Loading verification details...
      </div>
    );

  if (!user)
    return (
      <div className="text-center text-gray-400 py-10">
        No verification details found.
      </div>
    );

  const v = user.verification || {};
  const idData = v.idData || {};

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg mt-10 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-500 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-xl font-semibold text-blue-400">
          Verification Details
        </h2>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p><span className="text-gray-400">Name:</span> {user.name || "N/A"}</p>
          <p><span className="text-gray-400">Email:</span> {user.email || "N/A"}</p>
          <p><span className="text-gray-400">Phone:</span> {user.phone || "N/A"}</p>
        </div>
        <div>
          <p><span className="text-gray-400">ID Type:</span> {idData.idType || "N/A"}</p>
          <p><span className="text-gray-400">Score:</span> {v.score || "0"}%</p>
          <p>
            <span className="text-gray-400">Status:</span>{" "}
            <span
              className={`font-semibold ${
                v.status === "verified"
                  ? "text-green-400"
                  : v.status === "pending"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {v.status}
            </span>
          </p>
        </div>
      </div>

      {/* Uploaded Images */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-2">
          Uploaded Documents
        </h3>
        {v.idImageUrl && v.selfieUrl  ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
                <img
                  src={v.idImageUrl}
                  alt={idData.idNumber}
                  className="rounded-lg border border-gray-700 w-full h-40 object-cover cursor-pointer group-hover:opacity-80 transition"
                  onClick={() => window.open(v.idImageUrl, "_blank")}
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-xs px-2 py-0.5 rounded">
                  View
                </span>

                <img
                  src={v.selfieUrl}
                  alt={idData.idNumber}
                  className="rounded-lg border border-gray-700 w-full h-40 object-cover cursor-pointer group-hover:opacity-80 transition"
                  onClick={() => window.open(v.selfieUrl, "_blank")}
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-xs px-2 py-0.5 rounded">
                  View
                </span>
              
            
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No ID images uploaded.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          disabled={actionLoading}
          onClick={() => handleAction("approve")}
          className={`px-4 py-2 rounded-md flex items-center gap-1 ${
            actionLoading
              ? "bg-green-800 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          Approve
        </button>
        <button
          disabled={actionLoading}
          onClick={() => handleAction("reject")}
          className={`px-4 py-2 rounded-md flex items-center gap-1 ${
            actionLoading
              ? "bg-red-800 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
          Reject
        </button>
      </div>
    </div>
  );
}
