import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { usePreloadCache, globalImageCache } from '../hooks/usePreloadCache';
import { usePreopeningContext } from '../contexts/PreopeningContext';
import { LogoDodje } from '../components/LogoDodje';
import { Section, Level } from '../types/home';
import { iapService } from '../services/iap';

// Constantes pour AsyncStorage (mêmes que dans login.tsx)
const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_CREDENTIALS_KEY = 'savedCredentials';

// Composant invisible pour pré-monter toutes les images en mémoire
const ImagePreloader: React.FC<{ 
  shouldPreload: boolean;
}> = ({ shouldPreload }) => {
  if (!shouldPreload) return null;

  const ALL_SECTIONS: Section[] = ['Bourse', 'Crypto'];
  const ALL_LEVELS: Level[] = ['Débutant', 'Avancé', 'Expert'];

  console.log('🖼️ Pré-montage des images en cours...');
  console.log('📊 Images disponibles dans globalImageCache:', globalImageCache.size);

  return (
    <View style={styles.imagePreloader}>
      {ALL_SECTIONS.map(section => 
        ALL_LEVELS.map(level => {
          const key = `${section}-${level}`;
          
          // Utiliser directement globalImageCache
          const imageData = globalImageCache.get(key);
          
          if (!imageData?.url || !imageData?.isLoaded) {
            console.log(`⚠️ Image ${key} non disponible pour pré-montage`);
            console.log(`📊 Données image ${key}:`, imageData);
            return null;
          }
          
          console.log(`✅ Pré-montage de l'image ${key}: ${imageData.url.substring(0, 50)}...`);
          
          return (
            <Image
              key={key}
              source={{ uri: imageData.url }}
              style={styles.preloadedImage}
              resizeMode="contain"
              onLoad={() => console.log(`🎯 Image ${key} pré-montée en mémoire`)}
            />
          );
        })
      ).flat()}
    </View>
  );
};

