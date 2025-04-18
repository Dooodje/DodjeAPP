import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import theme from '../../config/theme';

// SVG Icons
import vectorDodje from '../../assets/figma/vector-dodje.svg';

interface HeaderProps {
  userName?: string;
  dodjiCount: number;
  streak: number;
  onProfilePress: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName = "Utilisateur",
  dodjiCount = 0,
  streak = 0,
  onProfilePress
}) => {
  return (
    <View style={styles.container}>
      {/* Logo et Information utilisateur */}
      <View style={styles.topContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.logoText}>Dodje</Text>
        </View>
        
        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.dodjiContainer}>
              <Image 
                source={require('../../assets/icons/dodji.png')} 
                style={styles.dodjiIcon} 
              />
              <Text style={styles.dodjiCount}>{dodjiCount}</Text>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Barre de progression quotidienne */}
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Série de {streak} jours</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(streak * 10, 100)}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.dark,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.light,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  profileInfo: {
    marginRight: 8,
  },
  userName: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dodjiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dodjiIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  dodjiCount: {
    color: theme.colors.secondary.main,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  streakContainer: {
    marginTop: 5,
  },
  streakText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xs,
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.colors.background.light,
    borderRadius: theme.borderRadius.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.xs,
  },
});

export default Header; 