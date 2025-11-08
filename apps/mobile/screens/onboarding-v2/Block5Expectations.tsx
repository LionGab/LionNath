/**
 * Onboarding v2 - Bloco 5: Expectativas & Preferências
 * "Por fim, quero saber o que você mais quer encontrar aqui — pra que cada momento faça sentido pra você 💙"
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { Button, ProgressIndicator, Chip, TextArea } from '@/ui';
import { ONBOARDING_V2_OPTIONS, CommunicationStyle } from '@/types/onboarding-v2.types';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';

const tokens = nossaMaternidadeDesignTokens;

interface Block5ExpectationsProps {
  onComplete: () => void;
  onBack: () => void;
}

export function Block5Expectations({ onComplete, onBack }: Block5ExpectationsProps) {
  const { data, updateData, isStepValid, completeOnboarding, saving } = useOnboardingV2();

  const [goals, setGoals] = useState<string[]>(data.main_goals || []);
  const [contentPrefs, setContentPrefs] = useState<string[]>(data.content_preferences || []);
  const [commStyle, setCommStyle] = useState<CommunicationStyle | undefined>(data.communication_style);
  const [broughtYouHere, setBroughtYouHere] = useState(data.what_brought_you_here || '');

  const handleGoalToggle = (goal: string) => {
    const newGoals = goals.includes(goal) ? goals.filter(g => g !== goal) : [...goals, goal];
    setGoals(newGoals);
    updateData({ main_goals: newGoals });
  };

  const handleContentToggle = (content: string) => {
    const newPrefs = contentPrefs.includes(content) ? contentPrefs.filter(c => c !== content) : [...contentPrefs, content];
    setContentPrefs(newPrefs);
    updateData({ content_preferences: newPrefs });
  };

  const handleStyleSelect = (style: CommunicationStyle) => {
    setCommStyle(style);
    updateData({ communication_style: style });
  };

  const handleTextChange = (text: string) => {
    setBroughtYouHere(text);
    updateData({ what_brought_you_here: text });
  };

  const handleFinish = async () => {
    const success = await completeOnboarding();
    if (success) {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <ProgressIndicator current={5} total={5} variant="bar" testID="progress_5_5" />

          <View style={styles.header}>
            <Text style={styles.title}>Estamos quase lá... 🌸</Text>
            <Text style={styles.subtitle}>
              Por fim, quero saber o que você mais quer encontrar aqui — pra que cada momento faça sentido pra você 💙
            </Text>
          </View>

          {/* O que trouxe você aqui */}
          <View style={styles.section}>
            <TextArea
              label="O que te trouxe até aqui hoje?"
              value={broughtYouHere}
              onChangeText={handleTextChange}
              placeholder="Conte um pouco sobre o que te motivou a buscar apoio..."
              maxLength={500}
              showCharCount
              accessibilityLabel="O que trouxe você aqui"
              testID="brought_you_text"
            />
          </View>

          {/* Objetivos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              O que você espera encontrar aqui? <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helper}>Escolha o que faz mais sentido pra você</Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.main_goals.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={goals.includes(option.value)}
                  onPress={() => handleGoalToggle(option.value)}
                  accessibilityLabel={`Objetivo: ${option.label}`}
                  testID={`goal_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Conteúdos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quais conteúdos te interessam mais?</Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.content_preferences.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={contentPrefs.includes(option.value)}
                  onPress={() => handleContentToggle(option.value)}
                  accessibilityLabel={`Conteúdo: ${option.label}`}
                  testID={`content_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Estilo de Comunicação */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Como você prefere que eu me comunique? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.communication_style.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={commStyle === option.value}
                  onPress={() => handleStyleSelect(option.value as CommunicationStyle)}
                  accessibilityLabel={`Estilo: ${option.label}`}
                  testID={`style_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Mensagem Final */}
          <View style={styles.finalMessage}>
            <Text style={styles.finalEmoji}>🎉</Text>
            <Text style={styles.finalText}>
              Pronto! Agora vamos personalizar tudo com base no que você compartilhou.
            </Text>
            <Text style={styles.finalSubtext}>
              Lembre-se: você pode atualizar essas informações a qualquer momento.
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={onBack} variant="outline" disabled={saving} accessibilityLabel="Voltar" testID="back_btn" style={styles.backButton}>
            Voltar
          </Button>
          <Button
            onPress={handleFinish}
            disabled={!isStepValid() || saving}
            accessibilityLabel="Finalizar onboarding"
            testID="finish_btn"
            style={styles.finishButton}
          >
            {saving ? <ActivityIndicator color="white" /> : 'Finalizar'}
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
  scrollContent: { paddingHorizontal: tokens.spacing.lg, paddingBottom: tokens.spacing['5xl'], gap: tokens.spacing.lg } as ViewStyle,
  header: { gap: tokens.spacing.sm, marginBottom: tokens.spacing.md } as ViewStyle,
  title: { fontSize: tokens.typography.headlineLg.fontSize, fontWeight: '600', color: tokens.palette.text, textAlign: 'center' } as TextStyle,
  subtitle: { fontSize: tokens.typography.bodyMd.fontSize, color: tokens.palette.neutrals[700], textAlign: 'center', lineHeight: tokens.typography.bodyMd.lineHeight * 1.4 } as TextStyle,
  section: { gap: tokens.spacing.sm } as ViewStyle,
  sectionLabel: { fontSize: tokens.typography.bodyMd.fontSize, fontWeight: '500', color: tokens.palette.text } as TextStyle,
  required: { color: tokens.palette.feedback.danger } as TextStyle,
  helper: { fontSize: tokens.typography.bodySm.fontSize, color: tokens.palette.neutrals[600] } as TextStyle,
  chipsContainer: { gap: tokens.spacing.xs } as ViewStyle,
  finalMessage: { marginTop: tokens.spacing.xl, padding: tokens.spacing.xl, borderRadius: tokens.radius.lg, backgroundColor: `${tokens.palette.accent}10`, alignItems: 'center', gap: tokens.spacing.md, ...tokens.shadow.soft } as ViewStyle,
  finalEmoji: { fontSize: 50 } as TextStyle,
  finalText: { fontSize: tokens.typography.bodyLg.fontSize, fontWeight: '500', color: tokens.palette.text, textAlign: 'center', lineHeight: tokens.typography.bodyLg.lineHeight * 1.4 } as TextStyle,
  finalSubtext: { fontSize: tokens.typography.bodySm.fontSize, color: tokens.palette.neutrals[600], textAlign: 'center' } as TextStyle,
  footer: { flexDirection: 'row', padding: tokens.spacing.lg, backgroundColor: tokens.palette.background, borderTopWidth: 1, borderTopColor: tokens.palette.neutrals[200], gap: tokens.spacing.md } as ViewStyle,
  backButton: { flex: 1 } as ViewStyle,
  finishButton: { flex: 2 } as ViewStyle,
});
