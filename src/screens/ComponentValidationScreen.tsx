/**
 * ComponentValidationScreen
 * Tela de validação visual dos componentes corrigidos pelo Agente 1
 * Demonstra todos os componentes com suas variantes e estados
 */

import { AnimatedCard } from '@/components/AnimatedCard';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EnhancedButton } from '@/components/EnhancedButton';
import { GradientView } from '@/components/GradientView';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { Text } from '@/components/Text';
import { borderRadius, colors, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Breakpoints para responsividade mobile-first
const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE, etc
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414; // iPhone 12, etc
const isLargeDevice = SCREEN_WIDTH >= 414; // iPhone Pro Max, etc

// Valores responsivos
const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

export default function ComponentValidationScreen() {
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header com Logo no Topo */}
        <View style={styles.header}>
          <View style={styles.logoHeader}>
            <Logo size={getResponsiveValue(60, 70, 80)} />
          </View>
          <Text variant="h2" style={styles.title}>
            Validação de Componentes
          </Text>
          <Text variant="caption" style={styles.subtitle}>
            Componentes corrigidos pelo Agente 1 - Frontend
          </Text>
        </View>

        {/* Navegação Rápida */}
        <View style={styles.navigationSection}>
          <Text variant="label" style={styles.navigationTitle}>
            Navegação Rápida
          </Text>
          <View style={styles.navigationButtons}>
            <Button
              variant="primary"
              size="sm"
              icon="home"
              accessibilityLabel="Navegar para Home"
              onPress={() => navigation.navigate('Home' as never)}
              style={styles.navButton}
            >
              Home
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="robot"
              accessibilityLabel="Navegar para Chat"
              onPress={() => navigation.navigate('Chat' as never)}
              style={styles.navButton}
            >
              Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="calendar"
              accessibilityLabel="Navegar para Plano Diário"
              onPress={() => navigation.navigate('DailyPlan' as never)}
              style={styles.navButton}
            >
              Plano
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon="account"
              accessibilityLabel="Navegar para Perfil"
              onPress={() => navigation.navigate('Profile' as never)}
              style={styles.navButton}
            >
              Perfil
            </Button>
          </View>
        </View>

        {/* Button Component - Todas as variantes */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            Button Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ Tipos explícitos, useMemo/useCallback aplicados, sem type assertions
          </Text>

          <View style={styles.componentGroup}>
            <Text variant="label" style={styles.groupTitle}>
              Variantes
            </Text>
            <View style={styles.buttonRow}>
              <Button
                variant="primary"
                accessibilityLabel="Botão Primary"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Primary
              </Button>
              <Button
                variant="secondary"
                accessibilityLabel="Botão Secondary"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Secondary
              </Button>
            </View>
            <View style={styles.buttonRow}>
              <Button
                variant="outline"
                accessibilityLabel="Botão Outline"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Outline
              </Button>
              <Button variant="ghost" accessibilityLabel="Botão Ghost" onPress={() => {}} style={styles.buttonCompact}>
                Ghost
              </Button>
            </View>
            <Button
              variant="destructive"
              accessibilityLabel="Botão Destructive"
              onPress={() => {}}
              style={styles.button}
            >
              Destructive
            </Button>
          </View>

          <View style={styles.componentGroup}>
            <Text variant="label" style={styles.groupTitle}>
              Tamanhos
            </Text>
            <View style={styles.buttonRow}>
              <Button
                variant="primary"
                size="sm"
                accessibilityLabel="Botão Small"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Small
              </Button>
              <Button
                variant="primary"
                size="md"
                accessibilityLabel="Botão Medium"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Medium
              </Button>
              <Button
                variant="primary"
                size="lg"
                accessibilityLabel="Botão Large"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Large
              </Button>
            </View>
          </View>

          <View style={styles.componentGroup}>
            <Text variant="label" style={styles.groupTitle}>
              Estados
            </Text>
            <View style={styles.buttonRow}>
              <Button
                variant="primary"
                loading
                accessibilityLabel="Botão Loading"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Loading
              </Button>
              <Button
                variant="primary"
                disabled
                accessibilityLabel="Botão Disabled"
                onPress={() => {}}
                style={styles.buttonCompact}
              >
                Disabled
              </Button>
            </View>
            <Button
              variant="primary"
              icon="check"
              accessibilityLabel="Botão com Ícone"
              onPress={() => {}}
              style={styles.button}
            >
              Com Ícone
            </Button>
          </View>
        </View>

        {/* Card Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            Card Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ useMemo aplicado, sem type assertions
          </Text>

          <View style={styles.componentGroup}>
            <Card variant="elevated" title="Card Elevated" style={styles.card}>
              <Text variant="body">Este é um card com elevação usando shadows do tema.</Text>
            </Card>
            <Card variant="outlined" title="Card Outlined" style={styles.card}>
              <Text variant="body">Este é um card com borda usando colors do tema.</Text>
            </Card>
            <Card variant="flat" title="Card Flat" style={styles.card}>
              <Text variant="body">Este é um card flat sem elevação.</Text>
            </Card>
            <Card
              variant="elevated"
              title="Card Clicável"
              subtitle="Toque para interagir"
              onPress={() => {}}
              style={styles.card}
            >
              <Text variant="body">Card com onPress - acessibilidade completa.</Text>
            </Card>
          </View>
        </View>

        {/* Input Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            Input Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ useCallback/useMemo aplicados, minHeight 48px (acessibilidade)
          </Text>

          <View style={styles.componentGroup}>
            <Input
              label="Input Normal"
              placeholder="Digite algo..."
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.input}
            />
            <Input
              label="Input com Ícone"
              placeholder="Com ícone"
              icon="email"
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.input}
            />
            <Input
              label="Input com Erro"
              placeholder="Campo com erro"
              error="Este campo é obrigatório"
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.input}
            />
            <Input
              label="Input com Helper Text"
              placeholder="Com texto de ajuda"
              helperText="Use pelo menos 8 caracteres"
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.input}
            />
          </View>
        </View>

        {/* Text Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            Text Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ useMemo aplicado, tipos explícitos
          </Text>

          <View style={styles.componentGroup}>
            <Text variant="h1" style={styles.textExample}>
              Heading 1
            </Text>
            <Text variant="h2" style={styles.textExample}>
              Heading 2
            </Text>
            <Text variant="h3" style={styles.textExample}>
              Heading 3
            </Text>
            <Text variant="label" style={styles.textExample}>
              Label
            </Text>
            <Text variant="body" style={styles.textExample}>
              Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
            <Text variant="caption" style={styles.textExample}>
              Caption text - Menor tamanho para informações secundárias
            </Text>
          </View>
        </View>

        {/* Badge Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            Badge Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ useMemo aplicado, sem type assertions
          </Text>

          <View style={styles.componentGroup}>
            <View style={styles.badgeRow}>
              <Badge variant="info" size="sm">
                Info
              </Badge>
              <Badge variant="success" size="sm">
                Success
              </Badge>
              <Badge variant="warning" size="sm">
                Warning
              </Badge>
              <Badge variant="error" size="sm">
                Error
              </Badge>
            </View>
            <View style={styles.badgeRow}>
              <Badge variant="info" size="md">
                Info Medium
              </Badge>
              <Badge variant="success" size="md">
                Success Medium
              </Badge>
              <Badge variant="warning" size="md">
                Warning Medium
              </Badge>
              <Badge variant="error" size="md">
                Error Medium
              </Badge>
            </View>
          </View>
        </View>

        {/* GradientView Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            GradientView Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ Tipos explícitos para LinearGradient
          </Text>

          <View style={styles.componentGroup}>
            <GradientView variant="sunset" style={styles.gradient}>
              <Text variant="body" style={{ color: colors.primaryForeground }}>
                Gradiente com tipos explícitos
              </Text>
            </GradientView>
          </View>
        </View>

        {/* EnhancedButton Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            EnhancedButton Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ useCallback/useMemo aplicados, imports corrigidos
          </Text>

          <View style={styles.componentGroup}>
            <EnhancedButton accessibilityLabel="Botão Enhanced" onPress={() => {}} style={styles.button}>
              Enhanced Button
            </EnhancedButton>
          </View>
        </View>

        {/* AnimatedCard Component */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            AnimatedCard Component
          </Text>
          <Text variant="caption" style={styles.sectionDescription}>
            ✅ useMemo aplicado para animatedStyle
          </Text>

          <View style={styles.componentGroup}>
            <AnimatedCard variant="elevated" title="Card Animado" animated style={styles.card}>
              <Text variant="body">Card com animação otimizada com useMemo.</Text>
            </AnimatedCard>
          </View>
        </View>

        {/* Acessibilidade Check */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>
            ✅ Checklist de Validação
          </Text>
          <View style={styles.checklist}>
            <Text variant="body" style={styles.checklistItem}>
              ✅ TypeScript: Tipos explícitos, sem `any` desnecessário
            </Text>
            <Text variant="body" style={styles.checklistItem}>
              ✅ Performance: useMemo e useCallback aplicados
            </Text>
            <Text variant="body" style={styles.checklistItem}>
              ✅ Acessibilidade: WCAG 2.1 AA (áreas de toque 44x44px+)
            </Text>
            <Text variant="body" style={styles.checklistItem}>
              ✅ Tema: Cores, spacing, typography do tema
            </Text>
            <Text variant="body" style={styles.checklistItem}>
              ✅ Estrutura: Imports organizados, JSDoc presente
            </Text>
          </View>
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: getResponsiveValue(spacing.sm, spacing.md, spacing.lg),
    paddingBottom: spacing['3xl'],
  },
  header: {
    padding: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    paddingTop: Platform.OS === 'ios' ? getResponsiveValue(spacing.lg, spacing.xl, spacing.xl) : spacing.lg,
    paddingBottom: spacing.lg,
    marginBottom: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginHorizontal: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    width: '100%',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    width: '100%',
    fontSize: getResponsiveValue(20, 22, 24),
    fontWeight: '700',
  },
  subtitle: {
    color: colors.mutedForeground,
    textAlign: 'center',
    width: '100%',
    fontSize: getResponsiveValue(12, 13, 14),
    paddingHorizontal: spacing.md,
  },
  navigationSection: {
    marginBottom: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
    padding: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  navigationTitle: {
    color: colors.foreground,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: getResponsiveValue(14, 15, 16),
  },
  navigationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: getResponsiveValue(spacing.xs, spacing.sm, spacing.sm),
  },
  navButton: {
    flex: isSmallDevice ? 1 : undefined,
    minWidth: getResponsiveValue(70, 80, 90),
    maxWidth: isSmallDevice ? undefined : getResponsiveValue(90, 100, 110),
    marginHorizontal: isSmallDevice ? spacing.xs : spacing.sm,
  },
  section: {
    marginBottom: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
    padding: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    color: colors.primary,
    marginBottom: spacing.xs,
    fontSize: getResponsiveValue(18, 20, 22),
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    fontSize: getResponsiveValue(11, 12, 13),
  },
  componentGroup: {
    marginBottom: spacing.md,
  },
  groupTitle: {
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontWeight: '600',
    fontSize: getResponsiveValue(13, 14, 15),
  },
  button: {
    marginBottom: spacing.sm,
  },
  buttonCompact: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    minWidth: isSmallDevice ? 0 : 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: isSmallDevice ? 'wrap' : 'nowrap',
  },
  card: {
    marginBottom: spacing.sm,
  },
  input: {
    marginBottom: spacing.sm,
  },
  textExample: {
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  gradient: {
    height: getResponsiveValue(60, 70, 80),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  checklist: {
    marginTop: spacing.md,
  },
  checklistItem: {
    marginBottom: spacing.xs,
    color: colors.foreground,
    fontSize: getResponsiveValue(13, 14, 15),
  },
});
