import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Écran DodjePlus - Point d'entrée vers les fonctionnalités avancées
 */
export default function DodjePlusScreen() {
  const router = useRouter();
  
  const navigateToDodjeLabScreen = () => {
    router.push("/(dodjelab)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DodjePlus</Text>
        <Text style={styles.subtitle}>Fonctionnalités supplémentaires à venir</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Cette section est en cours de développement. Restez à l'écoute pour découvrir
          de nouvelles fonctionnalités exclusives bientôt disponibles!
        </Text>
        
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={navigateToDodjeLabScreen}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dodje Lab</Text>
            <MaterialCommunityIcons name="flask" size={24} color="#06D001" />
          </View>
          <Text style={styles.cardDescription}>
            Accédez à notre laboratoire d'analyses et de simulations pour améliorer vos stratégies d'investissement.
          </Text>
        </TouchableOpacity>
        
        <View style={[styles.featureCard, styles.comingSoonCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Plus de fonctionnalités</Text>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#CCCCCC" />
          </View>
          <Text style={styles.cardDescription}>
            D'autres fonctionnalités exclusives seront disponibles prochainement.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#06D001',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 30,
    lineHeight: 24,
  },
  featureCard: {
    backgroundColor: '#11070B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#06D001',
  },
  comingSoonCard: {
    borderLeftColor: '#CCCCCC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
  },
}); 