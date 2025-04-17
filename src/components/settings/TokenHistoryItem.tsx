import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TokenData } from '../../types/settings';

interface TokenHistoryItemProps {
  item: TokenData;
}

export const TokenHistoryItem: React.FC<TokenHistoryItemProps> = ({ item }) => {
  const getIconName = () => {
    switch (item.type) {
      case 'purchase':
        return 'credit-card';
      case 'gain':
        return 'card-giftcard';
      case 'expense':
        return 'shopping-cart';
      default:
        return 'help';
    }
  };

  const getIconColor = () => {
    switch (item.type) {
      case 'purchase':
        return '#06D001'; // Green
      case 'gain':
        return '#FFD700'; // Gold
      case 'expense':
        return '#FF4500'; // Red-orange
      default:
        return '#999';
    }
  };

  const getAmountColor = () => {
    return item.type === 'expense' ? '#FF4500' : '#06D001';
  };

  const getAmountPrefix = () => {
    return item.type === 'expense' ? '-' : '+';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={getIconName()}
          size={24}
          color={getIconColor()}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <Text style={[styles.amount, { color: getAmountColor() }]}>
        {getAmountPrefix()} {item.amount} jetons
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 