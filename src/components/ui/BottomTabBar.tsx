import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppRoute } from '../../types/routes';

// Define icon type to match MaterialCommunityIcons names
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Define the tabs with proper typing
const TABS: Array<{
  icon: MaterialCommunityIconName;
  route: AppRoute | '/';
}> = [
  { icon: 'account', route: '/(tabs)/profile' as AppRoute },
  { icon: 'lock', route: '/(tabs)/secured' as AppRoute },
  { icon: 'home', route: '/' },
  { icon: 'cash-multiple', route: '/(tabs)/finances' as AppRoute },
  { icon: 'play-box-multiple', route: '/(tabs)/videos' as AppRoute },
];

export const BottomTabBar: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabButton}
          onPress={() => router.push(tab.route)}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0A0400',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 