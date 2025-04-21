import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { fontFamily, textPresets } from '../theme';

export type TextPresetNames = keyof typeof textPresets;

interface StyledTextProps extends TextProps {
  preset?: TextPresetNames;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  center?: boolean;
}

/**
 * Composant Text personnalisé qui utilise les polices Arboria et les styles prédéfinis
 */
export function StyledText(props: StyledTextProps) {
  const {
    preset = 'body',
    style: styleOverride,
    bold = false,
    italic = false,
    color,
    center = false,
    ...rest
  } = props;

  // Obtenir le style de base pour le preset
  const presetStyle = textPresets[preset] || textPresets.body;

  // Déterminer la police en fonction des options bold et italic
  let customFont = presetStyle.fontFamily;
  if (bold && presetStyle.fontFamily === fontFamily.light) {
    customFont = fontFamily.bold;
  }
  // Note: Nous n'avons pas de variante italique pour le moment

  const styles = [
    presetStyle,
    customFont ? { fontFamily: customFont } : {},
    color ? { color } : {},
    center ? { textAlign: 'center' as TextStyle['textAlign'] } : {},
    styleOverride,
  ];

  return <Text style={styles} {...rest} />;
}

export default StyledText; 