import * as faceapi from "face-api.js";

// Load models from /public/models
export async function loadFaceApiModels() {
  const MODEL_URL = "/models";
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("✅ Face API models loaded successfully");
  } catch (error) {
    console.error("❌ Model load error:", error);
  }
}

export default faceapi;
