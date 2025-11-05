/**
 * ThemeSelector Component
 *
 * Componente para selecionar tema (Bubblegum ou v0.app)
 *
 * @example
 * <ThemeSelector />
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeName } from '@/theme/themes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ThemeSelector: React.FC = () => {
  const { themeName, setThemeName, theme } = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;

  const themes: Array<{ name: ThemeName; label: string; description: string }> = [
    {
      name: 'bubblegum',
      label: 'Bubblegum',
      description: 'Tema rosa acolhedor (padrão)',
    },
    {
      name: 'v0-app',
      label: 'v0.app',
      description: 'Tema moderno do v0.app',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolher Tema</Text>
      <Text style={styles.subtitle}>Selecione o tema visual do app</Text>

      <ScrollView style={styles.themesList}>
        {themes.map((theme) => {
          const isSelected = themeName === theme.name;
          return (
            <TouchableOpacity
              key={theme.name}
              style={[
                styles.themeCard,
                {
                  backgroundColor: (isSelected ? colors.primary : colors.card) as string,
                  borderColor: (isSelected ? colors.primary : colors.border) as string,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setThemeName(theme.name)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar tema ${theme.label}`}
              accessibilityHint={theme.description}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.themeContent}>
                <View style={styles.themeInfo}>
                  <Text
                    style={[
                      styles.themeLabel,
                      {
                        color: isSelected ? colors.primaryForeground : colors.foreground,
                        fontWeight: isSelected ? typography.weights.bold : typography.weights.medium,
                      },
                    ]}
                  >
                    {theme.label}
                  </Text>
                  <Text
                    style={[
                      styles.themeDescription,
                      {
                        color: isSelected ? colors.primaryForeground : colors.mutedForeground,
                      },
                    ]}
                  >
                    {theme.description}
                  </Text>
                </View>

                {isSelected && (
                  <Icon name="check-circle" size={24} color={colors.primaryForeground} style={styles.checkIcon} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
  },
  themesList: {
    flex: 1,
  },
  themeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
  },
  themeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: 12,
  },
});
