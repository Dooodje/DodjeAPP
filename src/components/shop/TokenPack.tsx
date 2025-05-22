import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TokenPackProps } from '../../types/shop';
import Pack1 from '../Pack1';
import Pack2 from '../Pack2';
import Pack3 from '../Pack3';
import Pack4 from '../Pack4';
import Pack5 from '../Pack5';
import Pack6 from '../Pack6';
import SymboleBlanc from '../SymboleBlanc';

export const TokenPack: React.FC<TokenPackProps> = ({
  pack,
  onSelect,
  isSelected
}) => {
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
        isSelected && styles.selectedContainer,
        pack.isPopular && styles.popularContainer
      ]}
      onPress={() => onSelect(pack)}
    >
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {pack.name.toLowerCase().includes('starter') && (
            <Pack1 width={140} height={140} />
          )}
          {pack.name.toLowerCase().includes('basique') && (
            <Pack2 width={140} height={140} />
          )}
          {pack.name.toLowerCase().includes('standard') && (
            <Pack3 width={140} height={140} />
          )}
          {pack.name.toLowerCase().includes('premium') && (
            <Pack4 width={140} height={140} />
          )}
          {pack.name.toLowerCase().includes('expert') && (
            <Pack5 width={140} height={140} />
          )}
          {pack.name.toLowerCase().includes('ultime') && (
            <Pack6 width={140} height={140} />
          )}
        </View>

        <Text style={styles.amount}>
          {totalTokens.toLocaleString()}<SymboleBlanc width={14} height={14} />
        </Text>

        <View style={styles.header}>
          <Text style={styles.name}>{pack.name}</Text>
          {bonusAmount > 0 && (
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusText}>
                {pack.bonus}% offert
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{pack.price.toFixed(2)}€</Text>
        </View>

        {pack.isPopular && (
          <View style={styles.popularBadge}>
            <MaterialCommunityIcons name="star" size={16} color="#fff" />
            <Text style={styles.popularText}>Populaire</Text>
          </View>
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
    backgroundColor: '#0A0400',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    flex: 1,
  },
  selectedContainer: {
    borderColor: '#9BEC00',
  },
  popularContainer: {
    borderColor: '#FF9500',
  },
  content: {
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontFamily: 'Arboria-Bold',
    color: '#9BEC00',
    textAlign: 'center',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#F1E61C',
    textAlign: 'center',
  },
  priceContainer: {
    backgroundColor: '#9BEC00',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 25,
    marginTop: 5,
  },
  price: {
    fontSize: 13,
    fontFamily: 'Arboria-Bold',
    color: '#fff',
    textAlign: 'center',
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
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
    fontFamily: 'Arboria-Medium',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
}); 