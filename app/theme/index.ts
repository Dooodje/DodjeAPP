/**
 * Thème de l'application Dodje
 * Exporte tous les éléments du thème (couleurs, typographie, espacement, etc.)
 */

import typography from './typography';

// Couleurs de l'application
export const colors = {
  // Couleurs principales
  primary: '#000000',
  secondary: '#059212',
  accent1: '#06D001',
  accent2: '#9BEC00',
  accent3: '#F3FF90',
  background: '#0A0400',
  
  // Couleurs fonctionnelles
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    disabled: '#777777',
  },
  
  // Autres couleurs
  white: '#FFFFFF',
  black: '#000000',
  error: '#FF0000',
  success: '#06D001',
  warning: '#FFA500',
};

// Espacement standard
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Dégradés
export const gradients = {
  primary: ['#06D001', '#9BEC00', '#F3FF90'],
  // Autres dégradés seront ajoutés selon les maquettes Figma
};

// Ombres
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Coins arrondis
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999, // Pour les cercles parfaits
};

// Exporter la typographie
export const { 
  fontFamily, 
  fontSize, 
  lineHeight, 
  fontWeight, 
  presets: textPresets
} = typography;

// Exporter le thème complet
export default {
  colors,
  spacing,
  gradients,
  shadows,
  borderRadius,
  ...typography,
}; 