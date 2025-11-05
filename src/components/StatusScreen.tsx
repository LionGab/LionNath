/**
 * StatusScreen - Tela de status mostrando configurações e saúde do app
 * Usado para debug e validação
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography, borderRadius } from '@/theme/colors';
import { SUPABASE_CONFIG, API_CONFIG } from '@/config/api';
import { FEATURE_FLAGS } from '@/config/features';
import { supabase } from '@/services/supabase';

interface StatusItemProps {
  label: string;
  status: 'success' | 'error' | 'warning';
  value?: string;
  test?: () => Promise<boolean>;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status, value, test }) => {
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<boolean | null>(null);

  const handleTest = async () => {
    if (!test) return;
    setTesting(true);
    try {
      const result = await test();
      setTestResult(result);
    } catch {
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  };

  const statusConfig = {
    success: { icon: 'check-circle', color: colors.success || '#10b981' },
    error: { icon: 'alert-circle', color: colors.destructive },
    warning: { icon: 'alert', color: colors.warning || '#f59e0b' },
  }[status];

  return (
    <View style={styles.statusItem}>
      <View style={styles.statusHeader}>
        <View style={styles.statusIconContainer}>
          <Icon name={statusConfig.icon} size={24} color={statusConfig.color} />
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>{label}</Text>
          {value && (
            <Text style={styles.statusValue} numberOfLines={1}>
              {value}
            </Text>
          )}
        </View>
        {test && (
          <TouchableOpacity
            onPress={handleTest}
            disabled={testing}
            style={styles.testButton}
            accessible={true}
            accessibilityLabel={`Testar ${label}`}
            accessibilityRole="button"
          >
            <Icon name={testing ? 'loading' : 'play-circle'} size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      {testResult !== null && (
        <View style={styles.testResult}>
          <Text style={[styles.testResultText, testResult && styles.testResultSuccess]}>
            {testResult ? '✅ Teste passou' : '❌ Teste falhou'}
          </Text>
        </View>
      )}
    </View>
  );
};

export const StatusScreen: React.FC = () => {
  const [supabaseConnected, setSupabaseConnected] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Testar conexão Supabase
    const testSupabase = async () => {
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        setSupabaseConnected(!error);
      } catch {
        setSupabaseConnected(false);
      }
    };
    testSupabase();
  }, []);

  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('user_profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Icon name="information" size={48} color={colors.primary} />
          <Text style={styles.title}>Status do Sistema</Text>
          <Text style={styles.subtitle}>Verificação de configurações e saúde do app</Text>
        </View>

        {/* Configurações Supabase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Supabase</Text>
          <StatusItem
            label="URL do Supabase"
            status={SUPABASE_CONFIG.URL ? 'success' : 'error'}
            value={SUPABASE_CONFIG.URL || 'Não configurada'}
          />
          <StatusItem
            label="Chave Anônima"
            status={SUPABASE_CONFIG.ANON_KEY ? 'success' : 'error'}
            value={SUPABASE_CONFIG.ANON_KEY ? `${SUPABASE_CONFIG.ANON_KEY.substring(0, 20)}...` : 'Não configurada'}
          />
          <StatusItem
            label="Conexão com Banco"
            status={supabaseConnected === true ? 'success' : supabaseConnected === false ? 'error' : 'warning'}
            value={supabaseConnected === null ? 'Testando...' : supabaseConnected ? 'Conectado' : 'Falha na conexão'}
            test={testSupabaseConnection}
          />
        </View>

        {/* Configurações de IA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 APIs de IA</Text>
          <StatusItem
            label="Google Gemini API"
            status={API_CONFIG.GEMINI_API_KEY ? 'success' : 'error'}
            value={API_CONFIG.GEMINI_API_KEY ? `${API_CONFIG.GEMINI_API_KEY.substring(0, 15)}...` : 'Não configurada'}
          />
          <StatusItem
            label="Claude API"
            status={API_CONFIG.CLAUDE_API_KEY ? 'success' : 'warning'}
            value={API_CONFIG.CLAUDE_API_KEY ? 'Configurada' : 'Opcional'}
          />
          <StatusItem
            label="OpenAI API"
            status={API_CONFIG.OPENAI_API_KEY ? 'success' : 'warning'}
            value={API_CONFIG.OPENAI_API_KEY ? 'Configurada' : 'Opcional'}
          />
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚩 Feature Flags</Text>
          <StatusItem
            label="IA Habilitada"
            status={FEATURE_FLAGS.ENABLE_AI_FEATURES ? 'success' : 'warning'}
            value={FEATURE_FLAGS.ENABLE_AI_FEATURES ? 'Sim' : 'Não'}
          />
          <StatusItem
            label="Gamificação"
            status={FEATURE_FLAGS.ENABLE_GAMIFICATION ? 'success' : 'warning'}
            value={FEATURE_FLAGS.ENABLE_GAMIFICATION ? 'Habilitada' : 'Desabilitada'}
          />
          <StatusItem
            label="Analytics"
            status={FEATURE_FLAGS.ENABLE_ANALYTICS ? 'success' : 'warning'}
            value={FEATURE_FLAGS.ENABLE_ANALYTICS ? 'Habilitado' : 'Desabilitado'}
          />
        </View>

        {/* Ambiente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Ambiente</Text>
          <StatusItem
            label="Modo"
            status={process.env.NODE_ENV === 'development' ? 'success' : 'warning'}
            value={process.env.NODE_ENV || 'Não definido'}
          />
          <StatusItem
            label="App URL"
            status={process.env.EXPO_PUBLIC_APP_URL ? 'success' : 'warning'}
            value={process.env.EXPO_PUBLIC_APP_URL || 'Não configurada'}
          />
        </View>

        {/* Resumo */}
        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <Icon name="check-all" size={32} color={colors.primary} />
            <Text style={styles.summaryTitle}>Resumo</Text>
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryText}>
              ✅ Supabase: {SUPABASE_CONFIG.URL ? 'Configurado' : 'Não configurado'}
            </Text>
            <Text style={styles.summaryText}>
              ✅ Gemini API: {API_CONFIG.GEMINI_API_KEY ? 'Configurada' : 'Não configurada'}
            </Text>
            <Text style={styles.summaryText}>
              ✅ Conexão: {supabaseConnected === true ? 'Ativa' : supabaseConnected === false ? 'Falha' : 'Verificando...'}
            </Text>
            <Text style={styles.summaryText}>
              🚩 IA Features: {FEATURE_FLAGS.ENABLE_AI_FEATURES ? 'Habilitadas' : 'Desabilitadas'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  statusItem: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...colors.shadows?.light?.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
  },
  statusValue: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.mono,
  },
  testButton: {
    padding: spacing.xs,
  },
  testResult: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  testResultText: {
    fontSize: typography.sizes.sm,
    color: colors.destructive,
    fontFamily: typography.fontFamily.sans,
  },
  testResultSuccess: {
    color: colors.success || '#10b981',
  },
  summary: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
  },
  summaryContent: {
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.sans,
  },
});
