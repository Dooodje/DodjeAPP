import React, { useMemo, useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView, LayoutChangeEvent, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PositionData, Section, Level } from '../../types/home';
import PositionButton from './PositionButton';
import theme from '../../config/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Hauteur approximative du header (incluant la barre d'état)
const HEADER_HEIGHT = 120;
// Largeur de référence de l'image (iPhone 15 Pro Max)
const REFERENCE_WIDTH = 552;

// Toutes les combinaisons possibles pour pré-monter les images
const ALL_SECTIONS: Section[] = ['Bourse', 'Crypto'];
const ALL_LEVELS: Level[] = ['Débutant', 'Avancé', 'Expert'];

interface TreeBackgroundProps {
  imageUrl?: string;
  positions: Record<string, PositionData>;
  onPositionPress: (positionId: string, order?: number) => void;
  parcours?: Record<string, any>;
  imageDimensions?: {
    width: number;
    height: number;
    finalWidth: number;
    finalHeight: number;
  };
  isImageLoaded?: boolean;
  // Props pour identifier la section/niveau actuel
  currentSection: Section;
  currentLevel: Level;
  // Map de toutes les images préchargées
  allImagesData?: Map<string, {
    url: string;
    dimensions?: {
      width: number;
      height: number;
      finalWidth: number;
      finalHeight: number;
    };
    isLoaded: boolean;
  }>;
  // Props pour l'animation de déblocage
  pendingUnlockParcoursOrder?: number | null;
  hideLockParcoursOrder?: number | null;
}

export interface TreeBackgroundRef {
  scrollToPosition: (order: number) => Promise<{ x: number; y: number } | null>;
}

