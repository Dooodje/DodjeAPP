import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { registerSchema } from '../../src/utils/validation';
import { LogoDodje } from '../../src/components/LogoDodje';
import FondCo from '../../src/components/FondCo';
import { Ionicons } from '@expo/vector-icons';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError(null);
      // Générer un nom d'utilisateur temporaire à partir de l'email
      const tempUsername = data.email.split('@')[0];
      await register(data.email, data.password, tempUsername);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription');
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
      <FondCo width={windowWidth} height={windowHeight} />
      
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmez le mot de passe :</Text>
              <Input
                control={control}
                name="confirmPassword"
                placeholder="Tapez ici..."
                secureTextEntry
                style={styles.input}
              />
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
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
}); 