import { Middleware } from 'redux';
import { ProfileProgressionService } from '../../services/businessLogic/ProfileProgressionService';
import { RootState } from '../index';

/**
 * Middleware Redux qui surveille les actions pour mettre à jour automatiquement
 * la progression utilisateur après certaines actions spécifiques
 * telles que la complétion d'un parcours ou la connexion de l'utilisateur
 */
const progressUpdateMiddleware: Middleware = store => next => action => {
  // D'abord, laisse l'action se propager normalement
  const result = next(action);
  
  // Liste des types d'actions qui devraient déclencher une mise à jour de progression
  const actionsToTriggerUpdate = [
    'parcours/markAsCompleted',  // Lorsqu'un parcours est marqué comme terminé
    'parcours/updateStatus',     // Lorsque le statut d'un parcours est mis à jour
    'quiz/quizCompleted',        // Lorsqu'un quiz est terminé
    'auth/loginSuccess',         // Après la connexion d'un utilisateur
    'auth/refreshUserData'       // Lorsque les données utilisateur sont rafraîchies
  ];
  
  // Si l'action est l'une de celles qui déclenchent une mise à jour
  if (action && typeof action === 'object' && 'type' in action && typeof action.type === 'string' && 
      actionsToTriggerUpdate.includes(action.type)) {
    
    // Vérification spécifique pour parcours/updateStatus - ne déclencher que si status=completed
    if (action.type === 'parcours/updateStatus' && 
        'payload' in action && 
        typeof action.payload === 'object' && 
        action.payload !== null && 
        'status' in action.payload && 
        action.payload.status !== 'completed') {
      return result;
    }
    
    // Récupérer l'ID utilisateur depuis l'état Redux
    const state = store.getState() as RootState;
    const userId = state.auth?.user?.uid;
    
    // Si un utilisateur est connecté, mettre à jour sa progression
    if (userId) {
      console.log(`Action ${action.type} détectée, mise à jour de la progression pour l'utilisateur ${userId}`);
      
      // Appel asynchrone sans attendre le résultat (fire and forget)
      ProfileProgressionService.calculateAndUpdateUserProgress(userId)
        .catch(error => console.error('Erreur lors de la mise à jour de la progression:', error));
    }
  }
  
  return result;
};

export default progressUpdateMiddleware; 