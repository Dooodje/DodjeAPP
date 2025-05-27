import { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setUser } from '@/store/slices/authSlice';
import { authService, firestoreService } from '@/services';
import { UserData } from '@/types/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { ParcoursInitializationService } from '@/services/businessLogic/ParcoursInitializationService';
import { UserInitializationService } from '@/services/businessLogic/UserInitializationService';

// Durée de vie d'un token (en millisecondes) - 45 minutes
// Note: Firebase ID tokens expirent après 1 heure, mais on rafraîchit 15 minutes avant
const TOKEN_LIFESPAN_MS = 45 * 60 * 1000;

// Intervalle de vérification de secours (15 minutes)
const TOKEN_CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Hook personnalisé pour gérer l'authentification
 * Fournit les informations sur l'état de l'authentification et les fonctions associées
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const auth = getAuth();
  
  // Utilisation de useRef pour stocker les timers afin de les nettoyer correctement
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tokenCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de déconnexion définie avant d'être utilisée dans les callbacks
  const logout = useCallback(async () => {
    try {
      console.log('Tentative de déconnexion');
      
      // Nettoyer les timers de rafraîchissement lors de la déconnexion
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
        tokenRefreshTimerRef.current = null;
      }
      if (tokenCheckTimerRef.current) {
        clearInterval(tokenCheckTimerRef.current);
        tokenCheckTimerRef.current = null;
      }
      
      await authService.logout();
      console.log('Déconnexion réussie');
      dispatch(setUser(null));
      setTokenValid(false);
      setLastError(null);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      setLastError(error.message || 'Erreur lors de la déconnexion');
      throw error;
    }
  }, [dispatch]);

  // Fonction pour rafraîchir le token
  const refreshTokenAsync = useCallback(async () => {
    console.log('Planification d\'un rafraîchissement de token...');
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        setTokenValid(true);
        console.log('Token rafraîchi avec succès, planification du prochain rafraîchissement');
        
        // Programmation du prochain rafraîchissement gérée dans scheduleTokenRefresh
        return true;
      } else {
        console.warn('Échec du rafraîchissement du token');
        setTokenValid(false);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      setTokenValid(false);
      return false;
    }
  }, []);

  // Fonction pour planifier le prochain rafraîchissement de token
  const scheduleTokenRefresh = useCallback(() => {
    // Nettoyer le timer existant
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
    }
    
    // Définir un nouveau timer pour le rafraîchissement
    tokenRefreshTimerRef.current = setTimeout(async () => {
      const success = await refreshTokenAsync();
      if (success) {
        // Replanifier le prochain rafraîchissement seulement si celui-ci a réussi
        scheduleTokenRefresh();
      }
    }, TOKEN_LIFESPAN_MS);
    
    console.log(`Token refresh planifié dans ${TOKEN_LIFESPAN_MS / 60000} minutes`);
  }, [refreshTokenAsync]);

  // Vérification périodique de la validité du token (filet de sécurité)
  useEffect(() => {
    if (!user) return;

    // Planifier immédiatement un rafraîchissement de token
    scheduleTokenRefresh();
    
    // Vérifier la validité du token régulièrement (comme filet de sécurité)
    tokenCheckTimerRef.current = setInterval(async () => {
      console.log('Vérification de secours de la validité du token...');
      const isValid = await authService.isTokenValid();
      setTokenValid(isValid);
      
      if (!isValid) {
        console.warn('Token invalide détecté lors de la vérification de secours');
        // Si le token n'est plus valide, tenter un rafraîchissement
        const refreshed = await authService.refreshToken();
        if (!refreshed) {
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          console.error('Échec du rafraîchissement de secours, déconnexion');
          await logout();
        } else {
          console.log('Token rafraîchi avec succès lors de la vérification de secours');
          setTokenValid(true);
        }
      }
    }, TOKEN_CHECK_INTERVAL_MS);

    // Nettoyer les timers lors du démontage
    return () => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
      if (tokenCheckTimerRef.current) {
        clearInterval(tokenCheckTimerRef.current);
      }
    };
  }, [user, scheduleTokenRefresh, logout]);

  // Vérifier l'état de l'authentification au chargement de l'application
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true);
        
        if (firebaseUser) {
          // Utilisateur authentifié dans Firebase
          console.log('Utilisateur authentifié dans Firebase:', firebaseUser.uid);
          
          try {
            // Utiliser la fonction ensureUserExists pour garantir qu'un profil existe
            const userData = await firestoreService.ensureUserExists(firebaseUser);
            console.log('Profil utilisateur récupéré avec succès:', userData.uid);
            dispatch(setUser(userData));
            setTokenValid(true);
            setLastError(null);
            
            // Démarrer le cycle de rafraîchissement du token
            scheduleTokenRefresh();

            // Vérifier si c'est la première connexion
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              // Première connexion : initialiser les données utilisateur
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
              });

              // Initialiser les statuts des parcours et autres données utilisateur
              await Promise.all([
                ParcoursInitializationService.initializeUserParcours(firebaseUser.uid),
                UserInitializationService.initializeUserDodji(firebaseUser.uid),
                UserInitializationService.initializeUserVideoStatus(firebaseUser.uid)
              ]);
            } else {
              // Mettre à jour la date de dernière connexion
              await setDoc(userDocRef, {
                lastLogin: new Date().toISOString()
              }, { merge: true });
            }
          } catch (profileError: any) {
            console.error('Erreur lors de la récupération/création du profil:', profileError);
            
            // Si c'est une erreur de permission, stocker l'erreur mais garder l'utilisateur authentifié
            if (profileError.code === 'permission-denied' || 
                (profileError.message && profileError.message.includes('permission'))) {
              setLastError('Permissions insuffisantes pour accéder à votre profil');
              
              // Créer un userData minimal à partir des infos de Firebase Auth
              const minimalUserData: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
                photoURL: firebaseUser.photoURL,
                dodji: 0,
                streak: 0,
                isDodjeOne: false,
                level: 1,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              };
              
              dispatch(setUser(minimalUserData));
              setTokenValid(true);
              
              // Démarrer le cycle de rafraîchissement du token même avec userData minimal
              scheduleTokenRefresh();
            } else {
              // Pour les autres erreurs, considérer comme non authentifié
              dispatch(setUser(null));
              setTokenValid(false);
              setLastError(profileError.message || 'Erreur de profil utilisateur');
            }
          }
        } else {
          // Aucun utilisateur authentifié dans Firebase
          console.log('Aucun utilisateur authentifié dans Firebase');
          dispatch(setUser(null));
          setTokenValid(false);
          setLastError(null);
        }
      } catch (error: any) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        dispatch(setUser(null));
        setTokenValid(false);
        setLastError(error.message || 'Erreur d\'authentification');
      } finally {
        setIsLoading(false);
      }
    });

    // Nettoyer l'écouteur lorsque le composant est démonté
    return () => unsubscribe();
  }, [dispatch, auth, scheduleTokenRefresh]);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setLastError(null);
      console.log('Tentative de connexion pour:', email);
      const userData = await authService.login(email, password);
      console.log('Connexion réussie pour:', userData.uid);
      dispatch(setUser(userData));
      setTokenValid(true);
      
      // Démarrer le cycle de rafraîchissement du token après connexion
      scheduleTokenRefresh();
      
      // NE PAS vérifier le streak ici - cela sera fait sur la page d'accueil
      // pour éviter les conflits avec la navigation
      
      return userData;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setLastError(error.message || 'Erreur de connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      setLastError(null);
      console.log('Tentative d\'inscription pour:', email);
      const userData = await authService.register(email, password, username);
      console.log('Inscription réussie pour:', userData.uid);
      
      // Initialiser les statuts de l'utilisateur
      await UserInitializationService.initializeUser(userData.uid);
      console.log('Statuts initialisés avec succès pour:', userData.uid);
      
      dispatch(setUser(userData));
      setTokenValid(true);
      
      // Démarrer le cycle de rafraîchissement du token après inscription
      scheduleTokenRefresh();
      
      return userData;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setLastError(error.message || 'Erreur d\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      setLastError(null);
      console.log('Tentative de réinitialisation du mot de passe pour:', email);
      await authService.resetPassword(email);
      console.log('Email de réinitialisation envoyé à:', email);
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      setLastError(error.message || 'Erreur lors de la réinitialisation du mot de passe');
      throw error;
    }
  };

  // Vérifier explicitement la validité du token et le rafraîchir au besoin
  const checkTokenValidity = async (): Promise<boolean> => {
    try {
      const isValid = await authService.isTokenValid();
      setTokenValid(isValid);
      
      // Si le token n'est pas valide, tenter un rafraîchissement
      if (!isValid) {
        console.log('Token invalide détecté, tentative de rafraîchissement...');
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          console.log('Token rafraîchi avec succès lors de la vérification manuelle');
          setTokenValid(true);
          // Reprogrammer le prochain rafraîchissement
          scheduleTokenRefresh();
          return true;
        }
      }
      
      return isValid;
    } catch (error: any) {
      console.error('Erreur lors de la vérification du token:', error);
      setLastError(error.message || 'Erreur lors de la vérification du token');
      return false;
    }
  };

  return {
    user,
    isAuthenticated: !!user && tokenValid,
    isLoading,
    isTokenValid: tokenValid,
    error: lastError,
    login,
    register,
    logout,
    resetPassword,
    checkTokenValidity,
    refreshToken: refreshTokenAsync // Exposer la fonction de rafraîchissement manuel
  };
}; 