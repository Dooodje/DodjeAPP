import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../../types/home';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DailyStrike from '../DailyStrike';
import SymbolBlancComponent from '../SymboleBlanc';
import { useUserStreak } from '../../hooks/useUserStreak';
import { useStreak, StreakModal } from '../../streak';

interface GlobalHeaderProps {
  level?: number;
  points?: number;
  title?: string;
  showSectionSelector?: boolean;
  selectedSection?: Section;
  onSectionChange?: (section: Section) => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  level = 1,
  points = 2170,
  title = 'DÉBUTANT',
  showSectionSelector = false,
  selectedSection = 'Bourse',
  onSectionChange,
  showBackButton = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const { streak } = useUserStreak();
  const { modalData: streakModalData, closeModal: closeStreakModal, claimReward, showStreakInfo } = useStreak();
  const router = useRouter();
  
  // Animation du compteur de points
  const animatedPoints = useRef(new Animated.Value(points)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current;
  const displayedPoints = useRef(points);
  const [currentDisplayPoints, setCurrentDisplayPoints] = React.useState(points);
  
  // Animer le changement de points
  useEffect(() => {
    if (points !== displayedPoints.current) {
      const previousPoints = displayedPoints.current;
      displayedPoints.current = points;
      
      console.log('🎭 GlobalHeader: Animation compteur de', previousPoints, 'à', points);
      
      // Animation du compteur qui se déroule
      const listener = animatedPoints.addListener(({ value }) => {
        setCurrentDisplayPoints(Math.floor(value));
      });
      
      // Animation de scale pour attirer l'attention
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animation de couleur (jaune -> vert -> jaune)
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: false,
        }),
      ]).start();
      
      Animated.timing(animatedPoints, {
        toValue: points,
        duration: 2000, // 2 secondes pour correspondre à l'animation des Dodjis
        useNativeDriver: false, // On ne peut pas utiliser useNativeDriver pour les valeurs numériques
      }).start(() => {
        animatedPoints.removeListener(listener);
        setCurrentDisplayPoints(points);
      });
      
      return () => {
        animatedPoints.removeListener(listener);
      };
    }
  }, [points, animatedPoints, scaleAnimation, colorAnimation]);
  
  const handlePointsPress = () => {
    router.push('/(tabs)/boutique');
  };
  
  const handleStreakPress = () => {
    // Afficher le modal de streak avec les informations actuelles
    showStreakInfo();
  };
  
  return (
    <View style={styles.headerWrapper}>
      {/* Gradient principal pour le fond de l'en-tête */}
      <LinearGradient
        colors={['#0A0400', '#0A0400', 'rgba(10, 4, 0, 0.8)', 'rgba(10, 4, 0, 0)']}
        locations={[0, 0.47, 0.85, 1]}
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 15) }
        ]}
      >
        {/* Rangée supérieure avec DailyStreak et Dodji */}
        <View style={styles.topRow}>
          {showBackButton ? (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.dailyStreakContainer} onPress={handleStreakPress}>
              <DailyStrike width={22} height={22} />
              <Text style={styles.levelText}>{streak}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.pointsContainer} onPress={handlePointsPress}>
            <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
              <Animated.Text 
                style={[
                  styles.pointsText,
                  {
                    color: colorAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#F1E61C', '#9BEC00'], // Jaune -> Vert
                    }),
                  }
                ]}
              >
                {currentDisplayPoints}
              </Animated.Text>
            </Animated.View>
            <View style={styles.symbolContainer}>
              <SymbolBlancComponent width={22} height={22} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Rangée du titre centrée */}
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}

        {/* Sélecteur Bourse/Crypto en dessous */}
        {showSectionSelector && (
          <View style={styles.selectorContainer}>
            <View style={styles.sectionSelector}>
              <TouchableOpacity
                style={[
                  styles.sectionButton,
                  selectedSection === 'Bourse' && styles.selectedSection,
                ]}
                onPress={() => onSectionChange?.('Bourse')}
              >
                <Text
                  style={[
                    styles.sectionText,
                    selectedSection === 'Bourse' && styles.selectedSectionText,
                  ]}
                >
                  Bourse
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sectionButton,
                  selectedSection === 'Crypto' && styles.selectedSection,
                ]}
                onPress={() => onSectionChange?.('Crypto')}
              >
                <Text
                  style={[
                    styles.sectionText,
                    selectedSection === 'Crypto' && styles.selectedSectionText,
                  ]}
                >
                  Crypto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
      
      {/* Overlay noir supplémentaire pour un effet de profondeur - s'étend sur toute la hauteur */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.overlay}
      />

      {/* Modal de streak */}
      <StreakModal
        modalData={streakModalData}
        onClose={closeStreakModal}
        onClaimReward={claimReward}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    width: '100%',
    paddingBottom: 90,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300, // S'étend plus bas que le header pour un fondu progressif
    zIndex: -1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 0,
    marginBottom: 5,
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  dailyStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    width: 55,
  },
  levelText: {
    color: '#9BEC00',
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    marginLeft: 0,
  },
  titleText: {
    color: '#fff',
    fontSize: 26,
    fontFamily: 'Arboria-Bold',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    width: 65,
    justifyContent: 'flex-end',
  },
  pointsText: {
    color: '#F1E61C',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    marginRight: 0,
  },
  symbolContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  selectorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  sectionSelector: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'rgba(124, 99, 84, 0.25)',
    borderRadius: 30,
    width: '90%',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  sectionButton: {
    flex: 1,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  selectedSection: {
    backgroundColor: '#9BEC00',
    shadowColor: 'rgba(155, 236, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  sectionText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Arboria-Book',
  },
  selectedSectionText: {
    color: '#0A0400',
    fontFamily: 'Arboria-Medium',
  },
}); 