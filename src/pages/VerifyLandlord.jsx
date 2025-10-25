import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-hot-toast";
import { Loader2, Upload, X, Camera } from "lucide-react";
import * as faceapi from "face-api.js";

export default function VerifyLandlord() {
  const [form, setForm] = useState({ idType: "", idNumber: "" });
  const [idImage, setIdImage] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ✅ Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
    };
    loadModels();
  }, []);

  // ✅ Start camera
  const startCamera = async () => {
    try {
      setDetecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      toast.error("Camera access denied or unavailable.");
      setDetecting(false);
    }
  };

  // ✅ Perform liveness detection
  const runLivenessCheck = async () => {
    const video = videoRef.current;
    if (!video) return;

    let blinkDetected = false;
    let headTurnDetected = false;

    const interval = setInterval(async () => {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections) {
        const canvas = canvasRef.current;
        const dims = faceapi.matchDimensions(canvas, video, true);
        const resized = faceapi.resizeResults(detections, dims);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);

        // Estimate blink: low eye height ratio
        const leftEye = detections.landmarks.getLeftEye();
        const rightEye = detections.landmarks.getRightEye();
        const eyeHeight =
          (Math.abs(leftEye[1].y - leftEye[5].y) +
            Math.abs(rightEye[1].y - rightEye[5].y)) /
          2;
        if (eyeHeight < 3 && !blinkDetected) {
          blinkDetected = true;
          toast.success("✅ Blink detected!");
        }

        // Estimate head turn using horizontal movement
        const nose = detections.landmarks.getNose()[3];
        if (nose.x < 100 && !headTurnDetected) {
          headTurnDetected = true;
          toast.success("✅ Head turn detected!");
        }

        // When both detected, capture selfie
        if (blinkDetected && headTurnDetected) {
          clearInterval(interval);
          captureSelfie(video);
          setLivenessPassed(true);
          setDetecting(false);
          toast.success("🎉 Liveness confirmed!");
        }
      }
    }, 300);
  };

  // ✅ Capture selfie frame
  const captureSelfie = (video) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => setSelfie(new File([blob], "selfie.jpg", { type: "image/jpeg" })), "image/jpeg");
  };

  // ✅ Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idType || !form.idNumber || !idImage || !selfie) {
      toast.error("Please fill all fields and complete liveness check");
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data?.msg || "✅ Verification submitted successfully!");
      setForm({ idType: "", idNumber: "" });
      setIdImage(null);
      setSelfie(null);
      setLivenessPassed(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "❌ Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const UploadCard = ({ label, image, setImage }) => (
    <div>
      <label className="block text-sm mb-1 text-gray-400">{label}</label>
      {image ? (
        <div className="relative mt-2 w-32 h-32">
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="w-full h-full object-cover rounded-md border border-gray-700"
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
        <label className="flex flex-col items-center justify-center gap-2 mt-2 w-32 h-32 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 transition">
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
        Upload your government-issued ID and complete a short liveness check.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" encType="multipart/form-data">
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

        {/* Upload ID Image */}
        <UploadCard label="Upload ID Image" image={idImage} setImage={setIdImage} />

        {/* Liveness Section */}
        <div className="mt-6 text-center">
          <h3 className="text-blue-400 font-semibold mb-2">
            Live Face Verification
          </h3>
          {!detecting && !livenessPassed && (
            <button
              type="button"
              onClick={() => {
                startCamera();
                runLivenessCheck();
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md mx-auto hover:bg-green-700 transition"
            >
              <Camera size={18} /> Start Liveness Check
            </button>
          )}

          <div className="relative flex justify-center mt-3">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width="320"
              height="240"
              className="rounded-lg border border-gray-700"
            />
            <canvas
              ref={canvasRef}
              width="320"
              height="240"
              className="absolute top-0 left-0"
            />
          </div>

          {livenessPassed && (
            <p className="text-green-400 text-sm mt-2">✅ Liveness confirmed</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold transition hover:bg-blue-700 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Submitting...
            </>
          ) : (
            "Submit Verification"
          )}
        </button>
      </form>
    </div>
  );
}
