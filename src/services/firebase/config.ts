import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Utiliser les variables d'environnement via le plugin react-native-dotenv
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDgDWiRJuwuG6jnqwKyIVlNEAiNTTu6jdQ",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "doodje-455f9.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "doodje-455f9",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "doodje-455f9.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "612838674498",
  appId: process.env.FIREBASE_APP_ID || "1:612838674498:web:ba9f10dd9aa0d0a3d01ddb",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-PTCZR9N93R"
};

// Log pour le débogage
console.log('Initialisation Firebase avec la configuration:', 
  Platform.OS === 'web' ? 'Configuration Web' : JSON.stringify(firebaseConfig));

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 