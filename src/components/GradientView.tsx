/**
 * GradientView Component - Gradiente Maternal Acolhedor
 *
 * Componente para criar gradientes suaves e acolhedores
 * Baseado no tema Bubblegum com tons rosa e azul
 */

import { borderRadius } from '@/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

// Expo Linear Gradient (opcional)
type LinearGradientProps = {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

type LinearGradientType = React.ComponentType<LinearGradientProps> | null;

let LinearGradient: LinearGradientType = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  // expo-linear-gradient não disponível, usar fallback
}

export type GradientVariant = 'maternal' | 'soft' | 'warm' | 'calm' | 'sunset';

export interface GradientViewProps {
  /** Conteúdo do gradiente */
  children?: React.ReactNode;

  /** Variante do gradiente */
  variant?: GradientVariant;

  /** Direção do gradiente (padrão: vertical) */
  direction?: 'horizontal' | 'vertical' | 'diagonal';

  /** Border radius */
  borderRadius?: number;

  /** Estilo customizado */
  style?: ViewStyle;

  /** Opacidade do gradiente (0-1) */
  opacity?: number;
}

/**
 * 🎨 Cores dos Gradientes Acolhedores - Terracota, Sage, Lavanda
 * Design System Superior - Paleta Mobile-First
 */
const gradientColors = {
  maternal: {
    start: '#FCFAF8', // Creme suave (background)
    middle: '#F5F0E8', // Creme médio
    end: '#F0E8E0', // Creme quente
  },
  soft: {
    start: '#FCFAF8', // Creme suave
    middle: '#F8E8E8', // Rosa muito claro
    end: '#F0D8E8', // Lavanda claro
  },
  warm: {
    start: '#FCFAF8', // Creme suave
    middle: '#F8E8E8', // Rosa muito claro
    end: '#F0D8B8', // Pêssego suave
  },
  calm: {
    start: '#F0F8F5', // Verde muito claro
    middle: '#E8F0ED', // Sage claro
    end: '#F0E8E8', // Rosa muito claro
  },
  sunset: {
    start: '#F0D8B8', // Pêssego suave
    middle: '#F8E8E8', // Rosa muito claro
    end: '#E891B5', // Terracota (primary)
  },
};

/**
 * Direções do gradiente
 */
const getGradientDirection = (direction: 'horizontal' | 'vertical' | 'diagonal') => {
  switch (direction) {
    case 'horizontal':
      return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
    case 'diagonal':
      return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
    default: // vertical
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
  }
};

export const GradientView: React.FC<GradientViewProps> = ({
  children,
  variant = 'maternal',
  direction = 'vertical',
  borderRadius: customBorderRadius,
  style,
  opacity = 1,
}) => {
  const gradient = gradientColors[variant];
  const gradientDirection = getGradientDirection(direction);

  // Se LinearGradient não estiver disponível, usar View sólida
  if (!LinearGradient) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: gradient.start, opacity },
          customBorderRadius !== undefined && { borderRadius: customBorderRadius },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  const GradientComponent = LinearGradient as React.ComponentType<LinearGradientProps>;
  return (
    <GradientComponent
      colors={[gradient.start, gradient.middle, gradient.end]}
      start={gradientDirection.start}
      end={gradientDirection.end}
      style={[
        styles.container,
        customBorderRadius !== undefined && { borderRadius: customBorderRadius },
        style,
        { opacity },
      ]}
    >
      {children}
    </GradientComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});

