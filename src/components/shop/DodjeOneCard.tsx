import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DodjeOneCardProps } from '../../types/shop';

export const DodjeOneCard: React.FC<DodjeOneCardProps> = ({
  subscription,
  onSelect,
  isSelected
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        subscription.isPopular && styles.popularContainer
      ]}
      onPress={() => onSelect(subscription)}
    >
      {subscription.isPopular && (
        <View style={styles.popularBadge}>
          <MaterialCommunityIcons name="star" size={16} color="#fff" />
          <Text style={styles.popularText}>Populaire</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>DodjeOne</Text>
            <Text style={styles.duration}>
              {subscription.duration === 'monthly' ? 'Mensuel' : 'Annuel'}
            </Text>
          </View>
          <Text style={styles.price}>{subscription.price}€</Text>
        </View>

        <Text style={styles.description}>{subscription.description}</Text>

        <ScrollView style={styles.featuresContainer}>
          {subscription.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#06D001" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </ScrollView>
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
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  duration: {
    fontSize: 14,
    color: '#ccc',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06D001',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  featuresContainer: {
    maxHeight: 200,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
}); 