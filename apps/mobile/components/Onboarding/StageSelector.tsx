import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Chip } from '@/ui';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export type StageValue = 'gestante' | 'puerperio_0_3' | 'puerperio_3_12' | 'puerperio_12_plus' | 'outra';

const tokens = nossaMaternidadeDesignTokens;

const STAGE_OPTIONS: Array<{ value: StageValue; label: string }> = [
  { value: 'gestante', label: 'Gestante' },
  { value: 'puerperio_0_3', label: 'Puerpério 0–3 meses' },
  { value: 'puerperio_3_12', label: '3–12 meses' },
  { value: 'puerperio_12_plus', label: '12 meses ou mais' },
  { value: 'outra', label: 'Outra realidade' },
];

interface StageSelectorProps {
  selectedStage?: StageValue;
  onSelectStage: (stage: StageValue) => void;
}

export function StageSelector({ selectedStage, onSelectStage }: StageSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qual o seu estágio maternal?</Text>
      <View style={styles.grid}>
        {STAGE_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            selected={selectedStage === value}
            onPress={() => onSelectStage(value)}
            accessibilityLabel={`Selecionar estágio ${label}`}
            testID={`stage_chip_${value}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing.sm,
  } as ViewStyle,
  title: {
    fontSize: tokens.typography.bodyLg.fontSize,
    lineHeight: tokens.typography.bodyLg.lineHeight,
    fontWeight: tokens.typography.headlineSm.fontWeight,
    color: tokens.palette.text,
  } as TextStyle,
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  } as ViewStyle,
});
