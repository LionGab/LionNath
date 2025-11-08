/**
 * Spacing Component - Componente para espaçamento consistente
 *
 * Componente utilitário para aplicar espaçamento do design system
 * Garante consistência visual em toda a aplicação
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { spacing } from '@/theme';

export type SpacingSize = keyof typeof spacing;

export interface SpacingProps {
  /** Tamanho do espaçamento */
  size?: SpacingSize;

  /** Espaçamento horizontal (padding horizontal) */
  horizontal?: SpacingSize;

  /** Espaçamento vertical (padding vertical) */
  vertical?: SpacingSize;

  /** Espaçamento top */
  top?: SpacingSize;

  /** Espaçamento bottom */
  bottom?: SpacingSize;

  /** Espaçamento left */
  left?: SpacingSize;

  /** Espaçamento right */
  right?: SpacingSize;

  /** Estilo customizado */
  style?: ViewStyle;

  /** Children */
  children?: React.ReactNode;
}

/**
 * Componente Spacing para aplicar espaçamento consistente
 */
export const Spacing: React.FC<SpacingProps> = ({
  size,
  horizontal,
  vertical,
  top,
  bottom,
  left,
  right,
  style,
  children,
}) => {
  const spacingStyle: ViewStyle = {};

  if (size) {
    spacingStyle.padding = spacing[size];
  }

  if (horizontal) {
    spacingStyle.paddingHorizontal = spacing[horizontal];
  }

  if (vertical) {
    spacingStyle.paddingVertical = spacing[vertical];
  }

  if (top) {
    spacingStyle.paddingTop = spacing[top];
  }

  if (bottom) {
    spacingStyle.paddingBottom = spacing[bottom];
  }

  if (left) {
    spacingStyle.paddingLeft = spacing[left];
  }

  if (right) {
    spacingStyle.paddingRight = spacing[right];
  }

  return <View style={[spacingStyle, style]}>{children}</View>;
};

/**
 * Componente para espaçamento entre elementos
 */
export interface GapProps {
  /** Tamanho do gap */
  size?: SpacingSize;

  /** Direção (row ou column) */
  direction?: 'row' | 'column';
}

export const Gap: React.FC<GapProps> = ({ size = 'md', direction = 'column' }) => {
  const gapStyle: ViewStyle = {
    [direction === 'row' ? 'width' : 'height']: spacing[size],
  };

  return <View style={gapStyle} />;
};
