import { useState, useRef } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Upload,
  X,
  Camera,
  StopCircle,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";

export default function VerifyLandlord() {
  const [form, setForm] = useState({ idType: "", idNumber: "" });
  const [idImage, setIdImage] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  // ✅ Start camera
  const startCamera = async () => {
    try {
      stopCamera(); // make sure old stream stops
      const streamData = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = streamData;
        videoRef.current.play();
      }
      setStream(streamData);
      setCameraActive(true);
      toast.success("Camera started — center your face and click Capture 📸");
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Unable to access your camera. Please allow camera permission.");
    }
  };

  // ✅ Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // ✅ Capture selfie
  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfie(file);
        stopCamera();
        toast.success("✅ Selfie captured successfully!");
      },
      "image/jpeg",
      0.9
    );
  };

  // ✅ Submit verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idType || !form.idNumber || !idImage || !selfie) {
      toast.error("Please fill all fields and upload both images");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

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
      });
      toast.success(res.data?.msg || "✅ Verification submitted successfully!");
      setForm({ idType: "", idNumber: "" });
      setIdImage(null);
      setSelfie(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "❌ Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reusable image uploader
  const UploadCard = ({ label, image, setImage }) => (
    <div>
      <label className="block text-sm mb-1 text-gray-400">{label}</label>
      {image ? (
        <div className="relative mt-2 w-44 h-44">
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
        <label className="flex flex-col items-center justify-center gap-2 mt-2 w-44 h-44 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 transition">
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
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-lg text-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">
        Landlord Verification
      </h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Upload your valid government-issued ID and a clear selfie to verify your identity.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" encType="multipart/form-data">
        {/* ID Type */}
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

        {/* ID Number */}
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

        {/* Upload ID Image */}
        <UploadCard label="Upload ID Image" image={idImage} setImage={setIdImage} />

        {/* Selfie Section */}
        <div className="mt-6 text-center">
          <h3 className="text-blue-400 font-semibold mb-3">Take a Selfie</h3>

          {!cameraActive && !selfie && (
            <button
              type="button"
              onClick={startCamera}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md mx-auto hover:bg-green-700 transition"
            >
              <Camera size={18} /> Open Camera
            </button>
          )}

          {cameraActive && (
            <div className="flex flex-col items-center gap-3">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="rounded-lg border border-gray-700 w-[320px] h-[240px] bg-black"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={captureSelfie}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  <Camera size={18} /> Capture
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  <StopCircle size={18} /> Stop
                </button>
              </div>
            </div>
          )}

          {selfie && (
            <div className="mt-4 relative w-44 h-44 mx-auto">
              <img
                src={URL.createObjectURL(selfie)}
                alt="Selfie Preview"
                className="w-full h-full object-cover rounded-lg border border-gray-700"
              />
              <div className="absolute bottom-1 right-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => setSelfie(null)}
                  className="bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition"
                  title="Remove"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-black/70 text-white rounded-full p-1 hover:bg-blue-600 transition"
                  title="Retake"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>
            </div>
          )}

          {selfie && (
            <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-1">
              <CheckCircle size={14} /> Selfie ready
            </p>
          )}
        </div>

        {/* Submit */}
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
    </div>
  );
}
