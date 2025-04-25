/**
 * Point d'entrée centralisé pour l'exportation de tous les services de l'application
 * Facilite les importations dans d'autres fichiers
 */

// Barrel file pour tous les services de l'application
export * from './firebase';
export * from './video';
export * from './course';
export * from './home';
export * from './shop';
export * from './dodjeOneService';
export * from './profile';
export * from './dodji';
export * from './iap';
export * from './quiz';

// Exporter les services Firebase
export { authService, firestoreService, storageService } from './firebase/services';

// Autres services au besoin 