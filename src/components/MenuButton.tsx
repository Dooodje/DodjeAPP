import React from 'react';
import { View, Text, ViewStyle, StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface MenuButtonProps {
  label: string;
  isActive: boolean;
  ActiveIcon: React.FC<SvgProps>;
  InactiveIcon: React.FC<SvgProps>;
  style?: ViewStyle;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  isActive,
  ActiveIcon,
  InactiveIcon,
  style,
}) => {
  const Icon = isActive ? ActiveIcon : InactiveIcon;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.background, isActive && styles.activeBackground]} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon width={33} height={33} />
        </View>
        <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 212,
    height: 41,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    opacity: 0.1,
    borderRadius: 50,
  },
  activeBackground: {
    opacity: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  iconContainer: {
    width: 33,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Arboria-Book',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#0A0400',
  },
}); 