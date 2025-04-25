import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateEmail,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
      console.log(`Document utilisateur créé avec succès pour ${firebaseUser.uid}`);
      
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

      console.log('Tentative de création du document utilisateur dans Firestore...');
      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('Document utilisateur créé avec succès dans Firestore');
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
        lastLogin: new Date().toISOString(),
      });

      // Mettre à jour les données utilisateur avec la dernière connexion
      const updatedUserData = {
        ...userData,
        lastLogin: new Date().toISOString(),
      };
      
      // Sauvegarder l'utilisateur dans le stockage local
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUserData));

      return updatedUserData;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      
      // Catégorisation des erreurs Firebase
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Adresse e-mail ou mot de passe incorrect');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse e-mail invalide');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Ce compte a été désactivé');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard');
      }
      
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      // Supprimer les données utilisateur du stockage local
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error(error.message || 'Erreur lors de la déconnexion');
    }
  },

  // Récupérer l'utilisateur courant depuis le stockage local
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Vérifier si le token est valide
  async isTokenValid(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return false;
      }
      
      // Forcer le rafraîchissement du token pour vérifier sa validité
      await currentUser.getIdToken(true);
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  },

  // Rafraîchir le token d'authentification
  async refreshToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('Tentative de rafraîchissement de token sans utilisateur connecté');
        return null;
      }
      
      console.log('Rafraîchissement du token pour l\'utilisateur:', currentUser.uid);
      // Forcer l'obtention d'un nouveau token
      const newToken = await currentUser.getIdToken(true);
      console.log('Token rafraîchi avec succès');
      return newToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return null;
    }
  },

  // Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      // Validation de l'email
      if (!this.validateEmail(email)) {
        throw new Error('Adresse e-mail invalide');
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      
      // Catégorisation des erreurs Firebase
      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte associé à cette adresse e-mail');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse e-mail invalide');
      }
      
      throw new Error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  },

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: UserData | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // S'assurer que l'utilisateur existe dans Firestore et obtenir ses données
          const userData = await firestoreService.ensureUserExists(user);
          callback(userData);
        } catch (error) {
          console.error('Erreur dans onAuthStateChange:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // Update user email
  async updateEmail(newEmail: string): Promise<void> {
    try {
      // Validation des entrées
      if (!this.validateEmail(newEmail)) {
        throw new Error('Adresse e-mail invalide');
      }
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Vous devez être connecté pour modifier votre adresse e-mail');
      }

      // Vérifier si l'adresse e-mail est différente
      if (currentUser.email === newEmail) {
        throw new Error('La nouvelle adresse e-mail doit être différente de l\'actuelle');
      }

      console.log('Tentative de mise à jour de l\'adresse e-mail...');
      try {
        // Utiliser la méthode qui envoie un email de vérification
        await verifyBeforeUpdateEmail(currentUser, newEmail);
        console.log('Email de vérification envoyé à la nouvelle adresse');
      } catch (error: any) {
        // Si l'erreur est due à un besoin de réauthentification, lancer une erreur spécifique
        if (error.code === 'auth/requires-recent-login') {
          throw new Error('Pour des raisons de sécurité, vous devez vous reconnecter avant de modifier votre adresse e-mail');
        }
        throw error;
      }

      // Mettre à jour l'e-mail dans les données utilisateur de Firestore
      // Nous mettrons à jour le Firestore uniquement après vérification
      return;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'adresse e-mail:', error);
      
      // Catégorisation des erreurs Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse e-mail est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse e-mail invalide');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('Pour des raisons de sécurité, vous devez vous reconnecter avant de modifier votre adresse e-mail');
      }
      
      throw error;
    }
  },

  // Reauthenticate user with credentials
  async reauthenticate(password: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('Utilisateur non connecté ou email manquant');
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );

      await reauthenticateWithCredential(currentUser, credential);
      console.log('Réauthentification réussie');
      return;
    } catch (error: any) {
      console.error('Erreur lors de la réauthentification:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives échouées. Veuillez réessayer plus tard');
      } else if (error.code === 'auth/user-mismatch') {
        throw new Error('Les identifiants ne correspondent pas à l\'utilisateur actuel');
      }
      
      throw new Error('Échec de la réauthentification. Veuillez réessayer.');
    }
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