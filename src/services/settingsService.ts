import { db } from 'src/config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserSettings } from 'src/types/settings';

export const settingsService = {
  async getSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'user');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        return settingsDoc.data() as UserSettings;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  },

  async updateSettings(userId: string, settings: UserSettings): Promise<void> {
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'user');
      await setDoc(settingsRef, settings, { merge: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  },

  async updatePartialSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'users', userId, 'settings', 'user');
      await updateDoc(settingsRef, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour partielle des paramètres:', error);
      throw error;
    }
  },
}; 