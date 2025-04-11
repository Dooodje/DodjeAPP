import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Option {
  value: string;
  label: string;
}

interface SettingsSelectProps {
  title: string;
  description?: string;
  icon?: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  title,
  description,
  icon,
  value,
  options,
  onSelect
}) => {
  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <Text style={styles.value}>{selectedOption?.label}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              option.value === value && styles.selectedOption
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionText,
              option.value === value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
            {option.value === value && (
              <MaterialCommunityIcons
                name="check"
                size={20}
                color="#06D001"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
  value: {
    fontSize: 16,
    color: '#06D001',
  },
  optionsContainer: {
    padding: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 4,
  },
  selectedOption: {
    backgroundColor: 'rgba(6, 210, 1, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedOptionText: {
    color: '#06D001',
  },
}); 