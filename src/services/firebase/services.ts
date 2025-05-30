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
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from './config';
import { UserData, Parcours, UserProgress } from '../../types/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  USER: '@dodje_user',
};

// Firestore Services - Défini en premier pour éviter les références circulaires
export const firestoreService = {
  // User Services
  getUserData: async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserData : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      throw error;
    }
  },

  // Créer les sous-collections vides pour un nouvel utilisateur
  initializeUserSubcollections: async (uid: string): Promise<void> => {
    try {
      console.log(`Initialisation des sous-collections pour l'utilisateur ${uid}...`);
      
      // Créer un document vide dans chaque sous-collection pour les initialiser
      const subcollections = [
        'profil-invest', 
        'dodjelabs', 
        'jeton_dodji', 
        'dodjeone', 
        'video', 
        'quiz', 
        'connexion', 
        'parcours', 
        'historique'
      ];
      
      // Créer les sous-collections avec un document initial vide
      for (const subcollection of subcollections) {
        const initialDocRef = doc(db, 'users', uid, subcollection, 'init');
        
        // Définir des données initiales différentes selon la sous-collection
        let initialData: Record<string, any> = {
          createdAt: Timestamp.now(),
          initialized: true
        };
        
        // Données spécifiques par sous-collection
        if (subcollection === 'connexion') {
          initialData = {
            ...initialData,
            firstLogin: Timestamp.now()
          };
        } else if (subcollection === 'jeton_dodji') {
          initialData = {
            ...initialData,
            balance: 0,
            transactions: []
          };
        } else if (subcollection === 'dodjeone') {
          initialData = {
            ...initialData,
            status: 'free',
            since: Timestamp.now()
          };
        }
        
        await setDoc(initialDocRef, initialData);
      }
      
      console.log(`Sous-collections initialisées avec succès pour l'utilisateur ${uid}`);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des sous-collections:', error);
      throw error;
    }
  },

  ensureUserExists: async (firebaseUser: User): Promise<UserData> => {
    try {
      // Vérifier si l'utilisateur existe dans Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      // Si l'utilisateur existe, retourner ses données
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      
      // Si l'utilisateur n'existe pas, créer un nouveau document
      console.log(`Création d'un document utilisateur pour ${firebaseUser.uid}...`);
      const newUserData: UserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
        photoURL: firebaseUser.photoURL,
        dodji: 0,
        streak: 0,
        isDodjeOne: false,
        createdAt: Timestamp.now().toDate().toISOString(),
        lastLogin: Timestamp.now().toDate().toISOString(),
      };
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
      console.log(`Document utilisateur créé avec succès pour ${firebaseUser.uid}`);
      
      // Initialiser les sous-collections pour le nouvel utilisateur
      await firestoreService.initializeUserSubcollections(firebaseUser.uid);
      
      return newUserData;
    } catch (error) {
      console.error('Erreur lors de la vérification/création de l\'utilisateur:', error);
      throw error;
    }
  },

  updateUserData: async (uid: string, data: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', error);
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
      console.error('Erreur lors de la récupération des parcours:', error);
      throw error;
    }
  },

  // Progress Services
  getUserProgress: async (userId: string, parcoursId: string): Promise<UserProgress | null> => {
    try {
      const progressDoc = await getDoc(doc(db, 'userProgress', `${userId}_${parcoursId}`));
      return progressDoc.exists() ? progressDoc.data() as UserProgress : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression utilisateur:', error);
      throw error;
    }
  },

  updateUserProgress: async (userId: string, parcoursId: string, data: Partial<UserProgress>) => {
    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${parcoursId}`);
      await setDoc(progressRef, data, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression utilisateur:', error);
      throw error;
    }
  }
};

// Authentication Services - Maintenant défini après firestoreService
export const authService = {
  // Validation des entrées pour les fonctions d'authentification
  validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    // Expression régulière pour valider les adresses e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password: string): boolean {
    return !!password && typeof password === 'string' && password.length >= 6;
  },

  // Inscription
  async register(email: string, password: string, username: string): Promise<UserData> {
    try {
      // Validation des entrées
      if (!this.validateEmail(email)) {
        throw new Error('Adresse e-mail invalide');
      }
      
      if (!this.validatePassword(password)) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      if (!username || typeof username !== 'string' || username.length < 3) {
        throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      }

      console.log('Tentative de création du compte avec Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Compte créé avec succès dans Firebase Auth, UID:', user.uid);
      
      // Créer le document utilisateur dans Firestore avec toutes les données requises
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: username,
        photoURL: null,
        dodji: 0,
        streak: 0,
        isDodjeOne: false,
        createdAt: Timestamp.now().toDate().toISOString(),
        lastLogin: Timestamp.now().toDate().toISOString(),
      };

      console.log('Tentative de création du document utilisateur dans Firestore...');
      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('Document utilisateur créé avec succès dans Firestore');
        
        // Initialiser les sous-collections pour le nouvel utilisateur
        await firestoreService.initializeUserSubcollections(user.uid);
        console.log('Sous-collections initialisées avec succès');
        
      } catch (firestoreError: any) {
        console.error('Erreur lors de la création du document Firestore:', firestoreError);
        
        // Si l'erreur est liée aux permissions, fournir un message plus clair
        if (firestoreError.code === 'permission-denied') {
          throw new Error('Permissions insuffisantes pour créer le profil utilisateur. Veuillez vérifier les règles de sécurité Firestore.');
        }
        
        // On ne propage pas cette erreur pour éviter de bloquer la création du compte
        // L'utilisateur existe dans Authentication mais sans document Firestore
        console.warn('Création du document utilisateur échouée, mais le compte a été créé');
      }
      
      // Sauvegarder l'utilisateur dans le stockage local même si Firestore a échoué
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        console.log('Données utilisateur sauvegardées dans AsyncStorage');
      } catch (storageError) {
        console.error('Erreur lors de la sauvegarde dans AsyncStorage:', storageError);
      }
      
      return userData;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Catégorisation des erreurs Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse e-mail est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse e-mail invalide');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe est trop faible');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('L\'inscription par email/mot de passe n\'est pas activée');
      } else if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        throw new Error('Permissions insuffisantes. Veuillez vérifier les règles de sécurité Firebase.');
      }
      
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  },

  // Connexion
  async login(email: string, password: string): Promise<UserData> {
    try {
      // Validation des entrées
      if (!this.validateEmail(email)) {
        throw new Error('Adresse e-mail invalide');
      }
      
      if (!password || typeof password !== 'string') {
        throw new Error('Mot de passe invalide');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // S'assurer que l'utilisateur existe dans Firestore et obtenir ses données complètes
      const userData = await firestoreService.ensureUserExists(user);
      
      // Mettre à jour la dernière connexion
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: Timestamp.now().toDate().toISOString(),
      });

      // Mettre à jour également AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      // Ajouter une entrée dans la sous-collection connexion
      try {
        const connexionRef = doc(collection(db, 'users', user.uid, 'connexion'));
        await setDoc(connexionRef, {
          timestamp: Timestamp.now(),
          device: 'mobile', // À améliorer pour détecter réellement l'appareil
          platform: Platform.OS
        });
      } catch (connexionError) {
        console.warn('Erreur lors de l\'enregistrement de la connexion:', connexionError);
        // Ne pas bloquer la connexion si cet enregistrement échoue
      }

      return userData;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      
      // Catégorisation des erreurs
      if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse e-mail invalide');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Ce compte a été désactivé');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte trouvé avec cette adresse e-mail');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard');
      }
      
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      console.log('🚪 Début de la déconnexion complète...');
      
      // 1. Déconnexion Firebase
      await signOut(auth);
      console.log('✅ Déconnexion Firebase réussie');
      
      // 2. Vider AsyncStorage complètement
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage vidé');
      
      console.log('🎉 Déconnexion complète terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Vérification d'un utilisateur actuellement connecté
  async getCurrentUser(): Promise<UserData | null> {
    try {
      // Vérifier d'abord dans le stockage local pour une expérience plus rapide
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        return JSON.parse(storedUser) as UserData;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      return null;
    }
  },

  // Vérification de la validité du token
  async isTokenValid(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;
      
      // Tenter de récupérer le token ID pour vérifier sa validité
      await currentUser.getIdToken(false);
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  },

  // Rafraîchissement du token
  async refreshToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      // Forcer le rafraîchissement du token
      const token = await currentUser.getIdToken(true);
      return token;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return null;
    }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Adresse e-mail invalide');
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      
      // Catégorisation des erreurs
      if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse e-mail invalide');
      } else if (error.code === 'auth/user-not-found') {
        // Pour des raisons de sécurité, on pourrait vouloir ne pas indiquer que l'utilisateur n'existe pas
        // Mais cela peut nuire à l'expérience utilisateur
        throw new Error('Aucun compte trouvé avec cette adresse e-mail');
      }
      
      throw new Error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  },

  // Observer les changements d'état de l'authentification
  onAuthStateChange(callback: (user: UserData | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await firestoreService.ensureUserExists(firebaseUser);
          callback(userData);
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};

// Storage Services
export const storageService = {
  uploadFile: async (path: string, file: Blob): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  },

  deleteFile: async (path: string): Promise<void> => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  }
}; 