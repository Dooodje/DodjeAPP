import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Course } from '../../types/course';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CourseHeaderProps {
  course: Course;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Image de couverture */}
      <Image
        source={{ uri: course.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Informations du parcours */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.description}>{course.description}</Text>
        
        {/* Métadonnées */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Section</Text>
            <Text style={styles.metadataValue}>
              {course.section === 'bourse' ? 'Bourse' : 'Crypto'}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Niveau</Text>
            <Text style={styles.metadataValue}>
              {course.level === 'debutant'
                ? 'Débutant'
                : course.level === 'avance'
                ? 'Avancé'
                : 'Expert'}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Durée</Text>
            <Text style={styles.metadataValue}>{course.duration} min</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0400',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Arboria-Bold',
  },
  description: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'Arboria-Book',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
    fontFamily: 'Arboria-Light',
  },
  metadataValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Arboria-Medium',
  },
}); 