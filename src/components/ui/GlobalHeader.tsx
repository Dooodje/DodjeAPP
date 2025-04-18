import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Section } from '../../types/home';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GlobalHeaderProps {
  level?: number;
  points?: number;
  title?: string;
  showSectionSelector?: boolean;
  selectedSection?: Section;
  onSectionChange?: (section: Section) => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  level = 1,
  points = 0,
  title = 'DÉBUTANT',
  showSectionSelector = false,
  selectedSection = 'Bourse',
  onSectionChange,
  showBackButton = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient
      colors={['rgba(0, 0, 0, 0.9)', 'rgba(10, 4, 0, 0.9)', 'rgba(10, 4, 0, 0.6)', 'transparent']}
      locations={[0, 0.5, 0.8, 1]}
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 15) }
      ]}
    >
      <View style={[styles.topRow, showSectionSelector && styles.topRowWithSelector]}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.levelContainer}>
          <MaterialCommunityIcons name="sword-cross" size={20} color="#fff" />
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{points}</Text>
          <Text style={styles.pointsSymbol}>ô</Text>
        </View>
      </View>

      {showSectionSelector && (
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
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 16,
    width: '100%',
    zIndex: 1000,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topRowWithSelector: {
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    marginLeft: 6,
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    flex: 1,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    marginRight: 4,
  },
  pointsSymbol: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
  },
  sectionSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 4,
  },
  sectionButton: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSection: {
    backgroundColor: '#F3FF90',
  },
  sectionText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
  },
  selectedSectionText: {
    color: '#0A0400',
  },
}); 