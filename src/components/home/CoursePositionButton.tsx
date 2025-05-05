import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Alert } from 'react-native';
import { Parcours } from '../../types/firebase';
import { CoursePosition } from '../ui/CoursePosition';

interface CoursePositionButtonProps {
  parcours: Parcours;
  size?: number;
  isActive?: boolean;
  onPress: (parcoursId: string) => void;
  style?: ViewStyle;
}

const CoursePositionButton: React.FC<CoursePositionButtonProps> = ({
  parcours,
  size = 80,
  isActive = false,
  onPress,
  style
}) => {
  const handlePress = () => {
    if (parcours.status === 'blocked') {
      Alert.alert(
        "Parcours bloqué",
        "Vous devez d'abord terminer les parcours précédents pour accéder à celui-ci."
      );
      return;
    }
    onPress(parcours.id);
  };

  // Déterminer le type de positionnement
  const getPositionType = () => {
    if (parcours.isAnnexe || parcours.isAnnex) return 'annexe';
    if (parcours.isIntroduction) return 'important';
    if (parcours.isSpecial || parcours.isBonus) return 'special';
    return 'standard';
  };

  return (
    <View style={[styles.container, style]}>
      <CoursePosition
        type={getPositionType()}
        status={parcours.status}
        size={size}
        title={parcours.titre || parcours.title}
        onPress={handlePress}
        parcoursId={parcours.id}
        isActive={isActive}
      />
      
      {/* Badge d'ordre si fourni */}
      {parcours.ordre !== undefined && (
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{parcours.ordre}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F3FF90',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  orderText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CoursePositionButton; 