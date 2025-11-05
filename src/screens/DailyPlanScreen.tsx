import { useDailyPlan } from '@/hooks/useDailyPlan';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import type { DailyPlanLocal } from '@/types';
import { logger } from '@/utils/logger';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme/colors';

export default function DailyPlanScreen() {
  const navigation = useNavigation();
  const { dailyPlan, loading, generating, generatePlan } = useDailyPlan();

  const handleGeneratePlan = async () => {
    try {
      await generatePlan();
      Alert.alert('Sucesso!', 'Plano gerado com sucesso! 🎉');
    } catch (error) {
      logger.error('Erro ao gerar plano', { error });
      Alert.alert('Erro', 'Não foi possível gerar o plano');
    }
  };

  const handleGeneratePlan = async () => {
    try {
      await generatePlan();
      Alert.alert('Sucesso!', 'Plano gerado com sucesso! 🎉');
    } catch (error) {
      logger.error('Erro ao gerar plano', { error });
      Alert.alert('Erro', 'Não foi possível gerar o plano');
    }
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano Diário</Text>
        <View style={{ width: 60 }} />
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
              <Text style={styles.sectionTitle}>🎯 Prioridades de Hoje</Text>
              {dailyPlan?.priorities?.map((priority: string, index: number) => (
                <View key={index} style={styles.priorityItem}>
                  <Text style={styles.priorityNumber}>{index + 1}</Text>
                  <Text style={styles.priorityText}>{priority}</Text>
                </View>
              ))}
            </View>

            {/* Dica do Dia */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💡 Dica do Dia</Text>
              <Text style={styles.tipText}>{dailyPlan?.tip}</Text>
            </View>

            {/* Receita */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🍽️ Receita Especial</Text>
              <Text style={styles.recipeText}>{dailyPlan?.recipe}</Text>
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
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.light.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  priorityNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold as any,
    textAlign: 'center',
    lineHeight: 32,
    marginRight: spacing.md,
  },
  priorityText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.foreground,
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
