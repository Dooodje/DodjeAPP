import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialCommunityIconName } from '../../types/icons';

interface MediaErrorProps {
  message?: string;
  icon?: MaterialCommunityIconName;
  onRetry?: () => void;
}

export default function MediaError({
  message = "Une erreur s'est produite lors du chargement du média",
  icon = 'alert-circle',
  onRetry
}: MediaErrorProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={48} color="#ff0000" />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <MaterialCommunityIcons name="reload" size={24} color="#06D001" />
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: '#06D001',
    fontSize: 16,
    marginLeft: 8,
  },
}); 