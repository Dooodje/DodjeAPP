import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProfileHeaderProps {
  username?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  showUsername?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export function ProfileHeader({ 
  username = 'Utilisateur', 
  avatarUrl,
  showAvatar = true,
  showUsername = true,
  textAlign = 'left',
  containerStyle,
  textStyle
}: ProfileHeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {showAvatar && (
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={80} color="#FFFFFF" />
          )}
        </View>
      )}
      
      {showUsername && username && (
        <Text style={[
          styles.username, 
          { textAlign }, 
          textStyle
        ]}>
          {username}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  username: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Bold',
  },
}); 