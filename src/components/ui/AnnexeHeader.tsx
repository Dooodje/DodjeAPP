import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../../types/home';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DailyStrike from '../DailyStrike';
import SymbolBlancComponent from '../SymboleBlanc';
import { useUserStreak } from '../../hooks/useUserStreak';
import { useStreak, StreakModal } from '../../streak';
import { useAuth } from '../../hooks/useAuth';
import { useDodji } from '../../hooks/useDodji';

interface AnnexeHeaderProps {
  level?: number;
  title?: string;
  showSectionSelector?: boolean;
  selectedSection?: Section;
  onSectionChange?: (section: Section) => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const AnnexeHeader: React.FC<AnnexeHeaderProps> = ({
  level = 1,
  title = 'DÉBUTANT',
  showSectionSelector = false,
  selectedSection = 'Bourse',
  onSectionChange,
  showBackButton = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { dodji } = useDodji(user?.uid);
  const { streak } = useUserStreak();
  const { modalData: streakModalData, closeModal: closeStreakModal, claimReward, showStreakInfo } = useStreak();
  const router = useRouter();
  
  // Animation du compteur de dodjis
  const animatedDodji = useRef(new Animated.Value(dodji)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current;
  const displayedDodji = useRef(dodji);
  const [currentDisplayDodji, setCurrentDisplayDodji] = React.useState(dodji);
  
  // Animer le changement de dodjis
  useEffect(() => {
    if (dodji !== displayedDodji.current) {
      const previousDodji = displayedDodji.current;
      displayedDodji.current = dodji;
      
      console.log('🎭 AnnexeHeader: Animation compteur de', previousDodji, 'à', dodji);
      
      // Animation du compteur qui se déroule
      const listener = animatedDodji.addListener(({ value }) => {
        setCurrentDisplayDodji(Math.floor(value));
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
      
      Animated.timing(animatedDodji, {
        toValue: dodji,
        duration: 2000, // 2 secondes pour correspondre à l'animation des Dodjis
        useNativeDriver: false, // On ne peut pas utiliser useNativeDriver pour les valeurs numériques
      }).start(() => {
        animatedDodji.removeListener(listener);
        setCurrentDisplayDodji(dodji);
      });
      
      return () => {
        animatedDodji.removeListener(listener);
      };
    }
  }, [dodji, animatedDodji, scaleAnimation, colorAnimation]);
  
  const handlePointsPress = () => {
    router.push('/(tabs)/boutique');
  };
  
  const handleStreakPress = () => {
    // Afficher le modal de streak avec les informations actuelles
    showStreakInfo();
  };
  
  return (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={['#0A0400', '#0A0400', 'rgba(10, 4, 0, 0.8)', 'rgba(10, 4, 0, 0)']}
        locations={[0, 0.47, 0.85, 1]}
        style={[
          styles.container,
          { paddingTop: insets.top }
        ]}
      >
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
                {currentDisplayDodji}
              </Animated.Text>
            </Animated.View>
            <View style={styles.symbolContainer}>
              <SymbolBlancComponent width={22} height={22} />
            </View>
          </TouchableOpacity>
        </View>
        
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}

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
    paddingBottom: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  sectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  selectedSection: {
    backgroundColor: '#fff',
  },
  sectionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
  selectedSectionText: {
    color: '#000',
  },
  loader: {
    marginLeft: 8,
  },
}); 