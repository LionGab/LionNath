import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import type { DailyPlanLocal, QuickActionProps } from '@/types';
import { logger } from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, shadows, spacing, borderRadius, typography } from '@/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [pregnancyWeek, setPregnancyWeek] = useState<number | null>(null);
  const { dailyPlan, loading, generating, generatePlan } = useDailyPlan();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const profileJson = await AsyncStorage.getItem('userProfile');
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      setUserName(profile.name || 'Querida');
      setPregnancyWeek(profile.pregnancy_week);
    }
  };

  const QuickActionButton: React.FC<QuickActionProps> = ({ iconName, title, onPress, accessibilityLabel }) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={`Abre a tela de ${title.toLowerCase()}`}
      activeOpacity={0.7}
    >
      <Icon name={iconName} size={32} color={colors.primary} />
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoHeader}>
            <Logo size={50} />
          </View>
          <View style={styles.greetingContainer}>
            <Icon name="hand-wave" size={24} color={colors.primary} />
            <Text style={styles.greeting}>Olá, {userName}!</Text>
          </View>
          {pregnancyWeek && (
            <View style={styles.subGreetingContainer}>
              <Icon name="heart-pulse" size={18} color={colors.destructive} />
              <Text style={styles.subGreeting}>Semana {pregnancyWeek} de gestação</Text>
            </View>
          )}
        </View>

        {/* Botões de ação rápida */}
        <View style={styles.quickActionsContainer}>
          <QuickActionButton
            iconName="message-text-outline"
            title="Conversar"
            accessibilityLabel="Botão Conversar"
            onPress={() => navigation.navigate('Chat' as never)}
          />
          <QuickActionButton
            iconName="calendar-today"
            title="Plano Diário"
            accessibilityLabel="Botão Plano Diário"
            onPress={() => navigation.navigate('DailyPlan' as never)}
          />
          <QuickActionButton
            iconName="chart-line"
            title="Progresso"
            accessibilityLabel="Botão Progresso"
            onPress={() => Alert.alert('Em breve', 'Acompanhe seu progresso aqui!')}
          />
          <QuickActionButton
            iconName="account-cog-outline"
            title="Perfil"
            accessibilityLabel="Botão Perfil"
            onPress={() => navigation.navigate('Profile' as never)}
          />
        </View>

        {/* Plano Diário */}
        <Card title="Seu Plano de Hoje" icon="target" variant="elevated" style={styles.dailyPlanCard}>
          <View style={styles.dailyPlanHeader}>
            <Button
              variant="outline"
              size="sm"
              onPress={generateTodaysPlan}
              loading={loading}
              disabled={loading}
              icon="refresh"
              accessibilityLabel="Atualizar plano diário"
              accessibilityHint="Gera um novo plano personalizado para hoje"
            >
              Atualizar
            </Button>
          </View>

          {dailyPlan ? (
            <View>
              <View style={styles.sectionTitleContainer}>
                <Icon name="checkbox-marked-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Prioridades:</Text>
              </View>
              {dailyPlan.priorities?.map((priority: string, index: number) => (
                <Text key={index} style={styles.priorityItem}>
                  • {priority}
                </Text>
              ))}

              <View style={[styles.sectionTitleContainer, { marginTop: spacing.lg }]}>
                <Icon name="lightbulb-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Dica do Dia:</Text>
              </View>
              <Text style={styles.tip}>{dailyPlan?.tip}</Text>

              <View style={[styles.sectionTitleContainer, { marginTop: spacing.lg }]}>
                <Icon name="food-variant" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Receita:</Text>
              </View>
              <Text style={styles.recipe}>{dailyPlan?.recipe}</Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Icon name="calendar-blank-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyState}>Nenhum plano gerado ainda para hoje.</Text>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={handleGeneratePlan}
                loading={generating}
                disabled={generating}
                icon="sparkles"
                accessibilityLabel="Gerar plano diário"
                accessibilityHint="Cria um plano personalizado baseado no seu perfil"
              >
                {loading ? 'Gerando...' : 'Gerar Plano Agora'}
              </Button>
            </View>
          )}
        </Card>

        {/* Dicas Rápidas */}
        <Card title="Você sabia?" icon="lightbulb-on" variant="outlined" style={styles.tipsCard}>
          <View style={styles.tipContainer}>
            <Icon name="sleep" size={24} color={colors.accent} />
            <Text style={styles.tipText}>
              Durante a gravidez, é normal sentir cansaço. Ouça seu corpo e descanse sempre que possível!
            </Text>
          </View>
        </Card>

        {/* FAQ Rápido */}
        <Card title="Perguntas Frequentes" icon="help-circle-outline" variant="elevated" style={styles.faqCard}>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => navigation.navigate('Chat' as never)}
            accessible={true}
            accessibilityLabel="Perguntar: Como aliviar enjoo matinal?"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestionContainer}>
              <Icon name="stomach" size={20} color={colors.primary} style={styles.faqIcon} />
              <Text style={styles.faqQuestion}>Como aliviar enjoo matinal?</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => navigation.navigate('Chat' as never)}
            accessible={true}
            accessibilityLabel="Perguntar: Quais exercícios posso fazer?"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestionContainer}>
              <Icon name="run" size={20} color={colors.primary} style={styles.faqIcon} />
              <Text style={styles.faqQuestion}>Quais exercícios posso fazer?</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => navigation.navigate('Chat' as never)}
            accessible={true}
            accessibilityLabel="Perguntar: Quando devo ir ao médico?"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestionContainer}>
              <Icon name="stethoscope" size={20} color={colors.primary} style={styles.faqIcon} />
              <Text style={styles.faqQuestion}>Quando devo ir ao médico?</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Card>

        {/* Emergency Button */}
        <Button
          variant="destructive"
          size="lg"
          fullWidth
          icon="phone-alert"
          onPress={() => {
            Alert.alert(
              '🚨 Emergência',
              'Você será direcionado para ligar para o SAMU (192).\n\nSe você está com sintomas graves, ligue imediatamente ou procure um hospital!',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Ligar Agora',
                  style: 'destructive',
                  onPress: () => Linking.openURL('tel:192'),
                },
              ]
            );
          }}
          accessibilityLabel="Botão de emergência"
          accessibilityHint="Ligar para SAMU 192 em caso de emergência médica"
          style={styles.emergencyButton}
        >
          Emergência - SAMU 192
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  subGreetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  subGreeting: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.sans,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.lg,
    minHeight: 100,
    ...shadows.light.sm,
  },
  quickActionTitle: {
    fontSize: typography.sizes.sm, // 14px agora
    color: colors.foreground,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: typography.weights.medium as any,
  },
  dailyPlanCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  dailyPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyStateContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
    marginBottom: spacing.xs,
  },
  priorityItem: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  tip: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  recipe: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  emptyState: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tipText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
    flex: 1,
  },
  faqCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
    minHeight: 52,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  faqIcon: {
    marginRight: spacing.xs,
  },
  faqQuestion: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    flex: 1,
    lineHeight: 22,
    fontFamily: typography.fontFamily.sans,
  },
  emergencyButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing['3xl'],
  },
});
