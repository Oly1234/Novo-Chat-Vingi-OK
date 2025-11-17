// Firebase client-side configuration
// This file is for future real-time features using Firebase SDK

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyASzNgH9ryGsnX8wX3iQGHFSGPAZV82F_Y",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "agenda-44f53.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agenda-44f53",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "agenda-44f53.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "275665244985",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:275665244985:web:df6890622859f6c57ecee8"
};

export default firebaseConfig;
