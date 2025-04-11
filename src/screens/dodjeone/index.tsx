import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDodjeOne } from '../../hooks/useDodjeOne';
import { usePerformanceMonitor } from '../../utils/performance';
import { withErrorHandling } from '../../utils/errorHandling';
import { MaterialCommunityIconName } from '../../types/icons';
import { AppRoute } from '../../types/routes';

export function DodjeOneScreen() {
  const router = useRouter();
  const {
    subscription,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    restorePurchases,
  } = useDodjeOne();
  usePerformanceMonitor('DodjeOneScreen');

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  const handleSubscribe = withErrorHandling(
    async (plan: 'monthly' | 'yearly') => {
      try {
        await subscribe(plan);
        router.back();
      } catch (err) {
        console.error('Erreur lors de la souscription:', err);
      }
    },
    'Erreur lors de la souscription'
  );

  const handleRestorePurchases = withErrorHandling(
    async () => {
      try {
        await restorePurchases();
        if (subscription) {
          router.back();
        }
      } catch (err) {
        console.error('Erreur lors de la restauration des achats:', err);
      }
    },
    'Erreur lors de la restauration des achats'
  );

  const advantages = [
    {
      icon: 'video' as MaterialCommunityIconName,
      title: 'Accès illimité aux cours',
      description: 'Tous les cours premium sans restriction'
    },
    {
      icon: 'robot' as MaterialCommunityIconName,
      title: 'Accès à DodjeIA',
      description: 'Assistant IA personnalisé pour votre apprentissage'
    },
    {
      icon: 'certificate' as MaterialCommunityIconName,
      title: 'Certifications exclusives',
      description: 'Obtenez des certifications reconnues'
    },
    {
      icon: 'account-group' as MaterialCommunityIconName,
      title: 'Communauté VIP',
      description: 'Accès à une communauté d\'experts'
    },
    {
      icon: 'headphones' as MaterialCommunityIconName,
      title: 'Support prioritaire',
      description: 'Réponse garantie sous 24h'
    }
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroImagePlaceholder}>
          <MaterialCommunityIcons
            name="crown"
            size={48}
            color="#06D001"
          />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Passez à la vitesse supérieure</Text>
          <Text style={styles.heroSubtitle}>
            Accédez à toutes les fonctionnalités premium et accélérez votre apprentissage
          </Text>
        </View>
      </View>

      {subscription ? (
        <View style={styles.activeSubscription}>
          <Text style={styles.subscriptionTitle}>Abonnement actif</Text>
          <Text style={styles.subscriptionPlan}>
            Plan {subscription.plan === 'monthly' ? 'mensuel' : 'annuel'}
          </Text>
          <Text style={styles.subscriptionDate}>
            Renouvellement le {subscription.endDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Annuler l\'abonnement',
                'Êtes-vous sûr de vouloir annuler votre abonnement ?',
                [
                  {
                    text: 'Non',
                    style: 'cancel',
                  },
                  {
                    text: 'Oui',
                    onPress: () => {
                      cancelSubscription();
                      router.back();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.cancelButtonText}>Annuler l'abonnement</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.plansContainer}>
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handleSubscribe('monthly')}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Mensuel</Text>
                <Text style={styles.planPrice}>9.99€</Text>
                <Text style={styles.planPeriod}>/mois</Text>
              </View>
              <View style={styles.planFeatures}>
                <Text style={styles.feature}>✓ Accès illimité aux cours</Text>
                <Text style={styles.feature}>✓ Support prioritaire</Text>
                <Text style={styles.feature}>✓ Contenu exclusif</Text>
                <Text style={styles.feature}>✓ Sans publicité</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, styles.recommendedPlan]}
              onPress={() => handleSubscribe('yearly')}
            >
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommandé</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Annuel</Text>
                <Text style={styles.planPrice}>89.99€</Text>
                <Text style={styles.planPeriod}>/an</Text>
              </View>
              <View style={styles.planFeatures}>
                <Text style={styles.feature}>✓ Accès illimité aux cours</Text>
                <Text style={styles.feature}>✓ Support prioritaire</Text>
                <Text style={styles.feature}>✓ Contenu exclusif</Text>
                <Text style={styles.feature}>✓ Sans publicité</Text>
                <Text style={styles.feature}>✓ 25% d'économies</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
          >
            <Text style={styles.restoreButtonText}>
              Restaurer mes achats précédents
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.advantagesContainer}>
        <Text style={styles.sectionTitle}>Avantages Dodje One</Text>
        {advantages.map((advantage, index) => (
          <View key={index} style={styles.advantageCard}>
            <MaterialCommunityIcons
              name={advantage.icon}
              size={24}
              color="#06D001"
            />
            <View style={styles.advantageContent}>
              <Text style={styles.advantageTitle}>{advantage.title}</Text>
              <Text style={styles.advantageDescription}>
                {advantage.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          L'abonnement sera renouvelé automatiquement. Vous pouvez annuler à tout moment.
        </Text>
        <TouchableOpacity
          style={styles.termsButton}
          onPress={() => router.push('/(settings)/terms' as AppRoute)}
        >
          <Text style={styles.termsButtonText}>Voir les conditions d'utilisation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0400',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Arboria-Book',
  },
  hero: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 30,
  },
  heroImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: '#06D001',
    fontSize: 22,
    fontFamily: 'Arboria-Bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    lineHeight: 20,
  },
  activeSubscription: {
    marginTop: 20,
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
  },
  subscriptionTitle: {
    color: '#06D001',
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
    marginBottom: 10,
  },
  subscriptionPlan: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    marginBottom: 5,
  },
  subscriptionDate: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff4d4d',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
  plansContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendedPlan: {
    borderColor: '#06D001',
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
  },
  recommendedBadge: {
    backgroundColor: '#06D001',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    position: 'absolute',
    top: -12,
    right: 15,
    zIndex: 1,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Arboria-Bold',
  },
  planHeader: {
    marginBottom: 15,
    alignItems: 'center',
  },
  planTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Arboria-Bold',
    marginBottom: 8,
  },
  planPrice: {
    color: '#06D001',
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
  },
  planPeriod: {
    color: '#06D001',
    fontSize: 14,
    fontFamily: 'Arboria-Book',
  },
  planFeatures: {
    marginTop: 10,
  },
  feature: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    marginBottom: 8,
  },
  restoreButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  restoreButtonText: {
    color: '#9BEC00',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
  advantagesContainer: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Arboria-Bold',
    marginBottom: 20,
  },
  advantageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  advantageContent: {
    marginLeft: 15,
    flex: 1,
  },
  advantageTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    marginBottom: 5,
  },
  advantageDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: 'Arboria-Book',
    marginBottom: 10,
    textAlign: 'center',
  },
  termsButton: {
    alignItems: 'center',
  },
  termsButtonText: {
    color: '#9BEC00',
    fontSize: 14,
    fontFamily: 'Arboria-Medium',
  },
}); 