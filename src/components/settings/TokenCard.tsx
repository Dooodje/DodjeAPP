import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TokenPreferences } from '../../types/settings';
import { TokenHistory } from './TokenHistory';

interface TokenCardProps {
  tokens: TokenPreferences;
  onBuyTokens: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ tokens, onBuyTokens }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name="monetization-on"
          size={24}
          color="#FFD700"
        />
        <Text style={styles.title}>Jetons Dodji</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={styles.balanceValue}>{tokens.balance}</Text>
        </View>

        <TouchableOpacity 
          style={styles.buyButton}
          onPress={onBuyTokens}
        >
          <MaterialIcons
            name="add-shopping-cart"
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Acheter des jetons</Text>
        </TouchableOpacity>

        <TokenHistory history={tokens.history} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  content: {
    padding: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#999',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  buyButton: {
    backgroundColor: '#06D001',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 