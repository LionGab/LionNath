/**
 * Screen Component - Wrapper padrão para telas
 *
 * SafeAreaView + StatusBar + KeyboardAvoidingView + ScrollView opcional
 */

import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '@/theme';
import { Loading } from './Loading';
import { ErrorBoundary } from './ErrorBoundary';

export interface ScreenProps {
  children: React.ReactNode;
  /** Safe area edges (default: ['top', 'bottom']) */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Scrollable content */
  scrollable?: boolean;
  /** Show loading overlay */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Background color */
  backgroundColor?: string;
  /** Custom style */
  style?: ViewStyle;
  /** Status bar style */
  statusBarStyle?: 'auto' | 'inverted' | 'light' | 'dark';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = ['top', 'bottom'],
  scrollable = false,
  loading = false,
  loadingMessage,
  backgroundColor = colors.background,
  style,
  statusBarStyle = 'auto',
}) => {
  const content = scrollable ? (
    <ScrollView
      style={[styles.scrollView, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, { backgroundColor }, style]}>{children}</View>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor }]}>
        <StatusBar style={statusBarStyle} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          {content}
          {loading && (
            <View style={styles.loadingOverlay}>
              <Loading message={loadingMessage} />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
