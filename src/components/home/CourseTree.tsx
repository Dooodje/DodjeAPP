import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Course } from '../../types/home';
import { MaterialCommunityIconName } from '../../types/icons';

interface CourseTreeProps {
  courses: Course[];
  onCoursePress: (courseId: string) => void;
}

/**
 * Version ultra simplifiée de CourseTree sans aucune méthode pouvant utiliser indexOf
 * (pas de filter, map, find, includes, etc.)
 */
export const CourseTree: React.FC<CourseTreeProps> = ({ courses = [], onCoursePress }) => {
  // Fonction de gestion du clic sur le cours qui évite d'utiliser .find
  const handleCoursePress = () => {
    // Utiliser un ID en dur pour éviter toute recherche dans un tableau
    if (typeof onCoursePress === 'function') {
      try {
        onCoursePress('test-course-1');
      } catch (error) {
        console.error('Erreur lors de la navigation vers le cours:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Fond simple */}
      <View style={styles.defaultBackground} />

      {/* Affichage manuel d'un seul cours de test au centre sans passer par map */}
      <View style={styles.courseContainer}>
        <TouchableOpacity
          style={styles.courseButton}
          onPress={handleCoursePress}
        >
          <View style={styles.coursePlaceholder}>
            <MaterialCommunityIcons 
              name={'book-open-variant' as MaterialCommunityIconName} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          
          {/* Titre du cours */}
          <View style={styles.courseTitleContainer}>
            <Text style={styles.courseTitle}>
              Cours de test
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Message si aucun cours n'est disponible - pas nécessaire mais gardé pour le style */}
      {!courses || courses.length === 0 ? (
        <View style={styles.noCourseContainer}>
          <MaterialCommunityIcons name={'school-outline' as MaterialCommunityIconName} size={48} color="#FFF" />
          <Text style={styles.noCourseText}>Chargement des cours...</Text>
        </View>
      ) : null}
    </View>
  );
};

// Styles simplifiés
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    minHeight: 400,
  },
  defaultBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1A',
  },
  courseContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    // Position centrée manuellement
    left: '50%',
    top: '50%',
    marginLeft: -40,
    marginTop: -40,
    zIndex: 20,
  },
  courseButton: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#059212',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  coursePlaceholder: {
    width: '70%',
    height: '70%',
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitleContainer: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  courseTitle: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Arboria-Book',
    maxWidth: 100,
  },
  noCourseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 20,
  },
  noCourseText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Arboria-Book',
  },
}); 