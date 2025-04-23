import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PositionIndicatorProps {
  total: number;
  current: number;
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({ total, current }) => {
  // Générer un tableau de N éléments pour le nombre total de points
  const dots = Array.from({ length: total }, (_, index) => index);

  return (
    <View style={styles.container}>
      {dots.map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            current === index ? styles.activeDot : styles.inactiveDot,
            current === index && styles.activeDotSize
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 12.5,
    height: 12.5,
    borderRadius: 6.25,
    marginHorizontal: 6.5,
  },
  activeDot: {
    backgroundColor: '#F3FF90', // Jaune comme dans la maquette Figma
  },
  activeDotSize: {
    transform: [{ scale: 1.2 }], // Légèrement plus grand pour les points actifs
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Semi-transparent pour les inactifs
  },
});

export default PositionIndicator; 