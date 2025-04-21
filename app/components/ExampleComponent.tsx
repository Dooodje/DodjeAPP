import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import StyledText from './StyledText';
import { colors } from '../theme';

/**
 * Composant d'exemple montrant l'utilisation des différentes variantes de la police Arboria
 */
export default function ExampleComponent() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <StyledText preset="heading1" style={styles.marginBottom}>
          Heading 1 (Arboria-Black)
        </StyledText>
        
        <StyledText preset="heading2" style={styles.marginBottom}>
          Heading 2 (Arboria-Bold)
        </StyledText>
        
        <StyledText preset="heading3" style={styles.marginBottom}>
          Heading 3 (Arboria-Bold)
        </StyledText>
        
        <StyledText preset="heading4" style={styles.marginBottom}>
          Heading 4 (Arboria-Medium)
        </StyledText>
      </View>
      
      <View style={styles.section}>
        <StyledText style={[styles.sectionTitle, styles.marginBottom]}>
          Variantes de police
        </StyledText>
        
        <StyledText preset="body" style={styles.marginBottom}>
          Body Text (Arboria-Book) - Ceci est un exemple de texte de paragraphe
          standard utilisé pour les contenus principaux de l'application.
        </StyledText>
        
        <StyledText preset="bodyBold" style={styles.marginBottom}>
          Body Bold (Arboria-Bold) - Variante en gras du texte de paragraphe standard.
        </StyledText>
        
        <StyledText preset="medium" style={styles.marginBottom}>
          Medium Text (Arboria-Medium) - Utilisé pour les textes ayant une importance modérée.
        </StyledText>
        
        <StyledText preset="caption" style={styles.marginBottom}>
          Caption (Arboria-Light) - Utilisé pour les légendes et textes secondaires.
        </StyledText>
        
        <StyledText preset="button" style={styles.marginBottom}>
          Button Text (Arboria-Bold)
        </StyledText>
        
        <StyledText preset="small" style={styles.marginBottom}>
          Small Text (Arboria-Light) - Pour les textes très petits comme les mentions légales.
        </StyledText>
      </View>
      
      <View style={styles.section}>
        <StyledText style={[styles.sectionTitle, styles.marginBottom]}>
          Variantes de style
        </StyledText>
        
        <StyledText preset="body" color={colors.accent1} style={styles.marginBottom}>
          Texte coloré en vert accent
        </StyledText>
        
        <StyledText preset="body" center style={styles.marginBottom}>
          Texte centré
        </StyledText>
        
        <StyledText preset="body" bold style={styles.marginBottom}>
          Texte standard avec option bold
        </StyledText>
        
        <StyledText preset="body" style={[styles.marginBottom, styles.customStyle]}>
          Texte avec style personnalisé
        </StyledText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 32,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Arboria-Bold',
    fontSize: 20,
    color: colors.accent2,
    marginBottom: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },
  customStyle: {
    backgroundColor: colors.accent2,
    padding: 10,
    borderRadius: 8,
  },
}); 