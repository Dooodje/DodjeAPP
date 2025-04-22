import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Icon1Svg from '../assets/IlotMenuIcon1.svg';
import Icon2Svg from '../assets/IlotMenuIcon2.svg';
import Icon3Svg from '../assets/IlotMenuIcon3.svg';
import Icon5Svg from '../assets/IlotMenuIcon5.svg';
import Group1Svg from '../assets/IlotMenuGroup1.svg';
import Group2Svg from '../assets/IlotMenuGroup2.svg';
import Group3Svg from '../assets/IlotMenuGroup3.svg';
import Group4Svg from '../assets/IlotMenuGroup4.svg';
import Group5Svg from '../assets/IlotMenuGroup5.svg';
import Group6Svg from '../assets/IlotMenuGroup6.svg';
import Group7Svg from '../assets/IlotMenuGroup7.svg';
import Group8Svg from '../assets/IlotMenuGroup8.svg';
import Group9Svg from '../assets/IlotMenuGroup9.svg';
import Group10Svg from '../assets/IlotMenuGroup10.svg';
import Group11Svg from '../assets/IlotMenuGroup11.svg';
import Group12Svg from '../assets/IlotMenuGroup12.svg';
import Group13Svg from '../assets/IlotMenuGroup13.svg';
import Group14Svg from '../assets/IlotMenuGroup14.svg';

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
          <View style={styles.groupContainer}>
            <Group1Svg width={24} height={24} />
            <Group2Svg width={24} height={24} />
            <Group3Svg width={24} height={24} />
            <Group4Svg width={24} height={24} />
            <Group5Svg width={24} height={24} />
            <Group6Svg width={24} height={24} />
            <Group7Svg width={24} height={24} />
            <Group8Svg width={24} height={24} />
            <Group9Svg width={24} height={24} />
            <Group10Svg width={24} height={24} />
            <Group11Svg width={24} height={24} />
            <Group12Svg width={24} height={24} />
            <Group13Svg width={24} height={24} />
            <Group14Svg width={24} height={24} />
          </View>
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
  groupContainer: {
    position: 'relative',
    width: 24,
    height: 24,
  },
}); 