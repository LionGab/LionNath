/**
 * Claymorphism Theme - Azul Dark Mobile-First
 * Adaptado para React Native com sombras progressivas
 *
 * Estratégia: Usar múltiplas sombras para simular inset shadows
 * (React Native não suporta inset shadows nativamente)
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';

// Paleta Azul Dark (extraída do código reaproveitado)
export const claymorphismColors = {
  // Backgrounds
  bgBase: '#1f1f2e', // Fundo escuro base
  bgCard: '#2d3142', // Cards escuros

  // Accents Azul
  accentPrimary: '#818cf8', // Azul Indigo (primary)
  accentLight: '#a5b4fc', // Azul claro
  accentDark: '#6366f1', // Azul escuro

  // Text
  textPrimary: '#d1d5db', // Texto claro
  textMuted: '#9ca3af', // Texto secundário
  textDark: '#6b7280', // Texto escuro

  // Borders
  border: '#374151', // Bordas escuras
  borderLight: '#4b5563', // Bordas claras
};

/**
 * Sombras Claymorphism para React Native
 * Progressão mobile → tablet → desktop
 * Usa boxShadow para web (react-native-web) e elevation para Android
 */
export const clayShadows = {
  // Mobile (base) - sombras menores
  xs: Platform.select({
    web: {
      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)',
    } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  sm: Platform.select({
    web: {
      boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
    } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  }),
  md: Platform.select({
    web: {
      boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.25)',
    } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  }),
  lg: Platform.select({
    web: {
      boxShadow: '12px 12px 24px rgba(0, 0, 0, 0.3)',
    } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 12, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
  }),
  xl: Platform.select({
    web: {
      boxShadow: '16px 16px 32px rgba(0, 0, 0, 0.35)',
    } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 16, height: 16 },
      shadowOpacity: 0.35,
      shadowRadius: 32,
      elevation: 16,
    },
  }),
};

/**
 * Efeito Claymorphism completo
 * Combina sombras externas + gradiente interno para simular inset shadows
 */
export const clayStyle = {
  // Base clay card
  card: {
    backgroundColor: claymorphismColors.bgCard,
    borderRadius: 16,
    ...clayShadows.md,
    // Simular inset shadow com gradiente (se disponível)
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.1)',
  } as ViewStyle,

  // Clay card hover (desktop) - não aplicável em mobile
  cardHover: {
    ...clayShadows.lg,
    transform: [{ translateY: -2 }],
  } as ViewStyle,

  // Clay card active
  cardActive: {
    ...clayShadows.sm,
    transform: [{ translateY: 1 }],
  } as ViewStyle,

  // Clay button
  button: {
    backgroundColor: claymorphismColors.accentPrimary,
    borderRadius: 12,
    ...clayShadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  } as ViewStyle,

  // Clay button active
  buttonActive: {
    ...clayShadows.xs,
    transform: [{ translateY: 1 }],
  } as ViewStyle,
};

/**
 * Border radius progressivo (mobile → tablet → desktop)
 */
export const clayBorderRadius = {
  sm: 8, // Mobile
  md: 12, // Mobile/Tablet
  lg: 16, // Tablet
  xl: 20, // Tablet/Desktop
  '2xl': 24, // Desktop
};

/**
 * Padding progressivo (mobile-first)
 */
export const clayPadding = {
  xs: 8, // Mobile compact
  sm: 12, // Mobile
  md: 16, // Mobile/Tablet
  lg: 20, // Tablet
  xl: 24, // Tablet/Desktop
  '2xl': 32, // Desktop
};

/**
 * Helper para criar estilo claymorphism responsivo
 */
export function createClayStyle(size: 'sm' | 'md' | 'lg' = 'md', variant: 'card' | 'button' = 'card'): ViewStyle {
  const baseStyle = variant === 'card' ? clayStyle.card : clayStyle.button;
  const shadow = clayShadows[size];

  return {
    ...baseStyle,
    ...shadow,
    borderRadius: clayBorderRadius[size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'],
    padding: clayPadding[size],
  };
}

/**
 * Helper para criar gradiente interno (simular inset shadow)
 * Nota: React Native precisa de biblioteca de gradiente (ex: expo-linear-gradient)
 */
export const clayGradient = {
  // Gradiente interno claro (top)
  lightInset: {
    colors: ['rgba(129, 140, 248, 0.1)', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Gradiente interno escuro (bottom)
  darkInset: {
    colors: ['transparent', 'rgba(0, 0, 0, 0.2)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

/**
 * Tema completo Claymorphism
 */
export const claymorphismTheme = {
  colors: claymorphismColors,
  shadows: clayShadows,
  style: clayStyle,
  borderRadius: clayBorderRadius,
  padding: clayPadding,
  gradient: clayGradient,
};

export default claymorphismTheme;
