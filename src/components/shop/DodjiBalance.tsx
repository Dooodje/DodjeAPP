import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDodji } from '../../hooks/useDodji';

interface DodjiBalanceProps {
  onRefresh?: () => void;
}

export const DodjiBalance: React.FC<DodjiBalanceProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const { dodji } = useDodji(user?.uid);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.balanceContainer}>
          <MaterialCommunityIcons name="currency-usd" size={24} color="#06D001" />
          <Text style={styles.balanceText}>
            {dodji.toLocaleString()} Dodji
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06D001',
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: '#06D001',
    padding: 8,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
}); 