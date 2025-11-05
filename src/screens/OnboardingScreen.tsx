import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { validateOnboardingData } from '@/utils/validation';
import { UserRepository } from '@/repositories/UserRepository';
import { supabase } from '@/services/supabase';
import type { UserProfileLocal, UserType } from '@/types';
import { logger } from '@/utils/logger';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme/colors';

interface OnboardingScreenProps {
  onComplete?: () => void;
  route?: {
    params?: {
      onComplete?: () => void;
    };
  };
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, route }) => {
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<UserType | null>(null);
  const [pregnancyWeek, setPregnancyWeek] = useState('');
  const [babyName, setBabyName] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const preferencesOptions = [
    { label: 'Alimentação saudável', icon: 'food-apple' },
    { label: 'Exercícios físicos', icon: 'run' },
    { label: 'Bem-estar mental', icon: 'meditation' },
    { label: 'Preparação para o parto', icon: 'baby-carriage' },
    { label: 'Amamentação', icon: 'mother-nurse' },
    { label: 'Sono do bebê', icon: 'sleep' },
    { label: 'Relacionamento', icon: 'heart-multiple' },
  ];

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p: string) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Ops!', 'Por favor, digite seu nome');
      return;
    }
    if (step === 2 && !type) {
      Alert.alert('Ops!', 'Por favor, selecione uma opção');
      return;
    }
    if (step === 3 && type === 'gestante' && !pregnancyWeek) {
      Alert.alert('Ops!', 'Por favor, informe a semana de gravidez');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Validar dados antes de salvar
      const validation = validateOnboardingData({
        name,
        type,
        pregnancyWeek: pregnancyWeek,
        typeIsGestante: type === 'gestante',
      });

      if (!validation.isValid) {
        const firstError = validation.errors[0];
        Alert.alert('Ops!', firstError.message);
        setLoading(false);
        return;
      }

      // Criar usuário temporário
      const {
        data: { user },
      } = await supabase.auth.signUp({
        email: `${Date.now()}@temp.com`, // Email temporário
        password: `${Date.now()}-${Math.random()}`, // Senha temporária
      });

      if (!user) {
        throw new Error('Falha ao criar usuário');
      }

      // Salvar perfil usando repositório
      const profile: Partial<UserProfileLocal> = {
        id: user.id,
        name,
        type: type!,
        pregnancy_week: type === 'gestante' ? parseInt(pregnancyWeek, 10) : undefined,
        baby_name: babyName || undefined,
        preferences,
        subscription_tier: 'free',
        daily_interactions: 0,
        last_interaction_date: new Date().toISOString(),
      };

      const saveResult = await UserRepository.save(profile);

      if (saveResult.error) {
        throw saveResult.error;
      }

      // Salvar dados localmente
      await AsyncStorage.setItem('onboarded', 'true');
      await AsyncStorage.setItem('userId', user.id);
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('Erro ao completar onboarding', { error });
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size={120} />
          </View>
          <View style={styles.titleContainer}>
            <Icon name="mother-heart" size={32} color={colors.primary} />
            <Text style={styles.title}>Bem-vinda ao Nossa Maternidade!</Text>
          </View>
          <Text style={styles.subtitle}>Vou te conhecer melhor para poder te ajudar da melhor forma</Text>

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Qual é o seu nome?</Text>
              <Input
                label="Nome completo"
                value={name}
                onChangeText={setName}
                placeholder="Digite seu nome"
                icon="account"
                required
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Como você se identifica?</Text>
              <TouchableOpacity
                style={[styles.option, type === 'gestante' && styles.optionSelected]}
                onPress={() => setType('gestante')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Gestante"
                accessibilityState={{ selected: type === 'gestante' }}
              >
                <Icon
                  name="baby-carriage"
                  size={32}
                  color={type === 'gestante' ? colors.primary : colors.mutedForeground}
                />
                <Text style={styles.optionText}>Gestante</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.option, type === 'mae' && styles.optionSelected]}
                onPress={() => setType('mae')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Mãe"
                accessibilityState={{ selected: type === 'mae' }}
              >
                <Icon name="mother-nurse" size={32} color={type === 'mae' ? colors.primary : colors.mutedForeground} />
                <Text style={styles.optionText}>Mãe</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.option, type === 'tentante' && styles.optionSelected]}
                onPress={() => setType('tentante')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Tentante"
                accessibilityState={{ selected: type === 'tentante' }}
              >
                <Icon
                  name="heart-multiple"
                  size={32}
                  color={type === 'tentante' ? colors.primary : colors.mutedForeground}
                />
                <Text style={styles.optionText}>Tentante</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && type === 'gestante' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Em que semana de gestação você está?</Text>
              <Input
                label="Semana de gestação"
                value={pregnancyWeek}
                onChangeText={setPregnancyWeek}
                placeholder="Ex: 28"
                keyboardType="number-pad"
                icon="calendar-heart"
                helperText={`Você está na semana ${pregnancyWeek || '0'}`}
                required
              />
            </View>
          )}

          {step === 3 && (type === 'mae' || type === 'tentante') && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Qual é o nome do seu bebê?</Text>
              <Input
                label="Nome do bebê"
                value={babyName}
                onChangeText={setBabyName}
                placeholder="Ou deixe em branco se preferir"
                icon="baby-face"
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Quais são seus principais interesses?</Text>
              <Text style={styles.subtitle}>Selecione os que mais te interessam:</Text>
              {preferencesOptions.map((pref) => (
                <TouchableOpacity
                  key={pref.label}
                  style={[styles.preferenceOption, preferences.includes(pref.label) && styles.preferenceSelected]}
                  onPress={() => togglePreference(pref.label)}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityLabel={pref.label}
                  accessibilityState={{ checked: preferences.includes(pref.label) }}
                >
                  <Icon
                    name={pref.icon}
                    size={24}
                    color={preferences.includes(pref.label) ? colors.primary : colors.mutedForeground}
                    style={styles.preferenceIcon}
                  />
                  <Text style={styles.preferenceText}>{pref.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleNext}
            loading={loading}
            disabled={loading}
            icon={step < 4 ? 'arrow-right' : 'check-circle'}
            iconPosition="right"
            accessibilityLabel={step < 4 ? 'Ir para próximo passo' : 'Começar a usar o app'}
            accessibilityHint={step < 4 ? `Avançar para o passo ${step + 1} de 4` : 'Finalizar cadastro e começar'}
          >
            {step < 4 ? 'Próximo' : 'Começar agora!'}
          </Button>

          {step > 1 && (
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => setStep(Math.max(1, step - 1))}
              icon="arrow-left"
              accessibilityLabel="Voltar para passo anterior"
              style={styles.backButton}
            >
              Voltar
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    fontFamily: typography.fontFamily.sans,
  },
  stepContainer: {
    marginBottom: spacing['2xl'],
  },
  stepTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 60,
    ...shadows.light.sm,
  },
  optionSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
    ...shadows.light.md,
  },
  optionText: {
    fontSize: typography.sizes.lg,
    color: colors.foreground,
    fontWeight: typography.weights.medium as any,
    fontFamily: typography.fontFamily.sans,
  },
  preferenceOption: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
  },
  preferenceSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  preferenceIcon: {
    marginRight: spacing.xs,
  },
  preferenceText: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
    flex: 1,
  },
  backButton: {
    marginTop: spacing.md,
  },
});

export default OnboardingScreen;
