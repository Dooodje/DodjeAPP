import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../config/theme';
import Header from '../components/home/Header';
import LevelSelector from '../components/home/LevelSelector';
import CoursePositionButton from '../components/home/CoursePositionButton';
import BottomNavigation from '../components/navigation/BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Parcours } from '../types/firebase';
import { Menu } from '../components/Menu';
import { GlobalHeader } from '../components/ui/GlobalHeader';
import RightArrow from '../components/RightArrow';
import LeftArrow from '../components/LeftArrow';
import PositionIndicator from '../components/navigation/PositionIndicator';

// Dummy data pour les tests
const dummyParcours: Parcours[] = [
  {
    id: '1',
    title: 'Introduction à la bourse',
    description: 'Découvrez les bases de la bourse',
    theme: 'bourse',
    level: 'debutant',
    order: 1,
    imageUrl: '',
    position: { x: 30, y: 20 },
    videos: [],
    quiz: { id: 'q1', title: 'Quiz', questions: [], passingScore: 60 },
    isCompleted: false,
    isUnlocked: true,
    isIntroduction: true
  },
  {
    id: '2',
    title: 'Analyse technique',
    description: 'Apprenez à lire les graphiques',
    theme: 'bourse',
    level: 'debutant',
    order: 2,
    imageUrl: '',
    position: { x: 50, y: 40 },
    videos: [],
    quiz: { id: 'q2', title: 'Quiz', questions: [], passingScore: 60 },
    isCompleted: false,
    isUnlocked: false
  },
  {
    id: '3',
    title: 'Ressources annexes',
    description: 'Documentation complémentaire',
    theme: 'bourse',
    level: 'debutant',
    order: 3,
    imageUrl: '',
    position: { x: 70, y: 35 },
    videos: [],
    quiz: { id: 'q3', title: 'Quiz', questions: [], passingScore: 60 },
    isCompleted: false,
    isUnlocked: false,
    isAnnexe: true
  },
  {
    id: '4',
    title: 'Stratégies d\'investissement',
    description: 'Maîtrisez les stratégies',
    theme: 'bourse',
    level: 'avance',
    order: 1,
    imageUrl: '',
    position: { x: 40, y: 30 },
    videos: [],
    quiz: { id: 'q4', title: 'Quiz', questions: [], passingScore: 60 },
    isCompleted: false,
    isUnlocked: true
  },
  {
    id: '5',
    title: 'Introduction aux crypto-monnaies',
    description: 'Les bases des cryptos',
    theme: 'crypto',
    level: 'debutant',
    order: 1,
    imageUrl: '',
    position: { x: 25, y: 25 },
    videos: [],
    quiz: { id: 'q5', title: 'Quiz', questions: [], passingScore: 60 },
    isCompleted: false,
    isUnlocked: true,
    isIntroduction: true
  }
];

