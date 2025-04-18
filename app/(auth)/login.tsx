import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { loginSchema } from '../../src/utils/validation';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur Dodje</Text>
      <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

      <Input
        control={control}
        name="email"
        label="Email"
        placeholder="Entrez votre email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        control={control}
        name="password"
        label="Mot de passe"
        placeholder="Entrez votre mot de passe"
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isLoading ? 'Connexion...' : 'Se connecter'}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={styles.button}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Pas encore de compte ? </Text>
        <Link href="/register" style={styles.link}>
          S'inscrire
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A0400',
  },
  title: {
    fontFamily: 'Arboria-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Arboria-Book',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  button: {
    marginTop: 16,
  },
  error: {
    fontFamily: 'Arboria-Book',
    fontSize: 14,
    color: '#FF0000',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: 'Arboria-Book',
    fontSize: 14,
    color: '#FFFFFF',
  },
  link: {
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
    color: '#059212',
  },
}); 