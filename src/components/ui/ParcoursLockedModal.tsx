import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { ParcoursUnlockService } from '../../services/businessLogic/ParcoursUnlockService';

interface ParcoursLockedModalProps {
  visible: boolean;
  onClose: () => void;
  parcoursId: string;
  userId: string;
  onUnlock: () => void;
  parcoursTitle?: string;
}

const ParcoursLockedModal: React.FC<ParcoursLockedModalProps> = ({
  visible,
  onClose,
  parcoursId,
  userId,
  onUnlock,
  parcoursTitle
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockCost, setUnlockCost] = useState<number | null>(null);

  useEffect(() => {
    const fetchUnlockCost = async () => {
      if (visible && parcoursId) {
        try {
          console.log('Récupération du coût pour le parcours:', parcoursId);
          const cost = await ParcoursUnlockService.getUnlockCost(parcoursId);
          console.log('Coût récupéré:', cost);
          setUnlockCost(cost);
        } catch (err) {
          console.error('Erreur lors de la récupération du coût:', err);
          setError("Erreur lors de la récupération du coût");
        }
      }
    };

    fetchUnlockCost();
  }, [parcoursId, visible]);

  const handleUnlock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ParcoursUnlockService.unlockParcoursWithDodji(userId, parcoursId);
      
      if (result.success) {
        onUnlock();
        onClose();
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue lors du déblocage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Titre */}
          <Text style={styles.modalTitle}>Parcours verrouillé 🔒</Text>
          
          {/* Message */}
          <Text style={styles.modalText}>
            {parcoursTitle ? `Le parcours "${parcoursTitle}" n'est` : "Ce parcours n'est"} pas encore disponible. 
            Vous pouvez le débloquer avec vos Dodji ou terminer les parcours précédents pour y accéder.
          </Text>

          {/* Message d'erreur */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          {/* Boutons */}
          <View style={styles.buttonContainer}>
            {unlockCost !== null && (
              <TouchableOpacity
                style={[styles.button, styles.unlockButton]}
                onPress={handleUnlock}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0A0400" />
                ) : (
                  <Text style={styles.buttonText}>Débloquer ({unlockCost} Dodji)</Text>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Continuer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 4, 0, 0.8)',
  },
  modalView: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Arboria-Bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Arboria-Book',
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 24
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Arboria-Book',
    color: '#FF4B4B',
    marginBottom: 15,
    textAlign: 'center'
  },
  buttonContainer: {
    width: '100%',
    gap: 10
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 2,
    width: '100%'
  },
  unlockButton: {
    backgroundColor: '#F3FF90',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F3FF90'
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#0A0400',
    textAlign: 'center'
  },
  secondaryButtonText: {
    color: '#F3FF90'
  }
});

export default ParcoursLockedModal; 