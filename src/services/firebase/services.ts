import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from './config';
import { UserData, Parcours, UserProgress } from '../../types/firebase';

// Authentication Services
export const authService = {
  // Inscription
  async register(email: string, password: string, username: string): Promise<UserData> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Créer le document utilisateur dans Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: username,
        photoURL: null,
        dodji: 0,
        streak: 0,
        isDodjeOne: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Connexion
  async login(email: string, password: string): Promise<UserData> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Récupérer les données utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      // Mettre à jour la dernière connexion
      const userData = userDoc.data() as UserData;
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        lastLogin: new Date().toISOString(),
      });

      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: UserData | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as UserData);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};

// Firestore Services
export const firestoreService = {
  // User Services
  getUserData: async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserData : null;
    } catch (error) {
      throw error;
    }
  },

  updateUserData: async (uid: string, data: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      throw error;
    }
  },

  // Parcours Services
  getParcours: async (theme: string, level: string): Promise<Parcours[]> => {
    try {
      const q = query(
        collection(db, 'parcours'),
        where('theme', '==', theme),
        where('level', '==', level)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot<DocumentData>) => 
        ({ id: docSnapshot.id, ...docSnapshot.data() } as Parcours)
      );
    } catch (error) {
      throw error;
    }
  },

  // Progress Services
  getUserProgress: async (userId: string, parcoursId: string): Promise<UserProgress | null> => {
    try {
      const progressDoc = await getDoc(doc(db, 'userProgress', `${userId}_${parcoursId}`));
      return progressDoc.exists() ? progressDoc.data() as UserProgress : null;
    } catch (error) {
      throw error;
    }
  },

  updateUserProgress: async (userId: string, parcoursId: string, data: Partial<UserProgress>) => {
    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${parcoursId}`);
      await setDoc(progressRef, data, { merge: true });
    } catch (error) {
      throw error;
    }
  }
};

// Storage Services
export const storageService = {
  uploadFile: async (path: string, file: Blob): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (path: string): Promise<void> => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      throw error;
    }
  }
}; 