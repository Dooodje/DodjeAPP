import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase/config';

export interface QuestionnaireAnswers {
  answers: Record<string, string>;
  completedAt: any;
  questionnaireId: string;
  version: string;
}

export interface UserQuestionnaireData {
  sexe: 'homme' | 'femme';
  age: number;
  name: string;
  preference: 'bourse' | 'crypto';
  lvl: 'debutant' | 'avance' | 'expert';
  questionnaireCompleted: boolean;
  questionnaireCompletedAt: any;
}

export class QuestionnaireService {
  private static readonly COLLECTION_PATH = 'profil-invest';
  private static readonly DOCUMENT_ID = 'questionnaire-initial';
  private static readonly QUESTIONNAIRE_ID = 'gtn3g09nY47e6MSTLEkz';
  private static readonly VERSION = '1.0';

  /**
   * Enregistre les réponses du questionnaire directement dans le document utilisateur
   * @param userId ID de l'utilisateur
   * @param answers Réponses du questionnaire
   */
  static async saveQuestionnaireAnswers(
    userId: string, 
    answers: Record<string, string>
  ): Promise<void> {
    try {
      // Analyser les réponses pour extraire les données structurées
      const userData = this.parseAnswersToUserData(answers);
      
      // Mettre à jour le document utilisateur principal
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...userData,
        questionnaireCompleted: true,
        questionnaireCompletedAt: Timestamp.now()
      });

      // Également sauvegarder dans la sous-collection pour historique
      const questionnaireAnswers: QuestionnaireAnswers = {
        answers,
        completedAt: Timestamp.now(),
        questionnaireId: this.QUESTIONNAIRE_ID,
        version: this.VERSION
      };

      const userProfilInvestRef = doc(
        db, 
        'users', 
        userId, 
        this.COLLECTION_PATH, 
        this.DOCUMENT_ID
      );
      
      await setDoc(userProfilInvestRef, questionnaireAnswers);
      console.log('Réponses du questionnaire enregistrées avec succès dans le document utilisateur et l\'historique');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des réponses:', error);
      throw error;
    }
  }

  /**
   * Parse les réponses brutes en données utilisateur structurées
   * @param answers Réponses du questionnaire
   * @returns Données utilisateur structurées
   */
  private static parseAnswersToUserData(answers: Record<string, string>): UserQuestionnaireData {
    const userData: Partial<UserQuestionnaireData> = {};

    Object.entries(answers).forEach(([questionId, answer]) => {
      // Sexe
      if (answer === "1748684755763-1") {
        userData.sexe = "homme";
      } else if (answer === "1748684755763-2") {
        userData.sexe = "femme";
      }

      // Préférence
      if (answer === "1748684849492-1") {
        userData.preference = "bourse";
      } else if (answer === "1748684849492-2") {
        userData.preference = "crypto";
      }

      // Niveau
      if (answer === "1748684888584-1") {
        userData.lvl = "debutant";
      } else if (answer === "1748684888584-2") {
        userData.lvl = "avance";
      } else if (answer === "1748684888584-3") {
        userData.lvl = "expert";
      }

      // Âge (si c'est un nombre)
      if (!isNaN(Number(answer)) && Number(answer) > 0 && Number(answer) < 150) {
        userData.age = Number(answer);
      }

      // Nom (si c'est une chaîne de plus de 2 caractères et pas un ID)
      if (typeof answer === 'string' && 
          answer.length > 2 && 
          !answer.includes('-') && 
          isNaN(Number(answer)) &&
          !userData.name) {
        userData.name = answer;
      }
    });

    // Vérifier que toutes les données requises sont présentes
    if (!userData.sexe || !userData.age || !userData.name || !userData.preference || !userData.lvl) {
      console.warn('Données incomplètes du questionnaire:', userData);
    }

    return userData as UserQuestionnaireData;
  }

  /**
   * Récupère les réponses du questionnaire de première connexion
   * @param userId ID de l'utilisateur
   * @returns Les réponses du questionnaire ou null si aucune réponse trouvée
   */
  static async getQuestionnaireAnswers(userId: string): Promise<QuestionnaireAnswers | null> {
    try {
      const userProfilInvestRef = doc(
        db, 
        'users', 
        userId, 
        this.COLLECTION_PATH, 
        this.DOCUMENT_ID
      );
      
      const docSnap = await getDoc(userProfilInvestRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as QuestionnaireAnswers;
      } else {
        console.log('Aucune réponse de questionnaire trouvée pour cet utilisateur');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses du questionnaire:', error);
      throw error;
    }
  }

  /**
   * Récupère les données utilisateur du questionnaire depuis le document principal
   * @param userId ID de l'utilisateur
   * @returns Les données utilisateur du questionnaire ou null
   */
  static async getUserQuestionnaireData(userId: string): Promise<UserQuestionnaireData | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.questionnaireCompleted) {
          return {
            sexe: userData.sexe,
            age: userData.age,
            name: userData.name,
            preference: userData.preference,
            lvl: userData.lvl,
            questionnaireCompleted: userData.questionnaireCompleted,
            questionnaireCompletedAt: userData.questionnaireCompletedAt
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur du questionnaire:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur a déjà complété le questionnaire
   * @param userId ID de l'utilisateur
   * @returns true si le questionnaire a été complété, false sinon
   */
  static async hasCompletedQuestionnaire(userId: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.questionnaireCompleted === true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du questionnaire:', error);
      return false;
    }
  }

  /**
   * Analyse les réponses pour extraire des informations utiles (méthode legacy)
   * @param answers Réponses du questionnaire
   * @returns Objet avec les informations analysées
   */
  static analyzeAnswers(answers: Record<string, string>) {
    const analysis = {
      style: null as string | null,
      age: null as number | null,
      name: null as string | null,
      level: null as string | null,
      interest: null as string | null
    };

    // Analyser chaque réponse selon l'ID de la question
    Object.entries(answers).forEach(([questionId, answer]) => {
      // Vous pouvez adapter cette logique selon vos IDs de questions spécifiques
      if (answer.toLowerCase().includes('gland')) {
        analysis.style = answer;
      } else if (!isNaN(Number(answer))) {
        analysis.age = Number(answer);
      } else if (answer.toLowerCase().includes('débutant') || 
                 answer.toLowerCase().includes('avancé') || 
                 answer.toLowerCase().includes('expert')) {
        analysis.level = answer;
      } else if (answer.toLowerCase().includes('bourse') || 
                 answer.toLowerCase().includes('crypto')) {
        analysis.interest = answer;
      } else if (answer.length > 2 && !analysis.name) {
        analysis.name = answer;
      }
    });

    return analysis;
  }
} 