import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Parcours } from '../../types/firebase';

interface FeaturedBannerProps {
  parcours: Parcours;
  onPress: (parcoursId: string) => void;
}

const { width } = Dimensions.get('window');

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ parcours, onPress }) => {
  if (!parcours) return null;
  
  const handlePress = () => {
    onPress(parcours.id);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: parcours.imageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(10, 4, 0, 0.8)', 'rgba(10, 4, 0, 1)']}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <View style={styles.labelContainer}>
              <View 
                style={[
                  styles.themeLabel, 
                  { backgroundColor: parcours.theme === 'bourse' ? '#059212' : '#9BEC00' }
                ]}
              >
                <Text style={styles.themeLabelText}>
                  {parcours.theme === 'bourse' ? 'Bourse' : 'Crypto'}
                </Text>
              </View>
              
              <View style={styles.levelLabel}>
                <Text style={styles.levelLabelText}>
                  {parcours.level === 'debutant' ? 'Débutant' : 
                    parcours.level === 'avance' ? 'Avancé' : 'Expert'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.title} numberOfLines={2}>
              {parcours.titre || parcours.title}
            </Text>
            
            <Text style={styles.description} numberOfLines={2}>
              {parcours.description}
            </Text>
            
            <TouchableOpacity 
              style={styles.lectureButton}
              onPress={handlePress}
            >
              <Text style={styles.lectureButtonText}>Lecture</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 380,
    marginBottom: 24,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    padding: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  themeLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  themeLabelText: {
    fontFamily: 'Arboria-Bold',
    fontSize: 12,
    color: '#000',
  },
  levelLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelLabelText: {
    fontFamily: 'Arboria-Medium',
    fontSize: 12,
    color: '#FFF',
  },
  title: {
    fontFamily: 'Arboria-Bold',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Arboria-Book',
    fontSize: 14,
    color: '#CCC',
    marginBottom: 16,
  },
  lectureButton: {
    backgroundColor: '#06D001',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 200,
  },
  lectureButtonText: {
    fontFamily: 'Arboria-Bold',
    fontSize: 16,
    color: '#000',
  },
});

export default FeaturedBanner; 