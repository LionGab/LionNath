/**
 * Sistema de Temas Múltiplos
 *
 * Suporta múltiplos temas: Bubblegum (padrão) e v0.app
 */

import { light as bubblegumLight, dark as bubblegumDark } from '..';
import type { ThemeColors } from '../designSystemV1';
export type { ThemeColors } from '../designSystemV1';
import { v0AppLight, v0AppDark } from './v0-app';

export type ThemeName = 'bubblegum' | 'v0-app';

/**
 * Map de temas disponíveis
 */
export const themes = {
  bubblegum: {
    light: bubblegumLight as ThemeColors,
    dark: bubblegumDark as ThemeColors,
  },
  'v0-app': {
    light: v0AppLight as ThemeColors,
    dark: v0AppDark as ThemeColors,
  },
} as const;

/**
 * Obter tema por nome e modo
 */
export const getThemeColors = (themeName: ThemeName = 'bubblegum', isDark: boolean = false): ThemeColors => {
  return themes[themeName][isDark ? 'dark' : 'light'];
};

/**
 * Tema padrão (Bubblegum)
 */
export const defaultTheme: ThemeName = 'bubblegum';
