// src/firebase.js

// Import the Firebase SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjYP4IwvPUo_509385HOXCOz3DksWSrzw",
  authDomain: "naijahome-80385.firebaseapp.com",
  projectId: "naijahome-80385",
  storageBucket: "naijahome-80385.appspot.com", // ❌ fixed wrong domain (.app → .appspot.com)
  messagingSenderId: "588137565019",
  appId: "1:588137565019:web:9bb80d014a6a3534f9e87e",
  measurementId: "G-7GZ7LP01DE",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firebase Cloud Messaging setup
export const messaging = getMessaging(app);

// ✅ Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BL8Lq3hiSYntBL6bOxAHsZDU3-THgJcOFQin0p7yWc1Hs_aHdGEw30UAXesp33m5NBMuLCSf43JcKicASoWVdbs",
      });
      console.log("✅ FCM Token:", token);
      // Optionally send token to your backend for push notifications
    } else {
      console.warn("🚫 Notification permission denied by user.");
    }
  } catch (err) {
    console.error("❌ Error getting FCM token:", err);
  }
};

// ✅ Foreground message listener
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📩 Message received:", payload);
      resolve(payload);
    });
  });