type ThemeType = 'bourse' | 'crypto';
type LevelType = 'debutant' | 'avance' | 'expert';
type ScreenName = 'home' | 'courses' | 'shop' | 'profile';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('bourse');
  const [selectedLevel, setSelectedLevel] = useState<LevelType>('debutant');
  const [filteredParcours, setFilteredParcours] = useState<Parcours[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const totalPositions = 3;

  // Filtrer les parcours selon le thème et le niveau sélectionnés
  useEffect(() => {
    const filtered = dummyParcours.filter(
      p => p.theme === selectedTheme && p.level === selectedLevel
    );
    setFilteredParcours(filtered);
  }, [selectedTheme, selectedLevel]);

  // Fonction pour naviguer vers le détail d'un parcours
  const handleParcoursPress = (parcoursId: string) => {
    const parcours = dummyParcours.find(p => p.id === parcoursId);
    if (parcours) {
      // Navigation vers le détail du parcours
      // navigation.navigate('ParcoursDetail', { parcours });
      console.log(`Naviguer vers le parcours: ${parcours.title}`);
    }
  };

  // Fonction pour la navigation entre écrans
  const handleScreenChange = (screenName: ScreenName) => {
    setCurrentScreen(screenName);
    // Pour l'instant, on reste sur la même page car on n'a pas implémenté les autres écrans
    console.log(`Naviguer vers l'écran: ${screenName}`);
  };

  // Fonction pour changer le thème (bourse/crypto)
  const handleThemeChange = (theme: ThemeType) => {
    setSelectedTheme(theme);
  };

  // Fonction pour naviguer à gauche dans l'arbre
  const handleNavigateLeft = () => {
    setCurrentPosition(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  // Fonction pour naviguer à droite dans l'arbre
  const handleNavigateRight = () => {
    setCurrentPosition(prev => (prev < totalPositions - 1 ? prev + 1 : totalPositions - 1));
  };

  // Conversion du thème pour le composant Menu
  const activeMenu = selectedTheme === 'bourse' ? 'bourse' : 'crypto';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.dark} />
      
      <View style={styles.container}>
        {/* GlobalHeader avec positionnement amélioré */}
        <GlobalHeader
          level={3}
          points={250}
          title={selectedLevel === 'debutant' 
            ? 'DÉBUTANT' 
            : selectedLevel === 'avance' 
              ? 'AVANCÉ' 
              : 'EXPERT'}
          showSectionSelector={true}
          selectedSection={selectedTheme === 'bourse' ? 'Bourse' : 'Crypto'}
          onSectionChange={(section) => setSelectedTheme(section.toLowerCase() as ThemeType)}
        />
        
        {/* Contenu principal - Arbre d'apprentissage avec padding ajusté */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <LinearGradient
            colors={[
              theme.colors.background.dark, 
              'rgba(10, 4, 0, 0.9)', 
              'rgba(10, 4, 0, 0.8)'
            ]}
            style={styles.gradient}
          />
          
          {/* POINT ROUGE DE TEST */}
          <View style={styles.redDot} />
          
          {/* Ajout d'un padding en haut pour laisser de l'espace au header */}
          <View style={styles.contentPadding} />
          
          {/* Fond d'arbre d'apprentissage */}
          <Image 
            source={
              selectedTheme === 'bourse' 
                ? require('../assets/figma/parcours-bourse.svg') 
                : require('../assets/backgrounds/crypto-tree.png')
            }
            style={styles.treeBackground}
            resizeMode="contain"
          />
          
          {/* Boutons de position des parcours */}
          {filteredParcours.map(parcours => (
            <View 
              key={parcours.id}
              style={[
                styles.coursePositionWrapper,
                {
                  left: `${parcours.position.x}%`,
                  top: `${parcours.position.y}%`,
                }
              ]}
            >
              <CoursePositionButton 
                parcours={parcours}
                size={parcours.isIntroduction ? 100 : 80}
                isActive={parcours.isCompleted || parcours.isUnlocked}
                onPress={handleParcoursPress}
              />
            </View>
          ))}
          
          {/* Boutons de navigation d'arbre (gauche/droite) */}
          <View style={styles.treeNavigationContainer}>
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity 
                onPress={handleNavigateLeft}
                disabled={currentPosition === 0}
                style={[
                  styles.navigationArrowTouchable,
                  currentPosition === 0 && styles.navigationArrowDisabled
                ]}
              >
                <LeftArrow width={50} height={50} />
              </TouchableOpacity>
            </View>
            
            {/* Espace entre les flèches */}
            <View style={{ flex: 1 }} />
            
            <View style={styles.navigationButtonContainer}>
              <TouchableOpacity 
                onPress={handleNavigateRight}
                disabled={currentPosition === totalPositions - 1}
                style={[
                  styles.navigationArrowTouchable,
                  currentPosition === totalPositions - 1 && styles.navigationArrowDisabled
                ]}
              >
                <RightArrow width={50} height={50} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Indicateur de position - Utilisation du composant PositionIndicator */}
          <View style={styles.positionIndicatorContainer}>
            <PositionIndicator total={totalPositions} current={currentPosition} />
          </View>
          
          {/* Sélecteur de niveau */}
          <View style={styles.levelSelectorContainer}>
            <LevelSelector 
              selectedLevel={selectedLevel} 
              onLevelChange={setSelectedLevel} 
            />
          </View>
          
          {/* Bouton Dodji One */}
          <TouchableOpacity style={styles.dodjiOneButton}>
            <LinearGradient
              colors={[theme.colors.primary.light, theme.colors.primary.main]}
              style={styles.dodjiOneGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.dodjiOneText}>Dodje One</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Navigation bas d'écran */}
        <BottomNavigation
          currentScreen={currentScreen}
          onScreenChange={handleScreenChange}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    position: 'relative',
    paddingBottom: 80,
  },
  redDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'red',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 9999,
  },
  contentPadding: {
    height: 120, // Ajusté pour la nouvelle disposition du header
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  treeBackground: {
    width: '100%',
    height: 500,
    opacity: 0.6,
  },
  coursePositionWrapper: {
    position: 'absolute',
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  treeNavigationContainer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 5,
  },
  dodjiOneButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    overflow: 'hidden',
    borderRadius: 15,
  },
  dodjiOneGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  dodjiOneText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelSelectorContainer: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  navigationButtonContainer: {
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  navigationArrowTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationArrowDisabled: {
    opacity: 0.5,
  },
  positionIndicatorContainer: {
    position: 'absolute',
    bottom: 180,
    width: '100%',
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    zIndex: 15,
  },
});

export default HomeScreen; 