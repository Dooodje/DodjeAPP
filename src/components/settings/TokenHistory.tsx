import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TokenData } from '../../types/settings';
import { TokenHistoryItem } from './TokenHistoryItem';

interface TokenHistoryProps {
  history: TokenData[];
}

export const TokenHistory: React.FC<TokenHistoryProps> = ({ history }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <Text style={styles.title}>Historique des transactions</Text>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
      
      {expanded && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TokenHistoryItem item={item} />}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0400',
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    maxHeight: 300,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
}); 