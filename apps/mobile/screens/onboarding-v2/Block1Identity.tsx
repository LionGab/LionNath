/**
 * Onboarding v2 - Bloco 1: Apresentação & Identidade
 * "Oi, eu sou a Nath 🌸 Quero te conhecer melhor pra deixar tudo aqui com a sua cara."
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { Chip, Input, Button } from '@/ui';
import { ONBOARDING_V2_OPTIONS, MaternalStage } from '@/types/onboarding-v2.types';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';

const tokens = nossaMaternidadeDesignTokens;

interface Block1IdentityProps {
  onNext: () => void;
}

export function Block1Identity({ onNext }: Block1IdentityProps) {
  const { data, updateData, isStepValid } = useOnboardingV2();

  // Estado local para campos
  const [name, setName] = useState(data.name || '');
  const [maternalStage, setMaternalStage] = useState<MaternalStage | undefined>(data.maternal_stage);
  const [gestationWeek, setGestationWeek] = useState(data.gestation_week?.toString() || '');
  const [babyName, setBabyName] = useState(data.baby_name || '');
  const [babyAge, setBabyAge] = useState(data.baby_age_months?.toString() || '');

  // Atualizar dados quando campos mudam
  const handleNameChange = (value: string) => {
    setName(value);
    updateData({ name: value });
  };

  const handleStageSelect = (stage: MaternalStage) => {
    setMaternalStage(stage);
    updateData({ maternal_stage: stage });

    // Limpar campos condicionais quando stage muda
    if (stage !== 'gestante') {
      setGestationWeek('');
      updateData({ gestation_week: undefined });
    }
    if (stage === 'tentante') {
      setBabyName('');
      setBabyAge('');
      updateData({ baby_name: undefined, baby_age_months: undefined });
    }
  };

  const handleGestationWeekChange = (value: string) => {
    setGestationWeek(value);
    const week = parseInt(value, 10);
    updateData({ gestation_week: isNaN(week) ? undefined : week });
  };

  const handleBabyNameChange = (value: string) => {
    setBabyName(value);
    updateData({ baby_name: value });
  };

  const handleBabyAgeChange = (value: string) => {
    setBabyAge(value);
    const age = parseInt(value, 10);
    updateData({ baby_age_months: isNaN(age) ? undefined : age });
  };

  const handleContinue = () => {
    if (isStepValid()) {
      onNext();
    }
  };

  const showGestationWeek = maternalStage === 'gestante';
  const showBabyFields = maternalStage && maternalStage !== 'tentante';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ilustração */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationCircle}>
              <Text style={styles.illustrationEmoji}>🌸</Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} testID="onboarding_step1_title">
              Oi, eu sou a Nath 🌸
            </Text>
            <Text style={styles.subtitle}>Quero te conhecer melhor pra deixar tudo aqui com a sua cara.</Text>
          </View>

          {/* Nome (opcional) */}
          <View style={styles.section}>
            <Input
              label="Qual é o seu nome?"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Você pode usar um apelido"
              accessibilityLabel="Campo de nome"
              testID="name_input"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Estágio Maternal (obrigatório) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Qual o seu estágio maternal? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipsContainer}>
              {ONBOARDING_V2_OPTIONS.maternal_stage.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={maternalStage === option.value}
                  onPress={() => handleStageSelect(option.value as MaternalStage)}
                  accessibilityLabel={`Estágio maternal: ${option.label}`}
                  testID={`stage_chip_${option.value}`}
                />
              ))}
            </View>
          </View>

          {/* Semana de Gestação (condicional) */}
          {showGestationWeek && (
            <View style={styles.section}>
              <Input
                label="Em que semana de gestação você está?"
                value={gestationWeek}
                onChangeText={handleGestationWeekChange}
                placeholder="Ex: 20"
                keyboardType="number-pad"
                accessibilityLabel="Semana de gestação"
                testID="gestation_week_input"
                maxLength={2}
              />
            </View>
          )}

          {/* Nome do Bebê (condicional) */}
          {showBabyFields && (
            <View style={styles.section}>
              <Input
                label="Qual é o nome do seu bebê?"
                value={babyName}
                onChangeText={handleBabyNameChange}
                placeholder="Ou deixe em branco se preferir"
                accessibilityLabel="Nome do bebê"
                testID="baby_name_input"
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Idade do Bebê (condicional) */}
          {showBabyFields && maternalStage !== 'gestante' && (
            <View style={styles.section}>
              <Input
                label="Qual a idade do seu bebê? (em meses)"
                value={babyAge}
                onChangeText={handleBabyAgeChange}
                placeholder="Ex: 6"
                keyboardType="number-pad"
                accessibilityLabel="Idade do bebê em meses"
                testID="baby_age_input"
                maxLength={3}
              />
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimer}>
              💛 Você está segura aqui. Suas informações são privadas e usadas apenas para personalizar sua experiência.
            </Text>
            <Text style={styles.disclaimerFooter}>Não substitui cuidado médico • Ajuda: 188 (CVV) / 192 (SAMU)</Text>
          </View>
        </ScrollView>

        {/* Botão Continuar (sticky) */}
        <View style={styles.footer}>
          <Button
            onPress={handleContinue}
            disabled={!isStepValid()}
            accessibilityLabel="Continuar para próxima etapa"
            testID="next_btn"
            style={styles.button}
          >
            Continuar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.palette.background,
  } as ViewStyle,
  keyboardView: {
    flex: 1,
  } as ViewStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing['5xl'],
    gap: tokens.spacing.md,
  } as ViewStyle,
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: tokens.spacing.lg,
  } as ViewStyle,
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.soft,
  } as ViewStyle,
  illustrationEmoji: {
    fontSize: 60,
  } as TextStyle,
  header: {
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  } as ViewStyle,
  title: {
    fontSize: tokens.typography.headlineXL.fontSize,
    lineHeight: tokens.typography.headlineXL.lineHeight,
    fontWeight: tokens.typography.headlineXL.fontWeight,
    color: tokens.palette.text,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: tokens.typography.bodyLg.fontSize,
    lineHeight: tokens.typography.bodyLg.lineHeight,
    color: tokens.palette.neutrals[700],
    textAlign: 'center',
  } as TextStyle,
  section: {
    gap: tokens.spacing.sm,
  } as ViewStyle,
  sectionLabel: {
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    fontWeight: '500',
    color: tokens.palette.text,
  } as TextStyle,
  required: {
    color: tokens.palette.feedback.danger,
  } as TextStyle,
  chipsContainer: {
    gap: tokens.spacing.xs,
  } as ViewStyle,
  disclaimerContainer: {
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    backgroundColor: `${tokens.palette.accent}10`,
    gap: tokens.spacing.sm,
  } as ViewStyle,
  disclaimer: {
    fontSize: tokens.typography.bodySm.fontSize,
    lineHeight: tokens.typography.bodySm.lineHeight,
    color: tokens.palette.text,
    textAlign: 'center',
  } as TextStyle,
  disclaimerFooter: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.palette.neutrals[600],
    textAlign: 'center',
  } as TextStyle,
  footer: {
    padding: tokens.spacing.lg,
    backgroundColor: tokens.palette.background,
    borderTopWidth: 1,
    borderTopColor: tokens.palette.neutrals[200],
    ...tokens.shadow.soft,
  } as ViewStyle,
  button: {
    width: '100%',
  } as ViewStyle,
});
