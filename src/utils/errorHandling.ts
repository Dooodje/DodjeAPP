import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' = 'medium'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, fallbackMessage: string = 'Une erreur est survenue') => {
  if (error instanceof AppError) {
    switch (error.severity) {
      case 'high':
        Alert.alert(
          'Erreur critique',
          error.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // Log l'erreur pour le suivi
                console.error('Erreur critique:', error);
              },
            },
          ]
        );
        break;
      case 'medium':
        Alert.alert('Erreur', error.message);
        break;
      case 'low':
        // Afficher une notification toast ou un message moins intrusif
        console.warn('Erreur mineure:', error.message);
        break;
    }
  } else if (error instanceof Error) {
    Alert.alert('Erreur', error.message || fallbackMessage);
  } else {
    Alert.alert('Erreur', fallbackMessage);
  }
};

export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorMessage: string
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, errorMessage);
      throw error;
    }
  };
};

export const createErrorBoundary = (componentName: string) => {
  return (error: Error) => {
    console.error(`Erreur dans le composant ${componentName}:`, error);
    // Log l'erreur pour le suivi
    // Envoyer l'erreur à un service de monitoring si nécessaire
  };
};

export const validateInput = <T extends Record<string, any>>(
  input: T,
  validationRules: {
    [K in keyof T]?: (value: T[K]) => boolean | string;
  }
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};

  Object.entries(validationRules).forEach(([key, rule]) => {
    const value = input[key as keyof T];
    const result = rule(value);

    if (typeof result === 'string') {
      errors[key as keyof T] = result;
    } else if (!result) {
      errors[key as keyof T] = `Le champ ${key} est invalide`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}; 