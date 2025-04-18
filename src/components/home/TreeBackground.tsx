import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView, LayoutChangeEvent, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PositionData } from '../../types/home';
import PositionButton from './PositionButton';
import theme from '../../config/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Hauteur approximative du header (incluant la barre d'état)
const HEADER_HEIGHT = 120;
// Largeur de référence de l'image (iPhone 15 Pro Max)
const REFERENCE_WIDTH = 550;

interface TreeBackgroundProps {
  imageUrl: string;
  positions: Record<string, PositionData>;
  onPositionPress: (positionId: string, order?: number) => void;
  parcours?: Record<string, any>;
}

const TreeBackground: React.FC<TreeBackgroundProps> = ({ 
  imageUrl, 
  positions, 
  onPositionPress,
  parcours = {}
}) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [scrollViewHeight, setScrollViewHeight] = useState(screenHeight);
  const [scrollViewWidth, setScrollViewWidth] = useState(screenWidth);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const onScrollViewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
    setScrollViewWidth(width);
  };
  
  useEffect(() => {
    if (imageUrl) {
      Image.getSize(imageUrl, (width, height) => {
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
        
        setImageDimensions({
          width: finalWidth,
          height: finalHeight
        });
      }, (error) => {
        console.error('Erreur lors du chargement des dimensions de l\'image:', error);
        setImageDimensions({
          width: screenWidth,
          height: screenHeight * 2
        });
      });
    }
  }, [imageUrl]);

  const positionsArray = useMemo(() => {
    if (!positions) return [];
    return Object.entries(positions).map(([id, posData]) => ({
      id,
      ...posData
    }));
  }, [positions]);

  // Augmenter la hauteur du contenu pour permettre plus de défilement
  const contentHeight = Math.max(imageDimensions.height + 100, scrollViewHeight * 1.5);

  // Calculer la marge horizontale pour centrer l'image
  const horizontalMargin = screenWidth > REFERENCE_WIDTH ? (screenWidth - REFERENCE_WIDTH) / 2 : 0;

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
      
      {/* Image de parcours */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.backgroundImage,
            { 
              height: imageDimensions.height,
              width: imageDimensions.width,
              marginHorizontal: horizontalMargin
            }
          ]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.defaultBackground, { height: imageDimensions.height }]} />
      )}

      {/* Points de parcours */}
      {positionsArray.map((position) => (
        <PositionButton
          key={position.id}
          id={position.id}
          x={position.x}
          y={position.y}
          order={position.order}
          isAnnex={position.isAnnex}
          onPress={onPositionPress}
          parcoursData={position.order && parcours[position.order.toString()]}
          imageWidth={imageDimensions.width}
          imageHeight={imageDimensions.height}
          containerWidth={scrollViewWidth}
          containerHeight={scrollViewHeight}
        />
      ))}
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
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default TreeBackground; 