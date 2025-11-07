import {
  palette,
  light,
  dark,
  overlay,
  gradients,
  colors as semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from './designSystemV1';

interface ColorModes {
  light: typeof light;
  dark: typeof dark;
}

interface ColorsTokenGroup {
  palette: typeof palette;
  modes: ColorModes;
  overlay: typeof overlay;
  gradients: typeof gradients;
  semantic: typeof semanticColors;
}

interface DesignTokens {
  colors: ColorsTokenGroup;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof borderRadius;
  shadows: typeof shadows;
}

export const tokens: DesignTokens = {
  colors: {
    palette,
    modes: {
      light,
      dark,
    },
    overlay,
    gradients,
    semantic: semanticColors,
  },
  typography,
  spacing,
  radii: borderRadius,
  shadows,
};

export type Tokens = typeof tokens;

