import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Parcours } from '../../types/firebase';
import { CoursePosition } from '../ui/CoursePosition';
import ParcoursLockedModal from '../ui/ParcoursLockedModal';
import { useAuth } from '../../hooks/useAuth';

interface CoursePositionButtonProps {
  parcours: Parcours;
  size?: number;
  isActive?: boolean;
  onPress: (parcoursId: string) => void;
  style?: ViewStyle;
}

const CoursePositionButton: React.FC<CoursePositionButtonProps> = ({
  parcours,
  size = 80,
  isActive = false,
  onPress,
  style
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();

  const handlePress = () => {
    if (parcours.status === 'blocked') {
      console.log('Ouverture du modal pour le parcours:', {
        id: parcours.id,
        niveau: parcours.niveau,
        status: parcours.status,
        userId: user?.uid
      });
      setIsModalVisible(true);
      return;
    }
    onPress(parcours.id);
  };

  const handleUnlock = () => {
    // Rafraîchir l'interface après le déblocage
    onPress(parcours.id);
  };

  // Déterminer le type de positionnement
  const getPositionType = () => {
    if (parcours.isAnnexe || parcours.isAnnex) return 'annexe';
    if (parcours.isIntroduction) return 'important';
    if (parcours.isSpecial || parcours.isBonus) return 'special';
    return 'standard';
  };

  if (!user) return null;

  return (
    <>
      <View style={[styles.container, style]}>
        <CoursePosition
          type={getPositionType()}
          status={parcours.status}
          size={size}
          title={parcours.titre || parcours.title}
          onPress={handlePress}
          parcoursId={parcours.id}
          isActive={isActive}
        />
        
        {/* Badge d'ordre si fourni */}
        {parcours.ordre !== undefined && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{parcours.ordre}</Text>
          </View>
        )}
      </View>

      <ParcoursLockedModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        parcoursId={parcours.id}
        userId={user.uid}
        onUnlock={handleUnlock}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#F3FF90',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    color: '#0A0400',
    fontSize: 12,
    fontFamily: 'Arboria-Medium',
  }
});

export default CoursePositionButton; 