// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjYP4IwvPUo_509385HOXCOz3DksWSrzw",
  authDomain: "naijahome-80385.firebaseapp.com",
  projectId: "naijahome-80385",
  storageBucket: "naijahome-80385.firebasestorage.app",
  messagingSenderId: "588137565019",
  appId: "1:588137565019:web:9bb80d014a6a3534f9e87e",
  measurementId: "G-7GZ7LP01DE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

// ✅ Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY_FROM_FIREBASE",
      });
      console.log("FCM Token:", token);
      // You can send this token to your backend to store for later pushes
    } else {
      console.warn("Notification permission denied.");
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

// ✅ Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      resolve(payload);
    });
  })