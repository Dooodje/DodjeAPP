import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserSettings } from '../../types/settings';

interface SubscriptionCardProps {
  settings: UserSettings;
  onUpgradePress: () => void;
  onManagePress: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  settings,
  onUpgradePress,
  onManagePress
}) => {
  const { subscription } = settings;
  const isPremium = subscription.status === 'premium';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="crown"
          size={24}
          color="#FFD700"
        />
        <Text style={styles.title}>
          {isPremium ? 'Dodje One Premium' : 'Dodje One'}
        </Text>
      </View>

      <View style={styles.content}>
        {isPremium ? (
          <>
            <Text style={styles.status}>
              Abonnement {subscription.plan === 'monthly' ? 'mensuel' : 'annuel'}
            </Text>
            {subscription.nextBillingDate && (
              <Text style={styles.nextBilling}>
                Prochain paiement : {subscription.nextBillingDate.toLocaleDateString()}
              </Text>
            )}
            <TouchableOpacity
              style={styles.manageButton}
              onPress={onManagePress}
            >
              <Text style={styles.manageButtonText}>Gérer l'abonnement</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Accédez à toutes les fonctionnalités premium
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgradePress}
            >
              <Text style={styles.upgradeButtonText}>Passer à Premium</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  content: {
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    color: '#06D001',
    marginBottom: 8,
  },
  nextBilling: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  manageButton: {
    backgroundColor: 'rgba(6, 210, 1, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  manageButtonText: {
    color: '#06D001',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#06D001',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 