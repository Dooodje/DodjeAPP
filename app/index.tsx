import React, { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { useAppDispatch } from '../src/hooks/useRedux';
import { setTreeData, setError } from '../src/store/slices/homeSlice';
import { useAuth } from '../src/hooks/useAuth';

/**
 * Page d'entrée de l'application qui sert d'écran de chargement,
 * de nettoyage de l'état et de point de décision pour la redirection
 */
export default function Index() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [message, setMessage] = useState('Initialisation de l\'application...');

  // Étape de nettoyage et d'initialisation des données
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Réinitialiser l'état de l'application pour éviter des états incohérents
        dispatch(setError(null));
        
        // Initialiser le treeData avec un état minimal mais valide
        // pour éviter les erreurs undefined/null lors des accès aux propriétés
        dispatch(setTreeData({
          section: 'Bourse',
          level: 'Débutant',
          treeImageUrl: '',
          courses: []
        }));
        
        // Attendre un court délai pour s'assurer que les réductions sont appliquées
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Vérification de l'authentification et mise à jour du message
  useEffect(() => {
    if (!authLoading) {
      setMessage(isAuthenticated 
        ? 'Récupération des données utilisateur...' 
        : 'Vous devez vous connecter pour continuer');
    }
  }, [authLoading, isAuthenticated]);

  // Redirection conditionnelle après initialisation et vérification de l'authentification
  useEffect(() => {
    if (!isInitializing && !authLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log('Utilisateur authentifié, redirection vers l\'accueil');
          router.replace('/(tabs)');
        } else {
          console.log('Utilisateur non authentifié, redirection vers la page de connexion');
          router.replace('/(auth)/login');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isInitializing, authLoading, isAuthenticated, router]);

  // Afficher un indicateur de chargement pendant l'initialisation
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#059212" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
  },
  loadingText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Book',
    fontSize: 16,
  }
}); 