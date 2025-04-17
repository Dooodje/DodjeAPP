import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialCommunityIconName } from '../../types/icons';

interface SettingsButtonProps {
  icon?: MaterialCommunityIconName;
  size?: number;
  color?: string;
  onPress?: () => void;
}

export function SettingsButton({ 
  icon = 'cog', 
  size = 24, 
  color = '#FFFFFF',
  onPress
}: SettingsButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Utiliser le chemin sans parenthèses pour la navigation
      router.push("/settings");
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 