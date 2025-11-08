/**
 * Header Component - Header padrão para telas
 *
 * Back button + Title + Action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface HeaderProps {
  /** Título do header */
  title?: string;
  /** Mostrar botão voltar */
  showBack?: boolean;
  /** Handler do botão voltar (override) */
  onBack?: () => void;
  /** Botões de ação à direita */
  actions?: Array<{
    icon: string;
    onPress: () => void;
    accessibilityLabel: string;
    badge?: number;
  }>;
  /** Transparent background */
  transparent?: boolean;
  /** Sticky no scroll */
  sticky?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  actions = [],
  transparent = false,
  sticky = false,
  style,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[styles.container, transparent && styles.transparent, sticky && styles.sticky, style]}
      accessible={false}
    >
      <View style={styles.content}>
        {/* Back button */}
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Retorna para a tela anterior"
          >
            <Icon name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
        )}

        {/* Title */}
        {title && (
          <Text style={styles.title} numberOfLines={1} accessible={true} accessibilityRole="header">
            {title}
          </Text>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Actions */}
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
          >
            <Icon name={action.icon} size={24} color={colors.foreground} />
            {action.badge !== undefined && action.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{action.badge > 99 ? '99+' : action.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 100,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  sticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44, // WCAG mínimo
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
  },
  spacer: {
    flex: 1,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.destructive,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold as any,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.sans,
  },
});
