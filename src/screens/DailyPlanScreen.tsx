/**
 * DailyPlanScreen - Tela de plano diário acolhedora e otimizada mobile-first
 * Design empático para gestantes, mães e tentantes
 */

import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { logger } from '@/utils/logger';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Button } from '@/components/Button';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  if (loading) {
    return <LoadingScreen message="Carregando seu plano diário..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano Diário 📅</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {!dailyPlan ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <Icon name="calendar-blank-outline" size={64} color={colors.muted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nenhum plano para hoje</Text>
            <Text style={styles.emptyStateDescription}>
              Vamos criar um plano personalizado para você? Com prioridades, dicas e receitas especiais! 💝
            </Text>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleGeneratePlan}
              loading={generating}
              disabled={generating}
              icon="sparkles"
              accessibilityLabel="Gerar plano diário"
              accessibilityHint="Cria um plano personalizado baseado no seu perfil"
              style={styles.generateButton}
            >
              {generating ? 'Gerando...' : 'Gerar Plano Agora ✨'}
            </Button>
          </View>
        ) : (
          <>
            {/* Prioridades */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Icon name="target" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Prioridades de Hoje</Text>
              </View>
              {dailyPlan.priorities?.map((priority: string, index: number) => (
                <View key={index} style={styles.priorityItem}>
                  <View style={styles.priorityNumberContainer}>
                    <Text style={styles.priorityNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.priorityText}>{priority}</Text>
                </View>
              ))}
            </View>

            {/* Dica do Dia */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Icon name="lightbulb-on" size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Dica do Dia</Text>
              </View>
              <Text style={styles.tipText}>{dailyPlan.tip}</Text>
            </View>

            {/* Receita */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Icon name="chef-hat" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Receita Especial</Text>
              </View>
              <Text style={styles.recipeText}>{dailyPlan.recipe}</Text>
            </View>

            {/* Botão para gerar novo plano */}
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={handleGeneratePlan}
              loading={generating}
              disabled={generating}
              icon="refresh"
              accessibilityLabel="Gerar novo plano"
              accessibilityHint="Gera um novo plano personalizado para hoje"
              style={styles.regenerateButton}
            >
              {generating ? 'Gerando novo plano...' : '🔄 Gerar Novo Plano'}
            </Button>
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
  contentContainer: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: spacing.lg,
  },
  emptyState: {
    backgroundColor: colors.card,
    padding: spacing['2xl'],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.light.md,
    marginTop: spacing.xl,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  emptyStateDescription: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  generateButton: {
    marginTop: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.light.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  priorityNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  priorityNumber: {
    color: colors.primaryForeground,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold as any,
    fontFamily: typography.fontFamily.sans,
  },
  priorityText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.foreground,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  tipText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    lineHeight: 26,
    fontFamily: typography.fontFamily.sans,
    fontStyle: 'italic',
  },
  recipeText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  regenerateButton: {
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
});
