import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { registerSchema } from '../../src/utils/validation';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
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
      await register(data.email, data.password, data.username);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoignez la communauté Dodje</Text>

      <Input
        control={control}
        name="username"
        label="Nom d'utilisateur"
        placeholder="Entrez votre nom d'utilisateur"
        autoCapitalize="none"
      />

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

      <Input
        control={control}
        name="confirmPassword"
        label="Confirmer le mot de passe"
        placeholder="Confirmez votre mot de passe"
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isLoading ? 'Inscription...' : 'S\'inscrire'}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        style={styles.button}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Déjà un compte ? </Text>
        <Link href="/login" style={styles.link}>
          Se connecter
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