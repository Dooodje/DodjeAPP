import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useHome } from '../../src/hooks/useHome';
import { Level, Section } from '../../src/types/home';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import TreeBackground from '../../src/components/home/TreeBackground';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

const LEVELS: Level[] = ['Débutant', 'Avancé', 'Expert'];
const { width } = Dimensions.get('window');

/**
 * Page d'accueil principale de l'application
 * Affiche l'arbre d'apprentissage avec les parcours selon le niveau et la section
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    currentSection, 
    currentLevel, 
    homeDesign,
    loading, 
    error,
    streak,
    dodji,
    changeSection,
    changeLevel,
    handlePositionPress,
    fetchTreeData
  } = useHome();

  // Animation pour le swipe
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  // Obtenir l'index du niveau actuel
  const currentLevelIndex = LEVELS.indexOf(currentLevel);

  // Gérer le changement de niveau avec animation
  const handleLevelChange = useCallback((direction: 'next' | 'prev') => {
    const currentIndex = LEVELS.indexOf(currentLevel);
    let newIndex;

    if (direction === 'next' && currentIndex < LEVELS.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    changeLevel(LEVELS[newIndex]);
    translateX.value = withSpring(0);
  }, [currentLevel, changeLevel]);

  // Configurer le geste de swipe
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value.x;
    })
    .onEnd((event) => {
      if (Math.abs(event.velocityX) > 500) {
        if (event.velocityX > 0 && currentLevelIndex > 0) {
          // Swipe vers la droite (niveau précédent)
          handleLevelChange('prev');
        } else if (event.velocityX < 0 && currentLevelIndex < LEVELS.length - 1) {
          // Swipe vers la gauche (niveau suivant)
          handleLevelChange('next');
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Charger les données au premier rendu
  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  // Fonction pour gérer le changement de section (Bourse/Crypto)
  const handleSectionChange = (section: Section) => {
    changeSection(section);
  };

  // Fonction pour naviguer vers la page d'un parcours
  const navigateToCourse = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  // Wrapper pour fetchTreeData qui ne prend pas de paramètres pour éviter l'erreur du linter
  const handleRetry = useCallback(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06D001" />
        <Text style={styles.loadingText}>Chargement de votre parcours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Arbre de parcours avec le design dynamique */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.treeContainer, animatedStyle]}>
          {homeDesign ? (
            <TreeBackground
              imageUrl={homeDesign.imageUrl}
              positions={homeDesign.positions}
              onPositionPress={handlePositionPress}
              parcours={homeDesign.parcours}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun parcours disponible pour le moment</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Header par-dessus l'arbre de parcours */}
      <GlobalHeader
        level={1}
        points={dodji}
        title={currentLevel.toUpperCase()}
        showSectionSelector
        selectedSection={currentSection}
        onSectionChange={handleSectionChange}
      />

      {/* Flèches de navigation */}
      <View style={styles.navigationContainer}>
        {currentLevelIndex > 0 && currentLevel !== 'Débutant' && (
          <TouchableOpacity
            style={[styles.navButton, styles.leftButton]}
            onPress={() => handleLevelChange('prev')}
          >
            <MaterialCommunityIcons name="chevron-left" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {currentLevelIndex < LEVELS.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.rightButton]}
            onPress={() => handleLevelChange('next')}
          >
            <MaterialCommunityIcons name="chevron-right" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  treeContainer: {
    flex: 1,
    width: '100%',
  },
  navigationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(6, 208, 1, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#06D001',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
  }
});
