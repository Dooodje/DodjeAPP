import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView, LayoutChangeEvent, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogoLoadingSpinner } from '../ui/LogoLoadingSpinner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Mode de développement pour afficher la grille de référence
const DEV_GRID_MODE = __DEV__ && false; // Désactiver la grille pour la production

interface CourseBackgroundProps {
  imageUrl?: string;
  positions: Record<string, { x: number; y: number; order?: number; isAnnex: boolean }>;
  children: React.ReactNode;
  loading?: boolean;
  lastViewedVideoId?: string; // ID de la dernière vidéo visionnée
  lastUnblockedVideoId?: string; // ID de la dernière vidéo unblocked
  refreshControl?: React.ReactElement; // Prop pour le contrôle de rafraîchissement
  onImageDimensionsChange?: (width: number, height: number) => void; // Callback pour les dimensions de l'image
}

export interface CourseBackgroundRef {
  scrollToVideo: (videoId: string) => Promise<boolean>;
}

const CourseBackground = forwardRef<CourseBackgroundRef, CourseBackgroundProps>(({ 
  imageUrl, 
  positions,
  children,
  loading = false,
  lastViewedVideoId,
  lastUnblockedVideoId,
  refreshControl,
  onImageDimensionsChange
}, ref) => {
  // Initialiser avec des dimensions par défaut non nulles (taille de l'écran)
  const [imageDimensions, setImageDimensions] = useState({ 
    width: screenWidth, 
    height: screenHeight 
  });
  const [scrollViewHeight, setScrollViewHeight] = useState(screenHeight);
  const [scrollViewWidth, setScrollViewWidth] = useState(screenWidth);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Exposer la méthode scrollToVideo via la référence
  useImperativeHandle(ref, () => ({
    scrollToVideo: async (videoId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        console.log(`🎯 CourseBackground.scrollToVideo appelé pour la vidéo: ${videoId}`);
        console.log(`  - scrollViewRef.current: ${!!scrollViewRef.current}`);
        console.log(`  - positions disponibles: ${Object.keys(positions)}`);
        console.log(`  - position pour ${videoId}: ${!!positions[videoId]}`);
        
        if (!scrollViewRef.current || !positions[videoId]) {
          console.warn(`❌ Impossible de scroller vers la vidéo ${videoId}: ScrollView ou position non disponible`);
          if (!scrollViewRef.current) {
            console.warn(`  - scrollViewRef.current est null`);
          }
          if (!positions[videoId]) {
            console.warn(`  - Position non trouvée pour ${videoId} dans:`, Object.keys(positions));
          }
          resolve(false);
          return;
        }

        const videoPosition = positions[videoId];
        console.log(`📍 Position trouvée pour ${videoId}:`, videoPosition);
        console.log(`  - imageDimensions: ${imageDimensions.width}x${imageDimensions.height}`);
        console.log(`  - scrollViewHeight: ${scrollViewHeight}`);
        
        // Calculer la position pour centrer cette vidéo
        const scrollPosition = Math.max(0, (videoPosition.y / 100) * imageDimensions.height - scrollViewHeight / 2);
        const finalScrollPosition = Math.min(scrollPosition, imageDimensions.height - scrollViewHeight);
        
        console.log(`🎯 Calcul de scroll pour la vidéo ${videoId}:`);
        console.log(`  - Position Y: ${videoPosition.y}%`);
        console.log(`  - Position Y en pixels: ${(videoPosition.y / 100) * imageDimensions.height}px`);
        console.log(`  - Position de scroll calculée: ${scrollPosition}px`);
        console.log(`  - Position de scroll finale: ${finalScrollPosition}px`);
        
        scrollViewRef.current.scrollTo({ y: finalScrollPosition, animated: true });
        
        // Attendre que l'animation soit terminée
        setTimeout(() => {
          console.log(`✅ Scroll vers la vidéo ${videoId} terminé`);
          resolve(true);
        }, 500);
      });
    }
  }));
  
  // Reset du flag initialScrollDone quand les positions changent
  useEffect(() => {
    if (positions && Object.keys(positions).length > 0) {
      console.log("Positions mises à jour, réinitialisation du scroll initial");
      // Analyser les positions pour le débogage
      if (__DEV__) {
        console.log(`CourseBackground reçoit ${Object.keys(positions).length} positions:`);
        Object.entries(positions).forEach(([id, position]: [string, any]) => {
          if (position && typeof position.x === 'number' && typeof position.y === 'number') {
            console.log(`  - Position ${id}: x=${position.x}, y=${position.y}`);
          } else {
            console.warn(`  - Position ${id} invalide:`, position);
          }
        });
      }
      
      setInitialScrollDone(false);
    }
  }, [positions]);
  
  // Notifier le parent des changements de dimensions de l'image
  useEffect(() => {
    if (onImageDimensionsChange && imageDimensions.width > 0 && imageDimensions.height > 0) {
      console.log(`Notification des dimensions de l'image: ${imageDimensions.width}x${imageDimensions.height}`);
      onImageDimensionsChange(imageDimensions.width, imageDimensions.height);
    } else if (onImageDimensionsChange && (!imageDimensions.width || !imageDimensions.height)) {
      console.warn('Tentative de notification avec des dimensions invalides:', imageDimensions);
    }
  }, [imageDimensions, onImageDimensionsChange]);
  
  const onScrollViewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScrollViewWidth(width);
    setScrollViewHeight(height);
  };
  
  // Effet pour charger les dimensions de l'image
  useEffect(() => {
    // Si pas d'URL d'image, considérer que c'est chargé pour ne pas bloquer
    if (!imageUrl || imageUrl.trim() === '') {
      setImageLoaded(true);
      setImageError(false);
      
      // Dimensions par défaut basées sur l'écran
      setImageDimensions({
        width: screenWidth,
        height: screenHeight // Pas de scroll supplémentaire sans image
      });
      return;
    }
    
    // Sinon charger l'image et obtenir ses dimensions
    Image.getSize(imageUrl, (width, height) => {
      let finalWidth, finalHeight;
      
      // Calculer les dimensions de l'image en conservant son ratio
      // mais en s'adaptant à la largeur de l'écran
      const imageRatio = height / width;
      finalWidth = Math.max(Math.min(screenWidth, width), 100); // Jamais moins de 100px de large
      finalHeight = Math.max(finalWidth * imageRatio, 100); // Jamais moins de 100px de haut
      
      console.log(`Image d'arrière-plan: dimensions originales=${width}x${height}, dimensions finales=${finalWidth}x${finalHeight}`);
      
      setImageDimensions({
        width: finalWidth,
        height: finalHeight
      });
      setImageLoaded(true);
    }, (error) => {
      console.error('Erreur lors du chargement des dimensions de l\'image:', error);
      setImageError(true);
      setImageLoaded(true); // Important pour ne pas bloquer l'interface
      
      // Dimensions par défaut en cas d'erreur, basées sur l'écran
      setImageDimensions({
        width: screenWidth,
        height: screenHeight
      });
    });
  }, [imageUrl]);

  // Défilement initial vers la dernière vidéo unblocked ou la dernière vidéo visionnée
  useEffect(() => {
    console.log(`🔍 CourseBackground scroll initial - Conditions:`);
    console.log(`  - imageLoaded: ${imageLoaded}`);
    console.log(`  - scrollViewRef.current: ${!!scrollViewRef.current}`);
    console.log(`  - initialScrollDone: ${initialScrollDone}`);
    console.log(`  - loading: ${loading}`);
    console.log(`  - imageDimensions.height: ${imageDimensions.height}`);
    console.log(`  - lastUnblockedVideoId: ${lastUnblockedVideoId}`);
    console.log(`  - lastViewedVideoId: ${lastViewedVideoId}`);
    console.log(`  - positions keys: ${Object.keys(positions)}`);
    
    if (imageLoaded && scrollViewRef.current && !initialScrollDone && !loading && imageDimensions.height > 0) {
      let scrollPosition = 0;
      let targetVideoId = null;
      
      // Si lastUnblockedVideoId est fourni, ne pas faire de scroll initial automatique
      // La page parent gérera le scroll via scrollToVideo
      if (lastUnblockedVideoId) {
        console.log(`⏸️ CourseBackground: lastUnblockedVideoId fourni (${lastUnblockedVideoId}), pas de scroll initial automatique`);
        setInitialScrollDone(true);
        return;
      }
      
      // Priorité 1: Dernière vidéo visionnée (seulement si pas de lastUnblockedVideoId)
      if (lastViewedVideoId && positions[lastViewedVideoId]) {
        targetVideoId = lastViewedVideoId;
        const videoPosition = positions[lastViewedVideoId];
        scrollPosition = Math.max(0, (videoPosition.y / 100) * imageDimensions.height - scrollViewHeight / 2);
        scrollPosition = Math.min(scrollPosition, imageDimensions.height - scrollViewHeight);
        console.log(`📺 CourseBackground: Défilement vers la dernière vidéo visionnée (${lastViewedVideoId}) à la position Y: ${videoPosition.y}% => ${scrollPosition}px`);
      }
      // Priorité 2: Haut de l'image par défaut
      else {
        scrollPosition = 0;
        console.log(`⬆️ CourseBackground: Défilement vers le haut de l'image à la position Y: ${scrollPosition}`);
        if (lastViewedVideoId) {
          console.log(`⚠️ CourseBackground: lastViewedVideoId fourni (${lastViewedVideoId}) mais position non trouvée dans:`, Object.keys(positions));
        }
      }
      
      // Petit délai pour s'assurer que le ScrollView est complètement rendu
      setTimeout(() => {
        if (scrollViewRef.current) {
          console.log(`🚀 CourseBackground: Exécution du scroll vers Y=${scrollPosition}`);
          scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
          setInitialScrollDone(true);
          if (targetVideoId) {
            console.log(`✅ CourseBackground: Scroll initial effectué vers la vidéo ${targetVideoId}`);
          }
        } else {
          console.warn(`⚠️ CourseBackground: scrollViewRef.current est null lors de l'exécution du scroll`);
        }
      }, 300);
    } else {
      console.log(`⏳ CourseBackground: Conditions de scroll initial non remplies`);
    }
  }, [imageLoaded, loading, initialScrollDone, imageDimensions.height, scrollViewHeight, lastViewedVideoId, lastUnblockedVideoId, positions]);

  // Calculer la marge horizontale pour centrer l'image
  const horizontalMargin = Math.max(0, (scrollViewWidth - imageDimensions.width) / 2);

  // S'assurer que le contenu a exactement la taille de l'image (pas plus, pas moins)
  const contentHeight = imageDimensions.height;

  return (
    <View style={styles.container}>
      {/* Conteneur de défilement principal */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={{ 
          height: contentHeight,
          width: scrollViewWidth,
          alignItems: 'center'
        }}
        showsVerticalScrollIndicator={false}
        onLayout={onScrollViewLayout}
        bounces={false} // Désactiver le dépassement du scroll
        overScrollMode="never" // Désactiver le dépassement du scroll sur Android
        refreshControl={refreshControl}
      >
        {/* Image d'arrière-plan ou fond par défaut */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.backgroundImage,
              { 
                height: contentHeight,
                width: imageDimensions.width,
              }
            ]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('Erreur de chargement de l\'image:', e.nativeEvent.error);
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <LinearGradient
            colors={['#0A0400', '#192328']}
            style={[styles.defaultBackground, { 
              height: contentHeight,
              width: imageDimensions.width || screenWidth
            }]}
          />
        )}
        
        {/* Overlay supprimé pour préserver la qualité visuelle d'origine de l'image */}
        
        {/* Grille de référence pour le mode développement */}
        {DEV_GRID_MODE && (
          <View style={[
            styles.gridContainer, 
            { 
              height: contentHeight,
              width: imageDimensions.width || screenWidth
            }
          ]}>
            {/* Lignes horizontales tous les 10% */}
            {Array.from({ length: 10 }).map((_, index) => (
              <View 
                key={`h-${index}`} 
                style={[
                  styles.gridLine, 
                  styles.horizontalLine,
                  { top: `${(index + 1) * 10}%` }
                ]}
              >
                <Text style={styles.gridText}>{(index + 1) * 10}%</Text>
              </View>
            ))}
            
            {/* Lignes verticales tous les 25% */}
            {Array.from({ length: 4 }).map((_, index) => (
              <View 
                key={`v-${index}`} 
                style={[
                  styles.gridLine, 
                  styles.verticalLine,
                  { left: `${(index + 1) * 25}%` }
                ]}
              >
                <Text style={styles.gridText}>{(index + 1) * 25}%</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Contenu (uniquement affiché quand l'image est chargée) */}
        {(imageLoaded && !loading) && (
          <View style={[styles.contentContainer, { 
            height: contentHeight,
            width: imageDimensions.width || screenWidth,
            position: 'absolute',
            top: 0,
            left: horizontalMargin
          }]}>
            {children}
          </View>
        )}
      </ScrollView>
      
      {/* Loader pendant le chargement */}
      {(loading || !imageLoaded) && (
        <View style={styles.loaderContainer}>
          <LogoLoadingSpinner />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  mainScrollView: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
  },
  defaultBackground: {
    position: 'absolute',
    top: 0,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 4, 0, 0.7)',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    pointerEvents: 'none',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  gridText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 2,
    position: 'absolute',
  }
});

export default CourseBackground; 