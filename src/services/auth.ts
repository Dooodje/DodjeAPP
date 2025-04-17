import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { storageService } from './storage';

export interface User {
  id: string;
  email: string;
  username?: string;
}

class AuthService {
  private auth = getAuth();

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
      };
      await storageService.saveUser(user);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Email ou mot de passe incorrect');
      }
      throw error;
    }
  }

  async register(email: string, password: string, username: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
      });

      const user = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        username,
      };
      await storageService.saveUser(user);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Erreur lors de l\'inscription');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await storageService.removeUser();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Erreur lors de la déconnexion');
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await storageService.getUser();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }
}

export const authService = new AuthService(); 