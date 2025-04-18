import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setUser } from '../store/slices/authSlice';
import { authService, firestoreService } from '../services/firebase/services';
import { UserData } from '../types/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * Hook personnalisé pour gérer l'authentification
 * Fournit les informations sur l'état de l'authentification et les fonctions associées
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  // Vérifier l'état de l'authentification au chargement de l'application
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true);
        
        if (firebaseUser) {
          // Utilisateur authentifié dans Firebase, récupérer les données complètes
          const userData = await firestoreService.getUserData(firebaseUser.uid);
          if (userData) {
            dispatch(setUser(userData));
          } else {
            // Si l'utilisateur est authentifié mais qu'on ne trouve pas ses données
            // On peut créer un profil minimal basé sur les infos Firebase
            const minimalUserData: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              dodji: 0,
              streak: 0,
              isDodjeOne: false,
              createdAt: new Date(),
              lastLogin: new Date(),
            };
            dispatch(setUser(minimalUserData));
          }
        } else {
          // Aucun utilisateur authentifié dans Firebase
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        dispatch(setUser(null));
      } finally {
        setIsLoading(false);
      }
    });

    // Nettoyer l'écouteur lorsque le composant est démonté
    return () => unsubscribe();
  }, [dispatch, auth]);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.login(email, password);
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.register(email, password, username);
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await authService.logout();
      dispatch(setUser(null));
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };
}; 