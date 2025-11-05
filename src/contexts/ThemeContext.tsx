/**
 * Theme Context - Gerenciamento de tema (Light/Dark Mode + Múltiplos Temas)
 *
 * Context para gerenciar tema global, preferências do usuário e seleção de temas
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '@/constants/theme';
import { getThemeColors, ThemeName, defaultTheme } from '@/theme/themes';
import type { ThemeColors } from '@/theme/themes';
import { shadows, typography, spacing, borderRadius } from '@/theme/colors';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  themeName: ThemeName;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeName: (name: ThemeName) => void;
  theme: ReturnType<typeof getTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@nossa_maternidade:theme_mode';
const THEME_NAME_STORAGE_KEY = '@nossa_maternidade:theme_name';

/**
 * Helper para gerar escala de cores baseada em uma cor base
 */
function generateColorScale(baseColor: string, isDark: boolean) {
  // Simplificação: retorna escala baseada no tema
  // Em produção, você pode usar uma biblioteca como polished ou color2k
  const scales = {
    50: isDark ? '#1A1A1A' : '#FFF5F7',
    100: isDark ? '#2D2D2D' : '#FFE3E8',
    200: isDark ? '#404040' : '#FFCCD5',
    300: isDark ? '#535353' : '#FFB0C0',
    400: isDark ? '#666666' : '#FF94AB',
    500: baseColor,
    600: isDark ? '#999999' : '#E8899A',
    700: isDark ? '#B3B3B3' : '#D66D86',
    800: isDark ? '#CCCCCC' : '#C45172',
    900: isDark ? '#E6E6E6' : '#B2355E',
  };
  return scales;
}

/**
 * Helper para gerar escala de cores neutras
 */
function generateNeutralScale(isDark: boolean) {
  return {
    0: '#FFFFFF',
    50: isDark ? '#1A1A1A' : '#FAFAFA',
    100: isDark ? '#2D2D2D' : '#F5F5F5',
    200: isDark ? '#404040' : '#E5E5E5',
    300: isDark ? '#535353' : '#D4D4D4',
    400: isDark ? '#666666' : '#A3A3A3',
    500: isDark ? '#808080' : '#737373',
    600: isDark ? '#A3A3A3' : '#525252',
    700: isDark ? '#CCCCCC' : '#404040',
    800: isDark ? '#E6E6E6' : '#262626',
    900: isDark ? '#FFFFFF' : '#171717',
  };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultTheme);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Carregar preferências salvas
  useEffect(() => {
    loadThemePreferences();
  }, []);

  // Atualizar isDark baseado em themeMode
  useEffect(() => {
    const shouldBeDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
    setIsDark(shouldBeDark);
  }, [themeMode, systemColorScheme]);

  const loadThemePreferences = async () => {
    try {
      // Carregar theme mode (light/dark/auto)
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }

      // Carregar theme name (bubblegum/v0-app)
      const savedThemeName = await AsyncStorage.getItem(THEME_NAME_STORAGE_KEY);
      if (savedThemeName && ['bubblegum', 'v0-app'].includes(savedThemeName)) {
        setThemeNameState(savedThemeName as ThemeName);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências de tema:', error);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  }, []);

  const setThemeName = useCallback(async (name: ThemeName) => {
    try {
      setThemeNameState(name);
      await AsyncStorage.setItem(THEME_NAME_STORAGE_KEY, name);
    } catch (error) {
      console.error('Erro ao salvar nome do tema:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // Obter cores do tema atual
  const colors = getThemeColors(themeName, isDark);

  // Tema completo (compatibilidade com código existente)
  // Se o tema for bubblegum, usa getTheme, senão constrói do tema atual
  const baseTheme =
    themeName === 'bubblegum'
      ? getTheme(isDark)
      : {
          colors: {
            ...colors,
            // Adicionar escalas dinâmicas baseadas na cor primária
            primaryScale: generateColorScale(colors.primary, isDark),
            secondaryScale: generateColorScale(colors.secondary, isDark),
            neutral: generateNeutralScale(isDark),
            success: '#81C784',
            warning: '#FFB74D',
            error: colors.destructive,
            info: '#64B5F6',
            backgroundScale: {
              primary: colors.background,
              secondary: colors.card,
              tertiary: isDark ? '#1A1A1A' : '#FFFFFF',
            },
          },
          shadows: isDark ? shadows.dark : shadows.light,
          typography,
          spacing,
          borderRadius,
        };

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      // Garantir que todas as cores do tema atual estão presentes
      ...colors,
    },
    shadows: isDark ? shadows.dark : shadows.light,
    typography,
    spacing,
    borderRadius,
  };

  const value: ThemeContextType = {
    isDark,
    themeMode,
    themeName,
    colors,
    toggleTheme,
    setThemeMode,
    setThemeName,
    theme: theme as any,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
