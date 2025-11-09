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
    100: '#E4F0FC',
    200: '#CBE1F7',
    300: '#A7CDF2',
    400: '#7FBBEB',
    500: nossaMaternidadeDesignTokens.palette.primary,
    600: '#4E8BC3',
    700: '#3A6E9D',
    800: '#2C5276',
    900: '#203A54',
  },
  accent: {
    100: '#FFE4EA',
    200: '#FFC9D6',
    300: '#FF9FB8',
    400: '#FF8BA3',
    500: nossaMaternidadeDesignTokens.palette.accent,
    600: '#E55479',
    700: '#C43F64',
    800: '#9D2E4D',
    900: '#711F38',
  },
  surface: {
    100: '#F7FBFF',
    200: '#EEF4FF',
    300: '#E2EEFF',
    400: '#D6E6FF',
    500: nossaMaternidadeDesignTokens.palette.surface,
    600: '#B4C7DA',
    700: '#8AA1B4',
    800: '#637A8C',
    900: '#435362',
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
  background: nossaMaternidadeDesignTokens.palette.background,
  foreground: nossaMaternidadeDesignTokens.palette.text,
  card: '#FFFFFF',
  cardForeground: nossaMaternidadeDesignTokens.palette.text,
  popover: '#FFFFFF',
  popoverForeground: nossaMaternidadeDesignTokens.palette.text,
  primary: nossaMaternidadeDesignTokens.palette.primary,
  primaryForeground: '#FFFFFF',
  secondary: palette.surface[500],
  secondaryForeground: '#325A7D',
  accent: palette.accent[400],
  accentForeground: '#451822',
  muted: palette.surface[100],
  mutedForeground: '#7B6A63',
  destructive: palette.support.danger[500],
  destructiveForeground: '#FFFFFF',
  border: palette.surface[300],
  input: palette.surface[200],
  ring: palette.primary[400],
  sidebar: palette.surface[200],
  sidebarForeground: '#325A7D',
  sidebarPrimary: palette.primary[500],
  sidebarPrimaryForeground: '#FFFFFF',
  sidebarAccent: palette.accent[200],
  sidebarAccentForeground: '#5C1F30',
  sidebarBorder: palette.surface[400],
  sidebarRing: palette.primary[300],
  chart1: palette.primary[500],
  chart2: palette.accent[300],
  chart3: palette.surface[600],
  chart4: palette.support.success[400],
  chart5: palette.support.warning[300],
};

const dark: ThemeColors = {
  background: '#2A1F1C',
  foreground: palette.neutral[100],
  card: '#352826',
  cardForeground: palette.neutral[100],
  popover: '#352826',
  popoverForeground: palette.neutral[100],
  primary: palette.primary[300],
  primaryForeground: '#112236',
  secondary: '#3E4555',
  secondaryForeground: palette.neutral[100],
  accent: palette.accent[300],
  accentForeground: '#411724',
  muted: '#3C2F2B',
  mutedForeground: '#D3C0B9',
  destructive: palette.support.danger[400],
  destructiveForeground: '#401615',
  border: '#4B3B35',
  input: '#3C2F2B',
  ring: palette.primary[300],
  sidebar: '#352826',
  sidebarForeground: palette.neutral[100],
  sidebarPrimary: palette.primary[400],
  sidebarPrimaryForeground: '#112236',
  sidebarAccent: palette.accent[200],
  sidebarAccentForeground: '#40171F',
  sidebarBorder: '#4B3B35',
  sidebarRing: palette.primary[400],
  chart1: palette.primary[300],
  chart2: palette.accent[400],
  chart3: '#7DA2C4',
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
