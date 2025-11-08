/**
 * ThemeShowcase Component
 * Demonstra todas as cores, espaçamentos e estilos do tema Bubblegum
 * Use para visualizar e testar o design system
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export const ThemeShowcase = () => {
  return (
    <ScrollView style={styles.container}>
      {/* CORES PRIMÁRIAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cores Primárias</Text>

        <ColorBox name="Primary" hex={colors.primary} color={colors.primary} />
        <ColorBox name="Primary Foreground" hex={colors.primaryForeground} color={colors.primaryForeground} />
        <ColorBox name="Secondary" hex={colors.secondary} color={colors.secondary} />
        <ColorBox name="Accent" hex={colors.accent} color={colors.accent} />
      </View>

      {/* BACKGROUNDS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backgrounds</Text>

        <ColorBox name="Background" hex={colors.background} color={colors.background} />
        <ColorBox name="Card" hex={colors.card} color={colors.card} />
        <ColorBox name="Input" hex={colors.input} color={colors.input} />
      </View>

      {/* TIPOGRAFIA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tamanhos de Fonte</Text>

        <Text style={{ fontSize: typography.sizes.xs, color: colors.foreground, marginBottom: spacing.sm }}>
          Extra Small (12px)
        </Text>
        <Text style={{ fontSize: typography.sizes.sm, color: colors.foreground, marginBottom: spacing.sm }}>
          Small (14px)
        </Text>
        <Text style={{ fontSize: typography.sizes.base, color: colors.foreground, marginBottom: spacing.sm }}>
          Base (16px)
        </Text>
        <Text style={{ fontSize: typography.sizes.lg, color: colors.foreground, marginBottom: spacing.sm }}>
          Large (18px)
        </Text>
        <Text style={{ fontSize: typography.sizes.xl, color: colors.foreground, marginBottom: spacing.sm }}>
          Extra Large (20px)
        </Text>
        <Text style={{ fontSize: typography.sizes['2xl'], color: colors.foreground, marginBottom: spacing.sm }}>
          2XL (24px)
        </Text>
        <Text style={{ fontSize: typography.sizes['3xl'], color: colors.foreground }}>3XL (28px)</Text>
      </View>

      {/* ESPAÇAMENTO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Espaçamento (Spacing)</Text>

        <SpacingBox label="XS (4px)" size={spacing.xs} />
        <SpacingBox label="SM (8px)" size={spacing.sm} />
        <SpacingBox label="MD (12px)" size={spacing.md} />
        <SpacingBox label="LG (16px)" size={spacing.lg} />
        <SpacingBox label="XL (20px)" size={spacing.xl} />
        <SpacingBox label="2XL (24px)" size={spacing['2xl']} />
        <SpacingBox label="3XL (32px)" size={spacing['3xl']} />
      </View>

      {/* SOMBRAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sombras</Text>

        <View style={[styles.shadowBox, shadows.light.xs]}>
          <Text style={styles.shadowText}>Sombra XS</Text>
        </View>
        <View style={[styles.shadowBox, shadows.light.sm]}>
          <Text style={styles.shadowText}>Sombra SM</Text>
        </View>
        <View style={[styles.shadowBox, shadows.light.md]}>
          <Text style={styles.shadowText}>Sombra MD</Text>
        </View>
        <View style={[styles.shadowBox, shadows.light.lg]}>
          <Text style={styles.shadowText}>Sombra LG</Text>
        </View>
      </View>

      {/* BORDER RADIUS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Border Radius</Text>

        <BorderRadiusBox label="SM (4px)" radius={borderRadius.sm} />
        <BorderRadiusBox label="MD (8px)" radius={borderRadius.md} />
        <BorderRadiusBox label="LG (12px)" radius={borderRadius.lg} />
        <BorderRadiusBox label="XL (16px)" radius={borderRadius.xl} />
        <BorderRadiusBox label="Full (circular)" radius={borderRadius.full} />
      </View>

      {/* COMPONENTES EXEMPLO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Componentes Exemplo</Text>

        {/* Primary Button */}
        <TouchableOpacity style={styles.buttonPrimary}>
          <Text style={styles.buttonPrimaryText}>Botão Primary</Text>
        </TouchableOpacity>

        {/* Secondary Button */}
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Botão Secondary</Text>
        </TouchableOpacity>

        {/* Card */}
        <View style={styles.cardExample}>
          <Text style={styles.cardTitle}>Exemplo de Card</Text>
          <Text style={styles.cardText}>
            Este é um exemplo de card usando o tema Bubblegum com as sombras e espaçamento corretos.
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

/**
 * Componentes Auxiliares
 */

interface ColorBoxProps {
  name: string;
  hex: string;
  color: string;
}

const ColorBox: React.FC<ColorBoxProps> = ({ name, hex, color }) => (
  <View style={styles.colorBoxContainer}>
    <View style={[styles.colorBoxColor, { backgroundColor: color }]} />
    <View style={styles.colorBoxText}>
      <Text style={styles.colorBoxName}>{name}</Text>
      <Text style={styles.colorBoxHex}>{hex}</Text>
    </View>
  </View>
);

interface SpacingBoxProps {
  label: string;
  size: number;
}

const SpacingBox: React.FC<SpacingBoxProps> = ({ label, size }) => (
  <View style={styles.spacingBoxContainer}>
    <View style={[styles.spacingBoxVisual, { width: size * 8, height: 20 }]} />
    <Text style={styles.spacingBoxLabel}>{label}</Text>
  </View>
);

interface BorderRadiusBoxProps {
  label: string;
  radius: number;
}

const BorderRadiusBox: React.FC<BorderRadiusBoxProps> = ({ label, radius }) => (
  <View style={styles.borderRadiusContainer}>
    <View style={[styles.borderRadiusBox, { borderRadius: radius }]} />
    <Text style={styles.borderRadiusLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.light.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },

  // Color Boxes
  colorBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  colorBoxColor: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.lg,
    ...shadows.light.sm,
  },
  colorBoxText: {
    flex: 1,
  },
  colorBoxName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
  },
  colorBoxHex: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },

  // Spacing Boxes
  spacingBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  spacingBoxVisual: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    marginRight: spacing.lg,
  },
  spacingBoxLabel: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
  },

  // Border Radius Boxes
  borderRadiusContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  borderRadiusBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
    ...shadows.light.sm,
  },
  borderRadiusLabel: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
  },

  // Shadow Boxes
  shadowBox: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  shadowText: {
    color: colors.foreground,
    fontWeight: typography.weights.bold,
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.light.md,
  },
  buttonPrimaryText: {
    color: colors.primaryForeground,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.light.sm,
  },
  buttonSecondaryText: {
    color: colors.secondaryForeground,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },

  // Card
  cardExample: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  cardText: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
});

export default ThemeShowcase;
