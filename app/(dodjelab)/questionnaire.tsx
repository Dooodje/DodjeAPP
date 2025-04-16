import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { useAuth } from '../../src/hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

// Questions pour le questionnaire
const questions = [
  {
    id: 1,
    text: "Quel est votre horizon d'investissement ?",
    options: [
      { id: 'a', text: "Court terme (moins de 2 ans)" },
      { id: 'b', text: "Moyen terme (2 à 5 ans)" },
      { id: 'c', text: "Long terme (5 à 10 ans)" },
      { id: 'd', text: "Très long terme (plus de 10 ans)" }
    ]
  },
  {
    id: 2,
    text: "Comment réagiriez-vous si vos investissements perdaient 20% de leur valeur en un mois ?",
    options: [
      { id: 'a', text: "Je vendrais immédiatement pour éviter d'autres pertes" },
      { id: 'b', text: "Je vendrais une partie de mes investissements" },
      { id: 'c', text: "Je ne ferais rien et attendrais que ça remonte" },
      { id: 'd', text: "J'achèterais davantage pour profiter des prix bas" }
    ]
  },
  {
    id: 3,
    text: "Quel est votre principal objectif d'investissement ?",
    options: [
      { id: 'a', text: "Préserver mon capital avec un minimum de risque" },
      { id: 'b', text: "Générer un revenu régulier" },
      { id: 'c', text: "Croissance équilibrée entre revenu et capital" },
      { id: 'd', text: "Croissance maximale du capital avec une forte prise de risque" }
    ]
  },
  {
    id: 4,
    text: "Quelle part de votre patrimoine total êtes-vous prêt à investir ?",
    options: [
      { id: 'a', text: "Moins de 10%" },
      { id: 'b', text: "Entre 10% et 25%" },
      { id: 'c', text: "Entre 25% et 50%" },
      { id: 'd', text: "Plus de 50%" }
    ]
  },
  {
    id: 5,
    text: "Quelle est votre expérience en matière d'investissement ?",
    options: [
      { id: 'a', text: "Aucune expérience" },
      { id: 'b', text: "Débutant (quelques opérations)" },
      { id: 'c', text: "Intermédiaire (investissements réguliers depuis plusieurs années)" },
      { id: 'd', text: "Avancé (connaissance approfondie des marchés financiers)" }
    ]
  },
  {
    id: 6,
    text: "Quelle affirmation décrit le mieux votre approche des finances ?",
    options: [
      { id: 'a', text: "Je préfère la sécurité avant tout" },
      { id: 'b', text: "Je suis prudent mais ouvert à certaines opportunités" },
      { id: 'c', text: "Je recherche un bon équilibre entre risque et rendement" },
      { id: 'd', text: "Je suis prêt à prendre des risques importants pour des rendements élevés" }
    ]
  },
  {
    id: 7,
    text: "Comment décririez-vous votre stabilité financière actuelle ?",
    options: [
      { id: 'a', text: "Instable (revenu variable, peu d'épargne)" },
      { id: 'b', text: "Stable mais limitée (revenu régulier, épargne modeste)" },
      { id: 'c', text: "Bonne (revenu confortable, épargne constituée)" },
      { id: 'd', text: "Excellente (revenu élevé, épargne importante)" }
    ]
  },
  {
    id: 8,
    text: "Quels types d'investissements avez-vous déjà réalisés ?",
    options: [
      { id: 'a', text: "Uniquement des comptes d'épargne ou livrets" },
      { id: 'b', text: "Principalement des obligations ou fonds monétaires" },
      { id: 'c', text: "Un mix d'actions, obligations et autres produits" },
      { id: 'd', text: "Des investissements diversifiés incluant des actifs plus risqués (crypto, startups...)" }
    ]
  },
  {
    id: 9,
    text: "À quelle fréquence suivez-vous l'évolution de vos investissements ?",
    options: [
      { id: 'a', text: "Rarement (une fois par an ou moins)" },
      { id: 'b', text: "Occasionnellement (tous les trimestres)" },
      { id: 'c', text: "Régulièrement (plusieurs fois par mois)" },
      { id: 'd', text: "Quotidiennement" }
    ]
  }
];

export default function QuestionnaireScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.back();
    }
  };

  const handleSelectOption = (optionId: string) => {
    // Enregistrer la réponse actuelle
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: optionId
    });

    // Passer à la question suivante ou terminer
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmitQuestionnaire = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Sauvegarder les réponses dans Firestore
      const userRef = doc(db, 'users', user!.uid);
      await setDoc(userRef, {
        investmentQuestionnaire: {
          answers,
          completedAt: new Date().toISOString(),
        }
      }, { merge: true });

      // Rediriger vers la page d'analyse
      router.replace("/(dodjelab)");
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du questionnaire:', err);
      setError('Une erreur est survenue lors de l\'enregistrement de vos réponses. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calcul de la progression
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  // Obtenir la question actuelle
  const question = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Questionnaire"
        showBackButton
        onBackPress={handleBack}
      />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1}/{questions.length}
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.text}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  answers[question.id] === option.id && styles.selectedOption
                ]}
                onPress={() => handleSelectOption(option.id)}
              >
                <Text style={[
                  styles.optionText,
                  answers[question.id] === option.id && styles.selectedOptionText
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {currentQuestion === questions.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              Object.keys(answers).length < questions.length && styles.disabledButton
            ]}
            onPress={handleSubmitQuestionnaire}
            disabled={Object.keys(answers).length < questions.length || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.submitButtonText}>Terminer le questionnaire</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleBack}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
              <Text style={styles.navButtonText}>Précédent</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.navButton,
                !answers[question.id] && styles.disabledNavButton
              ]}
              onPress={() => currentQuestion < questions.length - 1 && answers[question.id] && setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[question.id]}
            >
              <Text style={styles.navButtonText}>Suivant</Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#11070B',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06D001',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#11070B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedOption: {
    borderColor: '#06D001',
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 8,
  },
  submitButton: {
    backgroundColor: '#06D001',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 