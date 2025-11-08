/**
 * Onboarding v2 - Bloco 3: Desafios & Necessidades
 * "Agora quero entender o que está mais desafiador pra você nesse momento."
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { Button, ProgressIndicator, Chip, TextArea, OptionCard } from '@/ui';
import { ONBOARDING_V2_OPTIONS } from '@/types/onboarding-v2.types';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';

const tokens = nossaMaternidadeDesignTokens;

interface Block3ChallengesProps {
  onNext: () => void;
  onBack: () => void;
}

export function Block3Challenges({ onNext, onBack }: Block3ChallengesProps) {
  const { data, updateData, isStepValid } = useOnboardingV2();

  const [challenges, setChallenges] = useState<string[]>(data.main_challenges || []);
  const [challengesText, setChallengesText] = useState(data.specific_challenges_text || '');
  const [needs, setNeeds] = useState<string[]>(data.support_needs || []);

  const handleChallengeToggle = (challenge: string) => {
    const newChallenges = challenges.includes(challenge)
      ? challenges.filter(c => c !== challenge)
      : [...challenges, challenge];

    setChallenges(newChallenges);
    updateData({ main_challenges: newChallenges });
  };

  const handleNeedToggle = (need: string) => {
    // Limite de 3 seleções
    if (needs.includes(need)) {
      const newNeeds = needs.filter(n => n !== need);
      setNeeds(newNeeds);
      updateData({ support_needs: newNeeds });
    } else if (needs.length < 3) {
      const newNeeds = [...needs, need];
      setNeeds(newNeeds);
      updateData({ support_needs: newNeeds });
    }
  };

  const handleTextChange = (text: string) => {
    setChallengesText(text);
    updateData({ specific_challenges_text: text });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <ProgressIndicator current={3} total={5} variant="dots" testID="progress_3_5" />

          <View style={styles.header}>
            <Text style={styles.title}>Quais são seus principais desafios?</Text>
            <Text style={styles.subtitle}>Agora quero entender o que está mais desafiador pra você. 🌿</Text>
          </View>

          {/* Desafios */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Selecione seus desafios <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helper}>Pode escolher quantos quiser</Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.main_challenges.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={challenges.includes(option.value)}
                  onPress={() => handleChallengeToggle(option.value)}
                  accessibilityLabel={`Desafio: ${option.label}`}
                  testID={`challenge_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Texto livre */}
          <View style={styles.section}>
            <TextArea
              label="Quer compartilhar mais sobre algum desafio específico?"
              value={challengesText}
              onChangeText={handleTextChange}
              placeholder="Ex: Meu bebê acorda de hora em hora..."
              maxLength={500}
              showCharCount
              accessibilityLabel="Desafios específicos"
              testID="challenges_text"
            />
          </View>

          {/* Necessidades (limite 3) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              O que você mais precisa agora? <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helper}>Escolha até 3 opções {needs.length > 0 && `(${needs.length}/3)`}</Text>
            <View style={styles.cardsGrid}>
              {ONBOARDING_V2_OPTIONS.support_needs.map((option) => (
                <View key={option.value} style={styles.cardWrapper}>
                  <OptionCard
                    icon={option.icon!}
                    label={option.label}
                    selected={needs.includes(option.value)}
                    disabled={!needs.includes(option.value) && needs.length >= 3}
                    onPress={() => handleNeedToggle(option.value)}
                    accessibilityLabel={`Necessidade: ${option.label}`}
                    testID={`need_${option.value}`}
                  />
                </View>
              ))}
            </View>
          </View>

        </ScrollView>

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
  title: { fontSize: tokens.typography.headlineLg.fontSize, fontWeight: '600', color: tokens.palette.text, textAlign: 'center' } as TextStyle,
  subtitle: { fontSize: tokens.typography.bodyMd.fontSize, color: tokens.palette.neutrals[700], textAlign: 'center' } as TextStyle,
  section: { gap: tokens.spacing.sm } as ViewStyle,
  sectionLabel: { fontSize: tokens.typography.bodyMd.fontSize, fontWeight: '500', color: tokens.palette.text } as TextStyle,
  required: { color: tokens.palette.feedback.danger } as TextStyle,
  helper: { fontSize: tokens.typography.bodySm.fontSize, color: tokens.palette.neutrals[600] } as TextStyle,
  chipsContainer: { gap: tokens.spacing.xs } as ViewStyle,
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm } as ViewStyle,
  cardWrapper: { width: '48%' } as ViewStyle,
  footer: { flexDirection: 'row', padding: tokens.spacing.lg, backgroundColor: tokens.palette.background, borderTopWidth: 1, borderTopColor: tokens.palette.neutrals[200], gap: tokens.spacing.md } as ViewStyle,
  backButton: { flex: 1 } as ViewStyle,
  nextButton: { flex: 2 } as ViewStyle,
});
