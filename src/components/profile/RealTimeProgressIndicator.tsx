import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileProgress } from '../../hooks/useProfileProgress';
import { useAuth } from '../../hooks/useAuth';
import { TestProgressUpdatesService } from '../../services/testProgressUpdates';

export const RealTimeProgressIndicator: React.FC = () => {
  const { user } = useAuth();
  const { progress, isLoading, error } = useProfileProgress(user?.uid || '');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Détecter les changements de progression
  useEffect(() => {
    if (progress) {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
    }
  }, [progress]);

  const handleTestRealTimeUpdates = async () => {
    if (!user?.uid || isTestRunning) return;
    
    setIsTestRunning(true);
    try {
      Alert.alert(
        "Test des listeners temps réel",
        "Ce test va simuler des mises à jour de progression. Vous devriez voir les changements en temps réel.",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Démarrer", 
            onPress: async () => {
              try {
                await TestProgressUpdatesService.testRealTimeListeners(user.uid);
                Alert.alert("Test terminé", "Les listeners temps réel fonctionnent correctement !");
              } catch (error) {
                console.error('Erreur lors du test:', error);
                Alert.alert("Erreur", "Une erreur s'est produite lors du test.");
              } finally {
                setIsTestRunning(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      setIsTestRunning(false);
    }
  };

  const handleResetProgress = async () => {
    if (!user?.uid || isTestRunning) return;
    
    try {
      await TestProgressUpdatesService.resetProgress(user.uid);
      Alert.alert("Progression remise à zéro", "La progression a été remise à zéro.");
    } catch (error) {
      console.error('Erreur lors de la remise à zéro:', error);
      Alert.alert("Erreur", "Impossible de remettre à zéro la progression.");
    }
  };

  if (!user?.uid) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="sync" 
          size={16} 
          color={isLoading ? "#9BEC00" : "#666"} 
          style={isLoading ? styles.spinning : undefined}
        />
        <Text style={styles.title}>Synchronisation temps réel</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Statut:</Text>
          <Text style={[
            styles.status, 
            { color: error ? '#FF6B6B' : isLoading ? '#9BEC00' : '#4CAF50' }
          ]}>
            {error ? 'Erreur' : isLoading ? 'Synchronisation...' : 'Connecté'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.label}>Dernière mise à jour:</Text>
          <Text style={styles.value}>
            {lastUpdate.toLocaleTimeString('fr-FR')}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.label}>Mises à jour:</Text>
          <Text style={styles.value}>{updateCount}</Text>
        </View>

        {progress && (
          <View style={styles.progressSummary}>
            <Text style={styles.summaryTitle}>Progression actuelle:</Text>
            <Text style={styles.summaryText}>
              Bourse: {progress.bourse.percentage}% ({progress.bourse.completedCourses}/{progress.bourse.totalCourses})
            </Text>
            <Text style={styles.summaryText}>
              Crypto: {progress.crypto.percentage}% ({progress.crypto.completedCourses}/{progress.crypto.totalCourses})
            </Text>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Boutons de test */}
        <View style={styles.testButtons}>
          <TouchableOpacity 
            style={[styles.testButton, isTestRunning && styles.testButtonDisabled]}
            onPress={handleTestRealTimeUpdates}
            disabled={isTestRunning}
          >
            <MaterialCommunityIcons name="play" size={14} color="#FFF" />
            <Text style={styles.testButtonText}>
              {isTestRunning ? 'Test en cours...' : 'Tester listeners'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.resetButton, isTestRunning && styles.testButtonDisabled]}
            onPress={handleResetProgress}
            disabled={isTestRunning}
          >
            <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
            <Text style={styles.testButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(155, 236, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(155, 236, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9BEC00',
    marginLeft: 8,
  },
  content: {
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#999',
  },
  value: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 236, 0, 0.2)',
  },
  summaryTitle: {
    fontSize: 12,
    color: '#9BEC00',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 11,
    color: '#CCC',
  },
  errorText: {
    fontSize: 11,
    color: '#FF6B6B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  spinning: {
    // Note: Pour une vraie animation de rotation, il faudrait utiliser Animated
    // Ici c'est juste un indicateur visuel
  },
  testButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 236, 0, 0.2)',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(155, 236, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
    flex: 1,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },
}); 