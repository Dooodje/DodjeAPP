/**
 * Configuration globale du thème de l'application
 * Basé sur le design Figma fourni
 */

import { Platform } from 'react-native';

export const colors = {
  // Couleurs principales de la marque
  primary: {
    light: '#9BEC00',
    main: '#06D001',
    dark: '#059212',
    contrast: '#FFFFFF',
  },

  // Couleurs secondaires
  secondary: {
    light: '#F3FF90',
    main: '#F1E61C',
    dark: '#F1BA0A',
    contrast: '#0A0400',
  },

  // Couleurs de fond
  background: {
    dark: '#0A0400',
    medium: '#1A1A1A',
    light: '#252525',
  },

  // Couleurs de texte
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    inactive: 'rgba(255, 255, 255, 0.6)',
    highlight: '#F3FF90',
  },

  // Couleurs d'états
  status: {
    success: '#06D001',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#0A84FF',
    blocked: '#666666',
  },

  // Couleurs additionnelles
  misc: {
    divider: 'rgba(255, 255, 255, 0.12)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: '#000000',
  },
};

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: 'Arboria-Medium, system-ui, sans-serif',
  }),

  // Tailles de texte
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    title: 24,
    header: 30,
  },

  // Poids des polices
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999, // Pour les cercles parfaits
};

export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: colors.misc.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.misc.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: colors.misc.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};

export const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
}; 