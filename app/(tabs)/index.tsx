import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useHomeOptimized } from '../../src/hooks/useHomeOptimized';
import { Level, Section } from '../../src/types/home';
import { router, useRouter } from 'expo-router';
import TreeBackground from '../../src/components/home/TreeBackground';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import CustomModal from '../../src/components/ui/CustomModal';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, runOnJS } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useQueryClient } from '@tanstack/react-query';
import ParcoursLockedModal from '../../src/components/ui/ParcoursLockedModal';

const LEVELS: Level[] = ['Débutant', 'Avancé', 'Expert'];
const { width } = Dimensions.get('window');

interface NavigationArrowProps {
  direction: 'left' | 'right';
  disabled: boolean;
  onPress: () => void;
}

// Composant de flèche personnalisé
const NavigationArrow: React.FC<NavigationArrowProps> = ({ direction, disabled, onPress }) => {
  // Ne pas rendre la flèche du tout si elle est désactivée
  if (disabled) return null;
  
  return (
    <TouchableOpacity 
      style={[
        styles.arrowButton,
        direction === 'left' ? styles.leftArrowButton : styles.rightArrowButton
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Svg width={50} height={50} viewBox="0 0 50 50">
        {direction === 'left' ? (
          <Path
            d="M32 10L18 25L32 40"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : (
          <Path
            d="M18 10L32 25L18 40"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
    </TouchableOpacity>
  );
};

interface PositionIndicatorsProps {
  total: number;
  current: number;
}

// Composant d'indicateurs de position
const PositionIndicators: React.FC<PositionIndicatorsProps> = ({ total, current }) => {
  return (
    <View style={styles.indicatorsContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View 
          key={index}
          style={[
            styles.indicator,
            current === index && styles.activeIndicator
          ]}
        >
          {current === index ? (
            <Svg height={16} width={16} viewBox="0 0 16 16">
              <Circle 
                cx="8" 
                cy="8" 
                r="7" 
                fill="#F3FF90"
              />
            </Svg>
          ) : (
            <Svg height={12} width={12} viewBox="0 0 12 12">
              <Circle 
                cx="6" 
                cy="6" 
                r="5" 
                fill="rgba(255, 255, 255, 0.3)"
              />
            </Svg>
          )}
        </View>
      ))}
    </View>
  );
};

/**
 * Page d'accueil principale de l'application
 * Affiche l'arbre d'apprentissage avec les parcours selon le niveau et la section
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Utiliser le hook optimisé au lieu du hook standard
  const { 
    currentSection, 
    currentLevel, 
    homeDesign,
    isLoading: loading, 
    error,
    streak,
    dodji,
    changeSection,
    changeLevel,
    handlePositionPress,
    fetchTreeData,
    prefetchNextLevelData,
    isModalVisible,
    setIsModalVisible,
    modalData
  } = useHomeOptimized();

  // Animation pour le swipe
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  // Obtenir l'index du niveau actuel
  const currentLevelIndex = LEVELS.indexOf(currentLevel);

  // Précharger les données du niveau suivant et précédent
  useEffect(() => {
    // Précharger le niveau suivant si disponible
    if (currentLevelIndex < LEVELS.length - 1) {
      const nextLevel = LEVELS[currentLevelIndex + 1];
      prefetchNextLevelData(nextLevel, currentSection);
    }
    
    // Précharger le niveau précédent si disponible
    if (currentLevelIndex > 0) {
      const prevLevel = LEVELS[currentLevelIndex - 1];
      prefetchNextLevelData(prevLevel, currentSection);
    }
  }, [currentLevel, currentSection, prefetchNextLevelData, currentLevelIndex]);

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

    // Précharger davantage en fonction de la nouvelle direction
    if (direction === 'next' && newIndex < LEVELS.length - 1) {
      prefetchNextLevelData(LEVELS[newIndex + 1], currentSection);
    } else if (direction === 'prev' && newIndex > 0) {
      prefetchNextLevelData(LEVELS[newIndex - 1], currentSection);
    }

    changeLevel(LEVELS[newIndex]);
    translateX.value = withSpring(0);
  }, [currentLevel, changeLevel, translateX, currentSection, prefetchNextLevelData]);

  // Configurer le geste de swipe
  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX + context.value.x;
    })
    .onEnd((event) => {
      'worklet';
      if (Math.abs(event.velocityX) > 500) {
        if (event.velocityX > 0 && currentLevelIndex > 0) {
          // Swipe vers la droite (niveau précédent)
          runOnJS(handleLevelChange)('prev');
        } else if (event.velocityX < 0 && currentLevelIndex < LEVELS.length - 1) {
          // Swipe vers la gauche (niveau suivant)
          runOnJS(handleLevelChange)('next');
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Charger les données au premier rendu avec moins d'appels
  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  // Fonction pour gérer le changement de section (Bourse/Crypto)
  const handleSectionChange = (section: Section) => {
    // Précharger les données du nouveau section pour les différents niveaux
    LEVELS.forEach(level => {
      prefetchNextLevelData(level, section);
    });
    
    changeSection(section);
  };

  // Naviguer vers la page d'un parcours
  const navigateToCourse = (courseId: string) => {
    const parcoursStatus = homeDesign?.parcours?.[courseId]?.status;
    if (parcoursStatus === 'blocked') {
      Alert.alert(
        "Parcours verrouillé 🔒",
        "Ce parcours n'est pas encore disponible. Vous devez d'abord terminer les parcours précédents pour y accéder.",
        [
          {
            text: "Compris",
            style: "default"
          }
        ],
        {
          cancelable: true,
        }
      );
      return;
    }
    router.push(`/course/${courseId}`);
  };

  // Wrapper pour fetchTreeData qui ne prend pas de paramètres pour éviter l'erreur du linter
  const handleRetry = useCallback(() => {
    // Invalider le cache pour forcer un rechargement frais
    queryClient.invalidateQueries({ queryKey: ['homeDesign'] });
    fetchTreeData();
  }, [fetchTreeData, queryClient]);

  const [selectedParcoursId, setSelectedParcoursId] = useState<string | null>(null);

  const handleParcoursUnlock = () => {
    if (selectedParcoursId) {
      router.push(`/course/${selectedParcoursId}`);
    }
  };

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
      {/* Modal pour les parcours bloqués */}
      {selectedParcoursId && user && (
        <ParcoursLockedModal
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedParcoursId(null);
          }}
          parcoursId={selectedParcoursId}
          userId={user.uid}
          onUnlock={handleParcoursUnlock}
          parcoursTitle={homeDesign?.parcours?.[selectedParcoursId]?.titre}
        />
      )}

      {/* Arbre de parcours avec le design dynamique */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.treeContainer, animatedStyle]}>
          {homeDesign ? (
            <TreeBackground
              imageUrl={homeDesign.imageUrl}
              positions={homeDesign.positions}
              onPositionPress={(positionId, order) => {
                if (order !== undefined && homeDesign.parcours) {
                  const orderStr = order.toString();
                  if (homeDesign.parcours[orderStr]) {
                    const parcours = homeDesign.parcours[orderStr];
                    if (parcours.id) {
                      if (parcours.status === 'blocked') {
                        setSelectedParcoursId(parcours.id);
                        setIsModalVisible(true);
                      } else {
                        handlePositionPress(positionId, order);
                      }
                    }
                  }
                }
              }}
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

      {/* Flèche gauche */}
      <NavigationArrow 
        direction="left" 
        disabled={currentLevelIndex === 0} 
        onPress={() => handleLevelChange('prev')}
      />
      
      {/* Flèche droite */}
      <NavigationArrow 
        direction="right" 
        disabled={currentLevelIndex === LEVELS.length - 1} 
        onPress={() => handleLevelChange('next')}
      />
      
      {/* Indicateurs de position */}
      <PositionIndicators total={LEVELS.length} current={currentLevelIndex} />
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
  arrowButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginTop: -25,
  },
  leftArrowButton: {
    left: 20,
  },
  rightArrowButton: {
    right: 20,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 100, // Remonté pour être visible au-dessus du menu de navigation
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  indicator: {
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    transform: [{ scale: 1.2 }],
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
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
