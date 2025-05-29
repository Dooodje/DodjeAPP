import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useHomeOptimized } from '../../src/hooks/useHomeOptimized';
import { Level, Section } from '../../src/types/home';
import { router, useRouter, useFocusEffect } from 'expo-router';
import TreeBackground from '../../src/components/home/TreeBackground';
import type { TreeBackgroundRef } from '../../src/components/home/TreeBackground';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import CustomModal from '../../src/components/ui/CustomModal';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, runOnJS } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useQueryClient } from '@tanstack/react-query';
import ParcoursLockedModal from '../../src/components/ui/ParcoursLockedModal';
import { useStreak, StreakModal } from '../../src/streak';
import { LogoLoadingSpinner } from '../../src/components/ui/LogoLoadingSpinner';
import { AnimationDeblocageParcours } from '../../src/components/AnimationDeblocageParcours';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    modalData,
    isPreloading,
    preloadedCount,
    allImagesData
  } = useHomeOptimized();

  // Hook pour gérer les streaks de connexion
  const { modalData: streakModalData, closeModal: closeStreakModal, claimReward } = useStreak();

  // Log pour diagnostiquer la modal
  React.useEffect(() => {
    console.log('🏠 HomeScreen: Données de la modal streak:', streakModalData);
  }, [streakModalData]);

  // Animation pour le swipe
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  // Obtenir l'index du niveau actuel
  const currentLevelIndex = LEVELS.indexOf(currentLevel);

  // Précharger les données du niveau suivant et précédent
  useEffect(() => {
    // Toutes les données sont déjà préchargées au montage du composant
    // Plus besoin de précharger individuellement
    console.log(`📊 Niveau actuel: ${currentLevel}, données déjà disponibles`);
  }, [currentLevel, currentSection, currentLevelIndex]);

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

    // Les données sont déjà préchargées, donc changement instantané
    console.log(`🔄 Changement vers ${LEVELS[newIndex]} - données déjà préchargées`);
    changeLevel(LEVELS[newIndex]);
    translateX.value = withSpring(0);
  }, [currentLevel, changeLevel, translateX]);

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
    // Les données sont déjà préchargées, donc pas besoin de précharger à nouveau
    console.log(`🔄 Changement vers ${section} - données déjà préchargées`);
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
  const [selectedParcoursOrder, setSelectedParcoursOrder] = useState<number | null>(null);

  const handleParcoursUnlock = async (parcoursOrder: number) => {
    console.log('🔓 handleParcoursUnlock appelé avec ordre:', parcoursOrder);
    console.log('🏠 homeDesign disponible:', !!homeDesign);
    console.log('🌳 treeBackgroundRef disponible:', !!treeBackgroundRef.current);
    
    // Marquer immédiatement ce parcours comme en cours de déblocage pour éviter le flash visuel
    // MAIS ne pas faire disparaître le cadenas encore
    console.log('🔒 Marquage du parcours comme en cours de déblocage pour éviter le flash');
    setPendingUnlockParcoursOrder(parcoursOrder);
    
    // Trouver la position du parcours débloqué
    if (homeDesign?.positions && treeBackgroundRef.current) {
      console.log('✅ Conditions remplies, tentative de scroll...');
      try {
        // Scroller vers le parcours pour le centrer
        const screenPosition = await treeBackgroundRef.current.scrollToPosition(parcoursOrder);
        
        if (screenPosition) {
          console.log('📱 Position écran pour animation:', screenPosition);
          
          // Faire disparaître le cadenas ET lancer l'animation en même temps
          console.log('🎬 Lancement de l\'animation et disparition du cadenas...');
          setHideLockParcoursOrder(parcoursOrder);
          setUnlockAnimation({
            isVisible: true,
            position: screenPosition,
            parcoursOrder: parcoursOrder
          });
        } else {
          console.log('❌ Échec du scroll - position non trouvée');
          // Si le scroll échoue, annuler le marquage
          setPendingUnlockParcoursOrder(null);
        }
      } catch (error) {
        console.error('❌ Erreur lors du scroll pour animation:', error);
        // Si le scroll échoue, annuler le marquage
        setPendingUnlockParcoursOrder(null);
      }
    } else {
      console.log('❌ Conditions non remplies:');
      console.log('  - homeDesign.positions:', !!homeDesign?.positions);
      console.log('  - treeBackgroundRef.current:', !!treeBackgroundRef.current);
      // Si les conditions ne sont pas remplies, annuler le marquage
      setPendingUnlockParcoursOrder(null);
    }
  };

  // États pour l'animation de déblocage
  const [unlockAnimation, setUnlockAnimation] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    parcoursOrder: number;
  } | null>(null);

  // État pour empêcher le changement de design prématuré
  const [pendingUnlockParcoursOrder, setPendingUnlockParcoursOrder] = useState<number | null>(null);

  // Nouvel état pour contrôler quand le cadenas doit disparaître (seulement au moment de l'animation)
  const [hideLockParcoursOrder, setHideLockParcoursOrder] = useState<number | null>(null);

  // Référence au TreeBackground pour contrôler le scroll
  const treeBackgroundRef = useRef<TreeBackgroundRef>(null);

  // Gérer les déblocages venant du quiz via AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const checkPendingUnlockAnimation = async () => {
        try {
          console.log('🔍 Vérification des animations de déblocage en attente...');
          const pendingData = await AsyncStorage.getItem('pendingUnlockAnimation');
          
          if (pendingData) {
            console.log('📦 Données de déblocage trouvées:', pendingData);
            const unlockData = JSON.parse(pendingData);
            const { parcoursOrder, timestamp } = unlockData;
            
            // Vérifier que les données ne sont pas trop anciennes (max 30 secondes)
            const now = Date.now();
            const timeDiff = now - timestamp;
            console.log(`⏰ Différence de temps: ${timeDiff}ms`);
            
            if (timeDiff > 30000) {
              console.log('⚠️ Données de déblocage trop anciennes, suppression...');
              await AsyncStorage.removeItem('pendingUnlockAnimation');
              return;
            }
            
            // Nettoyer AsyncStorage immédiatement
            await AsyncStorage.removeItem('pendingUnlockAnimation');
            console.log('🧹 AsyncStorage nettoyé');
            
            // Marquer immédiatement le parcours comme en cours de déblocage pour éviter le flash visuel
            // Ceci doit être fait AVANT toute vérification pour garantir que le cadenas reste visible
            console.log('🔒 Marquage immédiat du parcours comme en cours de déblocage depuis AsyncStorage');
            setPendingUnlockParcoursOrder(parcoursOrder);
            
            // Fonction pour lancer l'animation une fois que les conditions sont remplies
            const launchAnimation = async () => {
              if (homeDesign?.positions && treeBackgroundRef.current) {
                console.log('✅ Conditions remplies pour animation depuis AsyncStorage');
                
                try {
                  // Scroller vers le parcours pour le centrer
                  const screenPosition = await treeBackgroundRef.current.scrollToPosition(parcoursOrder);
                  
                  if (screenPosition) {
                    console.log('📱 Position écran pour animation depuis AsyncStorage:', screenPosition);
                    
                    // Attendre 300ms avant de lancer l'animation (cadenas visible pendant ce temps)
                    console.log('⏳ Attente de 300ms avant de lancer l\'animation...');
                    setTimeout(() => {
                      console.log('🎬 Lancement de l\'animation depuis AsyncStorage après délai...');
                      // Faire disparaître le cadenas ET lancer l'animation en même temps
                      setHideLockParcoursOrder(parcoursOrder);
                      setUnlockAnimation({
                        isVisible: true,
                        position: screenPosition,
                        parcoursOrder: parcoursOrder
                      });
                    }, 300);
                  } else {
                    console.log('❌ Échec du scroll depuis AsyncStorage - position non trouvée');
                    // Si le scroll échoue, annuler le marquage
                    setPendingUnlockParcoursOrder(null);
                  }
                } catch (error) {
                  console.error('❌ Erreur lors du scroll pour animation depuis AsyncStorage:', error);
                  // Si le scroll échoue, annuler le marquage
                  setPendingUnlockParcoursOrder(null);
                }
              } else {
                console.log('❌ Conditions non remplies pour AsyncStorage, nouvelle tentative dans 50ms...');
                // Réessayer après un court délai si les conditions ne sont pas encore remplies
                setTimeout(launchAnimation, 50);
              }
            };
            
            // Lancer l'animation (avec retry automatique si nécessaire)
            launchAnimation();
          } else {
            console.log('📭 Aucune animation de déblocage en attente');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la vérification des animations en attente:', error);
        }
      };

      // Vérification immédiate puis avec un petit délai de sécurité
      checkPendingUnlockAnimation();
      const timeoutId = setTimeout(checkPendingUnlockAnimation, 100);
      
      return () => clearTimeout(timeoutId);
    }, [homeDesign])
  );

  // Gérer la fin de l'animation de déblocage
  const handleUnlockAnimationComplete = () => {
    console.log('🔓 Animation de déblocage terminée');
    setUnlockAnimation(null);
    
    // Maintenant on peut permettre le changement de design et réafficher le cadenas si nécessaire
    setPendingUnlockParcoursOrder(null);
    setHideLockParcoursOrder(null);
    
    // Rafraîchir les données pour mettre à jour le statut du parcours
    console.log('🔄 Rafraîchissement des données après animation de déblocage');
    fetchTreeData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LogoLoadingSpinner />
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
            setSelectedParcoursOrder(null);
          }}
          parcoursId={selectedParcoursId}
          userId={user.uid}
          onUnlock={handleParcoursUnlock}
          parcoursTitle={homeDesign?.parcours?.[selectedParcoursId]?.titre}
          parcoursOrder={selectedParcoursOrder || undefined}
        />
      )}

      {/* Modal de streak de connexion */}
      <StreakModal
        modalData={streakModalData}
        onClose={closeStreakModal}
        onClaimReward={claimReward}
      />

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
                        setSelectedParcoursOrder(order);
                        setIsModalVisible(true);
                      } else {
                        handlePositionPress(positionId, order);
                      }
                    }
                  }
                }
              }}
              parcours={homeDesign.parcours}
              imageDimensions={homeDesign.imageDimensions}
              isImageLoaded={homeDesign.isImageLoaded}
              currentSection={currentSection}
              currentLevel={currentLevel}
              allImagesData={allImagesData}
              pendingUnlockParcoursOrder={pendingUnlockParcoursOrder}
              hideLockParcoursOrder={hideLockParcoursOrder}
              ref={treeBackgroundRef}
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
      
      {/* Animation de déblocage de parcours */}
      {unlockAnimation && (
        <AnimationDeblocageParcours
          isVisible={unlockAnimation.isVisible}
          position={unlockAnimation.position}
          onAnimationComplete={handleUnlockAnimationComplete}
        />
      )}
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
  subLoadingText: {
    color: '#CCCCCC',
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
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
