/**
 * Onboarding Theme Tokens
 * Tokens específicos para componentes de onboarding
 * Baseado no Design System v1 Nossa Maternidade
 */

import { nossaMaternidadeDesignTokens } from './themes/v1-nossa-maternidade';

const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

export const onboardingTheme = {
  /**
   * Cores para estados de opções e botões
   */
  colors: {
    // Estado padrão
    optionDefault: {
      background: palette.surface,
      border: palette.neutrals[300],
      text: palette.text,
    },
    // Estado selecionado
    optionSelected: {
      background: `${palette.primary}15`, // 15% opacity
      border: palette.primary,
      text: palette.primary,
    },
    // Estado pressionado
    optionPressed: {
      background: `${palette.primary}25`, // 25% opacity
      border: palette.primary,
      text: palette.primary,
    },
    // Estado desabilitado
    optionDisabled: {
      background: palette.neutrals[100],
      border: palette.neutrals[200],
      text: palette.neutrals[400],
    },
    // Botão primário
    buttonPrimary: {
      background: palette.primary,
      text: '#FFFFFF',
    },
    // Botão secundário
    buttonSecondary: {
      background: 'transparent',
      border: palette.primary,
      text: palette.primary,
    },
    // Botão desabilitado
    buttonDisabled: {
      background: palette.neutrals[200],
      text: palette.neutrals[400],
    },
  },

  /**
   * Espaçamentos específicos para onboarding
   */
  spacing: {
    questionCardPadding: spacing.xl,
    optionGap: spacing.md,
    optionPadding: spacing.lg,
    buttonHeight: 56, // Mínimo 44px + padding para touch target
    buttonPadding: spacing.md,
    progressBarHeight: 4,
    progressBarMargin: spacing.lg,
  },

  /**
   * Tipografia para onboarding
   * Com fallbacks defensivos para evitar erros de undefined
   */
  typography: {
    question: {
      fontSize: typography.headlineMd?.fontSize || 24,
      fontWeight: typography.headlineMd?.fontWeight || '500',
      lineHeight: typography.headlineMd?.lineHeight || 32,
      color: palette.text,
    },
    option: {
      fontSize: typography.bodyLg?.fontSize || 18,
      fontWeight: typography.bodyMd?.fontWeight || '400',
      lineHeight: typography.bodyLg?.lineHeight || 26,
    },
    button: {
      fontSize: typography.button?.fontSize || 16,
      fontWeight: typography.button?.fontWeight || '600',
    },
    progress: {
      fontSize: typography.caption?.fontSize || 12,
      color: palette.neutrals[500],
    },
  },

  /**
   * Border radius
   */
  borderRadius: {
    option: radius.lg,
    button: radius.md,
    card: radius.lg, // Usando lg ao invés de xl (que não existe)
  },

  /**
   * Sombras (usando shadowHelper)
   */
  shadows: {
    card: {
      // Será aplicado via shadowHelper
      elevation: 2,
    },
    optionSelected: {
      elevation: 4,
    },
  },
} as const;

export type OnboardingTheme = typeof onboardingTheme;
