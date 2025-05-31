import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useQuestionnaire } from '../hooks/useQuestionnaire';

/**
 * Exemple d'utilisation du hook useQuestionnaire
 * Ce composant montre comment récupérer et afficher les réponses du questionnaire
 */
export const QuestionnaireExample: React.FC = () => {
  const { 
    userData,
    answers, 
    hasCompleted, 
    isLoading, 
    error, 
    analysis 
  } = useQuestionnaire();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#06D001" />
        <Text style={styles.loadingText}>Chargement des données du questionnaire...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  if (!hasCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>
          L'utilisateur n'a pas encore complété le questionnaire de première connexion.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Données du Questionnaire</Text>
      
      {/* Données structurées principales */}
      {userData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Utilisateur</Text>
          <Text style={styles.dataText}>Nom: {userData.name}</Text>
          <Text style={styles.dataText}>Âge: {userData.age} ans</Text>
          <Text style={styles.dataText}>Sexe: {userData.sexe}</Text>
          <Text style={styles.dataText}>Préférence: {userData.preference}</Text>
          <Text style={styles.dataText}>Niveau: {userData.lvl}</Text>
          <Text style={styles.infoText}>
            Complété le: {userData.questionnaireCompletedAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
          </Text>
        </View>
      )}

      {/* Informations générales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations générales</Text>
        <Text style={styles.infoText}>
          Complété le: {answers?.completedAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
        </Text>
        <Text style={styles.infoText}>
          Version: {answers?.version || 'Inconnue'}
        </Text>
        <Text style={styles.infoText}>
          ID Questionnaire: {answers?.questionnaireId || 'Inconnu'}
        </Text>
      </View>

      {/* Analyse des réponses (legacy) */}
      {analysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse Legacy</Text>
          {analysis.name && (
            <Text style={styles.analysisText}>Nom: {analysis.name}</Text>
          )}
          {analysis.age && (
            <Text style={styles.analysisText}>Âge: {analysis.age} ans</Text>
          )}
          {analysis.style && (
            <Text style={styles.analysisText}>Style choisi: {analysis.style}</Text>
          )}
          {analysis.level && (
            <Text style={styles.analysisText}>Niveau: {analysis.level}</Text>
          )}
          {analysis.interest && (
            <Text style={styles.analysisText}>Intérêt: {analysis.interest}</Text>
          )}
        </View>
      )}

      {/* Réponses détaillées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réponses détaillées</Text>
        {answers?.answers && Object.entries(answers.answers).map(([questionId, answer]) => (
          <View key={questionId} style={styles.answerItem}>
            <Text style={styles.questionId}>Question {questionId}:</Text>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A0400',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06D001',
    marginBottom: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 16,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  dataText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  analysisText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 10,
  },
  answerItem: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  questionId: {
    color: '#06D001',
    fontSize: 14,
    fontWeight: 'bold',
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 2,
  },
}); 