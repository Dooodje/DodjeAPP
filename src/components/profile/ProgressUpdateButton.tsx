import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

type ProgressUpdateButtonProps = {
  onUpdateComplete?: () => void;
};

export const ProgressUpdateButton: React.FC<ProgressUpdateButtonProps> = ({ 
  onUpdateComplete 
}) => {
  const { user } = useAuth();
  const { calculateAndUpdateProgress, isLoading } = useProfile(user?.uid || '');
  const [updating, setUpdating] = useState(false);
  
  const handleUpdateProgress = async () => {
    if (!user?.uid || isLoading || updating) return;
    
    setUpdating(true);
    try {
      await calculateAndUpdateProgress();
      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleUpdateProgress}
      disabled={isLoading || updating || !user?.uid}
    >
      {(isLoading || updating) ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>Mettre à jour ma progression</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#06D001',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
}); 