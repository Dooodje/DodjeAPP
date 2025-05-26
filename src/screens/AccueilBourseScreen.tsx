import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHome } from '../hooks/useHome';
import { useNavigation } from '@react-navigation/native';
import { usePathname } from 'expo-router';
import { Section, Level } from '../types/home';

// Import components from the project - use named imports
import { IlotMenu } from '../components/IlotMenu';
import { Rectangle11 } from '../components/Rectangle11';
import RightArrow from '../components/RightArrow';
import LeftArrow from '../components/LeftArrow';
import DailyStrike from '../components/DailyStrike';
import SymboleBlanc from '../components/SymboleBlanc';
import { PastilleParcours } from '../components/PastilleParcours';
import { PastilleParcoursDefault } from '../components/PastilleParcoursDefault';
import { PastilleParcoursVariant2 } from '../components/PastilleParcoursVariant2';
import { PastilleParcoursVariant3 } from '../components/PastilleParcoursVariant3';
import { CourseTree } from '../components/home/CourseTree';
import { UserStats } from '../components/home/UserStats';
import PositionIndicator from '../components/navigation/PositionIndicator';

const AccueilBourseScreen = () => {
  const {
    currentSection,
    currentLevel,
    treeData,
    homeDesign,
    loading,
    error,
    streak,
    dodji,
    fetchTreeData,
    resetError,
    handlePositionPress,
    changeSection,
    changeLevel
  } = useHome();

  const navigation = useNavigation();
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const totalPositions = 3;

  // Effect to fetch tree data when component mounts
  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  // Handler for retry loading the data
  const handleRetry = () => {
    resetError();
    fetchTreeData();
  };

  // Function to navigate to a course
  const navigateToCourse = (courseId: string) => {
    // Use the handlePositionPress function from useHome hook
    handlePositionPress(courseId);
  };

  // Fonction pour naviguer à gauche dans l'arbre
  const handleNavigateLeft = () => {
    setCurrentPosition(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  // Fonction pour naviguer à droite dans l'arbre
  const handleNavigateRight = () => {
    setCurrentPosition(prev => (prev < totalPositions - 1 ? prev + 1 : totalPositions - 1));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background rectangles */}
        <Rectangle11 width={400} height={400} />
        <View style={styles.backgroundRect2Position}>
          <Rectangle11 width={400} height={400} />
        </View>
        
        {/* POINT ROUGE DE TEST */}
        <View style={styles.redDot} />
        
        {/* Main content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Section/Level selector */}
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={[styles.sectionButton, currentSection === 'Bourse' && styles.activeSectionButton]}
              onPress={() => changeSection('Bourse')}
            >
              <Text style={[styles.sectionText, currentSection === 'Bourse' && styles.activeSectionText]}>
                Bourse
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sectionButton, currentSection === 'Crypto' && styles.activeSectionButton]}
              onPress={() => changeSection('Crypto')}
            >
              <Text style={[styles.sectionText, currentSection === 'Crypto' && styles.activeSectionText]}>
                Crypto
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Level display */}
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>{currentLevel?.toUpperCase()}</Text>
          </View>
          
          {/* Points and Daily strike */}
          <View style={styles.statsContainer}>
            <View style={styles.dailyStreak}>
              <DailyStrike />
              <Text style={styles.streakCount}>1</Text>
            </View>
            
            <View style={styles.points}>
              <Text style={styles.pointsCount}>100</Text>
              <SymboleBlanc />
            </View>
          </View>
          
          {/* Course tree with navigation arrows */}
          <View style={styles.courseTreeContainer}>
            {/* Left arrow */}
            <View style={styles.leftArrowContainer}>
              <TouchableOpacity 
                style={styles.arrowButton}
                onPress={handleNavigateLeft}
                disabled={currentPosition === 0}
              >
                <View style={{opacity: currentPosition === 0 ? 0.5 : 1}}>
                  <LeftArrow width={50} height={50} />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Course Tree */}
            <View style={styles.treeContainer}>
              {error && !treeData?.courses?.length && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryText}>Réessayer</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {error && treeData?.courses?.length > 0 && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Certaines ressources n'ont pas pu être chargées, mais vous pouvez continuer à naviguer.
                  </Text>
                </View>
              )}
              
              <CourseTree 
                courses={treeData?.courses || []}
                treeImageUrl={treeData?.treeImageUrl || ''}
                onCoursePress={navigateToCourse}
              />
            </View>
            
            {/* Right arrow */}
            <View style={styles.rightArrowContainer}>
              <TouchableOpacity 
                style={styles.arrowButton} 
                onPress={handleNavigateRight}
                disabled={currentPosition === totalPositions - 1}
              >
                <View style={{opacity: currentPosition === totalPositions - 1 ? 0.5 : 1}}>
                  <RightArrow width={50} height={50} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Position indicators */}
          <View style={styles.positionIndicatorContainer}>
            <PositionIndicator total={totalPositions} current={currentPosition} />
          </View>
        </ScrollView>
        
        {/* Menu at the bottom */}
        <IlotMenu activeRoute={usePathname()} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  container: {
    flex: 1,
    position: 'relative',
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
  backgroundRect2Position: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 120, // Space for bottom menu
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    marginHorizontal: 5,
  },
  activeSectionButton: {
    backgroundColor: '#F3FF90',
  },
  sectionText: {
    fontSize: 20,
    fontFamily: 'Arboria-Book',
    color: '#FFFFFF',
  },
  activeSectionText: {
    color: '#0A0400',
  },
  levelContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  levelText: {
    fontSize: 40,
    fontFamily: 'Arboria-Bold',
    letterSpacing: -2,
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  dailyStreak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 25,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsCount: {
    fontSize: 25,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginRight: 5,
  },
  courseTreeContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
  },
  leftArrowContainer: {
    width: 105,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightArrowContainer: {
    width: 106,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeContainer: {
    flex: 1,
    minHeight: 400,
  },
  arrowButton: {
    padding: 10,
  },
  positionIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 15,
    height: 30,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    textAlign: 'center',
    marginBottom: 20,
  },
  warningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    padding: 10,
    backgroundColor: 'rgba(255, 107, 0, 0.8)',
    borderRadius: 10,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F3FF90',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  retryText: {
    color: '#0A0400',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
  }
});

export default AccueilBourseScreen; 