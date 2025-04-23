# Composants Figma

Ce dossier contient les composants importés depuis Figma, convertis en composants React Native.

## Composants disponibles

### PastilleAnnexe

Composant importé depuis Figma représentant une pastille annexe avec un design circulaire.

#### Usage

```tsx
import PastilleAnnexe from '@components/PastilleAnnexe';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      {/* Utilisation avec taille par défaut (64x64) */}
      <PastilleAnnexe />
      
      {/* Utilisation avec taille personnalisée */}
      <PastilleAnnexe width={48} height={48} />
    </View>
  );
};
```

#### Props

| Prop   | Type   | Par défaut | Description                      |
|--------|--------|------------|----------------------------------|
| width  | number | 64         | Largeur du composant en pixels   |
| height | number | 64         | Hauteur du composant en pixels   |

## Comment ajouter de nouveaux composants Figma

1. Exporter le SVG depuis Figma
2. Placer le fichier SVG dans `src/assets/`
3. Créer un nouveau composant React Native dans `src/components/`
4. Importer le SVG et l'intégrer dans le composant
5. Documenter le composant dans ce README

## Configurations techniques

Le projet utilise les packages suivants pour le support des SVG :
- `react-native-svg` : Pour afficher les SVG dans React Native
- `react-native-svg-transformer` : Pour importer directement les SVG comme des composants

La configuration Metro pour le support SVG est déjà en place dans le fichier `metro.config.js` à la racine du projet. 