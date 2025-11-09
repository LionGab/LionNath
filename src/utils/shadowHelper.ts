/**
 * Shadow Helper - Converte propriedades shadow* para boxShadow
 *
 * Helper para resolver o warning: "shadow*" style props are deprecated. Use "boxShadow"
 * IMPORTANTE: Na web, usa APENAS boxShadow. Em iOS/Android nativo, usa shadow* + elevation
 *
 * @example
 * const shadowStyle = createShadow({
 *   shadowColor: '#000',
 *   shadowOffset: { width: 0, height: 2 },
 *   shadowOpacity: 0.25,
 *   shadowRadius: 3.84,
 *   elevation: 5,
 * });
 */

import { Platform, ViewStyle } from 'react-native';

export interface ShadowProps {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Converte rgba/hex para rgba com opacity aplicada
 */
function getRgbaColor(color: string, opacity: number): string {
  // Se já é rgba, extrair valores e aplicar opacity
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const [, r, g, b, existingOpacity] = rgbaMatch;
    const finalOpacity = existingOpacity ? parseFloat(existingOpacity) * opacity : opacity;
    return `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
  }

  // Se é hex, converter para rgba
  const hexMatch = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback
  return color;
}

/**
 * Converte propriedades shadow* para boxShadow (web) ou mantém shadow* (native)
 * CRÍTICO: Na web, retorna APENAS boxShadow, sem shadow* properties
 */
export function createShadow(props: ShadowProps): ViewStyle {
  const {
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 0 },
    shadowOpacity = 1,
    shadowRadius = 0,
    elevation,
  } = props;

  const rgbaColor = getRgbaColor(shadowColor, shadowOpacity);
  const boxShadowValue = `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${rgbaColor}`;

  // Na web, retornar APENAS boxShadow (sem shadow* properties)
  if (Platform.OS === 'web') {
    return {
      boxShadow: boxShadowValue,
    } as ViewStyle;
  }

  // Em iOS/Android nativo, usar shadow* + elevation
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    ...(elevation !== undefined && { elevation }),
  } as ViewStyle;
}

/**
 * Helper para criar sombras pré-definidas
 */
export const shadowHelpers = {
  sm: (color: string = '#000', opacity: number = 0.1) =>
    createShadow({
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: opacity,
      shadowRadius: 4,
      elevation: 2,
    }),
  md: (color: string = '#000', opacity: number = 0.15) =>
    createShadow({
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: opacity,
      shadowRadius: 8,
      elevation: 4,
    }),
  lg: (color: string = '#000', opacity: number = 0.2) =>
    createShadow({
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: opacity,
      shadowRadius: 16,
      elevation: 8,
    }),
  xl: (color: string = '#000', opacity: number = 0.25) =>
    createShadow({
      shadowColor: color,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: opacity,
      shadowRadius: 24,
      elevation: 12,
    }),
};
