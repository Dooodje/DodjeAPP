import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Dimensions,
  ActivityIndicator,
  TextInput 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LogoDodje } from '../src/components/LogoDodje';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../src/services/firebase/config';
import GlandHomme from '../src/components/GlandHomme';
import GlandFemme from '../src/components/GlandFemme';
import BadgeBourse from '../src/components/BadgeBourse';
import BadgeCrypto from '../src/components/BadgeCrypto';
import BadgeDebutant from '../src/components/BadgeDebutant';
import BadgeAvance from '../src/components/BadgeAvance';
import BadgeExpert from '../src/components/BadgeExpert';

interface QuestionnaireProps {
  visible: boolean;
  onComplete: (answers: Record<string, string>) => void;
}

interface Choice {
  id: string;
  text: string;
  isSelected: boolean;
}

interface Question {
  id: string;
  text: string;
  choices: Choice[];
  isMultipleChoice: boolean;
  timeLimit: number | null;
  createdAt: any;
  comment?: string;
}

interface QuestionnaireData {
  description: string;
  questions: Question[];
  createdAt: any;
}

export default function FirstConnectionQuestionnaire({ visible, onComplete }: QuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  useEffect(() => {
    if (visible) {
      fetchQuestionnaireData();
    }
  }, [visible]);

  useEffect(() => {
    setCurrentAnswer(null);
    setTextInputValue('');
  }, [currentQuestionIndex]);

  const fetchQuestionnaireData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, 'questionnaires', 'gtn3g09nY47e6MSTLEkz');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as QuestionnaireData;
        setQuestionnaireData(data);
      } else {
        setError('Questionnaire non trouvé');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du questionnaire:', err);
      setError('Erreur lors du chargement du questionnaire');
    } finally {
      setLoading(false);
    }
  };

  if (!questionnaireData || loading) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        presentationStyle="overFullScreen"
        hardwareAccelerated={true}
      >
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06D001" />
            <Text style={styles.loadingText}>
              {loading ? 'Chargement du questionnaire...' : error}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  const currentQuestion = questionnaireData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questionnaireData.questions.length - 1;

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(null);
      setTextInputValue('');
    }
  };

  const handleAnswer = (questionId: string, choiceId: string) => {
    setCurrentAnswer(choiceId);
  };

  const handleValidateAnswer = () => {
    if (!currentAnswer) return;
    
    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);
    setCurrentAnswer(null);

    // Attendre un peu pour l'effet visuel
    setTimeout(() => {
      if (isLastQuestion) {
        handleComplete(newAnswers);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 300);
  };

  const handleComplete = async (finalAnswers: Record<string, string>) => {
    onComplete(finalAnswers);
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questionnaireData.questions.length) * 100;
  };

  // Fonction pour rendre la première question avec un design spécialisé
  const renderFirstQuestion = () => {
    if (currentQuestion.text !== "Choisis ton style.") return null;

    return (
      <View style={styles.firstQuestionContainer}>
        {/* Question Text Container */}
        <View style={styles.firstQuestionTextContainer}>
          <Text style={styles.firstQuestionTitle}>
            Choisis ton style.
          </Text>
          <Text style={styles.firstQuestionSubtitle}>
            Un gland ? Oui mais avec du style !
          </Text>
        </View>

        {/* Character Selection Container */}
        <View style={styles.characterSelectionContainer}>
          {currentQuestion.choices.map((choice) => {
            const isGlandMal = choice.text === "Gland mal";
            const isGlandFemelle = choice.text === "Gland Femelle";
            const isSelected = currentAnswer === choice.id;
            
            return (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.characterOption,
                  isSelected && styles.characterOptionSelected
                ]}
                onPress={() => handleAnswer(currentQuestion.id, choice.id)}
                activeOpacity={0.8}
              >
                {isGlandMal && <GlandHomme width={86} height={126} />}
                {isGlandFemelle && <GlandFemme width={88} height={126} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Validation Button */}
        <TouchableOpacity
          style={[
            styles.validateButton,
            currentAnswer ? styles.validateButtonActive : styles.validateButtonInactive
          ]}
          onPress={handleValidateAnswer}
          activeOpacity={0.8}
          disabled={!currentAnswer}
        >
          <Text style={styles.validateButtonText}>
            C'est parti !
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Fonction pour rendre les questions avec champ de saisie (âge, nom, etc.)
  const renderTextInputQuestion = () => {
    const isAgeQuestion = currentQuestion.text.includes("âge") || currentQuestion.text.includes("Renseigne ton âge");
    const isNameQuestion = currentQuestion.text.includes("nom") || currentQuestion.text.includes("Trouve ton nom") || currentQuestion.text.includes("blaze") || currentQuestion.text.includes("Trouve ton blaze");
    
    if (!isAgeQuestion && !isNameQuestion) return null;

    return (
      <View style={styles.textInputQuestionContainer}>
        {/* Question Text Container */}
        <View style={styles.textInputQuestionTextContainer}>
          <Text style={styles.textInputQuestionTitle}>
            {currentQuestion.text}
          </Text>
          {currentQuestion.comment && (
            <Text style={styles.textInputQuestionSubtitle}>
              {currentQuestion.comment}
            </Text>
          )}
        </View>

        {/* Text Input Field */}
        <TextInput
          style={styles.textInputField}
          value={textInputValue}
          onChangeText={setTextInputValue}
          placeholder={isAgeQuestion ? "Ton âge..." : "Ton nom..."}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          keyboardType={isAgeQuestion ? "numeric" : "default"}
          maxLength={isAgeQuestion ? 3 : 50}
        />

        {/* Validation Button */}
        <TouchableOpacity
          style={[
            styles.validateButton,
            textInputValue.trim() ? styles.validateButtonActive : styles.validateButtonInactive
          ]}
          onPress={() => {
            if (textInputValue.trim()) {
              const newAnswers = { ...answers, [currentQuestion.id]: textInputValue.trim() };
              setAnswers(newAnswers);
              setTextInputValue('');
              
              setTimeout(() => {
                if (isLastQuestion) {
                  handleComplete(newAnswers);
                } else {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                }
              }, 300);
            }
          }}
          activeOpacity={0.8}
          disabled={!textInputValue.trim()}
        >
          <Text style={styles.validateButtonText}>
            C'est parti !
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Fonction pour rendre les questions à choix multiples avec le design de la première question
  const renderMultipleChoiceQuestion = () => {
    if (currentQuestion.text === "Choisis ton style.") return null;
    
    // Exclure les questions avec champ de saisie
    const isAgeQuestion = currentQuestion.text.includes("âge") || currentQuestion.text.includes("Renseigne ton âge");
    const isNameQuestion = currentQuestion.text.includes("nom") || currentQuestion.text.includes("Trouve ton nom") || currentQuestion.text.includes("blaze") || currentQuestion.text.includes("Trouve ton blaze");
    if (isAgeQuestion || isNameQuestion) return null;

    // Vérifier si c'est la question de niveau
    const isLevelQuestion = currentQuestion.text.toLowerCase().includes("niveau");

    return (
      <View style={[
        styles.firstQuestionContainer,
        isLevelQuestion && styles.levelQuestionContainer
      ]}>
        {/* Question Text Container */}
        <View style={styles.firstQuestionTextContainer}>
          <Text style={styles.firstQuestionTitle}>
            {currentQuestion.text}
          </Text>
          {currentQuestion.comment && (
            <Text style={styles.firstQuestionSubtitle}>
              {currentQuestion.comment}
            </Text>
          )}
        </View>

        {/* Choices Container */}
        {isLevelQuestion ? (
          <View style={styles.levelChoicesContainer}>
            {/* Première ligne : Débutant et Avancé */}
            <View style={styles.levelFirstRow}>
              {currentQuestion.choices.filter(choice => 
                choice.text.toLowerCase().includes("débutant") || 
                choice.text.toLowerCase().includes("avancé")
              ).map((choice) => {
                const isDebutant = choice.text.toLowerCase().includes("débutant");
                const isAvance = choice.text.toLowerCase().includes("avancé");
                const isSelected = currentAnswer === choice.id;
                
                return (
                  <TouchableOpacity
                    key={choice.id}
                    style={[
                      styles.levelChoiceOption,
                      isSelected && styles.choiceOptionSelected
                    ]}
                    onPress={() => handleAnswer(currentQuestion.id, choice.id)}
                    activeOpacity={0.8}
                  >
                    {/* Choice Text */}
                    <Text style={[
                      styles.choiceText,
                      isSelected && styles.choiceTextSelected
                    ]}>
                      {choice.text}
                    </Text>
                    
                    {/* Badge Container */}
                    <View style={styles.badgeContainer}>
                      {isDebutant && <BadgeDebutant width={60} height={86} />}
                      {isAvance && <BadgeAvance width={95} height={91} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Deuxième ligne : Expert centré */}
            <View style={styles.levelSecondRow}>
              {currentQuestion.choices.filter(choice => 
                choice.text.toLowerCase().includes("expert")
              ).map((choice) => {
                const isSelected = currentAnswer === choice.id;
                
                return (
                  <TouchableOpacity
                    key={choice.id}
                    style={[
                      styles.levelChoiceOption,
                      isSelected && styles.choiceOptionSelected
                    ]}
                    onPress={() => handleAnswer(currentQuestion.id, choice.id)}
                    activeOpacity={0.8}
                  >
                    {/* Choice Text */}
                    <Text style={[
                      styles.choiceText,
                      isSelected && styles.choiceTextSelected
                    ]}>
                      {choice.text}
                    </Text>
                    
                    {/* Badge Container */}
                    <View style={styles.badgeContainer}>
                      <BadgeExpert width={89} height={92} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.choicesContainer}>
            {currentQuestion.choices.map((choice) => {
              const isBourse = choice.text.toLowerCase().includes("bourse");
              const isCrypto = choice.text.toLowerCase().includes("crypto");
              const isSelected = currentAnswer === choice.id;
              
              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceOption,
                    isSelected && styles.choiceOptionSelected
                  ]}
                  onPress={() => handleAnswer(currentQuestion.id, choice.id)}
                  activeOpacity={0.8}
                >
                  {/* Choice Text */}
                  <Text style={[
                    styles.choiceText,
                    isSelected && styles.choiceTextSelected
                  ]}>
                    {choice.text}
                  </Text>
                  
                  {/* Badge Container */}
                  <View style={styles.badgeContainer}>
                    {isBourse && <BadgeBourse width={66} height={81} />}
                    {isCrypto && <BadgeCrypto width={66} height={81} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Validation Button */}
        <TouchableOpacity
          style={[
            styles.validateButton,
            currentAnswer ? styles.validateButtonActive : styles.validateButtonInactive
          ]}
          onPress={handleValidateAnswer}
          activeOpacity={0.8}
          disabled={!currentAnswer}
        >
          <Text style={styles.validateButtonText}>
            C'est parti !
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {/* Back Arrow and Progress Bar Row */}
            <View style={styles.progressRow}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity 
                  style={styles.backButtonProgress}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Question Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderFirstQuestion()}
            {renderTextInputQuestion()}
            {renderMultipleChoiceQuestion()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0A0400',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    width: Dimensions.get('window').width * 0.95,
    maxWidth: 480,
    height: Dimensions.get('window').height * 0.90,
    backgroundColor: '#0A0400',
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 10000,
    elevation: 10000,
    shadowColor: '#06D001',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  progressContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    backgroundColor: 'rgba(6, 208, 1, 0.02)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButtonProgress: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#06D001',
    borderRadius: 8,
    shadowColor: '#06D001',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  firstQuestionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 150,
    alignItems: 'center',
    gap: 40,
    width: 408,
    alignSelf: 'center',
  },
  firstQuestionTextContainer: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  firstQuestionTitle: {
    fontSize: 42,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    lineHeight: 44,
    letterSpacing: -2,
    textAlign: 'center',
  },
  firstQuestionSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
    lineHeight: 20,
    textAlign: 'center',
  },
  characterSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    maxWidth: 350,
  },
  characterOption: {
    paddingVertical: 30,
    paddingHorizontal: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 170,
  },
  characterOptionSelected: {
    backgroundColor: '#9BEC00',
    shadowColor: '#9BEC00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  questionContainer: {
    padding: 28,
    gap: 32,
  },
  questionTextContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  questionText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  questionComment: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Arboria-Medium',
    lineHeight: 20,
    letterSpacing: -0.1,
    fontStyle: 'italic',
  },
  answersContainer: {
    gap: 20,
  },
  answerContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedAnswer: {
    backgroundColor: 'rgba(6, 208, 1, 0.08)',
    transform: [{ scale: 1.02 }],
    shadowColor: '#06D001',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  selectedAnswerText: {
    color: '#06D001',
    fontFamily: 'Arboria-Bold',
  },
  validateButton: {
    width: 196,
    height: 33,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  validateButtonActive: {
    backgroundColor: '#9BEC00',
  },
  validateButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  validateButtonText: {
    fontSize: 15,
    fontFamily: 'Arboria-Bold',
    textAlign: 'center',
    lineHeight: 15,
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 32,
    padding: 60,
    backgroundColor: '#0A0400',
    borderRadius: 24,
    zIndex: 10000,
    elevation: 10000,
    shadowColor: '#06D001',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  loadingText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  textInputQuestionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 200,
    alignItems: 'center',
    gap: 40,
    width: 408,
    alignSelf: 'center',
  },
  textInputQuestionTextContainer: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  textInputQuestionTitle: {
    fontSize: 42,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    lineHeight: 44,
    letterSpacing: -2,
    textAlign: 'center',
  },
  textInputQuestionSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Medium',
    lineHeight: 20,
    textAlign: 'center',
  },
  textInputField: {
    width: '100%',
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Arboria-Medium',
    textAlign: 'center',
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    maxWidth: 350,
  },
  choiceOption: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    maxWidth: 170,
    minHeight: 140,
    position: 'relative',
  },
  choiceOptionSelected: {
    backgroundColor: '#9BEC00',
    shadowColor: '#9BEC00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  choiceText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    lineHeight: 26,
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  choiceTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
  },
  badgeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelChoicesContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    maxWidth: 350,
  },
  levelFirstRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  levelSecondRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  levelChoiceOption: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    maxWidth: 170,
    minHeight: 140,
    position: 'relative',
  },
  levelQuestionContainer: {
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
}); 