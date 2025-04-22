import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { MenuButton } from './MenuButton';
import BourseActiveIcon from '../assets/MenuBourseActive.svg';
import CryptoActiveIcon from '../assets/MenuCryptoActive.svg';

interface MenuProps {
  activeMenu: 'bourse' | 'crypto';
  style?: ViewStyle;
}

export const Menu: React.FC<MenuProps> = ({ activeMenu, style }) => {
  return (
    <View style={[styles.container, style]}>
      <MenuButton
        label="Bourse"
        isActive={activeMenu === 'bourse'}
        ActiveIcon={BourseActiveIcon}
        InactiveIcon={BourseActiveIcon}
      />
      <MenuButton
        label="Crypto"
        isActive={activeMenu === 'crypto'}
        ActiveIcon={CryptoActiveIcon}
        InactiveIcon={CryptoActiveIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
}); 