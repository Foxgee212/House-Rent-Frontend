importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAjYP4IwvPUo_509385HOXCOz3DksWSrzw",
  authDomain: "naijahome-80385.firebaseapp.com",
  projectId: "naijahome-80385",
  storageBucket: "naijahome-80385.firebasestorage.app",
  messagingSenderId: "588137565019",
  appId: "1:588137565019:web:9bb80d014a6a3534f9e87e",
});

const messaging = firebase.messaging();

// When app is in background
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, { body, icon });
});
