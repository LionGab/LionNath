/**
 * SOSButton - Botão de emergência sempre visível
 *
 * Features:
 * - Sempre acessível no chat
 * - Modal com contatos de emergência (CVV 188, SAMU 192)
 * - Opção "quero conversar com humano" (fila moderação)
 * - Analytics de uso para monitoramento
 * - Design destacado e acessível
 * - Feedback tátil/visual ao pressionar
 *
 * @example
 * <SOSButton onPress={handleSOS} />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Pressable,
  AccessibilityInfo,
  Alert,
  Platform,
} from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { logger } from '@/lib/logger';

interface SOSButtonProps {
  onHumanSupportRequest?: () => void;
  style?: any;
}

export function SOSButton({ onHumanSupportRequest, style }: SOSButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { palette, typography, spacing, radius, shadow } = nossaMaternidadeDesignTokens;

  const handlePress = () => {
    setModalVisible(true);
    AccessibilityInfo.announceForAccessibility('Modal de emergência aberto');

    // Analytics
    logger.info('SOS Button Pressed', {
      timestamp: new Date().toISOString(),
    });
  };

  const handleCallCVV = async () => {
    try {
      const phoneNumber = Platform.OS === 'ios' ? 'tel://188' : 'tel:188';
      const canOpen = await Linking.canOpenURL(phoneNumber);

      if (canOpen) {
        await Linking.openURL(phoneNumber);
        logger.info('CVV Call Initiated');
      } else {
        Alert.alert('Erro', 'Não foi possível fazer a chamada. Tente ligar para 188.');
      }
    } catch (error) {
      logger.error('Erro ao ligar para CVV', error);
      Alert.alert('Erro', 'Não foi possível fazer a chamada.');
    }
  };

  const handleCallSAMU = async () => {
    try {
      const phoneNumber = Platform.OS === 'ios' ? 'tel://192' : 'tel:192';
      const canOpen = await Linking.canOpenURL(phoneNumber);

      if (canOpen) {
        await Linking.openURL(phoneNumber);
        logger.info('SAMU Call Initiated');
      } else {
        Alert.alert('Erro', 'Não foi possível fazer a chamada. Tente ligar para 192.');
      }
    } catch (error) {
      logger.error('Erro ao ligar para SAMU', error);
      Alert.alert('Erro', 'Não foi possível fazer a chamada.');
    }
  };

  const handleHumanSupport = () => {
    setModalVisible(false);
    onHumanSupportRequest?.();

    logger.info('Human Support Requested');

    Alert.alert(
      'Suporte Humano',
      'Estamos te conectando com nossa equipe. Em breve alguém entrará em contato.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      {/* SOS Button */}
      <TouchableOpacity
        style={[
          styles.sosButton,
          {
            backgroundColor: palette.feedback.danger,
            borderRadius: radius.full,
            ...shadow.medium,
          },
          style,
        ]}
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Botão de emergência SOS"
        accessibilityHint="Toque para acessar contatos de emergência e suporte"
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* Emergency Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={[
            styles.modalOverlay,
            { backgroundColor: palette.overlays.scrim },
          ]}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              {
                backgroundColor: palette.background,
                borderRadius: radius.lg,
                ...shadow.medium,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    fontSize: typography.headlineMd.fontSize,
                    fontWeight: typography.headlineMd.fontWeight,
                    color: palette.text,
                  },
                ]}
              >
                Estamos aqui por você
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  {
                    fontSize: typography.bodyMd.fontSize,
                    color: palette.neutrals[600],
                    marginTop: spacing.xs,
                  },
                ]}
              >
                Escolha uma opção abaixo para receber ajuda imediata
              </Text>
            </View>

            {/* Emergency Contacts */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: palette.feedback.danger,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={handleCallCVV}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Ligar para CVV - Centro de Valorização da Vida - 188"
              >
                <Text style={styles.optionIcon}>📞</Text>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { fontSize: typography.bodyLg.fontSize },
                    ]}
                  >
                    CVV - 188
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { fontSize: typography.bodySm.fontSize },
                    ]}
                  >
                    Centro de Valorização da Vida - Apoio emocional e prevenção do suicídio
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: palette.feedback.warning,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={handleCallSAMU}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Ligar para SAMU - 192"
              >
                <Text style={styles.optionIcon}>🚑</Text>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { fontSize: typography.bodyLg.fontSize },
                    ]}
                  >
                    SAMU - 192
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { fontSize: typography.bodySm.fontSize },
                    ]}
                  >
                    Emergência médica - Atendimento urgente
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: palette.primary,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={handleHumanSupport}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Solicitar conversa com pessoa da equipe"
              >
                <Text style={styles.optionIcon}>💙</Text>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { fontSize: typography.bodyLg.fontSize },
                    ]}
                  >
                    Quero conversar com alguém
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { fontSize: typography.bodySm.fontSize },
                    ]}
                  >
                    Nossa equipe te acompanhará neste momento
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: palette.neutrals[300],
                },
              ]}
              onPress={() => setModalVisible(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Fechar modal de emergência"
            >
              <Text
                style={[
                  styles.closeButtonText,
                  {
                    fontSize: typography.button.fontSize,
                    color: palette.text,
                  },
                ]}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    padding: 24,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  closeButton: {
    padding: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: '500',
  },
});
