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
import ThemeSelector from '../components/home/ThemeSelector';
import LevelSelector from '../components/home/LevelSelector';
import CoursePositionButton from '../components/home/CoursePositionButton';
import BottomNavigation from '../components/navigation/BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Parcours } from '../types/firebase';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.dark} />
      
      <View style={styles.container}>
        {/* Header */}
        <Header 
          userName="Charles"
          dodjiCount={250}
          streak={3}
          onProfilePress={() => handleScreenChange('profile')}
        />
        
        {/* Sélecteurs */}
        <View style={styles.selectorsContainer}>
          <ThemeSelector 
            selectedTheme={selectedTheme} 
            onThemeChange={setSelectedTheme} 
          />
          <LevelSelector 
            selectedLevel={selectedLevel} 
            onLevelChange={setSelectedLevel} 
          />
        </View>
        
        {/* Contenu principal - Arbre d'apprentissage */}
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
            <TouchableOpacity style={styles.treeNavButton}>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={theme.colors.text.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.treeNavButton}>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={theme.colors.text.primary} 
              />
            </TouchableOpacity>
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
    backgroundColor: theme.colors.background.dark,
  },
  selectorsContainer: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    minHeight: '100%',
    position: 'relative',
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
    height: undefined,
    aspectRatio: 0.8, // Ajustez selon le ratio de votre image
    opacity: 0.9,
  },
  coursePositionWrapper: {
    position: 'absolute',
    transform: [{ translateX: -40 }, { translateY: -40 }], // Centrer (moitié de la taille)
  },
  treeNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
  },
  treeNavButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dodjiOneButton: {
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dodjiOneGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  dodjiOneText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 