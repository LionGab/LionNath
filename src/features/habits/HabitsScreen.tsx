/**
 * Habits Screen - WITH GAMIFICATION
 *
 * Sistema completo de checklist de hábitos
 * 5 hábitos pré-definidos + progresso + streaks + GAMIFICAÇÃO
 *
 * Integrado com: GamificationManager
 * - Registra atividades
 * - Calcula pontos automaticamente
 * - Desbloqueia achievements
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import { supabase } from '@/services/supabase';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonPresets } from '@/shared/components/Skeleton';
import { Loading } from '@/shared/components/Loading';
import { GamificationManager } from '@/lib/gamification/gamification-manager';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
  scheduleStreakCelebration,
  requestNotificationPermissions,
} from '@/services/notifications';

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

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  is_custom: boolean;
  completed_today: boolean;
  streak_days: number;
}

const DEFAULT_HABITS = [
  {
    name: 'Respiração/pausa de 2 min',
    description: 'Uma pausa para respirar e se reconectar',
    category: 'bem-estar',
  },
  {
    name: 'Check-in emocional 1x/dia',
    description: 'Como você está se sentindo hoje?',
    category: 'bem-estar',
  },
  {
    name: '10 min de descanso/alongamento',
    description: 'Um momento para cuidar do corpo',
    category: 'bem-estar',
  },
  {
    name: '1 pedido de ajuda por dia (rede de apoio)',
    description: 'Conecte-se com quem te apoia',
    category: 'social',
  },
  {
    name: '1 conteúdo curto "que me ajudou hoje"',
    description: 'Compartilhe algo que te fez bem',
    category: 'crescimento',
  },
];

interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
}

interface Achievement {
  id: string;
  name: string;
  pointsReward: number;
  isNew?: boolean;
}

export default function HabitsScreen() {
  const navigation = useNavigation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCompleted, setTodayCompleted] = useState(0);

  // Gamification state
  const [gamStats, setGamStats] = useState<GamificationStats>({
    totalPoints: 0,
    currentLevel: 1,
    pointsToNextLevel: 100,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lastPointsEarned, setLastPointsEarned] = useState<number>(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [gamificationManager, setGamificationManager] = useState<GamificationManager | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Inicializar GamificationManager
      const manager = new GamificationManager(supabase, user.id);
      setGamificationManager(manager);

      // Inicializar usuário se necessário
      try {
        await manager.initializeUser();
      } catch (e) {
        // Usuário já inicializado, é ok
      }

      // Carregar estatísticas de gamificação
      try {
        const stats = await manager.getStats();
        setGamStats({
          totalPoints: stats.totalPoints,
          currentLevel: stats.currentLevel,
          pointsToNextLevel: stats.pointsToNextLevel,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
        });
        setAchievements(
          stats.achievements
            .filter((a) => a.isNew)
            .map((a) => ({
              id: a.id,
              name: a.name,
              pointsReward: a.pointsReward,
              isNew: true,
            }))
        );
      } catch (gamError) {
        console.warn('Erro ao carregar gamificação:', gamError);
        // Continuar mesmo se falhar
      }

      // Buscar hábitos do usuário
      const { data: userHabits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!userHabits || userHabits.length === 0) {
        // Criar hábitos padrão
        await createDefaultHabits(user.id);
        await loadHabits();
        return;
      }

      // Verificar completions de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .eq('date', today);

      const completedIds = new Set(completions?.map((c) => c.habit_id) || []);

      // Calcular streaks
      const habitsWithStats = await Promise.all(
        userHabits.map(async (habit) => {
          const { data: streakData } = await supabase
            .from('habit_completions')
            .select('date')
            .eq('habit_id', habit.id)
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30);

          let streak = 0;
          if (streakData && streakData.length > 0) {
            const dates = streakData.map((d) => new Date(d.date).getTime()).sort((a, b) => b - a);
            let currentDate = new Date().getTime();
            for (const date of dates) {
              const diff = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
              if (diff === streak) {
                streak++;
                currentDate = date;
              } else {
                break;
              }
            }
          }

          return {
            id: habit.id,
            name: habit.name,
            description: habit.description || '',
            category: habit.category || '',
            is_custom: habit.is_custom || false,
            completed_today: completedIds.has(habit.id),
            streak_days: streak,
          };
        })
      );

      setHabits(habitsWithStats);
      setTodayCompleted(habitsWithStats.filter((h) => h.completed_today).length);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Erro', 'Não foi possível carregar os hábitos');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultHabits = async (userId: string) => {
    const habitsToCreate = DEFAULT_HABITS.map((habit) => ({
      user_id: userId,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      is_custom: false,
      is_active: true,
    }));

    await supabase.from('habits').insert(habitsToCreate);
  };

  const toggleHabit = async (habitId: string, completed: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const habit = habits.find((h) => h.id === habitId);

      if (!habit) return;

      if (completed) {
        // Marcar como feito
        await supabase.from('habit_completions').insert({
          habit_id: habitId,
          user_id: user.id,
          date: today,
          completed_at: new Date().toISOString(),
        });

        // Registrar no sistema de gamificação
        if (gamificationManager) {
          try {
            const result = await gamificationManager.recordActivity('self_care', {
              habitName: habit.name,
              habitCategory: habit.category,
            });

            // Mostrar feedback de pontos
            setLastPointsEarned(result.pointsEarned);
            setShowPointsAnimation(true);
            setTimeout(() => setShowPointsAnimation(false), 2000);

            // Mostrar novo achievements
            if (result.newAchievements.length > 0) {
              Alert.alert(
                '🎉 Conquista Desbloqueada!',
                result.newAchievements.map((a) => `${a.name} (+${a.pointsReward} pts)`).join('\n')
              );
            }

            // Mostrar level up
            if (result.leveledUp) {
              Alert.alert('⬆️ LEVEL UP!', 'Parabéns, você subiu de nível!');
            }
          } catch (gamError) {
            console.warn('Erro ao registrar gamificação:', gamError);
          }
        }
      } else {
        // Desmarcar
        await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', user.id)
          .eq('date', today);
      }

      await loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o hábito');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonPresets.Text width="60%" height={32} />
          <SkeletonPresets.Text width="40%" height={16} style={{ marginTop: spacing.sm }} />
        </View>
        <View style={styles.habitsList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPresets.HabitCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Hábitos</Text>
        <Text style={styles.subtitle}>
          {habits.length > 0 ? `${todayCompleted} de ${habits.length} completados hoje` : 'Nenhum hábito criado ainda'}
        </Text>
      </View>

      {/* GAMIFICATION CARD */}
      {habits.length > 0 && (
        <View style={styles.gamificationContainer}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gamificationCard}
          >
            <View style={styles.gamificationContent}>
              {/* Level + Points */}
              <View style={styles.gamLevelSection}>
                <View style={styles.levelCircle}>
                  <Text style={styles.levelText}>Nv</Text>
                  <Text style={styles.levelNumber}>{gamStats.currentLevel}</Text>
                </View>
                <View style={styles.pointsInfo}>
                  <Text style={styles.pointsLabel}>Pontos Totais</Text>
                  <Text style={styles.pointsValue}>{gamStats.totalPoints}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={{
                        width: `${Math.min(
                          ((gamStats.totalPoints % gamStats.pointsToNextLevel) /
                            gamStats.pointsToNextLevel) *
                            100,
                          100
                        )}%`,
                        height: '100%',
                        backgroundColor: '#FBBF24',
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <Text style={styles.progressText}>{gamStats.pointsToNextLevel} pts até next level</Text>
                </View>
              </View>

              {/* Streak */}
              {gamStats.currentStreak > 0 && (
                <View style={styles.streakSection}>
                  <Text style={styles.streakLabel}>🔥 Sequência</Text>
                  <Text style={styles.streakValue}>{gamStats.currentStreak} dias</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* STATS CARD */}
      {habits.length > 0 && (
        <View style={styles.stats}>
          <Card variant="outlined" padding="md">
            <Text style={styles.statLabel}>Hábitos de hoje</Text>
            <Text style={styles.statValue}>
              {todayCompleted}/{habits.length}
            </Text>
          </Card>
        </View>
      )}

      {/* SHOW ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>🎉 Novas Conquistas!</Text>
          {achievements.map((ach) => (
            <Badge key={ach.id} variant="success" style={{ marginBottom: spacing.sm }}>
              {ach.name} +{ach.pointsReward} pts
            </Badge>
          ))}
        </View>
      )}

      {habits.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="Nenhum hábito criado"
          description="Crie seus hábitos diários para cuidar de si mesma com carinho e consistência."
          actionLabel="Criar primeiro hábito"
          onAction={() => Alert.alert('Em breve', 'Funcionalidade de criar hábito será adicionada em breve!')}
        />
      ) : (
        <View style={styles.habitsList}>
          {habits.map((habit) => (
            <Card
              key={habit.id}
              variant="elevated"
              style={styles.habitCard}
              onPress={() => toggleHabit(habit.id, !habit.completed_today)}
              accessibilityLabel={`${habit.name} - ${habit.completed_today ? 'Completo' : 'Incompleto'}`}
            >
              <View style={styles.habitContent}>
                <TouchableOpacity
                  style={styles.checkboxWrapper}
                  onPress={() => toggleHabit(habit.id, !habit.completed_today)}
                  accessible={false}
                >
                  <LinearGradient
                    colors={
                      habit.completed_today
                        ? [BLUE_THEME.primaryBlue, BLUE_THEME.lightBlue]
                        : ['transparent', 'transparent']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.checkbox, habit.completed_today && styles.checkboxCompleted]}
                  >
                    {habit.completed_today && <Icon name="check" size={24} color={BLUE_THEME.white} />}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  {habit.description && <Text style={styles.habitDescription}>{habit.description}</Text>}
                  {habit.streak_days > 0 && (
                    <Badge variant="success" size="sm" style={styles.streakBadge}>
                      🔥 {habit.streak_days} dias seguidos
                    </Badge>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.sans,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.sans,
  },
  // GAMIFICATION STYLES
  gamificationContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  gamificationCard: {
    borderRadius: 12,
    padding: spacing.lg,
    overflow: 'hidden' as any,
  },
  gamificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gamLevelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  levelText: {
    fontSize: typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: '600' as any,
    fontFamily: typography.fontFamily.sans,
  },
  levelNumber: {
    fontSize: typography.sizes['2xl'],
    color: '#FFFFFF',
    fontWeight: 'bold' as any,
    fontFamily: typography.fontFamily.sans,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  pointsValue: {
    fontSize: typography.sizes['xl'],
    color: '#FFFFFF',
    fontWeight: 'bold' as any,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: spacing.xs,
    overflow: 'hidden' as any,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: typography.fontFamily.sans,
  },
  streakSection: {
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  streakLabel: {
    fontSize: typography.sizes.sm,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  streakValue: {
    fontSize: typography.sizes.xl,
    color: '#FBBF24',
    fontWeight: 'bold' as any,
    fontFamily: typography.fontFamily.sans,
  },
  achievementsContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  achievementsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: 'bold' as any,
    color: colors.foreground,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  stats: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
  },
  habitsList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  habitCard: {
    marginBottom: spacing.md,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxWrapper: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(147, 197, 253, 0.3)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    borderColor: 'transparent',
    ...shadows.dark.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.foreground,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  habitDescription: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  streakBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
