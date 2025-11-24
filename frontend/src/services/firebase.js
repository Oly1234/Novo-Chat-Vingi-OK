import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyASzNgH9ryGsnX8wX3iQGHFSGPAZV82F_Y",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "agenda-44f53.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agenda-44f53",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "agenda-44f53.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "275665244985",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:275665244985:web:df6890622859f6c57ecee8"
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✓ Firebase inicializado com sucesso no frontend');
} catch (error) {
  console.error('✗ Erro ao inicializar Firebase:', error);
}

export { db, firebaseConfig };
export default app;
