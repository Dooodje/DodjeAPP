import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialCommunityIconName } from '../../types/icons';
import { Parcours } from '../../types/firebase';

interface PositionButtonProps {
  id: string;
  x: number;
  y: number;
  order?: number;
  isAnnex?: boolean;
  onPress: (positionId: string, order?: number) => void;
  parcoursData?: Parcours; // Données du parcours associé
}

const PositionButton: React.FC<PositionButtonProps> = ({
  id,
  x,
  y,
  order,
  isAnnex = false,
  onPress,
  parcoursData,
}) => {
  // Déterminer l'icône et la couleur en fonction du statut dans le useMemo
  const { icon, color, backgroundColor } = useMemo(() => {
    // Si pas de données de parcours ou un annexe, utiliser l'icône par défaut
    if (!parcoursData || isAnnex) {
      return {
        icon: (isAnnex ? 'script-text-outline' : 'map-marker') as MaterialCommunityIconName,
        color: '#FFFFFF',
        backgroundColor: isAnnex ? 'rgba(0, 150, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'
      };
    }

    // En fonction du statut du parcours
    if (parcoursData.status === 'completed') {
      return {
        icon: 'check-circle' as MaterialCommunityIconName,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 200, 0, 0.7)'
      };
    } else if (parcoursData.status === 'in_progress') {
      return {
        icon: 'progress-check' as MaterialCommunityIconName,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 165, 0, 0.7)'
      };
    } else if (parcoursData.status === 'blocked') {
      return {
        icon: 'lock' as MaterialCommunityIconName,
        color: '#FFFFFF',
        backgroundColor: 'rgba(200, 0, 0, 0.7)'
      };
    } else {
      // Statut par défaut (available)
      return {
        icon: 'map-marker' as MaterialCommunityIconName,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      };
    }
  }, [parcoursData, isAnnex]);

  return (
    <View
      style={[
        styles.container,
        {
          left: `${x}%`,
          top: `${y}%`,
          backgroundColor
        } as ViewStyle,
        isAnnex ? styles.annexContainer : styles.mainContainer,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          isAnnex ? styles.annexButton : styles.mainButton,
          // Ajouter un style en fonction du statut si disponible
          parcoursData?.status === 'completed' && styles.completedButton,
          parcoursData?.status === 'blocked' && styles.blockedButton,
        ]}
        onPress={() => onPress(id, order)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={icon}
          size={isAnnex ? 18 : 24}
          color={color}
        />
        
        {order !== undefined && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{order}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Petit effet de brillance au centre du bouton */}
      <View style={[
        styles.glow,
        isAnnex ? styles.annexGlow : styles.mainGlow
      ]} />
      
      {/* Titre du parcours en dessous du bouton si disponible */}
      {parcoursData?.titre && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText} numberOfLines={2}>
            {parcoursData.titre}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  } as ViewStyle,
  mainContainer: {
    width: 60,
    height: 60,
    zIndex: 20,
  },
  annexContainer: {
    width: 40,
    height: 40,
    zIndex: 15,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#059212',
    borderColor: '#06D001',
  },
  annexButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 146, 18, 0.7)',
    borderColor: 'rgba(6, 208, 1, 0.7)',
  },
  completedButton: {
    backgroundColor: '#06D001',
    borderColor: '#9BEC00',
  },
  blockedButton: {
    backgroundColor: '#444444',
    borderColor: '#666666',
  },
  orderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B00',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  mainGlow: {
    width: 30,
    height: 30,
  },
  annexGlow: {
    width: 20,
    height: 20,
  },
  labelContainer: {
    position: 'absolute',
    bottom: -35,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 5,
    width: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PositionButton; 