import React, { useEffect, useMemo, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// import { AnneauVector } from './vectors/AnneauVectors';
import Color0 from '../../components/Color0';
import SegmentedRing from '../../components/SegmentedRing';
import { ProgressRing } from './vectors/ProgressRing';
import { PastilleParcoursDefault } from '../PastilleParcoursDefault';
import { PastilleParcoursVariant2 } from '../PastilleParcoursVariant2';
import { PastilleParcoursVariant3 } from '../PastilleParcoursVariant3';
import PastilleAnnexe from '../PastilleAnnexe';
import { Vector } from '../Vector';

export type CoursePositionType = 'standard' | 'important' | 'special' | 'annexe';
export type CourseStatus = 'blocked' | 'unblocked' | 'completed' | 'in_progress';

interface CoursePositionProps {
  title?: string;
  type?: CoursePositionType;
  status?: CourseStatus;
  onPress?: () => void;
  size?: number;
  isActive?: boolean;
  style?: ViewStyle;
  parcoursId?: string;
  // Nouvelles props pour éviter les listeners supplémentaires
  videoCount?: number;
  completedVideos?: number;
  // Prop pour masquer le cadenas pendant l'animation
  hideVector?: boolean;
}

const CoursePositionComponent: React.FC<CoursePositionProps> = ({
  title,
  type = 'standard',
  status = 'blocked',
  onPress,
  size = 60,
  isActive = false,
  style,
  parcoursId,
  videoCount = 0,
  completedVideos = 0,
  hideVector = false
}) => {
  // Animation pour l'effet de rebond
  const bounceScale = useSharedValue(1);

  // Mémoriser les calculs de couleur pour éviter les recalculs
  const ringColor = useMemo((): string => {
    if (status === 'completed') {
      return '#06D001'; // Vert vif pour les parcours terminés
    }

    if (status === 'blocked') {
      return '#F3FF9099'; // Jaune avec 40% de transparence pour les parcours bloqués
    }
    
    switch (type) {
      case 'important':
        return '#F3FF90'; // Jaune clair
      case 'special':
        return '#9BEC00'; // Vert lime
      case 'annexe':
        return '#059212'; // Vert foncé
      case 'standard':
      default:
        return '#F3FF90'; // Jaune doré (par défaut)
    }
  }, [status, type]);

  // Mémoriser les calculs de taille
  const dimensions = useMemo(() => {
    const anneauSize = size * 1.2;
    // Maintenir le ratio width/height du SVG (101/82)
    const ringWidth = anneauSize;
    const ringHeight = anneauSize * (82/101);
    const pastilleSize = size * 0.8;
    
    return { anneauSize, ringWidth, ringHeight, pastilleSize };
  }, [size]);

  // Mémoriser la couleur du titre
  const titleColor = useMemo((): string => {
    return status === 'completed' ? '#06D001' : '#FFFFFF';
  }, [status]);

  // Optimiser l'animation - ne démarrer que si nécessaire
  useEffect(() => {
    if (status === 'unblocked') {
      bounceScale.value = withRepeat(
        withTiming(1.1, {
          duration: 800,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
        -1, // Répéter indéfiniment
        true // Reverse (aller-retour)
      );
    } else {
      bounceScale.value = withTiming(1, { duration: 200 });
    }
  }, [status, bounceScale]);

  // Style animé pour l'effet de rebond - mémorisé
  const bounceAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bounceScale.value }],
    };
  }, []);

  // Mémoriser le composant de pastille pour éviter les re-renders
  const pastilleComponent = useMemo(() => {
    if (type === 'annexe') {
      return <PastilleAnnexe width={dimensions.pastilleSize} height={dimensions.pastilleSize} />;
    }

    switch (status) {
      case 'completed':
        return <PastilleParcoursVariant2 style={{ width: dimensions.pastilleSize, height: dimensions.pastilleSize }} />;
      case 'unblocked':
        return <PastilleParcoursDefault style={{ width: dimensions.pastilleSize, height: dimensions.pastilleSize }} />;
      case 'in_progress':
        return <PastilleParcoursDefault style={{ width: dimensions.pastilleSize, height: dimensions.pastilleSize }} />;
      case 'blocked':
      default:
        return <PastilleParcoursVariant3 style={{ width: dimensions.pastilleSize, height: dimensions.pastilleSize }} />;
    }
  }, [type, status, dimensions.pastilleSize]);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Anneau segmenté avec animation de rebond pour les parcours unblocked */}
        <Animated.View style={status === 'unblocked' ? bounceAnimatedStyle : undefined}>
          <SegmentedRing 
            width={dimensions.ringWidth}
            height={dimensions.ringHeight}
            totalSegments={videoCount}
            completedSegments={completedVideos}
            ringColor={ringColor}
            completedColor="#06D001"
            ringWidth={6}
          />
        </Animated.View>
        
        {/* Pastille centrale */}
        <View style={styles.pastilleContainer}>
          {pastilleComponent}
          {status === 'blocked' && !hideVector && (
            <View style={styles.vectorContainer}>
              <Vector width={size * 0.55} height={size * 0.55} color="#F3FF90" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Titre en dessous du bouton */}
      {title && (
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
          {title}
        </Text>
      )}
    </View>
  );
};

// Mémoriser le composant pour éviter les re-renders inutiles
export const CoursePosition = memo(CoursePositionComponent, (prevProps, nextProps) => {
  // Comparaison personnalisée pour optimiser les re-renders
  return (
    prevProps.title === nextProps.title &&
    prevProps.type === nextProps.type &&
    prevProps.status === nextProps.status &&
    prevProps.size === nextProps.size &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.parcoursId === nextProps.parcoursId &&
    prevProps.videoCount === nextProps.videoCount &&
    prevProps.completedVideos === nextProps.completedVideos &&
    prevProps.hideVector === nextProps.hideVector
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
    width: 180,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pastilleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    fontWeight: 'bold',
    lineHeight: 18,
    opacity: 0.8,
    maxWidth: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
  },
  vectorContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    transform: [{ translateY: -8 }],
    zIndex: 2,
  },
}); 