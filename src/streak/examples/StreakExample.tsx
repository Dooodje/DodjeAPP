import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useStreak, StreakModal, StreakDisplay } from '../index';
import { useAuth } from '../../hooks/useAuth';
import { StreakService } from '../services/StreakService';

/**
 * Composant d'exemple pour tester le système de streak
 * À utiliser uniquement en développement
 */
export const StreakExample: React.FC = () => {
  const { user } = useAuth();
  const { 
    streakData, 
    modalData, 
    loading, 
    error, 
    checkStreak, 
    getCurrentStreak, 
    canEarnStreakToday, 
    resetStreak, 
    closeModal 
  } = useStreak();

  const handleCheckStreak = async () => {
    try {
      const result = await checkStreak();
      if (result) {
        Alert.alert(
          'Streak vérifié',
          `Streak actuel: ${result.currentStreak}\nDodji gagné: ${result.totalDodjiEarned}`
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleResetStreak = async () => {
    try {
      await resetStreak();
      Alert.alert('Succès', 'Streak réinitialisé avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleCheckCanEarn = async () => {
    try {
      const canEarn = await canEarnStreakToday();
      Alert.alert(
        'Vérification streak quotidien',
        `Peut gagner un streak aujourd'hui: ${canEarn ? 'Oui' : 'Non'}`
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleTestScenario = async () => {
    if (!user) return;
    
    try {
      // Simuler un scénario de test en réinitialisant d'abord
      await StreakService.resetStreak(user.uid);
      
      // Puis vérifier le streak (devrait créer un nouveau streak)
      const result = await StreakService.checkAndUpdateStreak(user.uid);
      
      Alert.alert(
        'Test Scenario Résultat',
        `Nouveau streak: ${result.currentStreak}\n` +
        `Dodji gagné: ${result.totalDodjiEarned}\n` +
        `Nouveau jour: ${result.isNewStreakDay ? 'Oui' : 'Non'}\n` +
        `Récompense: ${result.todayReward?.title || 'Aucune'}`
      );
      
      // Rafraîchir les données
      await getCurrentStreak();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vous devez être connecté pour tester le streak</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test du Système de Streak</Text>
      
      {/* Affichage des données actuelles */}
      <View style={styles.dataContainer}>
        <Text style={styles.sectionTitle}>Données actuelles :</Text>
        {streakData ? (
          <>
            <Text style={styles.dataText}>Streak actuel : {streakData.currentStreak} jours</Text>
            <Text style={styles.dataText}>
              Dernière mise à jour : {streakData.lastStreakUpdate || 'Jamais'}
            </Text>
            <Text style={styles.dataText}>
              Nouveau streak aujourd'hui : {streakData.isNewStreakDay ? 'Oui' : 'Non'}
            </Text>
            {streakData.todayReward && (
              <Text style={styles.dataText}>
                Récompense du jour : +{streakData.todayReward.dodjiReward} Dodji
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.dataText}>Aucune donnée de streak</Text>
        )}
      </View>

      {/* Affichage compact du streak */}
      {streakData && (
        <View style={styles.displayContainer}>
          <Text style={styles.sectionTitle}>Affichage compact :</Text>
          <StreakDisplay streakCount={streakData.currentStreak} compact />
        </View>
      )}

      {/* Boutons de test */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCheckStreak}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Vérifier le streak</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={getCurrentStreak}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Récupérer le streak</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCheckCanEarn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Peut gagner aujourd'hui ?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleResetStreak}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Réinitialiser le streak</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleTestScenario}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Tester un scénario</Text>
        </TouchableOpacity>
      </View>

      {/* Affichage des erreurs */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur : {error}</Text>
        </View>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      )}

      {/* Modal de streak */}
      <StreakModal modalData={modalData} onClose={closeModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    color: '#9BEC00',
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: 'rgba(155, 236, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#9BEC00',
  },
  dataText: {
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: '#9BEC00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF6B35',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Arboria-Bold',
    color: '#000000',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    color: '#FF6B35',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#CCCCCC',
  },
}); 