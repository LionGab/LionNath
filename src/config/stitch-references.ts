/**
 * Stitch Design References Configuration
 * 
 * Este arquivo centraliza as referências de design do projeto Stitch
 * para fácil aplicação no nosso Design System.
 * 
 * URL do projeto: https://stitch.withgoogle.com/projects/11277703543515991022
 */

export interface StitchColorPalette {
  primary: string;
  primaryVariant?: string;
  secondary: string;
  secondaryVariant?: string;
  background: string;
  surface: string;
  error: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
}

export interface StitchTypography {
  fontFamily: {
    primary: string;
    secondary?: string;
  };
  scale: {
    display: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
    body1: number;
    body2: number;
    button: number;
    caption: number;
    overline: number;
  };
  weights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface StitchSpacing {
  base: number; // Base unit (geralmente 4 ou 8)
  scale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
}

export interface StitchDesignTokens {
  colors: StitchColorPalette;
  typography: StitchTypography;
  spacing: StitchSpacing;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  elevation: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
}

/**
 * PLACEHOLDER - Aguardando referências do Stitch
 * 
 * Para aplicar as referências:
 * 1. Preencha os valores abaixo com as informações do projeto Stitch
 * 2. Execute o script de migração: npm run apply-stitch-references
 * 3. Os valores serão aplicados automaticamente ao design system
 */
export const stitchReferences: Partial<StitchDesignTokens> = {
  // TODO: Preencher com valores do Stitch
  colors: {
    primary: '#FF6C8D', // Exemplo - substituir com valor real
    secondary: '#6DA9E4', // Exemplo - substituir com valor real
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
  },
  typography: {
    fontFamily: {
      primary: 'Google Sans', // Stitch geralmente usa Google Sans
    },
    scale: {
      display: 40,
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      h5: 18,
      h6: 16,
      body1: 16,
      body2: 14,
      button: 16,
      caption: 12,
      overline: 10,
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    base: 4, // Material Design usa base 4
    scale: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 40,
      '3xl': 48,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  elevation: {
    level0: 0,
    level1: 1,
    level2: 2,
    level3: 4,
    level4: 8,
    level5: 16,
  },
};

/**
 * Helper para aplicar referências do Stitch ao nosso design system
 */
export function applyStitchReferences(references: StitchDesignTokens): void {
  // Esta função será implementada quando tivermos as referências completas
  console.log('Aplicando referências do Stitch:', references);
}

/**
 * Valida se as referências do Stitch estão completas
 */
export function validateStitchReferences(): boolean {
  const refs = stitchReferences;
  return !!(
    refs.colors &&
    refs.typography &&
    refs.spacing &&
    refs.borderRadius &&
    refs.elevation
  );
}
