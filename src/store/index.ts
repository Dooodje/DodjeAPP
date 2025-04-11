import { configureStore, Middleware, AnyAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { Platform } from 'react-native';
import homeReducer from './slices/homeSlice';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import quizReducer from './slices/quizSlice';
import profileReducer from './slices/profileSlice';
import shopReducer from './slices/shopSlice';
import videoReducer from './slices/videoSlice';
import settingsReducer from './slices/settingsSlice';
import { Section, Level } from '../types/home';
import { webStorage } from '../config/web';

// Valeurs par défaut sécurisées
const DEFAULT_SECTION: Section = 'Bourse';
const DEFAULT_LEVEL: Level = 'Débutant';

// Configuration de redux-persist avec support web
const persistConfig = {
  key: 'root',
  storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
  // Ne pas persister les états de chargement ou d'erreur
  blacklist: ['isLoading', 'error']
};

// Combiner tous les reducers
const rootReducer = combineReducers({
  home: homeReducer,
  auth: authReducer,
  course: courseReducer,
  quiz: quizReducer,
  profile: profileReducer,
  shop: shopReducer,
  video: videoReducer,
  settings: settingsReducer
});

// Créer le reducer persistant
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware de sécurité qui intercepte les actions et vérifie l'état du store
// Plus robuste avec validation profonde des valeurs
const safetyMiddleware: Middleware = store => next => action => {
  // Exécuter l'action avant la validation pour capturer les changements
  try {
    // Laisser passer l'action au reducer suivant
    const result = next(action);

    // Vérifier l'état après l'application du reducer
    const state = store.getState();

    // Vérifier l'état de home pour les erreurs potentielles
    if (state.home) {
      const { treeData, currentSection, currentLevel } = state.home;

      // Vérifier et corriger currentSection et currentLevel
      const safeSection = currentSection || DEFAULT_SECTION;
      const safeLevel = currentLevel || DEFAULT_LEVEL;
      
      if (!currentSection || !currentLevel) {
        console.warn('safetyMiddleware: currentSection ou currentLevel est invalide, correction automatique');
        if (!currentSection) {
          store.dispatch({ type: 'home/setCurrentSection', payload: safeSection });
        }
        if (!currentLevel) {
          store.dispatch({ type: 'home/setCurrentLevel', payload: safeLevel });
        }
      }

      // Vérifier l'absence de treeData, qui devrait toujours exister
      if (!treeData) {
        console.warn('safetyMiddleware: treeData est null ou undefined, correction automatique');
        
        // Réinitialiser treeData à une valeur sûre
        store.dispatch({
          type: 'home/setTreeData',
          payload: {
            section: safeSection,
            level: safeLevel,
            treeImageUrl: '',
            courses: []
          }
        });
      }
      
      // Si treeData existe mais a des propriétés manquantes, les corriger
      if (treeData && (!treeData.section || !treeData.level)) {
        console.warn('safetyMiddleware: treeData.section ou treeData.level est invalide, correction automatique');
        store.dispatch({
          type: 'home/setTreeData',
          payload: {
            ...treeData,
            section: treeData.section || safeSection,
            level: treeData.level || safeLevel,
            treeImageUrl: treeData.treeImageUrl || '',
            courses: Array.isArray(treeData.courses) ? treeData.courses : []
          }
        });
      }
      
      // Vérifier les courses dans treeData
      if (treeData && (!Array.isArray(treeData.courses) || treeData.courses.some((c: any) => !c || typeof c !== 'object'))) {
        console.warn('safetyMiddleware: treeData.courses est invalide, correction automatique');
        
        // Corriger l'état courses en filtrant les entrées invalides
        const validCourses = Array.isArray(treeData.courses) 
          ? treeData.courses.filter((c: any) => c && typeof c === 'object')
          : [];
        
        store.dispatch({
          type: 'home/setTreeData',
          payload: {
            ...treeData,
            courses: validCourses
          }
        });
      }
    }

    return result;
  } catch (error) {
    // En cas d'erreur, nettoyer l'état complet du store
    console.error('safetyMiddleware: Erreur critique interceptée, réinitialisation de l\'état', error);
    
    // Réinitialiser l'état home à un état minimal mais valide
    store.dispatch({
      type: 'home/setTreeData', 
      payload: {
        section: DEFAULT_SECTION,
        level: DEFAULT_LEVEL,
        treeImageUrl: '',
        courses: []
      }
    });
    
    // Continuer avec l'action originale (si possible)
    return next(action);
  }
};

// Logger middleware pour tracer toutes les erreurs potentielles
const loggerMiddleware: Middleware = () => next => action => {
  try {
    return next(action);
  } catch (error) {
    console.error('ERROR IN REDUCER:', error);
    console.error('ACTION THAT CAUSED ERROR:', action);
    throw error; // Re-throw for safetyMiddleware to catch
  }
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }).concat(loggerMiddleware, safetyMiddleware),
});

// Créer le persistor pour redux-persist
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 