import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakDisplayProps {
  streakCount: number;
  onPress?: () => void;
  compact?: boolean;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ 
  streakCount, 
  onPress, 
  compact = false 
}) => {
  const containerStyle = compact ? styles.compactContainer : styles.container;
  const textStyle = compact ? styles.compactText : styles.text;
  const iconSize = compact ? 16 : 20;

  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Ionicons name="flame" size={iconSize} color="#FF6B35" />
      <Text style={textStyle}>{streakCount}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  text: {
    color: '#FF6B35',
    fontFamily: 'Arboria-Bold',
    fontSize: 16,
    marginLeft: 6,
  },
  compactText: {
    color: '#FF6B35',
    fontFamily: 'Arboria-Bold',
    fontSize: 12,
    marginLeft: 4,
  },
}); 