import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DodjiBalanceProps } from '../../types/shop';

export const DodjiBalance: React.FC<DodjiBalanceProps> = ({ balance, onRefresh }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.balanceContainer}>
          <MaterialCommunityIcons name="currency-dodji" size={24} color="#06D001" />
          <Text style={styles.balanceText}>
            {balance.toLocaleString()} Dodji
          </Text>
        </View>

        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        Utilisez vos Dodji pour débloquer des contenus exclusifs
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    gap: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06D001',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
}); 