import { collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Quiz, QuizProgress } from '../types/quiz';

export const quizService = {
  // Récupérer un quiz par son ID
  async getQuizById(quizId: string): Promise<Quiz | null> {
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        return null;
      }
      return { id: quizDoc.id, ...quizDoc.data() } as Quiz;
    } catch (error) {
      console.error('Erreur lors de la récupération du quiz:', error);
      throw error;
    }
  },

  // Récupérer les quiz d'un cours
  async getQuizzesByCourseId(courseId: string): Promise<Quiz[]> {
    try {
      const quizzesQuery = query(collection(db, 'quizzes'), where('courseId', '==', courseId));
      const querySnapshot = await getDocs(quizzesQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz:', error);
      throw error;
    }
  },

  // Récupérer les quiz d'une vidéo
  async getQuizzesByVideoId(videoId: string): Promise<Quiz[]> {
    try {
      const quizzesQuery = query(collection(db, 'quizzes'), where('videoId', '==', videoId));
      const querySnapshot = await getDocs(quizzesQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz:', error);
      throw error;
    }
  },

  // Sauvegarder la progression d'un quiz
  async saveQuizProgress(userId: string, progress: QuizProgress): Promise<void> {
    try {
      const progressRef = doc(db, 'users', userId, 'quizProgress', progress.quizId);
      await setDoc(progressRef, {
        ...progress,
        completedAt: Timestamp.fromDate(progress.completedAt)
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la progression:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'un quiz
  async updateQuizStatus(userId: string, quizId: string, status: Quiz['status']): Promise<void> {
    try {
      const quizRef = doc(db, 'quizzes', quizId);
      await updateDoc(quizRef, {
        status,
        lastAttemptDate: Timestamp.now()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  // Mettre à jour le meilleur score
  async updateBestScore(userId: string, quizId: string, score: number): Promise<void> {
    try {
      const quizRef = doc(db, 'quizzes', quizId);
      await updateDoc(quizRef, {
        bestScore: score
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du meilleur score:', error);
      throw error;
    }
  },

  // Vérifier si un quiz est débloqué
  async isQuizUnlocked(userId: string, quizId: string): Promise<boolean> {
    try {
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        return false;
      }
      const quiz = quizDoc.data() as Quiz;
      return quiz.status === 'unlocked';
    } catch (error) {
      console.error('Erreur lors de la vérification du déblocage:', error);
      throw error;
    }
  }
}; 