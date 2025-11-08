/**
 * Onboarding v2 - Bloco 4: Rede de Apoio
 * "Ninguém deveria viver a maternidade sozinha. Me conta um pouco sobre o seu círculo."
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { Button, ProgressIndicator, Chip, TextArea } from '@/ui';
import { ONBOARDING_V2_OPTIONS, SupportNetworkLevel } from '@/types/onboarding-v2.types';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';

const tokens = nossaMaternidadeDesignTokens;

interface Block4SupportProps {
  onNext: () => void;
  onBack: () => void;
}

export function Block4Support({ onNext, onBack }: Block4SupportProps) {
  const { data, updateData, isStepValid } = useOnboardingV2();

  const [supportLevel, setSupportLevel] = useState<SupportNetworkLevel | undefined>(data.support_network_level);
  const [supportText, setSupportText] = useState(data.support_network_description || '');

  const handleSupportSelect = (level: SupportNetworkLevel) => {
    setSupportLevel(level);
    updateData({ support_network_level: level });
  };

  const handleTextChange = (text: string) => {
    setSupportText(text);
    updateData({ support_network_description: text });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressIndicator current={4} total={5} variant="dots" testID="progress_4_5" />

          <View style={styles.header}>
            <Text style={styles.title}>Você tem uma rede de apoio?</Text>
            <Text style={styles.subtitle}>
              Ninguém deveria viver a maternidade sozinha. Me conta um pouco sobre o seu círculo. 🤝
            </Text>
          </View>

          {/* Nível de Apoio */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Como é sua rede de apoio? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.support_network_level.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={supportLevel === option.value}
                  onPress={() => handleSupportSelect(option.value as SupportNetworkLevel)}
                  accessibilityLabel={`Rede de apoio: ${option.label}`}
                  testID={`support_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <TextArea
              label="Quer contar mais sobre sua rede de apoio?"
              value={supportText}
              onChangeText={handleTextChange}
              placeholder="Ex: Conto com minha mãe e meu parceiro..."
              maxLength={500}
              showCharCount
              accessibilityLabel="Descrição da rede de apoio"
              testID="support_text"
            />
          </View>

          {/* Mensagem Acolhedora */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageEmoji}>💙</Text>
            <Text style={styles.messageText}>
              Saiba que você não está sozinha. Estamos aqui para te apoiar nessa jornada.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={onBack}
            variant="outline"
            accessibilityLabel="Voltar"
            testID="back_btn"
            style={styles.backButton}
          >
            Voltar
          </Button>
          <Button
            onPress={onNext}
            disabled={!isStepValid()}
            accessibilityLabel="Continuar"
            testID="next_btn"
            style={styles.nextButton}
          >
            Continuar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.palette.background } as ViewStyle,
  keyboardView: { flex: 1 } as ViewStyle,
  scrollView: { flex: 1 } as ViewStyle,
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing['5xl'],
    gap: tokens.spacing.lg,
  } as ViewStyle,
  header: { gap: tokens.spacing.sm, marginBottom: tokens.spacing.md } as ViewStyle,
  title: {
    fontSize: tokens.typography.headlineLg.fontSize,
    fontWeight: '600',
    color: tokens.palette.text,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: tokens.typography.bodyMd.fontSize,
    color: tokens.palette.neutrals[700],
    textAlign: 'center',
  } as TextStyle,
  section: { gap: tokens.spacing.sm } as ViewStyle,
  sectionLabel: {
    fontSize: tokens.typography.bodyMd.fontSize,
    fontWeight: '500',
    color: tokens.palette.text,
  } as TextStyle,
  required: { color: tokens.palette.feedback.danger } as TextStyle,
  chipsContainer: { gap: tokens.spacing.xs } as ViewStyle,
  messageContainer: {
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    backgroundColor: `${tokens.palette.primary}10`,
    alignItems: 'center',
    gap: tokens.spacing.sm,
  } as ViewStyle,
  messageEmoji: { fontSize: 40 } as TextStyle,
  messageText: {
    fontSize: tokens.typography.bodyMd.fontSize,
    color: tokens.palette.text,
    textAlign: 'center',
    lineHeight: tokens.typography.bodyMd.lineHeight * 1.4,
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    padding: tokens.spacing.lg,
    backgroundColor: tokens.palette.background,
    borderTopWidth: 1,
    borderTopColor: tokens.palette.neutrals[200],
    gap: tokens.spacing.md,
  } as ViewStyle,
  backButton: { flex: 1 } as ViewStyle,
  nextButton: { flex: 2 } as ViewStyle,
});
