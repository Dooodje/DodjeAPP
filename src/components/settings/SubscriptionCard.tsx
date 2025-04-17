import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserSettings } from '../../types/settings';

interface SubscriptionCardProps {
  settings: UserSettings;
  onUpgradePress: () => void;
  onManagePress: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  settings,
  onUpgradePress,
  onManagePress,
}) => {
  const { subscription } = settings;
  const isSubscribed = subscription.status === 'premium';
  const isPremiumActive = isSubscribed && subscription.plan !== null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="card-membership" size={24} color="#F3FF90" />
        <Text style={styles.headerText}>Abonnement</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Plan actuel</Text>
          <Text style={styles.value}>
            {isSubscribed ? 'DodjeOne' : 'Gratuit'}
          </Text>
        </View>

        {isPremiumActive && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>
                {subscription.plan === 'monthly' ? 'Mensuel' : 'Annuel'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Renouvellement</Text>
              <Text style={styles.value}>
                {subscription.nextBillingDate 
                  ? new Date(subscription.nextBillingDate).toLocaleDateString('fr-FR') 
                  : 'Non défini'}
              </Text>
            </View>
          </>
        )}

        {!isSubscribed ? (
          <TouchableOpacity 
            style={styles.upgradeButton} 
            onPress={onUpgradePress}
          >
            <MaterialIcons name="star" size={18} color="#000" />
            <Text style={styles.upgradeButtonText}>Passer à DodjeOne</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.manageButton} 
            onPress={onManagePress}
          >
            <MaterialIcons name="settings" size={18} color="#FFF" />
            <Text style={styles.manageButtonText}>Gérer mon abonnement</Text>
          </TouchableOpacity>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  label: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#F3FF90',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginTop: 15,
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  manageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginTop: 15,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 