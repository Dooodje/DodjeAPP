# Plan d'intégration des maquettes Figma dans l'application Dodje

## 1. Préparation et analyse

### 1.1. Audit de l'application existante
- Analyser la structure actuelle des composants
- Identifier le système de style existant (thèmes, variables CSS/StyleSheet)
- Vérifier la gestion des assets (images, icônes)
- Examiner l'architecture de navigation

### 1.2. Préparation des ressources
- Importer la police Arboria dans le projet
  - Créer un dossier `/assets/fonts/`
  - Ajouter les fichiers de police (.ttf/.otf)
  - Configurer React Native pour utiliser ces polices
- Créer une structure pour les assets extraits de Figma
  - `/assets/icons/` - pour les icônes SVG
  - `/assets/images/` - pour les images
  - `/assets/illustrations/` - pour les illustrations complexes

### 1.3. Extraction des tokens de design
- Extraire les couleurs principales et secondaires
- Identifier les dégradés récurrents
- Documenter les espacements et tailles standard
- Noter les styles de texte (taille, poids, couleur)
- Lister les ombres et élévations

## 2. Mise en place des fondations

### 2.1. Création d'un système de thème
```typescript
// theme.ts
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
  // Autres catégories de couleurs...
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontFamily: {
    regular: 'Arboria-Book',
    medium: 'Arboria-Medium',
    bold: 'Arboria-Bold',
    light: 'Arboria-Light',
    italic: 'Arboria-Italic',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const gradients = {
  primary: ['#06D001', '#9BEC00', '#F3FF90'],
  // Autres dégradés...
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  // Autres ombres...
};
```

### 2.2. Mise en place des composants de base
- Créer des versions styled des composants React Native de base
```typescript
// components/Text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography, colors } from '../theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  color?: keyof typeof colors.text;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  ...props
}) => {
  // Définir les styles en fonction de la variante
  const variantStyles = getVariantStyles(variant);
  
  return (
    <RNText 
      style={[
        variantStyles, 
        { color: colors.text[color] }, 
        style
      ]} 
      {...props}
    />
  );
};

const getVariantStyles = (variant: TextProps['variant']) => {
  switch (variant) {
    case 'h1':
      return {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xxxl,
        lineHeight: typography.fontSize.xxxl * 1.2,
      };
    // Autres variantes...
    default:
      return {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        lineHeight: typography.fontSize.md * 1.5,
      };
  }
};
```

- Répéter pour d'autres composants de base (Button, Card, Container, etc.)

### 2.3. Configuration des SVG
- Installer `react-native-svg` et `react-native-svg-transformer`
- Configurer Metro pour transformer les SVG en composants
- Créer un système pour importer les icônes facilement

## 3. Stratégie d'intégration écran par écran

### 3.1. Processus d'intégration pour chaque écran
1. **Extraction des ressources**
   - Exporter les SVG, images et autres assets spécifiques à l'écran
   - Ajouter ces ressources dans les dossiers appropriés
   
2. **Analyse de la structure**
   - Identifier les principaux composants de l'écran
   - Décomposer en composants réutilisables
   
3. **Reproduction du layout**
   - Recréer la structure principale avec les bons espacements
   - Implémenter les grilles et alignements
   
4. **Application du style**
   - Appliquer les couleurs, dégradés et ombres
   - Configurer les typographies
   
5. **Révision et ajustements**
   - Comparer avec la maquette Figma
   - Ajuster les détails visuels

### 3.2. Ordre de priorité des écrans
1. Page d'accueil (Accueil bourse/crypto)
2. Parcours
3. Catalogue
4. Profil
5. Dodje Lab
6. Boutique
7. Pages secondaires (Quiz, Simulation, etc.)

## 4. Techniques d'extraction depuis Figma

### 4.1. Extraction des couleurs et styles
- Utiliser l'inspecteur Figma pour obtenir les codes hexadécimaux
- Noter les dégradés (direction, couleurs, stops)
- Extraire les ombres (offset, opacité, rayon)

### 4.2. Extraction des SVG
- Sélectionner l'élément dans Figma
- Cliquer droit > "Copy as" > "Copy as SVG"
- Créer un fichier .svg dans le projet
- Pour les icônes complexes, utiliser la fonction "Export"

### 4.3. Extraction des mesures et espacements
- Utiliser l'outil de mesure de Figma pour obtenir les dimensions
- Noter les marges et paddings
- Documenter les grilles utilisées

### 4.4. Utilisation des dégradés
- Pour les dégradés linéaires:
```jsx
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#06D001', '#9BEC00', '#F3FF90']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.gradientBackground}
/>
```

- Pour les dégradés radiaux, utiliser des solutions comme `react-native-linear-gradient`

## 5. Composants spécifiques à recréer

### 5.1. Navigation et tabs
- Recréer la barre de navigation inférieure
- Styliser les indicateurs d'onglet actif
- Implémenter les transitions entre onglets

### 5.2. Cartes et conteneurs
- Créer des composants Card avec les bons arrondis et ombres
- Implémenter les conteneurs avec dégradés
- Styliser les listes et grilles

### 5.3. Boutons et contrôles
- Styliser les différentes variantes de boutons
- Créer des composants pour les contrôles personnalisés
- Implémenter les états (normal, pressed, disabled)

### 5.4. Éléments spécifiques
- Recréer les indicateurs de parcours
- Styliser les quiz et questionnaires
- Implémenter les visuels de la page d'accueil

## 6. Tests et validation

### 6.1. Tests de compatibilité
- Vérifier le rendu sur différentes tailles d'écran
- Tester sur iOS et Android
- Valider l'apparence en mode clair/sombre (si applicable)

### 6.2. Tests de performance
- Vérifier la fluidité des animations
- Optimiser les ressources lourdes
- Mesurer l'impact sur les performances

### 6.3. Comparaison avec les maquettes
- Superposer les captures d'écran de l'app avec les maquettes
- Vérifier la fidélité du rendu
- Ajuster les écarts de design

## 7. Documentation

### 7.1. Guide de style
- Documenter tous les tokens de design
- Créer un guide des composants disponibles
- Expliquer les conventions de nommage

### 7.2. Processus d'ajout de nouveaux écrans
- Documenter la méthode pour ajouter de nouveaux écrans
- Expliquer comment utiliser les composants existants
- Fournir des exemples

## 8. Défis anticipés et solutions

### 8.1. Complexité des dégradés
- **Défi**: Certains dégradés complexes peuvent être difficiles à reproduire
- **Solution**: Utiliser des images de fond pour les dégradés très complexes ou des bibliothèques spécialisées

### 8.2. Polices personnalisées
- **Défi**: La police Arboria peut avoir des inconsistances sur différentes plateformes
- **Solution**: Tester rigoureusement et ajuster les styles de texte si nécessaire

### 8.3. Animations et transitions
- **Défi**: Reproduire les animations subtiles de Figma
- **Solution**: Utiliser React Native Reanimated pour les animations complexes, planifier cette phase séparément

### 8.4. Maintenance à long terme
- **Défi**: Garder la cohérence lors de futures mises à jour
- **Solution**: Mettre en place un système de design solide et documenté, créer des composants réutilisables 