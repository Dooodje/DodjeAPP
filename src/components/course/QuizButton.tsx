import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuizOff } from '../QuizOff';
import QuizOn from '../QuizOn';
import { LogoDodjeBlanc } from '../LogoDodjeBlanc';
import { Vector } from '../Vector';
import { useAuth } from '../../hooks/useAuth';
import { QuizStatusService } from '../../services/businessLogic/QuizStatusService';
import QuizLockedModal from '../ui/QuizLockedModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Constantes pour les dimensions
const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_BUTTON_SIZE = 90; // Ajusté à 90

interface QuizButtonProps {
  id: string;
  title?: string;
  positionX: number; // Position X en pourcentage (0-100)
  positionY: number; // Position Y en pourcentage (0-100)
  imageWidth: number; // Largeur de l'image d'arrière-plan
  imageHeight: number; // Hauteur de l'image d'arrière-plan
  onPress: (quizId: string) => void;
}

const QuizButton: React.FC<QuizButtonProps> = ({
  id,
  title = 'Quiz Final',
  positionX,
  positionY,
  imageWidth,
  imageHeight,
  onPress
}) => {
  const { user } = useAuth();
  const [quizStatus, setQuizStatus] = useState<'blocked' | 'unblocked' | 'completed'>('blocked');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tokenReward, setTokenReward] = useState<number>(0);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!user?.uid) return;
      try {
        // Charger le statut du quiz
        const status = await QuizStatusService.getQuizStatus(user.uid, id);
        setQuizStatus(status?.status || 'blocked');

        // Charger les données du quiz depuis Firestore
        const quizDoc = await getDoc(doc(db, 'quizzes', id));
        if (quizDoc.exists()) {
          setTokenReward(quizDoc.data().tokenReward || 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du quiz:', error);
        setQuizStatus('blocked');
      }
    };

    loadQuizData();
  }, [user?.uid, id]);

  // Calculer la position absolue en pixels
  const position = useMemo(() => {
    // Valider les dimensions
    const validImageWidth = imageWidth > 0 ? imageWidth : screenWidth;
    const validImageHeight = imageHeight > 0 ? imageHeight : screenWidth * 2;
    
    if (imageWidth <= 0 || imageHeight <= 0) {
      console.warn(`Dimensions d'image invalides pour le bouton quiz: ${imageWidth}x${imageHeight}. Utilisation des valeurs par défaut.`);
    }
    
    // Convertir les pourcentages en pixels absolus par rapport à l'image
    const absoluteX = (positionX / 100) * validImageWidth;
    const absoluteY = (positionY / 100) * validImageHeight;
    
    // Centrer le bouton sur le point exact
    const left = absoluteX - (DEFAULT_BUTTON_SIZE / 2);
    const top = absoluteY - (DEFAULT_BUTTON_SIZE / 2);
    
    // Log pour débogage
    console.log(`QuizButton (${id}): Position relative=${positionX}%,${positionY}%, Dimensions image=${validImageWidth}x${validImageHeight}, Position absolue=${left},${top}`);
    
    return { 
      left,
      top
    };
  }, [id, positionX, positionY, imageWidth, imageHeight]);

  return (
    <>
      <View style={[styles.container, position]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.buttonContent,
            quizStatus === 'blocked' && styles.buttonBlocked
          ]}
          onPress={() => {
            if (quizStatus === 'blocked') {
              setIsModalVisible(true);
            } else {
              onPress(id);
            }
          }}
        >
          <View style={styles.contentContainer}>
            {quizStatus === 'completed' ? (
              <QuizOn width={90} height={90} />
            ) : (
              <View style={styles.quizOffContainer}>
                <QuizOff width={90} height={90} />
                {quizStatus === 'blocked' && (
                  <View style={styles.vectorContainer}>
                    <Vector width={45} height={45} />
                  </View>
                )}
              </View>
            )}
            <View style={styles.textOverlay}>
              <Text style={[
                styles.quizText,
                quizStatus !== 'blocked' && styles.textUnblocked
              ]}>Quizz</Text>
              <View style={[
                styles.rewardContainer,
                quizStatus !== 'blocked' && styles.textUnblocked
              ]}>
                <Text style={styles.rewardText}>+{tokenReward}</Text>
                <LogoDodjeBlanc width={14} height={20} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <QuizLockedModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        quizTitle={title}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: DEFAULT_BUTTON_SIZE,
    height: DEFAULT_BUTTON_SIZE,
    borderRadius: DEFAULT_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  buttonBlocked: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  quizText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Arboria-Medium',
    textAlign: 'center',
    opacity: 0.5,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    opacity: 0.5,
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Arboria-Medium',
    textAlign: 'center',
    marginRight: 4,
  },
  quizOffContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vectorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22.5 }, { translateY: -22.5 }],
    zIndex: 2,
  },
  textUnblocked: {
    opacity: 1,
  },
});

export default QuizButton; 