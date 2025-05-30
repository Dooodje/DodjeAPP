import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { loginSchema } from '../../src/utils/validation';
import { LogoDodje } from '../../src/components/LogoDodje';
import { Ionicons } from '@expo/vector-icons';

interface LoginForm {
  email: string;
  password: string;
}

const REMEMBER_ME_KEY = 'rememberMe';
const SAVED_CREDENTIALS_KEY = 'savedCredentials';

export default function LoginScreen() {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const { control, handleSubmit, setValue } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  // Charger les identifiants sauvegardés au démarrage
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const rememberMeValue = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (rememberMeValue === 'true') {
          setRememberMe(true);
          const savedCredentials = await AsyncStorage.getItem(SAVED_CREDENTIALS_KEY);
          if (savedCredentials) {
            const { email, password } = JSON.parse(savedCredentials);
            setValue('email', email);
            setValue('password', password);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des identifiants:', error);
      }
    };

    loadSavedCredentials();
  }, [setValue]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Connexion normale
      await login(data.email, data.password);
      
      // Gérer la sauvegarde des identifiants
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
        await AsyncStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({
          email: data.email,
          password: data.password
        }));
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(SAVED_CREDENTIALS_KEY);
      }
      
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof Error && err.message.includes('auth/invalid-credential')) {
        setError('Adresse mail ou mot de passe incorrect');
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LogoDodje width={150} height={150} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse mail :</Text>
              <Input
                control={control}
                name="email"
                placeholder="Tapez ici..."
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe :</Text>
              <Input
                control={control}
                name="password"
                placeholder="Tapez ici..."
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberMeText}>Rester connecté</Text>
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formContainer: {
    gap: 20,
    width: '100%',
    maxWidth: 410,
    alignSelf: 'center',
    paddingBottom: 40,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontFamily: 'Arboria-Medium',
    fontSize: 20,
    color: '#FFFFFF',
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#9BEC00',
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
    fontSize: 15,
  },
  error: {
    fontFamily: 'Arboria-Book',
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#9BEC00',
  },
  rememberMeText: {
    color: '#FFFFFF',
    fontFamily: 'Arboria-Book',
    fontSize: 14,
  },
}); 