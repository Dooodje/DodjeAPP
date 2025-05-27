import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView, LayoutChangeEvent, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PositionData, Section, Level } from '../../types/home';
import PositionButton from './PositionButton';
import theme from '../../config/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Hauteur approximative du header (incluant la barre d'état)
const HEADER_HEIGHT = 120;
// Largeur de référence de l'image (iPhone 15 Pro Max)
const REFERENCE_WIDTH = 550;

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
  // Nouvelles props pour le système de pré-montage
  currentSection: Section;
  currentLevel: Level;
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
}

const TreeBackground: React.FC<TreeBackgroundProps> = ({ 
  imageUrl, 
  positions, 
  onPositionPress,
  parcours = {},
  imageDimensions,
  isImageLoaded = false,
  currentSection,
  currentLevel,
  allImagesData
}) => {
  const [calculatedDimensions, setCalculatedDimensions] = useState({ width: 0, height: 0 });
  const [scrollViewHeight, setScrollViewHeight] = useState(screenHeight);
  const [scrollViewWidth, setScrollViewWidth] = useState(screenWidth);
  const [imageLoadError, setImageLoadError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const onScrollViewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
    setScrollViewWidth(width);
  };
  
  // Utiliser les dimensions pré-calculées si disponibles, sinon calculer
  useEffect(() => {
    if (imageDimensions && imageDimensions.finalWidth && imageDimensions.finalHeight) {
      // Utiliser les dimensions pré-calculées du cache
      console.log(`🚀 Utilisation des dimensions en cache: ${imageDimensions.finalWidth}x${imageDimensions.finalHeight}`);
      setCalculatedDimensions({
        width: imageDimensions.finalWidth,
        height: imageDimensions.finalHeight
      });
      setImageLoadError(false);
    } else if (imageUrl && imageUrl.trim() !== '') {
      // Fallback: calculer les dimensions si pas en cache
      console.log('⚠️ Dimensions non disponibles en cache, calcul en cours...');
      Image.getSize(
        imageUrl, 
        (width, height) => {
          let finalWidth, finalHeight;
          
          if (screenWidth > REFERENCE_WIDTH) {
            // Pour les écrans plus larges que la référence
            finalWidth = REFERENCE_WIDTH;
            finalHeight = (height * REFERENCE_WIDTH) / width;
          } else {
            // Pour les écrans plus petits que la référence
            finalWidth = screenWidth;
            finalHeight = (height * screenWidth) / width;
          }
          
          setCalculatedDimensions({
            width: finalWidth,
            height: finalHeight
          });
          setImageLoadError(false);
        }, 
        (error) => {
          console.error('Erreur lors du chargement des dimensions de l\'image:', error);
          setImageLoadError(true);
          setCalculatedDimensions({
            width: screenWidth,
            height: screenHeight * 2
          });
        }
      );
    } else {
      // Si pas d'URL définie, définir les dimensions par défaut
      console.log('Pas d\'URL d\'image définie, utilisation des dimensions par défaut');
      setImageLoadError(true);
      setCalculatedDimensions({
        width: screenWidth,
        height: screenHeight * 2
      });
    }
  }, [imageUrl, imageDimensions]);

  const positionsArray = useMemo(() => {
    if (!positions) return [];
    return Object.entries(positions).map(([id, posData]) => ({
      id,
      ...posData
    }));
  }, [positions]);

  // Augmenter la hauteur du contenu pour permettre plus de défilement
  const contentHeight = Math.max(calculatedDimensions.height + 100, scrollViewHeight * 1.5);

  // Calculer la marge horizontale pour centrer l'image
  const horizontalMargin = screenWidth > REFERENCE_WIDTH ? (screenWidth - REFERENCE_WIDTH) / 2 : 0;

  // Générer la clé actuelle pour identifier l'image active
  const currentKey = `${currentSection}-${currentLevel}`;

  // Créer les styles d'image communs
  const getImageStyle = (dimensions: any) => [
    styles.backgroundImage,
    { 
      height: dimensions?.finalHeight || calculatedDimensions.height,
      width: dimensions?.finalWidth || calculatedDimensions.width,
      marginHorizontal: horizontalMargin,
    }
  ];

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
      
      {/* Pré-monter TOUTES les images de fond (cachées) */}
      {allImagesData && ALL_SECTIONS.map(section => 
        ALL_LEVELS.map(level => {
          const key = `${section}-${level}`;
          const imageData = allImagesData.get(key);
          const isCurrentImage = key === currentKey;
          
          if (!imageData?.url) return null;
          
          return (
            <Image
              key={key}
              source={{ uri: imageData.url }}
              style={[
                ...getImageStyle(imageData.dimensions),
                {
                  // Seule l'image actuelle est visible
                  opacity: isCurrentImage ? 0.9 : 0,
                  // Garder toutes les images dans le layout pour éviter les recalculs
                  position: 'absolute',
                  top: 0,
                  zIndex: isCurrentImage ? 1 : 0
                }
              ]}
              resizeMode="contain"
              onError={() => {
                if (isCurrentImage) {
                  setImageLoadError(true);
                }
              }}
              onLoad={() => {
                if (isCurrentImage) {
                  console.log(`🖼️ Image active affichée instantanément: ${key}`);
                }
              }}
            />
          );
        })
      ).flat()}
      
      {/* Image de fallback si aucune image pré-montée n'est disponible */}
      {(!allImagesData || !allImagesData.get(currentKey)) && imageUrl && !imageLoadError && (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.backgroundImage,
            { 
              height: calculatedDimensions.height,
              width: calculatedDimensions.width,
              marginHorizontal: horizontalMargin,
              opacity: isImageLoaded ? 0.9 : 0.5
            }
          ]}
          resizeMode="contain"
          onError={() => setImageLoadError(true)}
          onLoad={() => {
            console.log('🖼️ Image de fallback affichée');
          }}
        />
      )}

      {/* Fond par défaut si aucune image n'est disponible */}
      {(!imageUrl || imageLoadError) && (!allImagesData || !allImagesData.get(currentKey)) && (
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
        
        return (
          <PositionButton
            key={position.id}
            id={position.id}
            x={position.x}
            y={position.y}
            order={position.order}
            isAnnex={position.isAnnex}
            onPress={onPositionPress}
            parcoursData={parcoursData}
            imageWidth={calculatedDimensions.width}
            imageHeight={calculatedDimensions.height}
            containerWidth={scrollViewWidth}
            containerHeight={scrollViewHeight}
          />
        );
      })}
    </ScrollView>
  );
};

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
    opacity: 0.9,
  },
  defaultBackground: {
    backgroundColor: theme.colors.background.medium,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default TreeBackground; 