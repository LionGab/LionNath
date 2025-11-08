/**
 * Onboarding v2 - Bloco 2: Autocuidado & Emoções
 * "Eu sei que a maternidade pode ser intensa — mas também cheia de amor. Vamos entender como você está hoje?"
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { Button, ProgressIndicator, SliderInput, Chip } from '@/ui';
import { ONBOARDING_V2_OPTIONS, EmotionalState, SelfCareFrequency, SleepQuality } from '@/types/onboarding-v2.types';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';

const tokens = nossaMaternidadeDesignTokens;

interface Block2EmotionsProps {
  onNext: () => void;
  onBack: () => void;
}

export function Block2Emotions({ onNext, onBack }: Block2EmotionsProps) {
  const { data, updateData, isStepValid } = useOnboardingV2();

  const [emotionalStates, setEmotionalStates] = useState<EmotionalState[]>(data.emotional_state || []);
  const [stressLevel, setStressLevel] = useState(data.stress_level || 5);
  const [selfCare, setSelfCare] = useState<SelfCareFrequency | undefined>(data.self_care_frequency);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | undefined>(data.sleep_quality);
  const [energyLevel, setEnergyLevel] = useState(data.energy_level || 5);

  const handleEmotionToggle = (emotion: EmotionalState) => {
    const newStates = emotionalStates.includes(emotion)
      ? emotionalStates.filter(e => e !== emotion)
      : [...emotionalStates, emotion];

    setEmotionalStates(newStates);
    updateData({ emotional_state: newStates });
  };

  const handleStressChange = (value: number) => {
    setStressLevel(value);
    updateData({ stress_level: value });
  };

  const handleEnergyChange = (value: number) => {
    setEnergyLevel(value);
    updateData({ energy_level: value });
  };

  const handleSelfCareSelect = (freq: SelfCareFrequency) => {
    setSelfCare(freq);
    updateData({ self_care_frequency: freq });
  };

  const handleSleepSelect = (quality: SleepQuality) => {
    setSleepQuality(quality);
    updateData({ sleep_quality: quality });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Progress */}
          <ProgressIndicator current={2} total={5} variant="dots" testID="progress_2_5" />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Como você está se sentindo hoje?</Text>
            <Text style={styles.subtitle}>Eu sei que a maternidade pode ser intensa — mas também cheia de amor. 💙</Text>
          </View>

          {/* Autocuidado */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Com que frequência você consegue fazer algo por você?</Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.self_care_frequency.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={selfCare === option.value}
                  onPress={() => handleSelfCareSelect(option.value as SelfCareFrequency)}
                  accessibilityLabel={`Autocuidado: ${option.label}`}
                  testID={`self_care_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Sentimentos (multi-select) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Como você está se sentindo? <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helper}>Pode escolher mais de um</Text>
            <View style={styles.emotionsGrid}>
              {ONBOARDING_V2_OPTIONS.emotional_state.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={emotionalStates.includes(option.value as EmotionalState)}
                  onPress={() => handleEmotionToggle(option.value as EmotionalState)}
                  accessibilityLabel={`Sentimento: ${option.label}`}
                  testID={`emotion_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Slider Estresse */}
          <View style={styles.section}>
            <SliderInput
              label="Qual seu nível de estresse hoje?"
              min={1}
              max={10}
              value={stressLevel}
              onChange={handleStressChange}
              showMarkers
              showValue
              hapticFeedback
              accessibilityLabel="Nível de estresse de 1 a 10"
              testID="stress_slider"
            />
          </View>

          {/* Qualidade do sono */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Como está a qualidade do seu sono?</Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.sleep_quality.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={sleepQuality === option.value}
                  onPress={() => handleSleepSelect(option.value as SleepQuality)}
                  accessibilityLabel={`Sono: ${option.label}`}
                  testID={`sleep_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Slider Energia */}
          <View style={styles.section}>
            <SliderInput
              label="Qual seu nível de energia hoje?"
              min={1}
              max={10}
              value={energyLevel}
              onChange={handleEnergyChange}
              showMarkers
              showValue
              hapticFeedback
              accessibilityLabel="Nível de energia de 1 a 10"
              testID="energy_slider"
            />
          </View>

        </ScrollView>

        {/* Footer com botões */}
        <View style={styles.footer}>
          <Button onPress={onBack} variant="outline" accessibilityLabel="Voltar" testID="back_btn" style={styles.backButton}>
            Voltar
          </Button>
          <Button onPress={onNext} disabled={!isStepValid()} accessibilityLabel="Continuar" testID="next_btn" style={styles.nextButton}>
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
  scrollContent: { paddingHorizontal: tokens.spacing.lg, paddingBottom: tokens.spacing['5xl'], gap: tokens.spacing.lg } as ViewStyle,
  header: { gap: tokens.spacing.sm, marginBottom: tokens.spacing.md } as ViewStyle,
  title: { fontSize: tokens.typography.headlineLg.fontSize, lineHeight: tokens.typography.headlineLg.lineHeight, fontWeight: '600', color: tokens.palette.text, textAlign: 'center' } as TextStyle,
  subtitle: { fontSize: tokens.typography.bodyMd.fontSize, lineHeight: tokens.typography.bodyMd.lineHeight, color: tokens.palette.neutrals[700], textAlign: 'center' } as TextStyle,
  section: { gap: tokens.spacing.sm } as ViewStyle,
  sectionLabel: { fontSize: tokens.typography.bodyMd.fontSize, fontWeight: '500', color: tokens.palette.text } as TextStyle,
  required: { color: tokens.palette.feedback.danger } as TextStyle,
  helper: { fontSize: tokens.typography.bodySm.fontSize, color: tokens.palette.neutrals[600] } as TextStyle,
  chipsContainer: { gap: tokens.spacing.xs } as ViewStyle,
  emotionsGrid: { gap: tokens.spacing.xs } as ViewStyle,
  footer: { flexDirection: 'row', padding: tokens.spacing.lg, backgroundColor: tokens.palette.background, borderTopWidth: 1, borderTopColor: tokens.palette.neutrals[200], gap: tokens.spacing.md } as ViewStyle,
  backButton: { flex: 1 } as ViewStyle,
  nextButton: { flex: 2 } as ViewStyle,
});
