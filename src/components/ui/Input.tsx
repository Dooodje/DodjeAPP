import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { Control, Controller } from 'react-hook-form';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  control: Control<any>;
  name: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  control,
  name,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              error && styles.inputError,
              style,
            ]}
            placeholderTextColor="#666666"
            onChangeText={onChange}
            value={value}
            {...props}
          />
        )}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Arboria-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontFamily: 'Arboria-Book',
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  errorText: {
    fontFamily: 'Arboria-Book',
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
}); 