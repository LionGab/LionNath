/**
 * Toast Component - Notificações temporárias
 *
 * Auto-dismiss com animação suave
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  /** Tipo de toast */
  type: ToastType;
  /** Mensagem */
  message: string;
  /** Mostrar toast */
  visible: boolean;
  /** Duração em ms (default: 3000) */
  duration?: number;
  /** Label do botão de ação (opcional) */
  actionLabel?: string;
  /** Handler do botão de ação */
  onAction?: () => void;
  /** Callback quando fecha */
  onDismiss?: () => void;
}

const TOAST_CONFIG = {
  success: {
    icon: 'check-circle',
    backgroundColor: '#81C784',
    iconColor: '#FFFFFF',
  },
  error: {
    icon: 'alert-circle',
    backgroundColor: colors.destructive,
    iconColor: '#FFFFFF',
  },
  warning: {
    icon: 'alert',
    backgroundColor: '#FFB74D',
    iconColor: '#FFFFFF',
  },
  info: {
    icon: 'information',
    backgroundColor: '#64B5F6',
    iconColor: '#FFFFFF',
  },
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  visible,
  duration = 3000,
  actionLabel,
  onAction,
  onDismiss,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in + fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 90,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        dismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      dismiss();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
          },
        ]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`${type}: ${message}`}
      >
        <Icon name={config.icon} size={20} color={config.iconColor} style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={() => {
              onAction();
              dismiss();
            }}
            style={styles.actionButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: typography.weights.medium as any,
    fontFamily: typography.fontFamily.sans,
  },
  actionButton: {
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: typography.weights.bold as any,
    fontFamily: typography.fontFamily.sans,
  },
});

