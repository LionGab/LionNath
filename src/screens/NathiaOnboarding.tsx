/**
 * NathiaOnboarding - Tela de integração inicial
 *
 * Features:
 * - Fluxo completo de onboarding (4-6 perguntas)
 * - Exibe Starter Pack ao final
 * - Salva contexto no NathiaContext
 * - Navega para chat após conclusão
 * - Design acolhedor e guiado
 *
 * Wireframe:
 * ┌─────────────────────────┐
 * │  Bem-vinda à NAT-IA 💙  │ ← Header
 * ├─────────────────────────┤
 * │                         │
 * │  [OnboardingFlow]       │ ← Component
 * │   - Progress bar        │
 * │   - Question            │
 * │   - Options             │
 * │   - Navigation          │
 * │                         │
 * └─────────────────────────┘
 *
 * OU (após completar):
 *
 * ┌─────────────────────────┐
 * │   Starter Pack para     │
 * │        Você 🎉          │
 * ├─────────────────────────┤
 * │                         │
 * │ Círculos Recomendados:  │
 * │  [Card] [Card] [Card]   │
 * │                         │
 * │ Hábitos Sugeridos:      │
 * │  [Card] [Card]          │
 * │                         │
 * │ Conteúdos para Você:    │
 * │  [Card] [Card] [Card]   │
 * │                         │
 * │  [Começar a conversar]  │ ← CTA
 * └─────────────────────────┘
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { OnboardingFlow } from '@/components/nathia/OnboardingFlow';
import { RecommendationCard } from '@/components/nathia/RecommendationCard';
import { useNathiaContext } from '@/contexts/NathiaContext';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { NathiaOnboardingResponse, NathiaRecommendation } from '@/services/nathia-client';

export default function NathiaOnboarding() {
  const navigation = useNavigation();
  const { context, updateContext, completeOnboarding } = useNathiaContext();

  const [starterPack, setStarterPack] = useState<NathiaOnboardingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

  const handleOnboardingComplete = async (response: NathiaOnboardingResponse) => {
    setStarterPack(response);
    await completeOnboarding();
  };

  const handleStartChat = async () => {
    setLoading(true);

    // Aguarda um pouco para dar sensação de transição
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Navega para chat
    // @ts-ignore
    navigation.navigate('NathiaChat');
  };

  const handleRecommendationPress = (recommendation: NathiaRecommendation) => {
    // Navega para o item específico
    console.log('Recommendation pressed:', recommendation);

    // TODO: Implementar navegação específica
  };

  // Ainda no fluxo de onboarding
  if (!starterPack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              {
                fontSize: typography.headlineXL.fontSize,
                fontWeight: typography.headlineXL.fontWeight,
                color: palette.text,
              },
            ]}
          >
            Bem-vinda à NAT-IA 💙
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              {
                fontSize: typography.bodyLg.fontSize,
                color: palette.neutrals[600],
                marginTop: spacing.xs,
              },
            ]}
          >
            Vamos conhecer você melhor para personalizar sua experiência
          </Text>
        </View>

        <OnboardingFlow userId={context?.userId || ''} onComplete={handleOnboardingComplete} />
      </SafeAreaView>
    );
  }

  // Exibindo Starter Pack
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.starterPackHeader}>
          <Text
            style={[
              styles.starterPackTitle,
              {
                fontSize: typography.headlineXL.fontSize,
                fontWeight: typography.headlineXL.fontWeight,
                color: palette.text,
              },
            ]}
          >
            Starter Pack para Você 🎉
          </Text>
          <Text
            style={[
              styles.starterPackSubtitle,
              {
                fontSize: typography.bodyLg.fontSize,
                color: palette.neutrals[600],
                marginTop: spacing.xs,
              },
            ]}
          >
            {starterPack.welcomeMessage}
          </Text>
        </View>

        {/* Circles */}
        {starterPack.starterPack.circles.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: typography.headlineMd.fontSize,
                  fontWeight: typography.headlineMd.fontWeight,
                  color: palette.text,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              Círculos Recomendados
            </Text>

            {starterPack.starterPack.circles.map((circle) => (
              <RecommendationCard
                key={circle.id}
                recommendation={{
                  type: 'circle',
                  id: circle.id,
                  title: circle.name,
                  description: '',
                  reason: circle.reason,
                  priority: 1,
                }}
                onPress={handleRecommendationPress}
              />
            ))}
          </View>
        )}

        {/* Habits */}
        {starterPack.starterPack.habits.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: typography.headlineMd.fontSize,
                  fontWeight: typography.headlineMd.fontWeight,
                  color: palette.text,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              Hábitos Sugeridos
            </Text>

            {starterPack.starterPack.habits.map((habit) => (
              <RecommendationCard
                key={habit.id}
                recommendation={{
                  type: 'habit',
                  id: habit.id,
                  title: habit.name,
                  description: '',
                  reason: habit.reason,
                  priority: 1,
                }}
                onPress={handleRecommendationPress}
              />
            ))}
          </View>
        )}

        {/* Content */}
        {starterPack.starterPack.content.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  fontSize: typography.headlineMd.fontSize,
                  fontWeight: typography.headlineMd.fontWeight,
                  color: palette.text,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              Conteúdos para Você
            </Text>

            {starterPack.starterPack.content.map((content) => (
              <RecommendationCard
                key={content.id}
                recommendation={{
                  type: 'content',
                  id: content.id,
                  title: content.title,
                  description: '',
                  reason: content.reason,
                  priority: 1,
                }}
                onPress={handleRecommendationPress}
              />
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={[styles.ctaContainer, { paddingHorizontal: spacing.md }]}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: palette.primary,
                borderRadius: radius.md,
              },
            ]}
            onPress={handleStartChat}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.ctaText,
                  {
                    fontSize: typography.button.fontSize,
                    fontWeight: typography.button.fontWeight,
                  },
                ]}
              >
                Começar a conversar com NAT-IA
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  starterPackHeader: {
    padding: 20,
    alignItems: 'center',
  },
  starterPackTitle: {
    textAlign: 'center',
  },
  starterPackSubtitle: {
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  ctaContainer: {
    marginTop: 32,
  },
  ctaButton: {
    padding: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
  },
});
