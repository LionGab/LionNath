import type { UserProfileLocal } from '@/types';
import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Logo } from '@/components/Logo';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme/colors';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfileLocal | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const result = await UserRepository.getById(userId);
      if (result.data) {
        setProfile(result.data);
      } else {
        // Fallback: buscar do AsyncStorage
        const profileJson = await AsyncStorage.getItem('userProfile');
        if (profileJson) {
          setProfile(JSON.parse(profileJson));
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar perfil', { error });
      // Fallback: buscar do AsyncStorage
      const profileJson = await AsyncStorage.getItem('userProfile');
      if (profileJson) {
        setProfile(JSON.parse(profileJson));
      }
    }
  }, []);

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('onboarded');
          await AsyncStorage.removeItem('userProfile');
          await AsyncStorage.removeItem('userId');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' as never }],
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.logoContainer}>
            <Logo size={100} />
          </View>
          <Text style={styles.userName}>{profile?.name || 'Usuário'}</Text>
          <Text style={styles.userType}>
            {profile?.type === 'gestante' && '👶 Gestante'}
            {profile?.type === 'mae' && '🤱 Mãe'}
            {profile?.type === 'tentante' && '💕 Tentante'}
          </Text>
          {profile?.pregnancy_week && <Text style={styles.weekInfo}>Semana {profile.pregnancy_week}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Dias no app</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.daily_interactions || 0}</Text>
            <Text style={styles.statLabel}>Interações hoje</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile?.subscription_tier === 'premium' ? '⭐' : '🆓'}</Text>
            <Text style={styles.statLabel}>Plano</Text>
          </View>
        </View>

        {/* Preferences */}
        {profile?.preferences && profile.preferences.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Interesses</Text>
            {profile.preferences.map((pref: string, index: number) => (
              <View key={index} style={styles.preferenceItem}>
                <Text style={styles.preferenceText}>{pref}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Configurações</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>🔔 Notificações</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>🎨 Aparência</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>🔒 Privacidade</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>❓ Ajuda & Suporte</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.aboutText}>
            Nossa Maternidade é sua assistente virtual personalizada para gravidez e maternidade. 💕
          </Text>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  avatarSection: {
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing['2xl'],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.light.md,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  userName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  userType: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  weekInfo: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.bold as any,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    justifyContent: 'space-around',
    ...shadows.light.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.mutedForeground,
  },
  sectionCard: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.light.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  preferenceItem: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preferenceText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
  },
  settingArrow: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  aboutText: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  logoutButton: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: colors.destructive,
    ...shadows.light.sm,
  },
  logoutText: {
    fontSize: typography.sizes.base,
    color: colors.destructive,
    fontWeight: typography.weights.bold as any,
  },
});
