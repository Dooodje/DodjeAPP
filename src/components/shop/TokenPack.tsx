import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenPackProps } from '../../types/shop';

export const TokenPack: React.FC<TokenPackProps> = ({
  pack,
  onSelect,
  isSelected
}) => {
  // Vérifier si le pack est actif
  if (pack.status === 'inactive') {
    return null; // Ne pas afficher les packs inactifs
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
        isSelected && styles.selectedContainer,
        pack.isPopular && styles.popularContainer,
        pack.isBestValue && styles.bestValueContainer
      ]}
      onPress={() => onSelect(pack)}
    >
      {pack.isPopular && (
        <View style={styles.popularBadge}>
          <MaterialCommunityIcons name="star" size={16} color="#fff" />
          <Text style={styles.popularText}>Populaire</Text>
        </View>
      )}

      {pack.isBestValue && (
        <View style={styles.bestValueBadge}>
          <MaterialCommunityIcons name="trophy" size={16} color="#fff" />
          <Text style={styles.bestValueText}>Meilleure valeur</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{pack.name}</Text>
          <Text style={styles.price}>{pack.price}€</Text>
        </View>

        <View style={styles.amountContainer}>
          <MaterialCommunityIcons name="currency-usd" size={24} color="#06D001" />
          <Text style={styles.amount}>
            {totalTokens.toLocaleString()} Dodji
          </Text>
        </View>

        {bonusAmount > 0 && (
          <View style={styles.bonusContainer}>
            <MaterialCommunityIcons name="gift" size={16} color="#06D001" />
            <Text style={styles.bonusText}>
              +{bonusAmount.toLocaleString()} Dodji bonus ({pack.bonus}%)
            </Text>
          </View>
        )}

        <View style={styles.valueContainer}>
          <MaterialCommunityIcons name="calculator" size={14} color="#ccc" />
          <Text style={styles.valueText}>
            {(pack.price / totalTokens).toFixed(3)}€ par jeton
          </Text>
        </View>

        {pack.description && (
          <Text style={styles.description}>{pack.description}</Text>
        )}
      </View>

      {isSelected && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#06D001" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  selectedContainer: {
    borderColor: '#06D001',
    backgroundColor: '#1A1A1A',
  },
  popularContainer: {
    borderColor: '#FF9500',
  },
  bestValueContainer: {
    borderColor: '#06D001',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#06D001',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#06D001',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06D001',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusText: {
    fontSize: 14,
    color: '#06D001',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 12,
    color: '#ccc',
    fontStyle: 'italic',
  },
}); 