export const TreeBackground = forwardRef<TreeBackgroundRef, TreeBackgroundProps>(({
  imageUrl,
  positions,
  onPositionPress,
  parcours,
  imageDimensions,
  isImageLoaded,
  currentSection,
  currentLevel,
  allImagesData,
  pendingUnlockParcoursOrder,
  hideLockParcoursOrder
}, ref) => {
  const [scrollViewDimensions, setScrollViewDimensions] = useState({ width: 0, height: 0 });
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculer les dimensions optimisées (comme l'ancienne version)
  const calculatedDimensions = useMemo(() => {
    if (imageDimensions) {
      return {
        width: imageDimensions.finalWidth,
        height: imageDimensions.finalHeight
      };
    }
    
    // Dimensions par défaut optimisées
    const aspectRatio = 1457.2463768115942 / 400;
    const width = Math.min(screenWidth, REFERENCE_WIDTH);
    const height = width * aspectRatio;
    
    return { width, height };
  }, [imageDimensions]);

  // Calculer la marge horizontale
  const horizontalMargin = Math.max(0, (screenWidth - calculatedDimensions.width) / 2);
  
  // Hauteur du contenu
  const contentHeight = Math.max(calculatedDimensions.height + HEADER_HEIGHT, screenHeight);

  // Positions des parcours
  const positionsArray = useMemo(() => {
    if (!positions) return [];
    return Object.entries(positions).map(([id, posData]) => ({
      id,
      ...posData
    }));
  }, [positions]);
  
  const onScrollViewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScrollViewDimensions({ width, height });
  };

  const scrollToPosition = async (order: number): Promise<{ x: number; y: number } | null> => {
    return new Promise((resolve) => {
      if (!scrollViewRef.current) {
        resolve(null);
        return;
      }

      const position = positionsArray.find(p => p.order === order);
      if (!position) {
        resolve(null);
        return;
      }

      // Calculer la position absolue du parcours sur l'image
      const absoluteX = (position.x * calculatedDimensions.width) / 100;
      const absoluteY = (position.y * calculatedDimensions.height) / 100;

      // Calculer les limites de scroll
      const maxScrollX = Math.max(0, calculatedDimensions.width - scrollViewDimensions.width);
      const maxScrollY = Math.max(0, contentHeight - scrollViewDimensions.height);

      // Calculer la position de scroll pour centrer le parcours à l'écran
      let targetScrollX = absoluteX - (scrollViewDimensions.width / 2);
      let targetScrollY = absoluteY - (scrollViewDimensions.height / 2);

      // Limiter le scroll dans les bornes valides
      const scrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));
      const scrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));

      console.log('🎯 Calcul de position pour le parcours', order, {
        absoluteX,
        absoluteY,
        targetScrollX,
        targetScrollY,
        scrollX,
        scrollY,
        maxScrollX,
        maxScrollY,
        scrollViewDimensions,
        calculatedDimensions,
        horizontalMargin
      });

      // Scroller vers la position
      scrollViewRef.current.scrollTo({ 
        x: scrollX, 
        y: scrollY, 
        animated: true 
      });

      // Attendre que le scroll soit terminé avant de retourner la position écran
      setTimeout(() => {
        // Calculer la position réelle du parcours à l'écran après le scroll
        // La position écran = position absolue - position de scroll + marge horizontale
        // Mais il faut tenir compte que l'image est centrée avec marginHorizontal
        const imageStartX = horizontalMargin; // Position de début de l'image à l'écran
        const relativeXOnImage = absoluteX - scrollX; // Position relative sur l'image visible
        
        // Ajouter un petit décalage vers la droite pour les parcours à droite de l'écran
        const isRightSide = position.x > 50; // Si le parcours est à plus de 50% vers la droite
        const rightSideOffset = isRightSide ? 12 : 0; // Décalage de 15px vers la droite
        
        const screenX = imageStartX + relativeXOnImage + rightSideOffset;
        const screenY = absoluteY - scrollY - 25; // Ajustement pour centrer sur le cadenas
        
        console.log('📍 Position écran finale calculée:', {
          screenX,
          screenY,
          absoluteX,
          absoluteY,
          scrollX,
          scrollY,
          horizontalMargin,
          imageStartX,
          relativeXOnImage,
          isRightSide,
          rightSideOffset,
          positionXPercent: position.x,
          calculatedDimensions,
          scrollViewDimensions
        });
        
        resolve({ x: screenX, y: screenY });
      }, 500); // Attendre 500ms pour que l'animation de scroll soit terminée
    });
  };

  useImperativeHandle(ref, () => ({
    scrollToPosition
  }));

  // Clé de l'image actuelle
  const currentImageKey = `${currentSection}-${currentLevel}`;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { minHeight: contentHeight }
      ]}
      onLayout={onScrollViewLayout}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      bounces={true}
      overScrollMode="auto"
    >
      {/* Dégradé de fond */}
      <LinearGradient
        colors={[theme.colors.background.dark, 'rgba(10, 4, 0, 0.9)', 'rgba(10, 4, 0, 0.8)']}
        style={styles.gradient}
      />
      
      {/* PRÉ-MONTAGE DE TOUTES LES 6 IMAGES POUR LES GARDER EN MÉMOIRE */}
      {ALL_SECTIONS.map(section => 
        ALL_LEVELS.map(level => {
          const key = `${section}-${level}`;
          const imageData = allImagesData?.get(key);
          const isCurrentImage = key === currentImageKey;
          
          if (!imageData?.url || !imageData?.isLoaded) return null;
          
          return (
            <Image
              key={key}
              source={{ uri: imageData.url }}
              style={[
                styles.backgroundImage,
                {
                  height: calculatedDimensions.height,
                  width: calculatedDimensions.width,
                  marginHorizontal: horizontalMargin,
                  opacity: isCurrentImage ? 0.9 : 0, // Visible seulement si c'est l'image actuelle
                  zIndex: isCurrentImage ? 1 : 0, // Au premier plan seulement si c'est l'image actuelle
                }
              ]}
              resizeMode="contain"
            />
          );
        })
      ).flat()}
      
      {/* Fallback vers imageUrl si les images préchargées ne sont pas disponibles */}
      {imageUrl && !allImagesData?.get(currentImageKey)?.isLoaded && (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.backgroundImage,
            {
              height: calculatedDimensions.height,
              width: calculatedDimensions.width,
              marginHorizontal: horizontalMargin,
              opacity: 0.9,
            }
          ]}
          resizeMode="contain"
        />
      )}
      
      {/* Fond par défaut SEULEMENT si aucune image n'est disponible */}
      {!imageUrl && !allImagesData?.get(currentImageKey)?.isLoaded && (
        <View 
          style={[
            styles.defaultBackground, 
            { 
              height: calculatedDimensions.height,
              width: '100%'
            }
          ]} 
        />
      )}

      {/* Points de parcours */}
      {positionsArray.map((position) => {
        const parcoursData = parcours && position.order !== undefined ? parcours[position.order.toString()] : null;
        
        // Si ce parcours est en cours de déblocage, garder l'ancien statut (blocked)
        let modifiedParcoursData = parcoursData;
        if (pendingUnlockParcoursOrder !== null && 
            position.order === pendingUnlockParcoursOrder && 
            parcoursData) {
          modifiedParcoursData = {
            ...parcoursData,
            status: 'blocked' // Forcer le statut bloqué pendant l'animation
          };
        }
        
        return (
          <PositionButton
            key={position.id}
            id={position.id}
            x={position.x}
            y={position.y}
            order={position.order}
            isAnnex={position.isAnnex}
            onPress={onPositionPress}
            parcoursData={modifiedParcoursData}
            imageWidth={calculatedDimensions.width}
            imageHeight={calculatedDimensions.height}
            containerWidth={scrollViewDimensions.width}
            containerHeight={scrollViewDimensions.height}
            hideVector={hideLockParcoursOrder !== null && position.order === hideLockParcoursOrder}
          />
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.background.dark,
  },
  contentContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: HEADER_HEIGHT,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  defaultBackground: {
    backgroundColor: theme.colors.background.medium,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
}); 