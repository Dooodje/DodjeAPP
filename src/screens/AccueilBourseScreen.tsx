import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHome } from '../hooks/useHome';
import { useNavigation } from '@react-navigation/native';
import { Section, Level } from '../types/home';

// Import components from the project - use named imports
import { IlotMenu } from '../components/IlotMenu';
import { Rectangle11 } from '../components/Rectangle11';
import { ChoicePoint } from '../components/ChoicePoint';
import RightArrow from '../components/RightArrow';
import DailyStrike from '../components/DailyStrike';
import SymboleBlanc from '../components/SymboleBlanc';
import { PastilleParcours } from '../components/PastilleParcours';
import { PastilleParcoursDefault } from '../components/PastilleParcoursDefault';
import { PastilleParcoursVariant2 } from '../components/PastilleParcoursVariant2';
import { PastilleParcoursVariant3 } from '../components/PastilleParcoursVariant3';
import { CourseTree } from '../components/home/CourseTree';
import { UserStats } from '../components/home/UserStats';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0400" />
      
      <View style={styles.container}>
        {/* Background rectangles */}
        <Rectangle11 width={400} height={400} />
        <View style={styles.backgroundRect2Position}>
          <Rectangle11 width={400} height={400} />
        </View>
        
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
            {/* Left arrow (hidden in the design) */}
            <View style={styles.leftArrowContainer}>
              <TouchableOpacity style={styles.arrowButton}>
                <View style={{opacity: 0}}>
                  <RightArrow />
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
              <TouchableOpacity style={styles.arrowButton}>
                <RightArrow />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Choice points */}
          <View style={styles.choicePointContainer}>
            <ChoicePoint variant="choice1" />
          </View>
        </ScrollView>
        
        {/* Menu at the bottom */}
        <IlotMenu />
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
  choicePointContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Arboria-Book',
  },
  retryButton: {
    backgroundColor: '#059212',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Arboria-Book',
  },
  warningContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(10, 4, 0, 0.8)',
    borderRadius: 8,
    zIndex: 10,
  },
  warningText: {
    color: '#F3FF90',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Arboria-Book',
  },
});

export default AccueilBourseScreen; 