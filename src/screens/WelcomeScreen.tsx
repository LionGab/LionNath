/**
 * Welcome Screen - Design Moderno em Tons Azuis
 * Inspirado em shadcn/ui com claymorphism e gradientes suaves
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logo } from '@/components/Logo';
import { spacing, typography, borderRadius, shadows } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 🎨 Cores Azuis Modernas (inspirado em shadcn blue theme)
const BLUE_THEME = {
  // Backgrounds - Azul escuro profundo
  darkBlue: '#0A2540', // Azul escuro principal (base)
  deepBlue: '#0F3460', // Azul escuro intermediário
  navyBlue: '#16213E', // Azul marinho

  // Accents - Azul vibrante
  primaryBlue: '#3B82F6', // Azul primário (botões)
  lightBlue: '#60A5FA', // Azul claro (hover/active)
  skyBlue: '#93C5FD', // Azul céu (highlights)

  // Secundários
  mutedBlue: '#475569', // Azul acinzentado (texto secundário)
  grayBlue: '#64748B', // Cinza azulado (borders)

  // Text
  white: '#FFFFFF',
  lightGray: '#F1F5F9',
  darkGray: '#94A3B8',
};

interface WelcomeScreenProps {
  onStart?: () => void;
  onLogin?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLogin }) => {
  const navigation = useNavigation();

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animação de entrada suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      (navigation as any).navigate('Onboarding');
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      (navigation as any).navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE_THEME.darkBlue} />

      {/* Background Gradient */}
      <LinearGradient
        colors={[BLUE_THEME.darkBlue, BLUE_THEME.deepBlue, BLUE_THEME.navyBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Circles - Glassmorphism */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
          },
        ]}
      >
        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image source={require('@/assets/images/nat3.png')} style={styles.heroImage} resizeMode="contain" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Nossa{'\n'}Maternidade</Text>

        {/* Description */}
        <Text style={styles.description}>
          Seu espaço seguro para apoio emocional, organização da rotina e autocuidado na jornada da maternidade
        </Text>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <FeaturePill icon="heart-pulse" text="Apoio Emocional 24/7" />
          <FeaturePill icon="calendar-check" text="Rotina Organizada" />
          <FeaturePill icon="account-group" text="Comunidade Acolhedora" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Primary Button - Começar */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStart}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Começar minha jornada"
          >
            <LinearGradient
              colors={[BLUE_THEME.primaryBlue, BLUE_THEME.lightBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Começar Minha Jornada</Text>
              <Icon name="arrow-right" size={20} color={BLUE_THEME.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Button - Login */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogin}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Já sou membro"
          >
            <Text style={styles.secondaryButtonText}>Já Sou Membro</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Feito com 💙 por mães, para mães</Text>
      </View>
    </View>
  );
};

// Feature Pill Component
interface FeaturePillProps {
  icon: string;
  text: string;
}

const FeaturePill: React.FC<FeaturePillProps> = ({ icon, text }) => (
  <View style={styles.featurePill}>
    <Icon name={icon} size={16} color={BLUE_THEME.skyBlue} style={{ marginRight: spacing.xs }} />
    <Text style={styles.featurePillText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_THEME.darkBlue,
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    opacity: 0.5,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    opacity: 0.4,
  },
  decorativeCircle3: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(147, 197, 253, 0.06)',
    opacity: 0.3,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing['4xl'] : spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo
  logoContainer: {
    marginBottom: spacing['2xl'],
    alignItems: 'center',
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // backdropFilter not supported in React Native
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(147, 197, 253, 0.2)',
    ...shadows.dark.lg,
  },

  // Hero Image
  heroImageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  heroImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    maxWidth: 280,
    maxHeight: 280,
  },

  // Text
  title: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.extrabold,
    color: BLUE_THEME.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.sans,
    letterSpacing: -1,
    lineHeight: typography.sizes['5xl'] * 1.2,
  },
  description: {
    fontSize: typography.sizes.base,
    color: BLUE_THEME.darkGray,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.sizes.base,
    marginBottom: spacing['2xl'],
    fontFamily: typography.fontFamily.sans,
    maxWidth: 340,
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['3xl'],
    maxWidth: 360,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.2)',
  },
  featurePillText: {
    fontSize: typography.sizes.xs,
    color: BLUE_THEME.skyBlue,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily.sans,
  },

  // Actions
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: spacing.md,
  },

  // Primary Button
  primaryButton: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.dark.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: BLUE_THEME.white,
    fontFamily: typography.fontFamily.sans,
  },

  // Secondary Button
  secondaryButton: {
    width: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: BLUE_THEME.lightGray,
    fontFamily: typography.fontFamily.sans,
  },

  // Footer
  footer: {
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: BLUE_THEME.mutedBlue,
    fontFamily: typography.fontFamily.sans,
  },
});

export default WelcomeScreen;

