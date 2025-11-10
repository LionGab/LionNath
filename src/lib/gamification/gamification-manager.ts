import type { SupabaseClient } from '@supabase/supabase-js';

export interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  recentActivities: DailyActivity[];
  activeChallenges: WeeklyChallengeProgress[];
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  pointsReward: number;
  rarity: string;
  unlockedAt?: string;
  isNew?: boolean;
}

export interface WeeklyChallengeProgress {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  pointsReward: number;
  currentProgress: number;
  goalValue: number;
  isCompleted: boolean;
  endDate: string;
}

export interface DailyActivity {
  activityType: string;
  pointsEarned: number;
  activityDate: string;
}

/**
 * GamificationManager - Gerencia todos os aspectos de gamificação
 * Pontos, levels, streaks, achievements, e desafios semanais
 */
export class GamificationManager {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(supabase: SupabaseClient, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  /**
   * Inicializar gamificação para novo usuário
   */
  async initializeUser(): Promise<void> {
    const { error } = await this.supabase
      .from('user_gamification')
      .insert({
        user_id: this.userId,
        total_points: 0,
        current_level: 1,
        points_to_next_level: 100,
        current_streak: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    if (error && error.code !== '23505') {
      // Ignora erro de duplicata
      throw error;
    }
  }

  /**
   * Registrar atividade e atualizar pontos/streaks
   */
  async recordActivity(
    activityType: string,
    metadata: any = {}
  ): Promise<{
    pointsEarned: number;
    newAchievements: Achievement[];
    leveledUp: boolean;
  }> {
    const today = new Date().toISOString().split('T')[0];

    // Calcular pontos baseado no tipo de atividade
    const pointsMap: Record<string, number> = {
      check_in: 10,
      journal: 20,
      self_care: 15,
      community: 5,
    };

    const pointsEarned = pointsMap[activityType] || 5;

    // Registrar atividade
    await this.supabase.from('daily_activities').upsert({
      user_id: this.userId,
      activity_date: today,
      activity_type: activityType,
      points_earned: pointsEarned,
      metadata,
    });

    // Atualizar streak
    await this.updateStreak();

    // Atualizar pontos e nível
    const leveledUp = await this.addPoints(pointsEarned);

    // Atualizar contadores específicos
    await this.updateActivityCounters(activityType);

    // Verificar novas conquistas
    const newAchievements = await this.checkAchievements();

    // Atualizar progresso dos desafios
    await this.updateChallengeProgress(activityType);

    return {
      pointsEarned,
      newAchievements,
      leveledUp,
    };
  }

  /**
   * Atualizar streak
   */
  private async updateStreak(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { data: gamification } = await this.supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!gamification) return;

    const lastActivity = gamification.last_activity_date;

    let newStreak = gamification.current_streak;

    if (lastActivity === yesterday) {
      // Continua o streak
      newStreak += 1;
    } else if (lastActivity !== today) {
      // Quebrou o streak
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, gamification.longest_streak);

    await this.supabase
      .from('user_gamification')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId);
  }

  /**
   * Adicionar pontos e verificar level up
   */
  private async addPoints(points: number): Promise<boolean> {
    const { data: gamification } = await this.supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!gamification) return false;

    const newTotalPoints = gamification.total_points + points;
    let newLevel = gamification.current_level;
    let pointsToNextLevel = gamification.points_to_next_level;

    // Calcular level up (progressão exponencial suave)
    while (newTotalPoints >= this.getPointsForLevel(newLevel + 1)) {
      newLevel += 1;
    }

    pointsToNextLevel = this.getPointsForLevel(newLevel + 1) - newTotalPoints;
    const leveledUp = newLevel > gamification.current_level;

    await this.supabase
      .from('user_gamification')
      .update({
        total_points: newTotalPoints,
        current_level: newLevel,
        points_to_next_level: pointsToNextLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId);

    return leveledUp;
  }

  /**
   * Calcular pontos necessários para cada nível
   */
  private getPointsForLevel(level: number): number {
    // Progressão: 100, 250, 450, 700, 1000, 1350, 1750...
    return Math.floor(100 * level + 50 * Math.pow(level - 1, 1.5));
  }

  /**
   * Atualizar contadores de atividades
   */
  private async updateActivityCounters(activityType: string): Promise<void> {
    const counterMap: Record<string, string> = {
      check_in: 'total_check_ins',
      journal: 'total_journal_entries',
      self_care: 'total_self_care_activities',
      community: 'total_community_interactions',
    };

    const column = counterMap[activityType];
    if (!column) return;

    const { data: gamification } = await this.supabase
      .from('user_gamification')
      .select(column)
      .eq('user_id', this.userId)
      .single();

    if (!gamification) return;

    await this.supabase
      .from('user_gamification')
      .update({
        [column]: ((gamification as unknown as Record<string, number>)[column] || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', this.userId);
  }

  /**
   * Verificar e desbloquear conquistas
   */
  private async checkAchievements(): Promise<Achievement[]> {
    const { data: gamification } = await this.supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!gamification) return [];

    // Buscar todas as conquistas
    const { data: allAchievements } = await this.supabase.from('achievements').select('*').eq('is_active', true);

    if (!allAchievements) return [];

    // Buscar conquistas já desbloqueadas
    const { data: unlockedAchievements } = await this.supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', this.userId);

    const unlockedIds = new Set(unlockedAchievements?.map((a) => a.achievement_id) || []);

    const newAchievements: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      // Verificar critérios
      switch (achievement.requirement_type) {
        case 'streak':
          shouldUnlock = gamification.current_streak >= achievement.requirement_value;
          break;
        case 'count':
          const countMap: Record<string, number> = {
            self_care: gamification.total_self_care_activities,
            community: gamification.total_community_interactions,
            journal: gamification.total_journal_entries,
            check_in: gamification.total_check_ins,
          };
          const count = countMap[achievement.category] || 0;
          shouldUnlock = count >= achievement.requirement_value;
          break;
      }

      if (shouldUnlock) {
        // Desbloquear conquista
        await this.supabase.from('user_achievements').insert({
          user_id: this.userId,
          achievement_id: achievement.id,
          is_new: true,
        });

        // Adicionar pontos da conquista
        await this.addPoints(achievement.points_reward);

        newAchievements.push({
          id: achievement.id,
          code: achievement.code,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          icon: achievement.icon,
          pointsReward: achievement.points_reward,
          rarity: achievement.rarity,
          isNew: true,
        });
      }
    }

    return newAchievements;
  }

  /**
   * Atualizar progresso dos desafios
   */
  private async updateChallengeProgress(activityType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Buscar desafios ativos
    const { data: challenges } = await this.supabase
      .from('weekly_challenges')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today);

    if (!challenges) return;

    for (const challenge of challenges) {
      // Verificar se o tipo de atividade corresponde ao desafio
      if (challenge.category !== activityType) continue;

      // Buscar ou criar progresso
      const { data: progress } = await this.supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', this.userId)
        .eq('challenge_id', challenge.id)
        .single();

      if (progress) {
        const newProgress = progress.current_progress + 1;
        const isCompleted = newProgress >= challenge.goal_value;

        await this.supabase
          .from('user_challenge_progress')
          .update({
            current_progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', progress.id);

        // Se completou, dar pontos
        if (isCompleted && !progress.is_completed) {
          await this.addPoints(challenge.points_reward);
        }
      } else {
        // Criar novo progresso
        await this.supabase.from('user_challenge_progress').insert({
          user_id: this.userId,
          challenge_id: challenge.id,
          current_progress: 1,
          is_completed: 1 >= challenge.goal_value,
          completed_at: 1 >= challenge.goal_value ? new Date().toISOString() : null,
        });
      }
    }
  }

  /**
   * Buscar estatísticas completas
   */
  async getStats(): Promise<GamificationStats> {
    // Buscar dados de gamificação
    const { data: gamification } = await this.supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (!gamification) {
      await this.initializeUser();
      return this.getStats();
    }

    // Buscar conquistas desbloqueadas
    const { data: userAchievements } = await this.supabase
      .from('user_achievements')
      .select(
        `
        *,
        achievement:achievements(*)
      `
      )
      .eq('user_id', this.userId)
      .order('unlocked_at', { ascending: false });

    const achievements =
      userAchievements?.map((ua) => ({
        id: ua.achievement.id,
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        category: ua.achievement.category,
        icon: ua.achievement.icon,
        pointsReward: ua.achievement.points_reward,
        rarity: ua.achievement.rarity,
        unlockedAt: ua.unlocked_at,
        isNew: ua.is_new,
      })) || [];

    // Buscar atividades recentes
    const { data: activities } = await this.supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', this.userId)
      .order('activity_date', { ascending: false })
      .limit(7);

    const recentActivities =
      activities?.map((a) => ({
        activityType: a.activity_type,
        pointsEarned: a.points_earned,
        activityDate: a.activity_date,
      })) || [];

    // Buscar desafios ativos
    const today = new Date().toISOString().split('T')[0];
    const { data: challenges } = await this.supabase
      .from('weekly_challenges')
      .select(
        `
        *,
        progress:user_challenge_progress(*)
      `
      )
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today);

    const activeChallenges =
      challenges?.map((c) => {
        const progress = c.progress?.find((p: any) => p.user_id === this.userId);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          icon: c.icon,
          pointsReward: c.points_reward,
          currentProgress: progress?.current_progress || 0,
          goalValue: c.goal_value,
          isCompleted: progress?.is_completed || false,
          endDate: c.end_date,
        };
      }) || [];

    return {
      totalPoints: gamification.total_points,
      currentLevel: gamification.current_level,
      pointsToNextLevel: gamification.points_to_next_level,
      currentStreak: gamification.current_streak,
      longestStreak: gamification.longest_streak,
      achievements,
      recentActivities,
      activeChallenges,
    };
  }

  /**
   * Marcar conquistas como vistas
   */
  async markAchievementsAsSeen(achievementIds: string[]): Promise<void> {
    await this.supabase
      .from('user_achievements')
      .update({ is_new: false })
      .eq('user_id', this.userId)
      .in('achievement_id', achievementIds);
  }
}
