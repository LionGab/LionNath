import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ChatContext } from '@/services/ai';
// TODO: Migrar para daily-insight Edge Function (já implementada)
import { getDailyPlan, saveDailyPlan } from '@/services/supabase';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { logger } from '@/utils/logger';

// Blue Theme Constants
const BLUE_THEME = {
  darkBlue: '#0A2540',
  deepBlue: '#0F3460',
  primaryBlue: '#3B82F6',
  lightBlue: '#60A5FA',
  skyBlue: '#93C5FD',
  mutedBlue: '#475569',
  white: '#FFFFFF',
  lightGray: '#F1F5F9',
  darkGray: '#94A3B8',
};

interface DailyPlan {
  priorities: string[];
  tip: string;
  recipe: string;
}

const FALLBACK_DAILY_PLAN: DailyPlan = {
  priorities: ['💧 Beber 8 copos de água', '📅 Marcar consulta pré-natal', '🧘 Exercícios leves'],
  tip: 'Cuidar de você é cuidar do seu bebê! Tire um tempo para respirar hoje. 💕',
  recipe: 'Vitamina de Banana: 1 banana + 1 copo de leite + 1 colher de mel. Batido com gelo!',
};

export default function DailyPlanScreen() {
  const navigation = useNavigation();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadDailyPlan = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const today = format(new Date(), 'yyyy-MM-dd');

      if (!userId) {
        return;
      }

      const plan = await getDailyPlan(userId, today);
      setDailyPlan(plan);
    } catch (error) {
      logger.error('Erro ao carregar plano diário', {}, error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDailyPlan();
  }, [loadDailyPlan]);

  const handleGeneratePlan = useCallback(async () => {
    setGenerating(true);
    try {
      const profileJson = await AsyncStorage.getItem('userProfile');
      const hasContext = Boolean(profileJson);
      const context: ChatContext = hasContext ? JSON.parse(profileJson) : {};

      logger.info('Gerando plano diário local', {
        hasContext,
        stage: context.type,
      });

      // TODO: Migrar para daily-insight Edge Function
      setDailyPlan(FALLBACK_DAILY_PLAN);

      const userId = await AsyncStorage.getItem('userId');
      const today = format(new Date(), 'yyyy-MM-dd');

      if (userId) {
        await saveDailyPlan({
          user_id: userId,
          date: today,
          priorities: FALLBACK_DAILY_PLAN.priorities,
          tip: FALLBACK_DAILY_PLAN.tip,
          recipe: FALLBACK_DAILY_PLAN.recipe,
        });
      }

      Alert.alert('Sucesso!', 'Plano gerado com sucesso! 🎉');
    } catch (caughtError) {
      const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));

      logger.error('Erro ao gerar plano diário', error);
      Alert.alert('Erro', 'Não foi possível gerar o plano');
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const priorities = useMemo(() => (dailyPlan?.priorities ? [...dailyPlan.priorities] : []), [dailyPlan]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.headerBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano Diário</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        {!dailyPlan ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateTitle}>Nenhum plano para hoje</Text>
            <Text style={styles.emptyStateDescription}>
              Gere seu plano personalizado diário com prioridades, dicas e receitas!
            </Text>
            <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan} disabled={generating}>
              <Text style={styles.generateButtonText}>{generating ? 'Gerando...' : 'Gerar Plano Agora'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Prioridades */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <LinearGradient
                    colors={[BLUE_THEME.primaryBlue, BLUE_THEME.lightBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sectionIconGradient}
                  >
                    <Text style={styles.sectionEmoji}>🎯</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.sectionTitle}>Prioridades de Hoje</Text>
              </View>
              {priorities.map((priority, index) => (
                <View key={`${index}-${priority}`} style={styles.priorityItem}>
                  <LinearGradient
                    colors={[BLUE_THEME.primaryBlue, BLUE_THEME.lightBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.priorityNumberGradient}
                  >
                    <Text style={styles.priorityNumber}>{index + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.priorityText}>{priority}</Text>
                </View>
              ))}
            </View>

            {/* Dica do Dia */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💡 Dica do Dia</Text>
              <Text style={styles.tipText}>{dailyPlan.tip}</Text>
            </View>

            {/* Receita */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🍽️ Receita Especial</Text>
              <Text style={styles.recipeText}>{dailyPlan.recipe}</Text>
            </View>

            {/* Botão para gerar novo plano */}
            <TouchableOpacity style={styles.regenerateButton} onPress={handleGeneratePlan} disabled={generating}>
              <Text style={styles.regenerateButtonText}>
                {generating ? 'Gerando novo plano...' : '🔄 Gerar Novo Plano'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBack: {
    fontSize: typography.sizes.base,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
  },
  headerPlaceholder: {
    width: 60,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    backgroundColor: colors.card,
    padding: spacing['2xl'],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.light.md,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  emptyStateDescription: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.md,
    ...shadows.light.md,
  },
  generateButtonText: {
    color: colors.primaryForeground,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold as any,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.15)',
    ...shadows.dark.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionIconContainer: {
    marginBottom: 0,
  },
  sectionIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.dark.md,
  },
  sectionEmoji: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
    flex: 1,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.1)',
  },
  priorityNumberGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.dark.sm,
  },
  priorityNumber: {
    color: BLUE_THEME.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold as any,
    fontFamily: typography.fontFamily.sans,
  },
  priorityText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
    lineHeight: 22,
  },
  tipText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  recipeText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    lineHeight: 22,
  },
  regenerateButton: {
    backgroundColor: colors.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  regenerateButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold as any,
  },
});
