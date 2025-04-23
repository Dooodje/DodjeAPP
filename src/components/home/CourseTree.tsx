import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Course } from '../../types/home';
import { MaterialCommunityIconName } from '../../types/icons';
import { PastilleParcoursDefault } from '../../components/PastilleParcoursDefault';
import { PastilleParcoursVariant2 } from '../../components/PastilleParcoursVariant2';
import { PastilleParcoursVariant3 } from '../../components/PastilleParcoursVariant3';
import PastilleAnnexe from '../../components/PastilleAnnexe';

interface CourseTreeProps {
  courses: Course[];
  treeImageUrl?: string;
  onCoursePress: (courseId: string) => void;
}

/**
 * Version ultra simplifiée de CourseTree sans aucune méthode pouvant utiliser indexOf
 * (pas de filter, map, find, includes, etc.)
 */
export const CourseTree: React.FC<CourseTreeProps> = ({ 
  courses = [], 
  treeImageUrl,
  onCoursePress 
}) => {
  const [treeImageLoaded, setTreeImageLoaded] = useState<boolean>(true);
  const [treeImageError, setTreeImageError] = useState<boolean>(false);

  // If there's no treeImageUrl, consider it loaded
  useEffect(() => {
    if (!treeImageUrl || treeImageUrl.trim() === '') {
      setTreeImageLoaded(true);
      setTreeImageError(false);
    }
  }, [treeImageUrl]);

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

  // Handle tree image loading error
  const handleTreeImageError = (error: any) => {
    setTreeImageError(true);
    setTreeImageLoaded(true); // Important to allow courses to display
  };

  // Déterminer le type de pastille à afficher
  const getPastille = () => {
    // Simuler un cours annexe
    const isAnnexe = false;
    if (isAnnexe) {
      return <PastilleAnnexe width={56} height={56} />;
    }

    // Simuler un cours complété
    const isCompleted = true;
    if (isCompleted) {
      return <PastilleParcoursVariant2 style={{ width: 56, height: 56 }} />;
    }

    // Simuler un cours débloqué mais non complété
    const isUnlocked = false;
    if (isUnlocked) {
      return <PastilleParcoursDefault style={{ width: 56, height: 56 }} />;
    }

    // Simuler un cours bloqué (par défaut)
    return <PastilleParcoursVariant3 style={{ width: 56, height: 56 }} />;
  };

  return (
    <View style={styles.container}>
      {/* Background image or default background */}
      {treeImageUrl ? (
        <Image
          source={{ uri: treeImageUrl }}
          style={styles.treeImage}
          onLoad={() => setTreeImageLoaded(true)}
          onError={handleTreeImageError}
        />
      ) : (
        <View style={styles.defaultBackground} />
      )}

      {/* Affichage manuel d'un seul cours de test au centre sans passer par map */}
      <View style={styles.courseContainer}>
        <TouchableOpacity
          style={styles.courseButton}
          onPress={handleCoursePress}
        >
          <View style={styles.coursePlaceholder}>
            {getPastille()}
          </View>
          
          {/* Titre du cours */}
          <View style={styles.courseTitleContainer}>
            <Text style={styles.courseTitle}>
              Cours de test
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Ajout d'un cours annexe de démonstration */}
      <View style={[styles.courseContainer, styles.annexCoursePosition]}>
        <TouchableOpacity
          style={styles.courseButton}
          onPress={handleCoursePress}
        >
          <View style={styles.coursePlaceholder}>
            <PastilleAnnexe width={56} height={56} />
          </View>
          
          <View style={styles.courseTitleContainer}>
            <Text style={styles.courseTitle}>
              Cours annexe
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Ajout d'un cours terminé de démonstration */}
      <View style={[styles.courseContainer, styles.completedCoursePosition]}>
        <TouchableOpacity
          style={styles.courseButton}
          onPress={handleCoursePress}
        >
          <View style={styles.coursePlaceholder}>
            <PastilleParcoursVariant2 style={{ width: 56, height: 56 }} />
          </View>
          
          <View style={styles.courseTitleContainer}>
            <Text style={styles.courseTitle}>
              Cours terminé
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
  treeImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
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
  annexCoursePosition: {
    left: '75%',
    top: '30%',
  },
  completedCoursePosition: {
    left: '25%',
    top: '70%',
  },
  courseButton: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseTitleContainer: {
    position: 'absolute',
    bottom: -35,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 5,
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