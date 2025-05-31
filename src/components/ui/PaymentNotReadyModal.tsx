import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface PaymentNotReadyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PaymentNotReadyModal: React.FC<PaymentNotReadyModalProps> = ({
  visible,
  onClose
}) => {
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
          <Text style={styles.modalTitle}>Paiement non disponible</Text>
          
          {/* Message */}
          <Text style={styles.modalText}>
            Nous ne voulons pas de ton argent, du moins pas encore ! 😄
          </Text>
          
          {/* Bouton */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Compris</Text>
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
  primaryButton: {
    backgroundColor: '#F3FF90',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Arboria-Medium',
    color: '#0A0400',
    textAlign: 'center'
  }
});

export default PaymentNotReadyModal; 