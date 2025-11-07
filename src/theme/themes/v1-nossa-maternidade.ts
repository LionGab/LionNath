/**
 * Design System v1 - Nossa Maternidade
 *
 * Focado em acolhimento emocional, segurança e cuidado
 * Paleta baseada em tons pastéis suaves, tipografia de alta legibilidade
 * e espaçamentos generosos seguindo base 4.
 */

export type NeutralStop = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface NeutralPalette {
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

export interface CorePalette {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  neutrals: NeutralPalette;
  feedback: {
    success: string;
    successContrast: string;
    warning: string;
    warningContrast: string;
    danger: string;
    dangerContrast: string;
    info: string;
    infoContrast: string;
  };
  overlays: {
    scrim: string;
    subtle: string;
  };
}

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: '300' | '400' | '500' | '600' | '700';
  letterSpacing?: number;
}

export interface TypographyScale {
  display: TypographyToken;
  headlineXL: TypographyToken;
  headlineLg: TypographyToken;
  headlineMd: TypographyToken;
  headlineSm: TypographyToken;
  bodyLg: TypographyToken;
  bodyMd: TypographyToken;
  bodySm: TypographyToken;
  caption: TypographyToken;
  button: TypographyToken;
  overline: TypographyToken;
}

export type SpacingToken =
  | 'none'
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';

export type RadiusToken = 'sm' | 'md' | 'lg' | 'full';

export interface SpacingScale extends Record<SpacingToken, number> {}

export interface RadiusScale extends Record<RadiusToken, number> {}

export interface ShadowLevel {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  boxShadow: string;
}

export interface ShadowScale {
  soft: ShadowLevel;
  medium: ShadowLevel;
}

export interface NossaMaternidadeDesignTokens {
  palette: CorePalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  radius: RadiusScale;
  shadow: ShadowScale;
}

const neutralPalette: NeutralPalette = {
  100: '#FFF4EC',
  200: '#FFE5D6',
  300: '#FBD7C3',
  400: '#F5C9B0',
  500: '#E9B59A',
  600: '#CF9C82',
  700: '#B2816A',
  800: '#916555',
  900: '#6A4640',
};

const typographyScale: TypographyScale = {
  display: {
    fontSize: 40,
    lineHeight: 52,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  headlineXL: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headlineLg: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
  },
  headlineSm: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
};

const spacingScale: SpacingScale = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
};

const radiusScale: RadiusScale = {
  sm: 12,
  md: 18,
  lg: 24,
  full: 999,
};

const shadowScale: ShadowScale = {
  soft: {
    shadowColor: 'rgba(106, 84, 80, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
    boxShadow: '0px 12px 24px -12px rgba(106, 84, 80, 0.30)',
  },
  medium: {
    shadowColor: 'rgba(106, 84, 80, 0.18)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 14,
    boxShadow: '0px 18px 48px -16px rgba(106, 84, 80, 0.35)',
  },
};

export const nossaMaternidadeDesignTokens: NossaMaternidadeDesignTokens = {
  palette: {
    primary: '#6DA9E4',
    accent: '#FF8BA3',
    background: '#FFF8F3',
    surface: '#DCEBFA',
    text: '#6A5450',
    neutrals: neutralPalette,
    feedback: {
      success: '#6EBFA2',
      successContrast: '#10352A',
      warning: '#F5C26B',
      warningContrast: '#3C280F',
      danger: '#E57878',
      dangerContrast: '#3C1010',
      info: '#73B5E6',
      infoContrast: '#0F2F46',
    },
    overlays: {
      scrim: 'rgba(16, 12, 11, 0.45)',
      subtle: 'rgba(109, 169, 228, 0.08)',
    },
  },
  typography: typographyScale,
  spacing: spacingScale,
  radius: radiusScale,
  shadow: shadowScale,
};

export function getNeutralTone(stop: NeutralStop): string {
  return nossaMaternidadeDesignTokens.palette.neutrals[stop];
}

export function getSpacing(token: SpacingToken): number {
  return nossaMaternidadeDesignTokens.spacing[token];
}

export function getRadius(token: RadiusToken): number {
  return nossaMaternidadeDesignTokens.radius[token];
}


