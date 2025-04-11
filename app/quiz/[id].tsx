import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function QuizPage() {
  const { id, parcoursId } = useLocalSearchParams<{ id: string; parcoursId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Simuler le chargement du quiz
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleBackPress = () => {
    if (parcoursId) {
      router.push(`/course/${parcoursId}` as any);
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Final</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Contenu */}
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#06D001" />
              <Text style={styles.loaderText}>Chargement du quiz...</Text>
            </View>
          ) : (
            <View style={styles.quizContainer}>
              <View style={styles.quizInfoCard}>
                <MaterialIcons name="quiz" size={48} color="#FFC107" style={styles.quizIcon} />
                <Text style={styles.quizTitle}>Quiz Final</Text>
                <Text style={styles.quizDescription}>
                  Ce quiz vous permettra de tester vos connaissances acquises durant ce parcours.
                </Text>
                <Text style={styles.quizId}>ID du Quiz: {id}</Text>
                <Text style={styles.quizId}>ID du Parcours: {parcoursId}</Text>
                
                <View style={styles.infoContainer}>
                  <MaterialIcons name="info-outline" size={18} color="#FFFFFF" style={styles.infoIcon} />
                  <Text style={styles.infoText}>
                    Cette fonctionnalité est en cours de développement.
                    L'intégration complète des questions et de la vérification des réponses sera disponible prochainement.
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.startButton} onPress={handleBackPress}>
                  <Text style={styles.startButtonText}>Retour au parcours</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  headerSpacer: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  quizContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  quizInfoCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  quizIcon: {
    marginBottom: 16,
  },
  quizTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  quizDescription: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  quizId: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 8,
  },
  infoContainer: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginVertical: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#06D001',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 