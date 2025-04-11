import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { AppRoute } from '../../src/types/routes';
import { GlobalHeader } from '../../src/components/ui/GlobalHeader';
import { MaterialCommunityIconName } from '../../src/types/icons';

interface SettingsItem {
  icon: MaterialCommunityIconName;
  title: string;
  onPress: () => void;
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Compte',
      items: [
        {
          icon: 'account',
          title: 'Profil',
          onPress: () => router.push('/(tabs)/profile' as AppRoute),
        },
        {
          icon: 'crown',
          title: 'Abonnement',
          onPress: () => router.push('/(settings)/subscription' as AppRoute),
        },
      ],
    },
    {
      title: 'Préférences',
      items: [
        {
          icon: 'bell',
          title: 'Notifications',
          onPress: () => console.log('Notifications'),
        },
        {
          icon: 'theme-light-dark',
          title: 'Thème',
          onPress: () => console.log('Thème'),
        },
      ],
    },
    {
      title: 'Légal',
      items: [
        {
          icon: 'file-document',
          title: 'Conditions d\'utilisation',
          onPress: () => router.push('/(settings)/terms' as AppRoute),
        },
        {
          icon: 'shield',
          title: 'Politique de confidentialité',
          onPress: () => router.push('/(settings)/privacy' as AppRoute),
        },
      ],
    },
    {
      title: 'Application',
      items: [
        {
          icon: 'information',
          title: 'À propos',
          onPress: () => console.log('À propos'),
        },
        {
          icon: 'logout',
          title: 'Déconnexion',
          onPress: () => {
            // Logique de déconnexion
          },
          danger: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="PARAMÈTRES"
        showBackButton
        onBackPress={handleBack}
      />
      <ScrollView>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.item}
                onPress={item.onPress}
              >
                <View style={styles.itemIconContainer}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={item.danger ? '#FF4D4D' : '#06D001'}
                  />
                </View>
                <Text style={[styles.itemTitle, item.danger && styles.itemTitleDanger]}>
                  {item.title}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#06D001',
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  itemTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Arboria-Book',
  },
  itemTitleDanger: {
    color: '#FF4D4D',
  },
}); 