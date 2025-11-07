import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logo } from '@/components/Logo';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

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

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profileJson = await AsyncStorage.getItem('userProfile');
    if (profileJson) {
      setProfile(JSON.parse(profileJson));
    }
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Em Breve', `A funcionalidade "${feature}" estará disponível em breve! ✨`);
  };

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
            routes: [{ name: 'Onboarding' }],
          } as any);
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
          <View style={styles.avatarContainer}>
            <Image source={require('@/assets/images/nat2.png')} style={styles.avatarImage} resizeMode="cover" />
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
            <View style={styles.statIconContainer}>
              <LinearGradient
                colors={[BLUE_THEME.primaryBlue, BLUE_THEME.lightBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconGradient}
              >
                <Text style={styles.statEmoji}>📅</Text>
              </LinearGradient>
            </View>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Dias no app</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconGradient}
              >
                <Text style={styles.statEmoji}>💬</Text>
              </LinearGradient>
            </View>
            <Text style={styles.statNumber}>{profile?.daily_interactions || 0}</Text>
            <Text style={styles.statLabel}>Interações hoje</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconGradient}
              >
                <Text style={styles.statEmoji}>{profile?.subscription_tier === 'premium' ? '⭐' : '🎁'}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.statNumber}>{profile?.subscription_tier === 'premium' ? 'Pro' : 'Free'}</Text>
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

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleComingSoon('Notificações')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Notificações - Em breve"
          >
            <Text style={styles.settingText}>🔔 Notificações</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleComingSoon('Aparência')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Aparência - Em breve"
          >
            <Text style={styles.settingText}>🎨 Aparência</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleComingSoon('Privacidade')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Privacidade - Em breve"
          >
            <Text style={styles.settingText}>🔒 Privacidade</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleComingSoon('Ajuda & Suporte')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Ajuda & Suporte - Em breve"
          >
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
  avatarContainer: {
    marginBottom: spacing.lg,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: BLUE_THEME.primaryBlue,
    ...shadows.light.lg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    justifyContent: 'space-evenly',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.15)',
    ...shadows.dark.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  statIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.dark.md,
  },
  statEmoji: {
    fontSize: 28,
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.sans,
    textAlign: 'center',
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

