// Design System v1 - Tokens exportáveis para React Native + NativeWind
// Mantém paridade com src/theme/themes/v1-nossa-maternidade.ts e inclui atômicos prontos

import { nossaMaternidadeDesignTokens } from '../themes/v1-nossa-maternidade';

const { palette, typography, spacing, radius, shadow } = nossaMaternidadeDesignTokens;

export const nossaMaternidadeTokens = {
  palette,
  typography,
  spacing,
  radius,
  shadow,
  nativewind: {
    colors: {
      primary: palette.primary,
      accent: palette.accent,
      background: palette.background,
      surface: palette.surface,
      text: palette.text,
      success: palette.feedback.success,
      warning: palette.feedback.warning,
      danger: palette.feedback.danger,
      info: palette.feedback.info,
      overlay: palette.overlays.scrim,
      ...Object.fromEntries(
        Object.entries(palette.neutrals).map(([stop, value]) => [`neutral-${stop}`, value])
      ),
    },
    spacing,
    borderRadius: radius,
    boxShadow: {
      soft: shadow.soft.boxShadow,
      medium: shadow.medium.boxShadow,
    },
    elevation: {
      soft: shadow.soft.elevation,
      medium: shadow.medium.elevation,
    },
  },
};

export function getNativeWindColor(token) {
  return nossaMaternidadeTokens.nativewind.colors[token];
}

export function getNativeWindSpacing(token) {
  return nossaMaternidadeTokens.nativewind.spacing[token];
}

export function getNativeWindRadius(token) {
  return nossaMaternidadeTokens.nativewind.borderRadius[token];
}


