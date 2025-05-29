import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { usePreloadCache, globalImageCache } from '../hooks/usePreloadCache';
import { LogoDodje } from '../components/LogoDodje';
import { Section, Level } from '../types/home';

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
  const { user, isLoading: authLoading } = useAuth();
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

  // États pour les animations
  const [logoScale] = useState(new Animated.Value(0.8));
  const [progressOpacity] = useState(new Animated.Value(0));

  // Calculer le pourcentage de progression
  const progressPercentage = totalItems > 0 ? Math.round((progress / totalItems) * 100) : 0;

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

  // Naviguer vers l'écran d'ouverture quand le chargement ET le pré-montage sont terminés
  useEffect(() => {
    if (isComplete && !authLoading && preloadingComplete) {
      console.log('✅ Préchargement et pré-montage terminés, navigation vers /opening');
      setTimeout(() => {
        router.replace('/opening');
      }, 500); // Petit délai pour une transition fluide
    }
  }, [isComplete, authLoading, preloadingComplete]);

  // Fonction pour obtenir le texte de chargement approprié
  const getLoadingText = () => {
    if (authLoading) {
      return "Authentification...";
    }
    
    if (!user) {
      return "Chargement des données statiques...";
    }
    
    if (isLoading) {
      return "Chargement des données utilisateur...";
    }
    
    if (isComplete && shouldPreloadImages && !preloadingComplete) {
      return "Pré-montage des images...";
    }
    
    if (isComplete && preloadingComplete) {
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
      
      {/* Logo animé */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
        <LogoDodje width={120} height={120} />
      </Animated.View>

      {/* Texte de chargement */}
      <Text style={styles.loadingText}>
        {getLoadingText()}
      </Text>

      {/* Barre de progression animée */}
      <Animated.View style={[styles.progressContainer, { opacity: progressOpacity }]}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </Animated.View>

      {/* Détails du chargement */}
      {(isLoading || isComplete) && (
        <Animated.View style={[styles.detailsContainer, { opacity: progressOpacity }]}>
          <Text style={styles.detailsText}>
            Données: {cacheStats.staticDataCached}/{totalStaticData}
          </Text>
          <Text style={styles.detailsText}>
            Images: {cacheStats.imagesCached}/{totalImages}
          </Text>
          {user && (
            <Text style={styles.detailsText}>
              Données utilisateur: {loadedDataCount - cacheStats.staticDataCached}
            </Text>
          )}
        </Animated.View>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <Text style={styles.errorText}>
          Erreur: {error}
        </Text>
      )}

      {/* Message d'attente si pas d'utilisateur */}
      {!authLoading && !user && (
        <Text style={styles.waitingText}>
          Veuillez vous connecter pour continuer
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  detailsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  detailsText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  waitingText: {
    color: '#ffeb3b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
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