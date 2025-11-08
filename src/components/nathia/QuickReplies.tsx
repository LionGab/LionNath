/**
 * QuickReplies - Sugestões rápidas contextuais
 *
 * Features:
 * - Chips com sugestões baseadas em contexto
 * - Scroll horizontal para múltiplas opções
 * - Atualiza dinamicamente conforme conversa
 * - Design System v1 (chips)
 * - Acessibilidade completa
 *
 * @example
 * <QuickReplies
 *   suggestions={["Me sinto ansiosa", "Dúvida sobre amamentação"]}
 *   onSelect={handleQuickReply}
 * />
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AccessibilityInfo } from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function QuickReplies({ suggestions, onSelect, disabled = false }: QuickRepliesProps) {
  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const handleSelect = (suggestion: string) => {
    if (disabled) return;

    onSelect(suggestion);
    AccessibilityInfo.announceForAccessibility(`Selecionado: ${suggestion}`);
  };

  return (
    <View style={styles.container} accessible={false}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.md }]}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`suggestion-${index}`}
            style={[
              styles.chip,
              {
                backgroundColor: disabled ? palette.neutrals[300] : palette.surface,
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                marginRight: spacing.xs,
              },
            ]}
            onPress={() => handleSelect(suggestion)}
            disabled={disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Sugestão: ${suggestion}`}
            accessibilityState={{ disabled }}
          >
            <Text
              style={[
                styles.chipText,
                {
                  fontSize: typography.bodySm.fontSize,
                  color: disabled ? palette.neutrals[500] : palette.text,
                },
              ]}
            >
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    alignItems: 'center',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '500',
  },
});

/**
 * Helper: Gera sugestões contextuais baseadas no estágio
 */
export function getContextualSuggestions(context: {
  stage?: 'gestante' | 'mae' | 'tentante' | 'puerperio';
  pregnancyWeek?: number;
  concerns?: string[];
}): string[] {
  const { stage, pregnancyWeek, concerns } = context;

  // Sugestões base
  const baseSuggestions = ['Como está meu bebê?', 'Me sinto ansiosa', 'Dicas de bem-estar'];

  // Sugestões específicas por estágio
  if (stage === 'gestante') {
    if (pregnancyWeek && pregnancyWeek < 13) {
      return ['Sintomas do 1º trimestre', 'O que evitar na gravidez', 'Quando fazer pré-natal', ...baseSuggestions];
    } else if (pregnancyWeek && pregnancyWeek < 28) {
      return ['Movimentos do bebê', 'Lista do enxoval', 'Dúvidas sobre parto', ...baseSuggestions];
    } else {
      return ['Sinais de trabalho de parto', 'Plano de parto', 'Bolsa maternidade', ...baseSuggestions];
    }
  }

  if (stage === 'mae') {
    return ['Dúvidas sobre amamentação', 'Rotina com bebê', 'Cuidados pós-parto', ...baseSuggestions];
  }

  if (stage === 'tentante') {
    return ['Como aumentar fertilidade', 'Período fértil', 'Exames pré-concepção', ...baseSuggestions];
  }

  if (stage === 'puerperio') {
    return ['Me sinto sobrecarregada', 'Baby blues', 'Recuperação pós-parto', ...baseSuggestions];
  }

  return baseSuggestions;
}
