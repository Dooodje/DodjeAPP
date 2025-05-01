import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
// import { AnneauVector } from './vectors/AnneauVectors';
import Color0 from '../../components/Color0';
import SegmentedRing from '../../components/SegmentedRing';
import { ProgressRing } from './vectors/ProgressRing';
import { PastilleParcoursDefault } from '../PastilleParcoursDefault';
import { PastilleParcoursVariant2 } from '../PastilleParcoursVariant2';
import { PastilleParcoursVariant3 } from '../PastilleParcoursVariant3';
import PastilleAnnexe from '../PastilleAnnexe';
import { useParcoursVideos } from '@/hooks/useParcoursVideos';
import { useParcours } from '@/hooks/useParcours';

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
}

export const CoursePosition: React.FC<CoursePositionProps> = ({
  title,
  type = 'standard',
  status = 'blocked',
  onPress,
  size = 60,
  isActive = false,
  style,
  parcoursId
}) => {
  // Récupérer les données des vidéos et du parcours
  const videosData = parcoursId 
    ? useParcoursVideos(parcoursId) 
    : { totalVideos: 0, completedVideos: 0, loading: false, error: null };
  
  const { parcoursData, loading: parcoursLoading } = useParcours(parcoursId);

  // Déterminer si les données du parcours sont disponibles
  const hasParcoursData = !!parcoursId && !parcoursLoading && parcoursData;

  // Obtenir le nombre total de vidéos
  const videoCount = hasParcoursData ? (parcoursData?.videoCount || 0) : 0;

  // Nombre de vidéos complétées
  const completedVideos = videosData.completedVideos || 0;

  // Détermine la couleur de l'anneau en fonction du type et de l'état actif
  const getRingColor = (): string => {
    if (status === 'completed') {
      return '#06D001'; // Vert vif pour les parcours terminés
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
  };

  // Calcule les tailles proportionnelles
  const anneauSize = size * 1.2;
  // Maintenir le ratio width/height du SVG (101/82)
  const ringWidth = anneauSize;
  const ringHeight = anneauSize * (82/101);
  const pastilleSize = size * 0.8;

  // Sélectionne le composant de pastille approprié en fonction du statut
  const renderPastille = () => {
    if (type === 'annexe') {
      return <PastilleAnnexe width={pastilleSize} height={pastilleSize} />;
    }

    switch (status) {
      case 'completed':
        return <PastilleParcoursVariant2 style={{ width: pastilleSize, height: pastilleSize }} />;
      case 'unblocked':
        return <PastilleParcoursDefault style={{ width: pastilleSize, height: pastilleSize }} />;
      case 'in_progress':
        return <PastilleParcoursDefault style={{ width: pastilleSize, height: pastilleSize }} />;
      case 'blocked':
      default:
        return <PastilleParcoursVariant3 style={{ width: pastilleSize, height: pastilleSize }} />;
    }
  };
  
  // Détermine la couleur du titre en fonction du statut
  const getTitleColor = (): string => {
    return status === 'completed' ? '#06D001' : '#FFFFFF';
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Anneau segmenté en fonction du nombre de vidéos */}
        <SegmentedRing 
          width={ringWidth}
          height={ringHeight}
          totalSegments={videoCount}
          completedSegments={completedVideos}
          ringColor={getRingColor()}
          ringWidth={6}
        />
        
        {/* Pastille centrale */}
        <View style={styles.pastilleContainer}>
          {renderPastille()}
        </View>
      </TouchableOpacity>
      
      {/* Titre en dessous du bouton */}
      {title && (
        <Text style={[styles.title, { color: getTitleColor() }]} numberOfLines={2}>
          {title}
        </Text>
      )}
    </View>
  );
};

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
}); 