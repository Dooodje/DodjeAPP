/**
 * Configuration Firebase centralisée pour l'application
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configuration Firebase provenant du projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgDWiRJuwuG6jnqwKyIVlNEAiNTTu6jdQ",
  authDomain: "doodje-455f9.firebaseapp.com",
  projectId: "doodje-455f9",
  storageBucket: "doodje-455f9.firebasestorage.app",
  messagingSenderId: "612838674498",
  appId: "1:612838674498:web:ba9f10dd9aa0d0a3d01ddb",
  measurementId: "G-PTCZR9N93R"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Exportation des services Firebase
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Vérification que le storageBucket est correctement configuré
console.log('Firebase Storage Bucket:', firebaseConfig.storageBucket);

export default app; 