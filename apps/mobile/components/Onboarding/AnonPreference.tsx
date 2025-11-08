import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Toggle } from '@/ui';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

interface AnonPreferenceProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const tokens = nossaMaternidadeDesignTokens;

export function AnonPreference({ value, onChange }: AnonPreferenceProps) {
  return (
    <Toggle
      label="Publicar anonimamente por padrão"
      description="Seu nome não será exibido nas conversas e comunidades."
      value={value}
      onValueChange={onChange}
      accessibilityLabel="Alternar publicação anônima por padrão"
      accessibilityHint="Ative para que suas interações sejam anônimas automaticamente"
      testID="anon_toggle"
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: tokens.spacing.lg,
  } as ViewStyle,
});


