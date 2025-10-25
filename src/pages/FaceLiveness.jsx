import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Eye, ArrowLeftRight, CheckCircle2 } from "lucide-react";

export default function FaceLiveness() {
  const videoRef = useRef(null);
  const blinkState = useRef({ closedFrames: 0, blinked: false });
  const headHistory = useRef([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState("Loading models...");
  const [blinked, setBlinked] = useState(false);
  const [turnedLeft, setTurnedLeft] = useState(false);
  const [turnedRight, setTurnedRight] = useState(false);
  const [verified, setVerified] = useState(false);

  // ✅ Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus("✅ Models loaded. Center your face in the oval frame.");
      } catch (error) {
        console.error("Model load error:", error);
        setStatus("❌ Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  // ✅ Start camera
  useEffect(() => {
    if (!modelsLoaded) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setStatus("❌ Camera access denied."));
  }, [modelsLoaded]);

  // ✅ Detect blinking & head turn
  useEffect(() => {
    if (!modelsLoaded) return;

    const detectLiveness = async () => {
      const video = videoRef.current;
      if (!video) return;

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        setStatus("No face detected ❌");
        return;
      }

      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // 👁️ EAR (Eye Aspect Ratio)
      const getEAR = (eye) => {
        const [p1, p2, p3, p4, p5, p6] = eye;
        const v1 = Math.hypot(p2.y - p6.y, p2.x - p6.x);
        const v2 = Math.hypot(p3.y - p5.y, p3.x - p5.x);
        const h = Math.hypot(p1.x - p4.x, p1.y - p4.y);
        return (v1 + v2) / (2.0 * h);
      };

      const ear = (getEAR(leftEye) + getEAR(rightEye)) / 2.0;

      // 👁️ Blink detection with stable logic
      const CLOSE_THRESH = 0.28;
      const OPEN_THRESH = 0.33;
      const { closedFrames, blinked } = blinkState.current;

      if (ear < CLOSE_THRESH) {
        blinkState.current.closedFrames = closedFrames + 1;
      } else if (ear > OPEN_THRESH && closedFrames > 1 && !blinked) {
        setBlinked(true);
        blinkState.current = { closedFrames: 0, blinked: true };
      } else {
        blinkState.current.closedFrames = 0;
      }

      // 👃 Improved head direction detection
      const nose = landmarks.getNose();
      const noseX = nose[3].x;
      const faceBox = detection.detection.box;
      const relX = (noseX - faceBox.x) / faceBox.width;

      // Smooth results using short history (avoid jitter)
      headHistory.current.push(relX);
      if (headHistory.current.length > 5) headHistory.current.shift();

      const avgRelX =
        headHistory.current.reduce((a, b) => a + b, 0) /
        headHistory.current.length;

      // Mirrored view => reversed
      if (avgRelX < 0.35) setTurnedRight(true);
      if (avgRelX > 0.65) setTurnedLeft(true);

      // ✅ Liveness condition
      if (blinked && turnedLeft && turnedRight && !verified) {
        setVerified(true);
        setStatus("🎉 Liveness verified! You are real ✅");
      } else if (!verified) {
        setStatus(
          `Blink and turn head left & right...
          ${blinked ? "👁️ Blink OK " : ""}
          ${turnedLeft ? "↩️ Left OK " : ""}
          ${turnedRight ? "↪️ Right OK" : ""}`
        );
      }
    };

    const interval = setInterval(detectLiveness, 100);
    return () => clearInterval(interval);
  }, [modelsLoaded, turnedLeft, turnedRight, verified]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-100 relative">
      <h1 className="text-2xl font-bold text-blue-400 mb-3">Liveness Verification</h1>
      <p className="text-sm mb-5 text-gray-400 text-center whitespace-pre-line">
        {status}
      </p>

      {/* 🟦 Oval camera frame */}
      <div className="relative border-4 border-blue-600 rounded-full w-[320px] h-[420px] flex items-center justify-center overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="480"
          height="360"
          className="object-cover transform -scale-x-100 absolute top-0 left-0 w-full h-full"
        />

        {/* Dark overlay outside oval */}
        <div className="absolute inset-0 bg-gray-950/60 pointer-events-none" />

        {/* Oval cutout mask */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 pointer-events-none" />
      </div>

      {/* 🧭 Step indicators */}
      <div className="flex gap-6 mt-6 text-gray-400">
        <div className="flex flex-col items-center">
          <Eye
            size={30}
            className={`${
              blinked ? "text-green-500" : "text-gray-500"
            } transition-all`}
          />
          <span className="text-xs mt-1">Blink</span>
        </div>
        <div className="flex flex-col items-center">
          <ArrowLeftRight
            size={30}
            className={`${
              turnedLeft && turnedRight ? "text-green-500" : "text-gray-500"
            } transition-all`}
          />
          <span className="text-xs mt-1">Turn</span>
        </div>
        <div className="flex flex-col items-center">
          <CheckCircle2
            size={30}
            className={`${
              verified ? "text-green-500" : "text-gray-500"
            } transition-all`}
          />
          <span className="text-xs mt-1">Verified</span>
        </div>
      </div>

      {verified && (
        <button
          onClick={() => alert("✅ Verified and ready to continue")}
          className="mt-6 bg-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue
        </button>
      )}
    </div>
  );
}