import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SettingsItemProps {
  title: string;
  description?: string;
  icon?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  showSwitch?: boolean;
  showChevron?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  value,
  onValueChange,
  onPress,
  showSwitch = false,
  showChevron = false
}) => {
  const renderRightContent = () => {
    if (showSwitch) {
      return (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#1a1a1a', true: '#06D001' }}
          thumbColor="#fff"
        />
      );
    }

    if (showChevron) {
      return (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#666"
        />
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress && !showSwitch}
    >
      <View style={styles.leftContent}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color="#fff"
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </View>
      {renderRightContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
}); 