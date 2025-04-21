/**
 * Typographie de l'application Dodje
 * Ce fichier contient la configuration des polices, tailles et styles de texte
 */

export const fontFamily = {
  black: 'Arboria-Black',
  light: 'Arboria-Light',
  bold: 'Arboria-Bold', 
  thin: 'Arboria-Thin',
  medium: 'Arboria-Medium',
  book: 'Arboria-Book',
  mono: 'SpaceMono',
  // Fallbacks au cas où
  regular: 'Arboria-Book', // Book comme standard pour regular
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 24,
  xxxl: 32,
};

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 42,
};

export const fontWeight = {
  thin: '200',
  light: '300',
  normal: '400',
  medium: '500',
  bold: '700',
  black: '900',
};

// Préréglages pour les textes courants
export const presets = {
  heading1: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
  },
  heading2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
  },
  heading3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  heading4: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  body: {
    fontFamily: fontFamily.book,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  bodyBold: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  caption: {
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  small: {
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  medium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
};

export default {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  presets,
}; 