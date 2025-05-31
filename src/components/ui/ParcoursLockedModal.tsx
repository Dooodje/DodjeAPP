import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { ParcoursUnlockService } from '../../services/businessLogic/ParcoursUnlockService';
import { router } from 'expo-router';

interface ParcoursLockedModalProps {
  visible: boolean;
  onClose: () => void;
  parcoursId: string;
  userId: string;
  onUnlock: (parcoursOrder: number) => void;
  parcoursTitle?: string;
  parcoursOrder?: number;
}

const ParcoursLockedModal: React.FC<ParcoursLockedModalProps> = ({
  visible,
  onClose,
  parcoursId,
  userId,
  onUnlock,
  parcoursTitle,
  parcoursOrder
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockCost, setUnlockCost] = useState<number | null>(null);
  const [hasTriedUnlockWithoutFunds, setHasTriedUnlockWithoutFunds] = useState(false);

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

  // Réinitialiser l'état quand la modal s'ouvre
  useEffect(() => {
    if (visible) {
      setHasTriedUnlockWithoutFunds(false);
      setError(null);
    }
  }, [visible]);

  const handleUnlock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔓 Modal: Début du processus de déblocage');
      console.log('📋 Modal: parcoursOrder =', parcoursOrder);
      
      // D'abord tenter le déblocage
      const result = await ParcoursUnlockService.unlockParcoursWithDodji(userId, parcoursId);
      
      if (result.success) {
        console.log('🔓 Modal: Parcours débloqué avec succès');
        
        // Déclencher l'animation SEULEMENT si le déblocage a réussi
        if (parcoursOrder !== undefined) {
          console.log('🔒 Modal: Lancement de l\'animation de déblocage');
          onUnlock(parcoursOrder);
        }
        
        // Fermer le modal immédiatement
        console.log('🚪 Modal: Fermeture du modal');
        onClose();
      } else {
        console.log('❌ Modal: Échec du déblocage:', result.error);
        setError(result.error || "Une erreur est survenue");
        
        // Si l'erreur indique un manque de fonds, marquer que l'utilisateur a tenté sans assez de dodji
        if (result.error && result.error.includes("pas assez de Dodji")) {
          setHasTriedUnlockWithoutFunds(true);
        }
      }
    } catch (err) {
      console.log('❌ Modal: Erreur lors du déblocage:', err);
      setError("Une erreur est survenue lors du déblocage");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToShop = () => {
    console.log('🛒 Redirection vers la boutique');
    onClose();
    router.push('/boutique');
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
            {/* Toujours afficher le bouton de déblocage/caisse */}
            <TouchableOpacity
              style={[styles.button, styles.unlockButton]}
              onPress={hasTriedUnlockWithoutFunds ? handleGoToShop : handleUnlock}
              disabled={loading || (unlockCost === null && !hasTriedUnlockWithoutFunds)}
            >
              {loading ? (
                <ActivityIndicator color="#0A0400" />
              ) : (
                <Text style={styles.buttonText}>
                  {hasTriedUnlockWithoutFunds 
                    ? "Passer à la caisse" 
                    : unlockCost !== null 
                      ? `Débloquer (${unlockCost} Dodji)` 
                      : "Chargement..."
                  }
                </Text>
              )}
            </TouchableOpacity>
            
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