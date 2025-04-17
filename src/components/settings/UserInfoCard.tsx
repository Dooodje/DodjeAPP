import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserInfoPreferences } from '../../types/settings';

interface UserInfoCardProps {
  userInfo: UserInfoPreferences;
  onUpdateUsername: (username: string) => Promise<void>;
  onResetPassword: () => Promise<void>;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ 
  userInfo, 
  onUpdateUsername,
  onResetPassword
}) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userInfo.username);

  const handleSaveUsername = async () => {
    if (newUsername.trim() && newUsername !== userInfo.username) {
      await onUpdateUsername(newUsername);
    }
    setEditingUsername(false);
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
          <Text style={styles.value}>{userInfo.email}</Text>
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
              />
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleSaveUsername}
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