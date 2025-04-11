import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setUser } from '../store/slices/authSlice';
import { authService } from '../services/auth';

/**
 * Hook personnalisé pour gérer l'authentification
 * Fournit les informations sur l'état de l'authentification et les fonctions associées
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'état de l'authentification au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          dispatch(setUser(currentUser));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Fonction de déconnexion simplifiée
  const logout = async () => {
    try {
      await authService.logout();
      // Au lieu d'utiliser clearUser, nous allons utiliser setUser(null)
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
    logout
  };
}; 