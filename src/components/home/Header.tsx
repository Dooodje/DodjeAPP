import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import theme from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useDodji } from '../../hooks/useDodji';

// SVG Icons
import vectorDodje from '../../assets/figma/vector-dodje.svg';

interface HeaderProps {
  userName?: string;
  streak?: number;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName = "Utilisateur",
  streak = 0,
  onProfilePress
}) => {
  const { user } = useAuth();
  const { dodji } = useDodji(user?.uid);

  return (
    <View style={styles.container as ViewStyle}>
      {/* Logo et Information utilisateur */}
      <View style={styles.topContainer as ViewStyle}>
        <View style={styles.logoContainer as ViewStyle}>
          <Image 
            source={require('../../assets/icons/logo.png')} 
            style={styles.logo as ImageStyle} 
          />
          <Text style={styles.logoText as TextStyle}>Dodje</Text>
        </View>
        
        <TouchableOpacity style={styles.profileButton as ViewStyle} onPress={onProfilePress}>
          <View style={styles.profileInfo as ViewStyle}>
            <Text style={styles.userName as TextStyle}>{userName}</Text>
            <View style={styles.dodjiContainer as ViewStyle}>
              <Image 
                source={require('../../assets/icons/dodji.png')} 
                style={styles.dodjiIcon as ImageStyle} 
              />
              <Text style={styles.dodjiCount as TextStyle}>{dodji}</Text>
            </View>
          </View>
          <View style={styles.avatarContainer as ViewStyle}>
            <Text style={styles.avatarText as TextStyle}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Barre de progression quotidienne */}
      <View style={styles.streakContainer as ViewStyle}>
        <Text style={styles.streakText as TextStyle}>Série de {streak} jours</Text>
        <View style={styles.progressBarContainer as ViewStyle}>
          <View style={[styles.progressBar as ViewStyle, { width: `${Math.min(streak * 10, 100)}%` }]} />
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
    fontWeight: '700',
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
    fontWeight: '500',
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
    fontWeight: '700',
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
    fontWeight: '700',
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