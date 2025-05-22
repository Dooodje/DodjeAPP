import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Parcours } from '../../types/firebase';
import { useRouter } from 'expo-router';

interface CourseCardProps {
  parcours: Parcours;
  isLocked?: boolean;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24; // 2 colonnes avec padding

const CourseCard: React.FC<CourseCardProps> = ({ parcours, isLocked = false, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (isLocked) return;
    
    if (onPress) {
      onPress();
    } else {
      router.push(`/course/${parcours.id}?from=catalogue`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: parcours.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {isLocked && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={24} color="#FFF" />
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {parcours.titre || parcours.title}
        </Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.courseMetaInfo}>
            <Text style={styles.courseDomain}>
              {parcours.domaine}
            </Text>
            <Text style={styles.courseDot}>•</Text>
            <Text style={styles.courseLevel}>
              {parcours.niveau}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseDomain: {
    color: '#9BEC00',
    fontFamily: 'Arboria-Book',
    fontSize: 12,
  },
  courseDot: {
    color: '#FFFFFF',
    fontSize: 12,
    marginHorizontal: 6,
    opacity: 0.5,
  },
  courseLevel: {
    fontSize: 12,
    color: '#CCCCCC',
  }
});

export default CourseCard; 