import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserInfoPreferences } from '../../types/settings';
import { ReauthModal } from './ReauthModal';
import { authService } from '../../services';

interface UserInfoCardProps {
  userInfo: UserInfoPreferences;
  onUpdateUsername: (username: string) => Promise<void>;
  onUpdateEmail: (email: string) => Promise<void>;
  onResetPassword: () => Promise<void>;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ 
  userInfo, 
  onUpdateUsername,
  onUpdateEmail,
  onResetPassword
}) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userInfo.username);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(userInfo.email);
  const [isLoading, setIsLoading] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [reauthError, setReauthError] = useState<string | undefined>(undefined);

  const handleSaveUsername = async () => {
    if (newUsername.trim() && newUsername !== userInfo.username) {
      setIsLoading(true);
      try {
        await onUpdateUsername(newUsername);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour le pseudo.');
      } finally {
        setIsLoading(false);
      }
    }
    setEditingUsername(false);
  };

  const handleSaveEmail = async () => {
    if (newEmail.trim() && newEmail !== userInfo.email) {
      setIsLoading(true);
      try {
        await onUpdateEmail(newEmail);
        Alert.alert('Succès', 'Un email de vérification a été envoyé à votre nouvelle adresse. Veuillez vérifier votre boîte de réception et suivre les instructions.'); 
      } catch (error: any) {
        // Vérifier si l'erreur est due à un besoin de réauthentification
        if (error.message && error.message.includes('reconnecter')) {
          // Stocker l'email en attente pour l'utiliser après réauthentification
          setPendingEmail(newEmail);
          setReauthError(undefined);
          setShowReauthModal(true);
        } else {
          Alert.alert('Erreur', error.message || 'Impossible de mettre à jour l\'adresse email.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    setEditingEmail(false);
  };

  const handleReauthSubmit = async (password: string) => {
    try {
      // Réauthentifier l'utilisateur
      await authService.reauthenticate(password);
      
      // Si la réauthentification réussit et qu'il y a un email en attente, tenter à nouveau de modifier l'email
      if (pendingEmail) {
        await onUpdateEmail(pendingEmail);
        setPendingEmail(null);
        Alert.alert('Succès', 'Un email de vérification a été envoyé à votre nouvelle adresse. Veuillez vérifier votre boîte de réception et suivre les instructions.');
      }
      setShowReauthModal(false);
    } catch (error: any) {
      setReauthError(error.message);
      throw error; // Relancer l'erreur pour que le modal puisse l'afficher
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="account-circle"
          size={24}
          color="#06D001"
        />
        <Text style={styles.title}>Informations utilisateur</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          {editingEmail ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                autoFocus
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleSaveEmail}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color="#06D001"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  setNewEmail(userInfo.email);
                  setEditingEmail(false);
                }}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#FF4500"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{userInfo.email}</Text>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setEditingEmail(true)}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Pseudo</Text>
          {editingUsername ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={newUsername}
                onChangeText={setNewUsername}
                autoFocus
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleSaveUsername}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color="#06D001"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  setNewUsername(userInfo.username);
                  setEditingUsername(false);
                }}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#FF4500"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{userInfo.username}</Text>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setEditingUsername(true)}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.passwordButton}
          onPress={onResetPassword}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name="lock-reset"
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Réinitialiser le mot de passe</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de réauthentification */}
      <ReauthModal
        visible={showReauthModal}
        onClose={() => {
          setShowReauthModal(false);
          setPendingEmail(null);
          setReauthError(undefined);
        }}
        onSubmit={handleReauthSubmit}
        errorMessage={reauthError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 16,
    color: '#999',
  },
  value: {
    fontSize: 16,
    color: '#fff',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    width: 150,
  },
  passwordButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 