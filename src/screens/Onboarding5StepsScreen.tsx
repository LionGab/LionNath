/**
 * OnboardingScreen - 5 Passos (≤90s)
 *
 * 1. Fase → 2. Emoção/Slider → 3. Desafios → 4. Preferências → 5. Starter Pack
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Fase = 'gestante' | 'mae' | 'tentante' | 'puerperio';
type Desafio = 'sono' | 'alimentacao' | 'ansiedade' | 'relacionamento' | 'trabalho' | 'financas';

interface OnboardingData {
  fase: Fase | null;
  emocao: number; // 0-10
  desafios: Desafio[];
  postar_anonimo: boolean;
  notificacoes: boolean;
}

const FASES: { value: Fase; label: string; icon: string }[] = [
  { value: 'gestante', label: 'Gestante', icon: 'baby-buggy' },
  { value: 'mae', label: 'Mãe', icon: 'heart' },
  { value: 'tentante', label: 'Tentante', icon: 'flower' },
  { value: 'puerperio', label: 'Puerpério', icon: 'baby-face-outline' },
];

const DESAFIOS: { value: Desafio; label: string }[] = [
  { value: 'sono', label: 'Sono' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'ansiedade', label: 'Ansiedade' },
  { value: 'relacionamento', label: 'Relacionamento' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'financas', label: 'Finanças' },
];

const EMOCAO_LABELS: Record<number, string> = {
  0: 'Calma',
  2: 'Tranquila',
  5: 'Oscilando',
  8: 'Preocupada',
  10: 'No limite',
};

export default function OnboardingScreen() {
  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fase: null,
    emocao: 5,
    desafios: [],
    postar_anonimo: true, // ON por padrão
    notificacoes: false, // OFF por padrão
  });
  const [loading, setLoading] = useState(false);
  const startTime = useRef(Date.now());
  const handleEmocaoChange = useCallback((value: number) => {
    // Arredonda para manter o slider alinhado com escala discreta 0-10 e evita stale closures
    setData((prev) => ({
      ...prev,
      emocao: Math.round(value),
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleComplete = useCallback(async () => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 90) {
      console.warn(`Onboarding levou ${elapsed}s (meta: ≤90s)`);
    }

    setLoading(true);
    try {
      // Salvar dados do onboarding
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('onboarding_data', JSON.stringify(data));

      // Chamar API para gerar Starter Pack
      // TODO: Integrar com API de onboarding

      // Navegar para Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      Alert.alert('Erro', 'Não foi possível completar o onboarding');
    } finally {
      setLoading(false);
    }
  }, [data, navigation]);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: palette.text, fontSize: typography.headlineMd.fontSize }]}>
        Em que fase você está?
      </Text>
      <Text style={[styles.stepSubtitle, { color: palette.neutrals[600], fontSize: typography.bodyMd.fontSize }]}>
        Escolha a opção que melhor descreve seu momento
      </Text>

      <View style={styles.fasesContainer}>
        {FASES.map((fase) => (
          <TouchableOpacity
            key={fase.value}
            style={[
              styles.faseCard,
              {
                backgroundColor: data.fase === fase.value ? palette.primary : palette.surface,
                borderRadius: radius.md,
                padding: spacing.lg,
                borderWidth: 2,
                borderColor: data.fase === fase.value ? palette.primary : palette.neutrals[300],
                minHeight: 44, // WCAG mínimo
              },
            ]}
            onPress={() => setData({ ...data, fase: fase.value })}
            accessible={true}
            accessibilityLabel={`Fase: ${fase.label}`}
            accessibilityRole="button"
          >
            <Icon name={fase.icon} size={32} color={data.fase === fase.value ? '#FFFFFF' : palette.primary} />
            <Text
              style={[
                styles.faseLabel,
                {
                  color: data.fase === fase.value ? '#FFFFFF' : palette.text,
                  fontSize: typography.bodyMd.fontSize,
                  fontWeight: '600',
                  marginTop: spacing.sm,
                },
              ]}
            >
              {fase.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: palette.text, fontSize: typography.headlineMd.fontSize }]}>
        Como você está se sentindo?
      </Text>
      <Text style={[styles.stepSubtitle, { color: palette.neutrals[600], fontSize: typography.bodyMd.fontSize }]}>
        Deslize para indicar seu nível emocional
      </Text>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
            Calma
          </Text>
          <Text style={[styles.sliderLabel, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
            No limite
          </Text>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={data.emocao}
          onValueChange={handleEmocaoChange}
          minimumTrackTintColor={palette.primary}
          maximumTrackTintColor={palette.neutrals[300]}
          thumbTintColor={palette.accent}
        />

        <View
          style={[
            styles.emocaoDisplay,
            {
              backgroundColor: palette.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.emocaoValue,
              {
                color: palette.text,
                fontSize: typography.headlineLg.fontSize,
                fontWeight: '600',
                textAlign: 'center',
              },
            ]}
          >
            {data.emocao}
          </Text>
          <Text
            style={[
              styles.emocaoLabel,
              {
                color: palette.neutrals[600],
                fontSize: typography.bodyMd.fontSize,
                textAlign: 'center',
                marginTop: spacing.xs,
              },
            ]}
          >
            {EMOCAO_LABELS[data.emocao] || 'Oscilando'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: palette.text, fontSize: typography.headlineMd.fontSize }]}>
        Quais são seus principais desafios?
      </Text>
      <Text style={[styles.stepSubtitle, { color: palette.neutrals[600], fontSize: typography.bodyMd.fontSize }]}>
        Escolha até 2 desafios
      </Text>

      <View style={styles.desafiosContainer}>
        {DESAFIOS.map((desafio) => {
          const isSelected = data.desafios.includes(desafio.value);
          const canSelect = !isSelected && data.desafios.length < 2;

          return (
            <TouchableOpacity
              key={desafio.value}
              style={[
                styles.desafioCard,
                {
                  backgroundColor: isSelected ? palette.primary : palette.surface,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  borderWidth: 2,
                  borderColor: isSelected ? palette.primary : palette.neutrals[300],
                  opacity: canSelect || isSelected ? 1 : 0.5,
                  minHeight: 44, // WCAG mínimo
                },
              ]}
              onPress={() => {
                if (isSelected) {
                  setData({ ...data, desafios: data.desafios.filter((d) => d !== desafio.value) });
                } else if (canSelect) {
                  setData({ ...data, desafios: [...data.desafios, desafio.value] });
                }
              }}
              disabled={!canSelect && !isSelected}
              accessible={true}
              accessibilityLabel={`Desafio: ${desafio.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: !canSelect && !isSelected }}
            >
              <Text
                style={[
                  styles.desafioLabel,
                  {
                    color: isSelected ? '#FFFFFF' : palette.text,
                    fontSize: typography.bodyMd.fontSize,
                    fontWeight: '500',
                  },
                ]}
              >
                {desafio.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: palette.text, fontSize: typography.headlineMd.fontSize }]}>
        Suas preferências
      </Text>
      <Text style={[styles.stepSubtitle, { color: palette.neutrals[600], fontSize: typography.bodyMd.fontSize }]}>
        Configure como você quer usar o app
      </Text>

      <View style={styles.preferencesContainer}>
        <View
          style={[
            styles.preferenceRow,
            {
              backgroundColor: palette.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.md,
            },
          ]}
        >
          <View style={styles.preferenceLeft}>
            <Icon name="account-off" size={24} color={palette.primary} />
            <View style={styles.preferenceText}>
              <Text style={[styles.preferenceTitle, { color: palette.text, fontSize: typography.bodyMd.fontSize }]}>
                Postar anonimamente
              </Text>
              <Text
                style={[
                  styles.preferenceSubtitle,
                  { color: palette.neutrals[600], fontSize: typography.bodySm.fontSize },
                ]}
              >
                Seus posts aparecerão como "Mãe Anônima"
              </Text>
            </View>
          </View>
          <Switch
            value={data.postar_anonimo}
            onValueChange={(value) => setData({ ...data, postar_anonimo: value })}
            trackColor={{ false: palette.neutrals[300], true: palette.primary }}
            thumbColor={data.postar_anonimo ? '#FFFFFF' : palette.neutrals[500]}
            accessible={true}
            accessibilityLabel="Postar anonimamente"
            accessibilityRole="switch"
          />
        </View>

        <View
          style={[
            styles.preferenceRow,
            {
              backgroundColor: palette.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.preferenceLeft}>
            <Icon name="bell-outline" size={24} color={palette.primary} />
            <View style={styles.preferenceText}>
              <Text style={[styles.preferenceTitle, { color: palette.text, fontSize: typography.bodyMd.fontSize }]}>
                Notificações
              </Text>
              <Text
                style={[
                  styles.preferenceSubtitle,
                  { color: palette.neutrals[600], fontSize: typography.bodySm.fontSize },
                ]}
              >
                Receber lembretes e atualizações
              </Text>
            </View>
          </View>
          <Switch
            value={data.notificacoes}
            onValueChange={(value) => setData({ ...data, notificacoes: value })}
            trackColor={{ false: palette.neutrals[300], true: palette.primary }}
            thumbColor={data.notificacoes ? '#FFFFFF' : palette.neutrals[500]}
            accessible={true}
            accessibilityLabel="Notificações"
            accessibilityRole="switch"
          />
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: palette.text, fontSize: typography.headlineMd.fontSize }]}>
        Seu Starter Pack está pronto!
      </Text>
      <Text style={[styles.stepSubtitle, { color: palette.neutrals[600], fontSize: typography.bodyMd.fontSize }]}>
        Preparamos especialmente para você:
      </Text>

      <View style={styles.starterPackContainer}>
        {/* Círculo */}
        <View
          style={[
            styles.starterPackItem,
            {
              backgroundColor: palette.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Icon name="account-group" size={32} color={palette.primary} />
          <Text
            style={[
              styles.starterPackTitle,
              { color: palette.text, fontSize: typography.bodyMd.fontSize, fontWeight: '600', marginTop: spacing.sm },
            ]}
          >
            Círculo de Apoio
          </Text>
          <Text
            style={[
              styles.starterPackDescription,
              { color: palette.neutrals[600], fontSize: typography.bodySm.fontSize, marginTop: spacing.xs },
            ]}
          >
            Conecte-se com outras mães na mesma fase
          </Text>
        </View>

        {/* Conteúdo "Em 5 min" */}
        <View
          style={[
            styles.starterPackItem,
            {
              backgroundColor: palette.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.md,
            },
          ]}
        >
          <Icon name="book-open-variant" size={32} color={palette.primary} />
          <Text
            style={[
              styles.starterPackTitle,
              { color: palette.text, fontSize: typography.bodyMd.fontSize, fontWeight: '600', marginTop: spacing.sm },
            ]}
          >
            Conteúdo "Em 5 Minutos"
          </Text>
          <Text
            style={[
              styles.starterPackDescription,
              { color: palette.neutrals[600], fontSize: typography.bodySm.fontSize, marginTop: spacing.xs },
            ]}
          >
            Leia conteúdos práticos em poucos minutos
          </Text>
        </View>

        {/* Micro-hábito */}
        <View
          style={[
            styles.starterPackItem,
            {
              backgroundColor: palette.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
            },
          ]}
        >
          <Icon name="check-circle" size={32} color={palette.primary} />
          <Text
            style={[
              styles.starterPackTitle,
              { color: palette.text, fontSize: typography.bodyMd.fontSize, fontWeight: '600', marginTop: spacing.sm },
            ]}
          >
            Micro-hábito Personalizado
          </Text>
          <Text
            style={[
              styles.starterPackDescription,
              { color: palette.neutrals[600], fontSize: typography.bodySm.fontSize, marginTop: spacing.xs },
            ]}
          >
            Comece com um pequeno hábito diário
          </Text>
        </View>
      </View>
    </View>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.fase !== null;
      case 2:
        return true; // Slider sempre tem valor
      case 3:
        return data.desafios.length > 0;
      case 4:
        return true; // Preferências sempre têm valores padrão
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top', 'bottom']}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: palette.neutrals[300], borderRadius: radius.full }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: palette.primary,
                borderRadius: radius.full,
                width: `${(step / 5) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
          {step}/5
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: palette.surface,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderTopWidth: 1,
            borderTopColor: palette.neutrals[300],
          },
        ]}
      >
        <View style={styles.footerButtons}>
          {step > 1 && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: palette.neutrals[200],
                  borderRadius: radius.md,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  minHeight: 44,
                  flex: 1,
                  marginRight: spacing.sm,
                },
              ]}
              onPress={handleBack}
              accessible={true}
              accessibilityLabel="Voltar"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.backButtonText,
                  { color: palette.text, fontSize: typography.button.fontSize, fontWeight: '600' },
                ]}
              >
                Voltar
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: canProceed() ? palette.primary : palette.neutrals[300],
                borderRadius: radius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                minHeight: 44,
                flex: step > 1 ? 1 : 1,
                opacity: canProceed() ? 1 : 0.5,
              },
            ]}
            onPress={handleNext}
            disabled={!canProceed() || loading}
            accessible={true}
            accessibilityLabel={step === 5 ? 'Finalizar' : 'Próximo'}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canProceed() || loading }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.nextButtonText,
                  {
                    color: '#FFFFFF',
                    fontSize: typography.button.fontSize,
                    fontWeight: typography.button.fontWeight,
                  },
                ]}
              >
                {step === 5 ? 'Começar' : 'Próximo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  fasesContainer: {
    gap: 12,
  },
  faseCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faseLabel: {
    // Estilos aplicados inline
  },
  sliderContainer: {
    marginTop: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    // Estilos aplicados inline
  },
  slider: {
    width: '100%',
    height: 40,
  },
  emocaoDisplay: {
    // Estilos aplicados inline
  },
  emocaoValue: {
    // Estilos aplicados inline
  },
  emocaoLabel: {
    // Estilos aplicados inline
  },
  desafiosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  desafioCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desafioLabel: {
    // Estilos aplicados inline
  },
  preferencesContainer: {
    marginTop: 24,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    // Estilos aplicados inline
  },
  starterPackContainer: {
    marginTop: 24,
  },
  starterPackItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starterPackTitle: {
    // Estilos aplicados inline
  },
  starterPackDescription: {
    textAlign: 'center',
  },
  footer: {
    // Estilos aplicados inline
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    // Estilos aplicados inline
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    // Estilos aplicados inline
  },
});
