/**
 * Onboarding Screen - Tour das Funcionalidades
 * Apresenta as principais features do app de forma visual e interativa
 */

import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 🎨 Cores Azuis Modernas (matching WelcomeScreen e theme colors)
const BLUE_THEME = {
  // Backgrounds - Azul escuro profundo
  darkBlue: '#0A2540', // Background principal
  deepBlue: '#0F3460', // Cards e elementos
  navyBlue: '#16213E', // Popover e contraste

  // Azuis primários - Vibrantes e modernos
  primaryBlue: '#3B82F6', // Blue 500 - Primário
  lightBlue: '#60A5FA', // Blue 400 - Hover/Active
  skyBlue: '#93C5FD', // Blue 300 - Highlights
  accentBlue: '#0EA5E9', // Sky 500 - Accent

  // Cinzas azulados - Texto e borders
  mutedBlue: '#475569', // Slate 600 - Texto terciário
  grayBlue: '#64748B', // Slate 500 - Texto secundário
  borderBlue: '#334155', // Slate 700 - Borders

  // Cores claras
  white: '#FFFFFF',
  lightGray: '#F1F5F9', // Slate 100
  darkGray: '#94A3B8', // Slate 400
};

// Breakpoints para responsividade mobile-first
const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE, etc
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414; // iPhone 12, etc
const isLargeDevice = SCREEN_WIDTH >= 414; // iPhone Pro Max, etc

// Valores responsivos
const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

interface OnboardingScreenProps {
  onComplete?: () => void;
  route?: any;
}

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  features: FeatureItem[];
  image?: any; // ImageSourcePropType from React Native
}

