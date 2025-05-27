import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAppInitialization } from '../hooks/useAppInitialization';
import { LogoDodje } from './LogoDodje';

const { width, height } = Dimensions.get('window');

interface AppInitializationScreenProps {
  onInitialized: () => void;
  loadGlobalDataOnly?: boolean;
}

export const AppInitializationScreen: React.FC<AppInitializationScreenProps> = ({
  onInitialized,
  loadGlobalDataOnly = false,
}) => {
  const {
    isInitialized,
    isInitializing,
    initializationProgress,
    error,
    retry,
    forceReinitialize,
  } = useAppInitialization(loadGlobalDataOnly);

  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Animation de la barre de progression
  React.useEffect(() => {
    if (initializationProgress) {
      Animated.timing(progressAnim, {
        toValue: initializationProgress.progress / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [initializationProgress, progressAnim]);

  // Animation d'apparition
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Rediriger quand l'initialisation est terminée
  React.useEffect(() => {
    if (isInitialized) {
      setTimeout(() => {
        onInitialized();
      }, 1000); // Petit délai pour montrer le succès
    }
  }, [isInitialized, onInitialized]);

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'imageCache':
        return '🖼️';
      case 'cleanup':
        return '🧹';
      case 'homeData':
        return '📊';
      case 'verification':
        return '✅';
      case 'complete':
        return '🎉';
      case 'error':
        return '❌';
      default:
        return '⚡';
    }
  };

  const getProgressColor = () => {
    if (error) return '#FF6B6B';
    if (isInitialized) return '#9BEC00';
    return '#06D001';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Logo ou icône de l'app */}
        <View style={styles.logoContainer}>
          <LogoDodje />
          <Text style={styles.appName}>Dodje</Text>
        </View>

        {/* Indicateur de progression */}
        <View style={styles.progressContainer}>
          {initializationProgress && (
            <>
              <View style={styles.stepContainer}>
                <Text style={styles.stepIcon}>
                  {getStepIcon(initializationProgress.step)}
                </Text>
                <Text style={styles.stepMessage}>
                  {initializationProgress.message}
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getProgressColor(),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {initializationProgress.progress}%
                </Text>
              </View>
            </>
          )}

          {/* Spinner de chargement */}
          {isInitializing && !error && (
            <ActivityIndicator
              size="large"
              color={getProgressColor()}
              style={styles.spinner}
            />
          )}

          {/* Message de succès */}
          {isInitialized && (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successMessage}>
                Application prête !
              </Text>
            </View>
          )}

          {/* Gestion des erreurs */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.errorMessage}>
                Erreur lors de l'initialisation
              </Text>
              <Text style={styles.errorDetails}>{error}</Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={retry}
                >
                  <Text style={styles.buttonText}>Réessayer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.forceButton]}
                  onPress={forceReinitialize}
                >
                  <Text style={styles.buttonText}>Réinitialiser</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Informations de debug (en développement) */}
        {__DEV__ && initializationProgress && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Debug: {initializationProgress.step}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.8,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Arboria-Bold',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  stepMessage: {
    fontSize: 16,
    color: '#B8B8D1',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Arboria-Book',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#2A2A4A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#B8B8D1',
    fontWeight: '600',
    fontFamily: 'Arboria-Medium',
  },
  spinner: {
    marginTop: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  successIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 18,
    color: '#9BEC00',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Arboria-Bold',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 50,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Arboria-Bold',
  },
  errorDetails: {
    fontSize: 14,
    color: '#B8B8D1',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Arboria-Book',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  retryButton: {
    backgroundColor: '#06D001',
  },
  forceButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Arboria-Bold',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
}); 