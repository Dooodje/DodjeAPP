import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenPackProps } from '../../types/shop';
import SymboleBlanc from '../SymboleBlanc';

export const WelcomePack: React.FC<TokenPackProps> = ({
  pack,
  onSelect,
  isSelected
}) => {
  // Animation de rebond pour le badge "Offert !"
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation de rebond répétée
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    bounceAnimation.start();
    
    return () => bounceAnimation.stop();
  }, [bounceAnim]);

  // Vérifier si le pack est actif
  if (pack.status === 'inactive') {
    return null;
  }
  
  // Calculer le montant du bonus si totalTokens n'est pas défini
  const bonusAmount = pack.totalTokens 
    ? pack.totalTokens - pack.amount 
    : pack.bonus ? Math.round(pack.amount * (pack.bonus / 100)) : 0;
  
  // Calculer le total si totalTokens n'est pas défini
  const totalTokens = pack.totalTokens || pack.amount + bonusAmount;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onSelect(pack)}
    >
      <View style={styles.content}>
        {/* Section de bienvenue */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Bienvenue</Text>
            <Text style={styles.welcomeSubtitle}>
              Dans la vie, on a tous besoin d'un petit coup de pouce !
            </Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>
              {totalTokens.toLocaleString()}
            </Text>
            <SymboleBlanc width={18} height={18} />
          </View>
        </View>

        {/* Section des détails du pack */}
        <View style={styles.packDetails}>
          {bonusAmount > 0 && (
            <View style={styles.bonusContainer}>
              <MaterialCommunityIcons name="gift" size={16} color="#9BEC00" />
              <Text style={styles.bonusText}>
                {pack.bonus}% offert
              </Text>
            </View>
          )}
        </View>
      </View>

      {isSelected && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#9BEC00" />
        </View>
      )}

      {/* Badge "Offert !" en haut à droite */}
      <Animated.View 
        style={[
          styles.offertBadge,
          {
            transform: [
              { rotate: '15deg' },
              { scale: bounceAnim }
            ]
          }
        ]}
      >
        <Text style={styles.offertText}>Offert !</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#9BEC00',
    shadowColor: '#9BEC00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedContainer: {
    borderColor: '#F1E61C',
    shadowColor: '#F1E61C',
  },
  content: {
    gap: 10,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    color: '#9BEC00',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 18,
  },
  packDetails: {
    alignItems: 'center',
    gap: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  amount: {
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
    color: '#F1E61C',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bonusText: {
    fontSize: 12,
    color: '#9BEC00',
    fontFamily: 'Arboria-Medium',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  offertBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  offertText: {
    fontSize: 12,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 