export default function PreOpening() {
  const { user, isLoading: authLoading, login } = useAuth();
  const { markPreopeningComplete } = usePreopeningContext();
  const {
    isLoading,
    isComplete,
    progress,
    loadedDataCount,
    loadedImagesCount,
    totalItems,
    error,
    cacheStats
  } = usePreloadCache();

  // État pour contrôler le pré-montage
  const [shouldPreloadImages, setShouldPreloadImages] = useState(false);
  const [preloadingComplete, setPreloadingComplete] = useState(false);
  
  // État pour l'initialisation IAP
  const [isIAPInitialized, setIsIAPInitialized] = useState(false);

  // État pour contrôler l'animation de zoom out
  const [shouldZoomOut, setShouldZoomOut] = useState(false);
  
  // État pour contrôler la visibilité du logo après l'animation
  const [isLogoVisible, setIsLogoVisible] = useState(true);

  // États pour l'authentification automatique
  const [autoAuthAttempted, setAutoAuthAttempted] = useState(false);
  const [autoAuthInProgress, setAutoAuthInProgress] = useState(false);

  // États pour les animations
  const [logoScale] = useState(new Animated.Value(0.8));
  const [progressOpacity] = useState(new Animated.Value(0));

  // Calculer le pourcentage de progression
  const progressPercentage = totalItems > 0 ? Math.round((progress / totalItems) * 100) : 0;

  // Authentification automatique au démarrage
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (autoAuthAttempted || user) return;
      
      try {
        setAutoAuthAttempted(true);
        console.log('🔐 Vérification des identifiants sauvegardés...');
        
        const rememberMeValue = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (rememberMeValue === 'true') {
          const savedCredentials = await AsyncStorage.getItem(SAVED_CREDENTIALS_KEY);
          if (savedCredentials) {
            const { email, password } = JSON.parse(savedCredentials);
            console.log('✅ Identifiants trouvés, tentative de connexion automatique...');
            
            setAutoAuthInProgress(true);
            await login(email, password);
            console.log('🎯 Connexion automatique réussie !');
          } else {
            console.log('⚠️ Option "Rester connecté" activée mais aucun identifiant sauvegardé');
          }
        } else {
          console.log('ℹ️ Aucune connexion automatique demandée');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la connexion automatique:', error);
        // En cas d'erreur, supprimer les identifiants sauvegardés
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(SAVED_CREDENTIALS_KEY);
      } finally {
        setAutoAuthInProgress(false);
      }
    };

    attemptAutoLogin();
  }, [user, login, autoAuthAttempted]);

  // Initialiser le service IAP en parallèle
  useEffect(() => {
    const initializeIAP = async () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try {
          await iapService.initialize();
          console.log('Service IAP initialisé avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'initialisation du service IAP:', error);
        }
      }
      // Dans tous les cas, marquer comme initialisé pour ne pas bloquer l'application
      setIsIAPInitialized(true);
    };

    initializeIAP();
  }, []);

  // Démarrer les animations au montage
  useEffect(() => {
    // Animation du logo
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animation de la barre de progression (après un délai)
    setTimeout(() => {
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);
  }, []);

  // Démarrer le pré-montage des images quand le chargement est presque terminé
  useEffect(() => {
    if (isComplete && cacheStats.imagesCached >= 6 && !shouldPreloadImages) {
      console.log('🚀 Démarrage du pré-montage des images...');
      setShouldPreloadImages(true);
      
      // Attendre un peu que le pré-montage se fasse
      setTimeout(() => {
        console.log('✅ Pré-montage des images terminé');
        setPreloadingComplete(true);
      }, 1000); // 1 seconde pour que toutes les images soient pré-montées
    }
  }, [isComplete, cacheStats.imagesCached, shouldPreloadImages]);

  // Démarrer l'animation de zoom out quand tous les chargements sont terminés
  useEffect(() => {
    if (isComplete && !authLoading && !autoAuthInProgress && autoAuthAttempted && preloadingComplete && isIAPInitialized && !shouldZoomOut) {
      console.log('✅ Tous les chargements terminés, démarrage du zoom out du logo');
      setShouldZoomOut(true);
      
      // Animation de zoom out rapide et au maximum
      Animated.timing(logoScale, {
        toValue: 0, // Zoom out au maximum pour faire disparaître le logo
        duration: 300, // Animation rapide (300ms)
        useNativeDriver: true,
      }).start(() => {
        // Masquer définitivement le logo pour éviter qu'il réapparaisse
        setIsLogoVisible(false);
        
        // IMPORTANT: Marquer le preopening comme terminé AVANT la navigation
        // Cela déclenchera la création des listeners Firestore
        markPreopeningComplete();
        
        // Navigation conditionnelle selon l'état de l'utilisateur
        if (user) {
          // Utilisateur connecté -> aller vers l'application
          console.log('🎯 Utilisateur connecté, navigation vers /(tabs)');
          router.replace('/(tabs)');
        } else {
          // Aucun utilisateur connecté -> retour à l'opening
          console.log('🔄 Aucun utilisateur connecté, redirection vers /opening');
          router.replace('/opening');
        }
      });
    }
  }, [isComplete, authLoading, autoAuthInProgress, autoAuthAttempted, preloadingComplete, isIAPInitialized, shouldZoomOut, markPreopeningComplete, user]);

  // Fonction pour obtenir le texte de chargement approprié
  const getLoadingText = () => {
    if (autoAuthInProgress) {
      return "Connexion automatique...";
    }
    
    if (authLoading) {
      return "Authentification...";
    }
    
    if (!user && !autoAuthAttempted) {
      return "Vérification des identifiants...";
    }
    
    if (!user && autoAuthAttempted) {
      return "Chargement des données...";
    }
    
    if (isLoading) {
      return "Chargement des données utilisateur...";
    }
    
    if (isComplete && shouldPreloadImages && !preloadingComplete) {
      return "Pré-montage des images...";
    }
    
    if (isComplete && preloadingComplete && !user) {
      return "Redirection vers l'accueil...";
    }
    
    if (isComplete && preloadingComplete && user) {
      return "Chargement terminé !";
    }
    
    return "Initialisation...";
  };

  // Totaux pour l'affichage (6 combinaisons section/niveau)
  const totalStaticData = 6;
  const totalImages = 6;

  return (
    <View style={styles.container}>
      {/* Pré-montage invisible de toutes les images pour les garder en mémoire */}
      <ImagePreloader shouldPreload={shouldPreloadImages} />
      
      {/* Logo centré - seulement visible si isLogoVisible est true */}
      {isLogoVisible && (
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <LogoDodje width={225} height={225} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    // Pas de margin, le logo est parfaitement centré
  },
  imagePreloader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0,
    zIndex: -1,
  },
  preloadedImage: {
    width: '50%',
    height: '50%',
  },
}); 