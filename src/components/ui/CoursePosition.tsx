import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { AnneauVector } from './vectors/AnneauVectors';
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

  // Déterminer si l'anneau de progression doit être affiché
  const shouldShowProgressRing = !!parcoursId && 
    !videosData.error && 
    !parcoursLoading &&
    parcoursData?.videoCount > 0;

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
        return '#F1E61C'; // Jaune doré (par défaut)
    }
  };

  // Détermine le type d'anneau en fonction du type de Course
  const getAnneauType = (): 'anneau1' | 'anneau2' | 'anneau3' | 'anneau5' => {
    switch (type) {
      case 'important':
        return 'anneau3';
      case 'special':
        return 'anneau5';
      case 'annexe':
        return 'anneau2';
      case 'standard':
      default:
        return 'anneau1';
    }
  };

  // Calcule les tailles proportionnelles
  const anneauSize = size;
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
        {/* Anneau extérieur - Utilise l'anneau de progression si un ID de parcours est fourni */}
        {shouldShowProgressRing ? (
          <ProgressRing 
            size={anneauSize} 
            totalSegments={parcoursData?.videoCount || 0}
            completedSegments={videosData.completedVideos}
            completedColor="#06D001"
            incompleteColor={getRingColor()}
            isActive={isActive}
          />
        ) : (
          <AnneauVector 
            size={anneauSize} 
            color={getRingColor()}
            type={getAnneauType()}
          />
        )}
        
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