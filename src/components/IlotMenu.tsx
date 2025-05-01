import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Icon1Svg from '../assets/IlotMenuIcon1.svg';
import Icon2Svg from '../assets/IlotMenuIcon2.svg';
import Icon3Svg from '../assets/IlotMenuIcon3.svg';
import Icon4Svg from '../assets/IlotMenuIcon4.svg';
import Icon5Svg from '../assets/IlotMenuIcon5.svg';

interface IlotMenuProps {
  style?: ViewStyle;
}

export const IlotMenu: React.FC<IlotMenuProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.background} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon1Svg width={24} height={24} />
        </View>
        <View style={styles.iconContainer}>
          <Icon2Svg width={24} height={24} />
        </View>
        <View style={styles.iconContainer}>
          <Icon3Svg width={24} height={24} />
        </View>
        <View style={styles.iconContainer}>
          <Icon4Svg width={24} height={24} />
        </View>
        <View style={styles.iconContainer}>
          <Icon5Svg width={24} height={24} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 408,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
    padding: 20,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 