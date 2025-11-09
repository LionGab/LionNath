import { Platform } from 'react-native';
import { nossaMaternidadeDesignTokens, getNeutralTone, getSpacing, getRadius } from './themes/v1-nossa-maternidade';

type ColorStop = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface ColorScale {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface SupportPalette {
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  info: ColorScale;
}

export interface ThemePalette {
  primary: ColorScale;
  accent: ColorScale;
  surface: ColorScale;
  neutral: ColorScale;
  support: SupportPalette;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface OverlayTokens {
  primary: string;
  primaryBorder: string;
  primaryBorderLight: string;
  neutral: string;
  white: string;
  black: string;
}

export interface GradientTokens {
  sunrise: [string, string];
  embrace: [string, string];
  ocean: [string, string];
  blossom: [string, string];
  calm: [string, string];
  pink: [string, string, string]; // Gradiente rosa suave de 3 cores
  pinkSoft: [string, string, string]; // Gradiente rosa suave para cards
  blue: [string, string];
  purple: [string, string];
  green: [string, string];
  amber: [string, string];
}

export interface ShadowToken {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  boxShadow?: string;
}

export interface ThemeShadows {
  xs: ShadowToken;
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
}

export interface Shadows {
  light: ThemeShadows;
  dark: ThemeShadows;
}

export interface TypographyScale {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  weights: {
    light: '300';
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    extrabold: '800';
  };
  sizes: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  scale: typeof nossaMaternidadeDesignTokens.typography;
}

export interface SpacingTokens {
  none: 0;
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
}

export interface RadiusTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

const palette: ThemePalette = {
  primary: {
    100: '#FCE4EC', // Rosa muito claro
    200: '#F8BBD0', // Rosa claro
    300: '#F48FB1', // Primary do Stitch (base)
    400: '#F06292', // Rosa médio
    500: nossaMaternidadeDesignTokens.palette.primary,
    600: '#EC407A', // Rosa escuro
    700: '#D81B60', // Rosa mais escuro
    800: '#C2185B', // Rosa muito escuro
    900: '#AD1457', // Rosa mais escuro ainda
  },
  accent: {
    100: '#FCE4EC', // Mesma escala do primary (rosa)
    200: '#F8BBD0',
    300: '#F48FB1', // Mesma cor do primary
    400: '#F48FB1',
    500: nossaMaternidadeDesignTokens.palette.accent,
    600: '#EC407A',
    700: '#D81B60',
    800: '#C2185B',
    900: '#AD1457',
  },
  surface: {
    100: '#E0F7FA', // Background light do Stitch (base)
    200: '#B2EBF2', // Azul claro
    300: '#80DEEA', // Azul médio claro
    400: '#4DD0E1', // Azul médio
    500: nossaMaternidadeDesignTokens.palette.surface,
    600: '#00BCD4', // Azul escuro
    700: '#00ACC1', // Azul mais escuro
    800: '#0097A7', // Azul muito escuro
    900: '#00838F', // Azul mais escuro ainda
  },
  neutral: {
    100: nossaMaternidadeDesignTokens.palette.neutrals[100],
    200: nossaMaternidadeDesignTokens.palette.neutrals[200],
    300: nossaMaternidadeDesignTokens.palette.neutrals[300],
    400: nossaMaternidadeDesignTokens.palette.neutrals[400],
    500: nossaMaternidadeDesignTokens.palette.neutrals[500],
    600: nossaMaternidadeDesignTokens.palette.neutrals[600],
    700: nossaMaternidadeDesignTokens.palette.neutrals[700],
    800: nossaMaternidadeDesignTokens.palette.neutrals[800],
    900: nossaMaternidadeDesignTokens.palette.neutrals[900],
  },
  support: {
    success: {
      100: '#E5F6E9',
      200: '#C9ECD5',
      300: '#9CDCBA',
      400: '#6CC8A1',
      500: nossaMaternidadeDesignTokens.palette.feedback.success,
      600: '#2B9B77',
      700: '#1E7F64',
      800: '#146551',
      900: '#0C4B3D',
    },
    warning: {
      100: '#FFF4E1',
      200: '#FFE3B8',
      300: '#FFCD8A',
      400: '#FFB35C',
      500: nossaMaternidadeDesignTokens.palette.feedback.warning,
      600: '#E07D20',
      700: '#B85D15',
      800: '#8F4310',
      900: '#6A2E0A',
    },
    danger: {
      100: '#FFE8E7',
      200: '#FFCBC9',
      300: '#FF9E9C',
      400: '#FF807F',
      500: nossaMaternidadeDesignTokens.palette.feedback.danger,
      600: '#D95755',
      700: '#B14341',
      800: '#873230',
      900: '#62231F',
    },
    info: {
      100: '#E7F6FF',
      200: '#CBEBFF',
      300: '#9FD9FF',
      400: '#73C4FF',
      500: nossaMaternidadeDesignTokens.palette.feedback.info,
      600: '#2B90E0',
      700: '#1D73B8',
      800: '#135591',
      900: '#0C3B69',
    },
  },
};

const light: ThemeColors = {
  background: '#E0F7FA', // Background light do Stitch
  foreground: '#37474F', // Text main do Stitch
  card: '#FFFFFF',
  cardForeground: '#37474F',
  popover: '#FFFFFF',
  popoverForeground: '#37474F',
  primary: '#F48FB1', // Primary rosa do Stitch
  primaryForeground: '#FFFFFF',
  secondary: '#B0BEC5', // Border color do Stitch
  secondaryForeground: '#37474F',
  accent: '#F48FB1', // Mesma cor primária
  accentForeground: '#FFFFFF',
  muted: '#E0F7FA', // Background light
  mutedForeground: '#78909C', // Placeholder color do Stitch
  destructive: palette.support.danger[500],
  destructiveForeground: '#FFFFFF',
  border: '#B0BEC5', // Border color do Stitch
  input: '#FFFFFF', // Input background branco com opacidade
  ring: '#F48FB1', // Primary para ring
  sidebar: '#E0F7FA',
  sidebarForeground: '#37474F',
  sidebarPrimary: '#F48FB1',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#F48FB1',
  sidebarAccentForeground: '#FFFFFF',
  sidebarBorder: '#B0BEC5',
  sidebarRing: '#F48FB1',
  chart1: '#F48FB1',
  chart2: '#73B5E6',
  chart3: '#6EBFA2',
  chart4: palette.support.success[400],
  chart5: palette.support.warning[300],
};

const dark: ThemeColors = {
  background: '#111c21', // Background dark do Stitch
  foreground: '#FFFFFF', // Texto branco no dark
  card: '#1E2A2F', // Card escuro
  cardForeground: '#FFFFFF',
  popover: '#1E2A2F',
  popoverForeground: '#FFFFFF',
  primary: '#F48FB1', // Mesma cor primária no dark
  primaryForeground: '#FFFFFF',
  secondary: '#3E4555',
  secondaryForeground: '#FFFFFF',
  accent: '#F48FB1',
  accentForeground: '#FFFFFF',
  muted: '#1E2A2F',
  mutedForeground: '#78909C', // Placeholder color mantido
  destructive: palette.support.danger[400],
  destructiveForeground: '#FFFFFF',
  border: '#3E4555', // Border mais escuro no dark
  input: '#1E2A2F',
  ring: '#F48FB1',
  sidebar: '#111c21',
  sidebarForeground: '#FFFFFF',
  sidebarPrimary: '#F48FB1',
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: '#F48FB1',
  sidebarAccentForeground: '#FFFFFF',
  sidebarBorder: '#3E4555',
  sidebarRing: '#F48FB1',
  chart1: '#F48FB1',
  chart2: '#73B5E6',
  chart3: '#6EBFA2',
  chart4: palette.support.success[400],
  chart5: palette.support.warning[400],
};

const overlay: OverlayTokens = {
  primary: 'rgba(109, 169, 228, 0.12)',
  primaryBorder: 'rgba(109, 169, 228, 0.24)',
  primaryBorderLight: 'rgba(109, 169, 228, 0.18)',
  neutral: 'rgba(74, 52, 46, 0.08)',
  white: 'rgba(255, 255, 255, 0.06)',
  black: 'rgba(0, 0, 0, 0.5)',
};

const gradients: GradientTokens = {
  sunrise: ['#FF8BA3', '#6DA9E4'],
  embrace: ['#FFF8F3', '#DCEBFA'],
  ocean: ['#4E8BC3', '#203A54'],
  blossom: ['#FFE4EA', '#FF8BA3'],
  calm: ['#E5F6E9', '#6CC8A1'],
  pink: ['#FFB6C1', '#FFC0CB', '#FFE4E1'], // Gradiente rosa suave de 3 cores
  pinkSoft: ['#FFB6C1', '#FFC0CB', '#FFE4E1'], // Gradiente rosa suave para cards
  blue: ['#7FBBEB', '#325A7D'],
  purple: ['#9D2E4D', '#4E8BC3'],
  green: ['#6CC8A1', '#2B9B77'],
  amber: ['#FFCD8A', '#FF9A33'],
};

export const colors = {
  ...light,
  overlay,
  gradients,
  palette,
};

const LIGHT_SHADOW_COLOR = 'rgba(32, 58, 84, 0.18)';
const DARK_SHADOW_COLOR = 'rgba(17, 34, 54, 0.55)';

const shadows: Shadows = {
  light: {
    xs: Platform.select({
      web: {
        boxShadow: '0px 4px 10px -6px rgba(32, 58, 84, 0.25)',
      },
      default: {
        shadowColor: LIGHT_SHADOW_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
    sm: Platform.select({
      web: {
        boxShadow: nossaMaternidadeDesignTokens.shadow.soft.boxShadow,
      },
      default: {
        ...nossaMaternidadeDesignTokens.shadow.soft,
      },
    }),
    md: Platform.select({
      web: {
        boxShadow: nossaMaternidadeDesignTokens.shadow.medium.boxShadow,
      },
      default: {
        ...nossaMaternidadeDesignTokens.shadow.medium,
      },
    }),
    lg: Platform.select({
      web: {
        boxShadow: '0px 28px 64px -18px rgba(32, 58, 84, 0.30)',
      },
      default: {
        shadowColor: 'rgba(32, 58, 84, 0.22)',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 18,
      },
    }),
  },
  dark: {
    xs: Platform.select({
      web: {
        boxShadow: '0px 4px 12px -6px rgba(17, 34, 54, 0.45)',
      },
      default: {
        shadowColor: DARK_SHADOW_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
    sm: Platform.select({
      web: {
        boxShadow: '0px 14px 28px -12px rgba(17, 34, 54, 0.45)',
      },
      default: {
        shadowColor: 'rgba(17, 34, 54, 0.35)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 10,
      },
    }),
    md: Platform.select({
      web: {
        boxShadow: '0px 24px 48px -18px rgba(17, 34, 54, 0.55)',
      },
      default: {
        shadowColor: DARK_SHADOW_COLOR,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 1,
        shadowRadius: 32,
        elevation: 16,
      },
    }),
    lg: Platform.select({
      web: {
        boxShadow: '0px 36px 72px -24px rgba(17, 34, 54, 0.65)',
      },
      default: {
        shadowColor: 'rgba(17, 34, 54, 0.65)',
        shadowOffset: { width: 0, height: 24 },
        shadowOpacity: 1,
        shadowRadius: 48,
        elevation: 24,
      },
    }),
  },
};

const typography: TypographyScale = {
  fontFamily: {
    sans: 'System',
    serif: 'Times New Roman',
    mono: 'Courier',
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  sizes: {
    xs: nossaMaternidadeDesignTokens.typography.caption.fontSize,
    sm: nossaMaternidadeDesignTokens.typography.bodySm.fontSize,
    base: nossaMaternidadeDesignTokens.typography.bodyMd.fontSize,
    lg: nossaMaternidadeDesignTokens.typography.bodyLg.fontSize,
    xl: nossaMaternidadeDesignTokens.typography.headlineSm.fontSize,
    '2xl': nossaMaternidadeDesignTokens.typography.headlineMd.fontSize,
    '3xl': nossaMaternidadeDesignTokens.typography.headlineLg.fontSize,
    '4xl': nossaMaternidadeDesignTokens.typography.headlineXL.fontSize,
    '5xl': nossaMaternidadeDesignTokens.typography.display.fontSize,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.65,
  },
  scale: nossaMaternidadeDesignTokens.typography,
};

const spacing: SpacingTokens = {
  none: 0,
  xxs: getSpacing('xxs'),
  xs: getSpacing('xs'),
  sm: getSpacing('sm'),
  md: getSpacing('md'),
  lg: getSpacing('lg'),
  xl: getSpacing('xl'),
  '2xl': getSpacing('2xl'),
  '3xl': getSpacing('3xl'),
  '4xl': getSpacing('4xl'),
  '5xl': getSpacing('5xl'),
};

const borderRadius: RadiusTokens = {
  sm: getRadius('sm'),
  md: getRadius('md'),
  lg: getRadius('lg'),
  xl: getRadius('lg') + 8,
  full: getRadius('full'),
};

export function getTheme(isDark: boolean): ThemeColors {
  return isDark ? dark : light;
}

export function getTone(stop: ColorStop): string {
  return getNeutralTone(stop);
}

export { palette, light, dark, overlay, gradients, shadows, typography, spacing, borderRadius };

export const designTokens = nossaMaternidadeDesignTokens;

export default {
  palette,
  colors,
  light,
  dark,
  overlay,
  gradients,
  shadows,
  typography,
  spacing,
  borderRadius,
};
