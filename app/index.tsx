import React, { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { useAppDispatch } from '../src/hooks/useRedux';
import { setTreeData, setError, setHomeDesign } from '../src/store/slices/homeSlice';
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
  const [initError, setInitError] = useState<string | null>(null);

  // Étape de nettoyage et d'initialisation des données
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Réinitialiser l'état de l'application pour éviter des états incohérents
        dispatch(setError(null));
        setInitError(null);
        
        // Initialiser le treeData avec un état minimal mais valide
        // pour éviter les erreurs undefined/null lors des accès aux propriétés
        console.log('Initialisation de l\'état treeData...');
        dispatch(setTreeData({
          section: 'Bourse',
          level: 'Débutant',
          treeImageUrl: '',
          courses: []
        }));
        
        // Initialiser le homeDesign avec un état minimal mais valide
        console.log('Initialisation de l\'état homeDesign...');
        dispatch(setHomeDesign({
          domaine: 'Bourse',
          niveau: 'Débutant',
          imageUrl: '',
          positions: {},
          parcours: {}
        }));
        
        // Attendre un court délai pour s'assurer que les réductions sont appliquées
        console.log('Attente pour l\'application des réductions...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Initialisation terminée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setInitError('Erreur lors de l\'initialisation de l\'application');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Vérification de l'authentification et mise à jour du message
  useEffect(() => {
    if (!authLoading && !isInitializing) {
      setMessage(isAuthenticated 
        ? 'Récupération des données utilisateur...' 
        : 'Vous devez vous connecter pour continuer');
    }
  }, [authLoading, isAuthenticated, isInitializing]);

  // Redirection conditionnelle après initialisation et vérification de l'authentification
  useEffect(() => {
    if (!isInitializing && !authLoading) {
      const timer = setTimeout(() => {
        if (initError) {
          // En cas d'erreur d'initialisation, ne pas rediriger
          console.error('Redirection annulée en raison d\'une erreur d\'initialisation');
          return;
        }
        
        if (isAuthenticated) {
          console.log('Utilisateur authentifié, redirection vers l\'accueil');
          router.replace('/(tabs)');
        } else {
          console.log('Utilisateur non authentifié, redirection vers la page de connexion');
          router.replace('/(auth)/login');
        }
      }, 1000); // Délai légèrement plus long pour s'assurer que tout est bien initialisé
      
      return () => clearTimeout(timer);
    }
  }, [isInitializing, authLoading, isAuthenticated, router, initError]);

  // Afficher un indicateur de chargement pendant l'initialisation
  // ou un message d'erreur si l'initialisation a échoué
  if (initError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{initError}</Text>
        <Text style={styles.loadingText}>Veuillez redémarrer l'application</Text>
      </View>
    );
  }
  
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
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: 'Arboria-Bold',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 30,
  }
}); 