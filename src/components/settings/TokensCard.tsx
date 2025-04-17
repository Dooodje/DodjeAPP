import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserSettings, TokenData } from '../../types/settings';

interface TokensCardProps {
  settings: UserSettings;
  onBuyTokens: () => void;
}

export const TokensCard: React.FC<TokensCardProps> = ({
  settings,
  onBuyTokens,
}) => {
  const { tokens } = settings;
  const [showHistory, setShowHistory] = useState(false);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Format the token amount with a + or - sign
  const formatTokenAmount = (amount: number): string => {
    if (amount > 0) return `+${amount}`;
    return amount.toString();
  };

  // Get color based on transaction type
  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'purchase':
        return '#06D001'; // Green
      case 'gain':
        return '#059212'; // Dark green
      case 'expense':
        return '#FF3B30'; // Red
      default:
        return '#FFFFFF'; // White
    }
  };

  // Render a token history item
  const renderHistoryItem = ({ item }: { item: TokenData }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <Text style={styles.historyItemDescription}>{item.description}</Text>
        <Text style={styles.historyItemDate}>
          {new Date(item.date).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <Text 
        style={[
          styles.historyItemAmount, 
          { color: getTransactionColor(item.type) }
        ]}
      >
        {formatTokenAmount(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="toll" size={24} color="#F3FF90" />
        <Text style={styles.headerText}>Tokens Dodji</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={styles.balanceValue}>{tokens.balance}</Text>
        </View>

        <TouchableOpacity 
          style={styles.buyButton} 
          onPress={onBuyTokens}
        >
          <MaterialIcons name="add-circle" size={18} color="#000" />
          <Text style={styles.buyButtonText}>Acheter des tokens</Text>
        </TouchableOpacity>

        {tokens.history.length > 0 && (
          <TouchableOpacity 
            style={styles.historyToggle} 
            onPress={toggleHistory}
          >
            <Text style={styles.historyToggleText}>
              {showHistory ? "Masquer l'historique" : "Voir l'historique"}
            </Text>
            <MaterialIcons 
              name={showHistory ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#AAAAAA" 
            />
          </TouchableOpacity>
        )}

        {showHistory && tokens.history.length > 0 && (
          <View style={styles.historyContainer}>
            <FlatList
              data={tokens.history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              style={styles.historyList}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginVertical: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#222222',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    padding: 15,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 15,
  },
  balanceLabel: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  balanceValue: {
    color: '#F3FF90',
    fontSize: 22,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#F3FF90',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginVertical: 10,
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5,
  },
  historyToggleText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 5,
  },
  historyContainer: {
    marginTop: 10,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemDescription: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  historyItemDate: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 2,
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
}); 