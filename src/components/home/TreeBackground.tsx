import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import { PositionData } from '../../types/home';
import PositionButton from './PositionButton';

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
  const scrollViewRef = useRef<ScrollView>(null);
  
  const onScrollViewLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
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

  const contentHeight = Math.max(imageDimensions.height, scrollViewHeight * 1.5);
  const minScrollOffset = 0;
  const maxScrollOffset = Math.max(0, imageDimensions.height - scrollViewHeight);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY < minScrollOffset) {
      scrollViewRef.current?.scrollTo({ y: minScrollOffset, animated: false });
    } else if (offsetY > maxScrollOffset) {
      scrollViewRef.current?.scrollTo({ y: maxScrollOffset, animated: false });
    }
  };

  // Calculer la marge horizontale pour centrer l'image
  const horizontalMargin = screenWidth > REFERENCE_WIDTH ? (screenWidth - REFERENCE_WIDTH) / 2 : 0;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { marginTop: 0 }]}
      contentContainerStyle={[
        styles.contentContainer,
        { minHeight: contentHeight }
      ]}
      onLayout={onScrollViewLayout}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={handleScroll}
      bounces={false}
      overScrollMode="never"
    >
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
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: HEADER_HEIGHT,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  defaultBackground: {
    backgroundColor: '#1A1A1A',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default TreeBackground; 