interface FeatureItem {
  emoji: string;
  text: string;
  color: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'home',
    title: 'Home com o NathIA',
    subtitle: 'Sua assistente virtual empática',
    description:
      'Converse com a NathIA, sua companheira virtual que entende seu momento e oferece suporte personalizado 24/7.',
    icon: 'robot-happy',
    color: BLUE_THEME.primaryBlue, // Azul primário
    features: [
      { emoji: '💙', text: 'Chat empático e acolhedor', color: '#60A5FA' },
      { emoji: '✨', text: 'Respostas personalizadas', color: '#93C5FD' },
      { emoji: '🧠', text: 'Memória de conversas anteriores', color: '#3B82F6' },
      { emoji: '🤗', text: 'Suporte emocional sempre disponível', color: '#0EA5E9' },
    ],
  },
  {
    id: 'apoio-emocional',
    title: 'Apoio Emocional',
    subtitle: 'Análise de sentimentos com IA',
    description: 'Análise de sentimentos com IA e sugestões personalizadas para seu bem-estar emocional.',
    icon: 'heart-pulse',
    color: BLUE_THEME.accentBlue, // Sky blue - Accent
    features: [
      { emoji: '💕', text: 'Análise de sentimentos em tempo real', color: '#F472B6' },
      { emoji: '🌟', text: 'Sugestões personalizadas de bem-estar', color: '#FBBF24' },
      { emoji: '🛡️', text: 'Acompanhamento emocional', color: '#60A5FA' },
      { emoji: '🧘', text: 'Recursos de autocuidado', color: '#A78BFA' },
    ],
  },
  {
    id: 'rotina-organizada',
    title: 'Rotina Organizada',
    subtitle: 'Gerencie tudo com facilidade',
    description: 'Gerencie alimentação, sono e atividades do seu bebê com facilidade e tranquilidade.',
    icon: 'calendar-check',
    color: BLUE_THEME.lightBlue, // Azul claro
    features: [
      { emoji: '🍼', text: 'Controle de alimentação do bebê', color: '#93C5FD' },
      { emoji: '😴', text: 'Acompanhamento de sono', color: '#A78BFA' },
      { emoji: '📅', text: 'Agenda de atividades', color: '#60A5FA' },
      { emoji: '⏰', text: 'Lembretes personalizados', color: '#3B82F6' },
    ],
  },
  {
    id: 'mundo-nath',
    title: 'MundoNath',
    subtitle: 'Comunidade e conexão',
    description: 'Conecte-se com outras mães, compartilhe experiências e encontre apoio na comunidade.',
    icon: 'account-group',
    color: BLUE_THEME.skyBlue, // Azul céu claro
    image: require('@/assets/images/nat1.png'),
    features: [
      { emoji: '👥', text: 'Comunidade de mães', color: '#60A5FA' },
      { emoji: '💬', text: 'Compartilhamento de experiências', color: '#93C5FD' },
      { emoji: '🎯', text: 'Grupos temáticos', color: '#3B82F6' },
      { emoji: '🤝', text: 'Suporte mútuo', color: '#0EA5E9' },
    ],
  },
  {
    id: 'conteudo-exclusivo',
    title: 'Conteúdo Exclusivo',
    subtitle: 'Dicas e estratégias da Nathalia Valente',
    description: 'Acesso a dicas, receitas e estratégias da Nathalia Valente para sua jornada.',
    icon: 'book-open-variant',
    color: '#6366F1', // Indigo 500 - Para variedade
    features: [
      { emoji: '📚', text: 'Dicas exclusivas da Nathalia', color: '#818CF8' },
      { emoji: '🥗', text: 'Receitas saudáveis', color: '#34D399' },
      { emoji: '✨', text: 'Estratégias práticas', color: '#FBBF24' },
      { emoji: '🔄', text: 'Conteúdo atualizado', color: '#60A5FA' },
    ],
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, route }) => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Mobile-first: Usar navigation listener ao invés de params não-serializáveis
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Screen focada - callback será gerenciado via navigation
    });
    return unsubscribe;
  }, [navigation]);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarded', 'true');
      // Mobile-first: Usar navigation para atualizar estado
      // O AppNavigator detectará a mudança no AsyncStorage e atualizará automaticamente
      if (onComplete) {
        onComplete();
      } else {
        // Fallback: navegar diretamente para Home
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
    });

    // Tamanhos responsivos - Reduzidos para melhor proporção
    const iconSize = getResponsiveValue(48, 56, 64);
    const iconContainerSize = getResponsiveValue(96, 112, 128);

    return (
      <View style={styles.slide}>
        <ScrollView
          contentContainerStyle={styles.slideScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.slideContent, { opacity }]}>
            {/* Logo completa */}
            <View style={styles.logoContainerSlide}>
              <Logo size={getResponsiveValue(SCREEN_WIDTH * 0.2, SCREEN_WIDTH * 0.25, SCREEN_WIDTH * 0.3)} />
            </View>

            {/* Optional Image */}
            {item.image && (
              <View style={styles.slideImageContainer}>
                <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            {/* Description */}
            <Text style={styles.description}>{item.description}</Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {item.features.map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  {/* Emoji Icon Container */}
                  <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}20` }]}>
                    <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                  </View>

                  {/* Feature Text */}
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: currentIndex === index ? BLUE_THEME.primaryBlue : BLUE_THEME.grayBlue,
                },
              ]}
            />
          );
        })}
      </View>
    );
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

      <SafeAreaView style={styles.safeArea}>
        {/* Header com Skip */}
        <View style={styles.header}>
          {/* Espaçador flexível */}
          <View style={styles.headerSpacer} />

          {/* Botão Skip à direita */}
          {currentIndex < ONBOARDING_SLIDES.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
        />

        {/* Pagination */}
        {renderPagination()}

        {/* Actions */}
        <View style={styles.actions}>
          {currentIndex > 0 && (
            <Button
              variant="outline"
              size="lg"
              onPress={handleBack}
              icon="arrow-left"
              accessibilityLabel="Voltar para slide anterior"
              style={styles.backButton}
            >
              Voltar
            </Button>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth={currentIndex === 0}
            onPress={handleNext}
            icon={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'check-circle' : 'arrow-right'}
            iconPosition="right"
            accessibilityLabel={
              currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Começar a usar o app' : 'Ir para próximo slide'
            }
            style={currentIndex === 0 ? { flex: 1 } : styles.nextButton}
          >
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Começar agora!' : 'Próximo'}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Estilos base (valores fixos)
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_THEME.darkBlue,
  },
  safeArea: {
    flex: 1,
  },
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
  logoContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none' as const, // Permitir toque nos elementos abaixo
  },
  skipButton: {
    padding: spacing.sm,
    minWidth: 44, // Touch target mínimo
    minHeight: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const, // Prevenir overflow
  },
  pagination: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    minHeight: 32,
  },
  backButton: {
    flex: 1,
    minHeight: 44, // Touch target mínimo
  },
  nextButton: {
    flex: 2,
    minHeight: 44, // Touch target mínimo
  },
});

// Função para obter estilos responsivos
const getStyles = () => ({
  ...baseStyles,
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    paddingBottom: spacing.sm,
    minHeight: getResponsiveValue(48, 52, 56),
    width: '100%' as const, // Garantir largura total
    maxWidth: '100%' as const, // Não ultrapassar largura
  },
  headerSpacer: {
    flex: 1,
  },
  skipText: {
    fontSize: getResponsiveValue(typography.sizes.sm, typography.sizes.base, typography.sizes.base),
    color: BLUE_THEME.darkGray,
    fontFamily: typography.fontFamily.sans,
  },
  slideScrollContent: {
    flexGrow: 1,
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg, spacing.xl),
    paddingVertical: getResponsiveValue(spacing.sm, spacing.md, spacing.lg),
    width: SCREEN_WIDTH, // Garantir largura total
  },
  slideContent: {
    alignItems: 'center' as const,
    width: '100%' as const,
    maxWidth: SCREEN_WIDTH - getResponsiveValue(spacing.md * 2, spacing.lg * 2, spacing.xl * 2), // Largura total menos padding
    paddingHorizontal: 0, // Padding já está no container pai
  },
  iconContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    borderWidth: 2,
    borderColor: 'rgba(147, 197, 253, 0.25)',
    ...shadows.dark.lg,
  },
  logoContainerSlide: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg), // Espaçamento otimizado
    marginTop: 0, // Remover margin top para melhor espaçamento
    paddingVertical: getResponsiveValue(spacing.xs, spacing.sm, spacing.md), // Padding ao invés de margin
    width: '100%' as const,
    maxWidth: getResponsiveValue(SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.35), // Proporção melhor
  },
  slideImageContainer: {
    width: '100%' as const,
    alignItems: 'center' as const,
    marginBottom: getResponsiveValue(spacing.lg, spacing.xl, spacing.xl),
  },
  slideImage: {
    width: getResponsiveValue(SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.45, SCREEN_WIDTH * 0.4),
    height: getResponsiveValue(SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.45, SCREEN_WIDTH * 0.4),
    maxWidth: 220,
    maxHeight: 220,
  },
  title: {
    fontSize: getResponsiveValue(22, 26, 28), // Tamanhos mais adequados para mobile
    fontWeight: typography.weights.bold as any,
    color: BLUE_THEME.white,
    textAlign: 'center' as const,
    marginBottom: getResponsiveValue(spacing.xs, spacing.sm, spacing.sm),
    marginTop: 0, // Remover margin top
    fontFamily: typography.fontFamily.sans,
    paddingHorizontal: spacing.md,
    lineHeight: getResponsiveValue(28, 32, 36), // Line-height proporcional
    width: '100%' as const,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: getResponsiveValue(14, 16, 18), // Tamanhos mais proporcionais
    fontWeight: typography.weights.semibold as any,
    color: BLUE_THEME.skyBlue,
    textAlign: 'center' as const,
    marginBottom: getResponsiveValue(spacing.xs, spacing.sm, spacing.md),
    fontFamily: typography.fontFamily.sans,
    paddingHorizontal: spacing.md,
    lineHeight: getResponsiveValue(20, 22, 26), // Line-height proporcional
    width: '100%' as const,
    flexShrink: 1,
  },
  description: {
    fontSize: getResponsiveValue(13, 14, 15), // Tamanhos mais legíveis
    color: BLUE_THEME.darkGray,
    textAlign: 'center' as const,
    lineHeight: getResponsiveValue(20, 22, 24), // Line-height mais confortável
    marginBottom: getResponsiveValue(spacing.md, spacing.lg, spacing.lg),
    fontFamily: typography.fontFamily.sans,
    paddingHorizontal: spacing.md,
    width: '100%' as const,
    flexShrink: 1,
  },
  featuresContainer: {
    width: '100%' as const,
    gap: getResponsiveValue(spacing.sm, spacing.md, spacing.md),
    alignSelf: 'stretch' as const, // Garantir que ocupa toda largura disponível
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: getResponsiveValue(spacing.sm, spacing.sm + 2, spacing.md), // Padding otimizado
    borderRadius: borderRadius.md, // Border radius reduzido para mobile
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.12)',
    ...shadows.dark.md,
    minHeight: getResponsiveValue(52, 56, 60), // Touch target melhorado
    gap: getResponsiveValue(spacing.sm, spacing.sm + 2, spacing.md),
    width: '100%' as const,
    maxWidth: '100%' as const,
  },
  featureIconContainer: {
    width: getResponsiveValue(36, 40, 44),
    height: getResponsiveValue(36, 40, 44),
    borderRadius: getResponsiveValue(9, 10, 11),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.15)',
    ...shadows.dark.sm,
  },
  featureEmoji: {
    fontSize: getResponsiveValue(18, 20, 22),
    textAlign: 'center' as const,
    lineHeight: getResponsiveValue(22, 24, 26),
  },
  featureText: {
    fontSize: getResponsiveValue(13, 14, 15), // Tamanhos mais legíveis
    color: BLUE_THEME.white,
    flex: 1,
    flexShrink: 1,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.weights.medium as any,
    lineHeight: getResponsiveValue(18, 20, 22), // Line-height confortável
    letterSpacing: 0.2, // Espaçamento entre letras para melhor legibilidade
  },
  paginationDot: {
    height: getResponsiveValue(6, 8, 8),
    borderRadius: getResponsiveValue(3, 4, 4),
    backgroundColor: BLUE_THEME.grayBlue,
  },
  actions: {
    flexDirection: 'row' as const,
    paddingHorizontal: getResponsiveValue(spacing.md, spacing.lg, spacing.xl),
    paddingBottom: Platform.OS === 'ios' ? getResponsiveValue(spacing.lg, spacing.xl, spacing.xl) : spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    alignItems: 'center' as const,
    minHeight: getResponsiveValue(60, 70, 80),
  },
});

const styles = getStyles();

export default OnboardingScreen;

