import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";

export default function VerifyLandlord() {
  const [form, setForm] = useState({ idType: "", idNumber: "" });
  const [idImage, setIdImage] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [faceDistance, setFaceDistance] = useState(null);
  const [reviewerNote, setReviewerNote] = useState("");

  // ✅ Submit verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idType || !form.idNumber || !idImage || !selfie)
      return toast.error("Please fill all fields and upload both images");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in first.");

    const formData = new FormData();
    formData.append("idType", form.idType);
    formData.append("idNumber", form.idNumber);
    formData.append("idImage", idImage);
    formData.append("selfie", selfie);

    try {
      setLoading(true);
      const res = await API.post("/verification/auto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000,
      });

      toast.success(res.data?.msg || "⚠️ Verification submitted, pending outcome!");
      setForm({ idType: "", idNumber: "" });
      setIdImage(null);
      setSelfie(null);

      // Start polling for verification status
      const userId = res.data.verificationId;
      pollVerification(userId);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "❌ Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Poll backend for verification status
  const pollVerification = (userId) => {
    setVerificationStatus("pending");
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/verification/${userId}/status`);
        const verification = res.data.verification;
        setVerificationStatus(verification.status);
        setMatchScore(verification.score);
        setFaceDistance(verification.faceMatchDistance);
        setReviewerNote(verification.reviewerNote);

        if (verification.status !== "pending") clearInterval(interval);
      } catch (err) {
        console.error("Error polling verification status:", err);
      }
    }, 3000);
  };

  // ✅ Upload card component
  const UploadCard = ({ label, image, setImage, instructions }) => (
    <div className="mb-4">
      <label className="block text-sm mb-1 text-gray-400 font-medium">{label}</label>
      {instructions && (
        <p className="text-xs text-gray-500 mb-1">{instructions}</p>
      )}
      {image ? (
        <div className="relative mt-1 w-60 h-40">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-full h-full object-contain rounded-md border border-gray-700 bg-black"
          />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 mt-1 w-60 h-40 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 transition">
          <Upload size={24} className="text-blue-400" />
          <span className="text-gray-300 text-sm text-center">Click to upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}
      {image && (
        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
          <CheckCircle size={12} /> Image ready
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-2xl shadow-lg text-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">
        Landlord Verification
      </h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Please upload your valid government-issued ID and a clear selfie.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1 text-gray-400">ID Type</label>
          <select
            value={form.idType}
            onChange={(e) => setForm({ ...form, idType: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select ID Type</option>
            <option value="National ID">National ID</option>
            <option value="Driver's License">Driver's License</option>
            <option value="Passport">Passport</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-400">ID Number</label>
          <input
            type="text"
            placeholder="Enter your ID Number"
            value={form.idNumber}
            onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <UploadCard
          label="Upload ID Image"
          image={idImage}
          setImage={setIdImage}
          instructions="Ensure all details are clearly visible."
        />

        <UploadCard
          label="Upload Selfie"
          image={selfie}
          setImage={setSelfie}
          instructions="Face should be well-lit and clearly visible."
        />

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold transition hover:bg-blue-700 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Submitting...
            </>
          ) : (
            "Submit Verification"
          )}
        </button>
      </form>

      {/* ✅ Verification Status */}
      {verificationStatus && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center">
          <h3 className="font-semibold text-lg mb-2">Verification Status</h3>
          <p className="text-sm">
            {verificationStatus === "pending"
              ? "⏳ Pending"
              : verificationStatus === "verified"
              ? "✅ Verified"
              : "❌ Rejected"}
          </p>
          {matchScore !== null && <p>Match Score: {matchScore}%</p>}
          {faceDistance !== null && <p>Face Distance: {faceDistance.toFixed(4)}</p>}
          {reviewerNote && <p className="text-gray-400 text-sm mt-1">{reviewerNote}</p>}
        </div>
      )}
    </div>
  );
}
