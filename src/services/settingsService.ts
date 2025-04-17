import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserSettings } from '../types/settings';
import { sendPasswordResetEmail } from 'firebase/auth';

export const settingsService = {
  async getSettings(userId: string): Promise<UserSettings | null> {
    if (!userId) {
      console.error('getSettings: userId est undefined ou null');
      return null;
    }
    
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'user');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        // Vérifier que les données retournées sont bien un objet
        if (data && typeof data === 'object') {
          return data as UserSettings;
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  },

  async updateSettings(userId: string, settings: UserSettings): Promise<void> {
    if (!userId) {
      console.error('updateSettings: userId est undefined ou null');
      throw new Error('userId est requis');
    }
    
    if (!settings || typeof settings !== 'object') {
      console.error('updateSettings: settings est undefined, null ou pas un objet');
      throw new Error('settings est requis et doit être un objet');
    }
    
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'user');
      await setDoc(settingsRef, settings, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  },

  async updatePartialSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    // Vérification plus stricte de userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('updatePartialSettings: userId est undefined, null, ou invalide');
      throw new Error('userId est requis et doit être une chaîne non vide');
    }
    
    if (!updates || typeof updates !== 'object') {
      console.error('updatePartialSettings: updates est undefined, null ou pas un objet');
      throw new Error('updates est requis et doit être un objet');
    }
    
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'user');
      
      // Vérifier si le document existe
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        // Si le document existe, utiliser updateDoc
        await updateDoc(settingsRef, updates);
      } else {
        // Si le document n'existe pas, utiliser setDoc avec merge: true
        await setDoc(settingsRef, updates, { merge: true });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour partielle des paramètres:', error);
      throw error;
    }
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!email || typeof email !== 'string') {
      console.error('sendPasswordResetEmail: email est undefined, null ou pas une chaîne');
      throw new Error('email est requis et doit être une chaîne');
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du mail de réinitialisation du mot de passe:', error);
      throw error;
    }
  },
}; 