/**
 * Hook useNathiaActions - Processamento de actions contextuais
 *
 * Processa ações retornadas pelo Claude:
 * - openScreen: Navega para tela específica
 * - joinCircle: Entra em círculo de apoio
 * - startHabit: Inicia novo hábito
 * - showContent: Exibe conteúdo educacional
 * - sos: Aciona modo emergência
 *
 * Integra com:
 * - React Navigation (deep linking)
 * - Analytics (tracking de conversão)
 * - Notifications (confirmação de ação)
 *
 * @example
 * const { processAction, isProcessing } = useNathiaActions();
 * await processAction(action);
 */

import { useCallback, useState } from 'react';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { NathiaAction } from '@/services/nathia-client';
import { logger } from '@/lib/logger';
import { Alert } from 'react-native';

// Type-safe navigation helper
type AppNavigation = NavigationProp<ParamListBase>;

export interface UseNathiaActionsResult {
  processAction: (action: NathiaAction) => Promise<void>;
  isProcessing: boolean;
  lastProcessedAction: NathiaAction | null;
}

export function useNathiaActions(): UseNathiaActionsResult {
  const navigation = useNavigation<AppNavigation>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedAction, setLastProcessedAction] = useState<NathiaAction | null>(null);

  const processAction = useCallback(
    async (action: NathiaAction) => {
      if (!action || !action.type) {
        logger.warn('Action inválida recebida', { action });
        return;
      }

      setIsProcessing(true);
      setLastProcessedAction(action);

      try {
        logger.info('Processando NAT-IA action', {
          type: action.type,
          data: action.data,
        });

        switch (action.type) {
          case 'openScreen':
            await handleOpenScreen(action);
            break;

          case 'joinCircle':
            await handleJoinCircle(action);
            break;

          case 'startHabit':
            await handleStartHabit(action);
            break;

          case 'showContent':
            await handleShowContent(action);
            break;

          case 'sos':
            await handleSOS(action);
            break;

          default:
            logger.warn('Tipo de action desconhecido', { type: action.type });
        }

        // Analytics: track conversão
        trackActionConversion(action);
      } catch (caughtError) {
        const error = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
        logger.error('Erro ao processar action', error, { actionType: action.type });

        Alert.alert('Ops!', 'Não foi possível completar esta ação. Tente novamente.', [{ text: 'OK' }]);
      } finally {
        setIsProcessing(false);
      }
    },
    [navigation]
  );

  // Handlers específicos para cada tipo de action

  const handleOpenScreen = async (action: NathiaAction) => {
    const screenName = action.data?.screenName;

    if (!screenName) {
      throw new Error('screenName não fornecido');
    }

    // Mapeia nomes de tela
    const screenMap: Record<string, string> = {
      dailyPlan: 'DailyPlan',
      community: 'Community',
      habits: 'Habits',
      profile: 'Profile',
      content: 'ContentDetail',
      recommendations: 'NathiaRecommendations',
    };

    const targetScreen = screenMap[screenName] || screenName;

    // Type-safe navigation with dynamic screen names
    (navigation.navigate as (screen: string, params?: any) => void)(targetScreen, action.data);
  };

  const handleJoinCircle = async (action: NathiaAction) => {
    const circleId = action.data?.circleId;

    if (!circleId) {
      throw new Error('circleId não fornecido');
    }

    // Navega para detalhes do círculo
    (navigation.navigate as (screen: string, params?: any) => void)('CircleDetail', { circleId });

    // Feedback visual
    Alert.alert('Círculo de Apoio', `Pronto! Agora você pode participar do círculo "${action.label}". Vamos lá?`, [
      {
        text: 'Mais tarde',
        style: 'cancel',
      },
      {
        text: 'Participar',
        onPress: () => {
          // TODO: Integrar com join circle API
        },
      },
    ]);
  };

  const handleStartHabit = async (action: NathiaAction) => {
    const habitId = action.data?.habitId;

    if (!habitId) {
      throw new Error('habitId não fornecido');
    }

    // Navega para criar/visualizar hábito
    (navigation.navigate as (screen: string, params?: any) => void)('HabitDetail', { habitId });

    Alert.alert('Novo Hábito', `Que tal começar o hábito "${action.label}"? Pequenos passos fazem diferença!`, [
      {
        text: 'Depois',
        style: 'cancel',
      },
      {
        text: 'Começar agora',
        onPress: () => {
          // TODO: Integrar com habits API
        },
      },
    ]);
  };

  const handleShowContent = async (action: NathiaAction) => {
    const contentId = action.data?.contentId;
    const url = action.data?.url;

    if (contentId) {
      // Navega para conteúdo específico
      (navigation.navigate as (screen: string, params?: any) => void)('ContentDetail', { contentId });
    } else if (url) {
      // Abre URL externa (vídeo, artigo, etc)
      // TODO: Integrar com WebView ou browser externo
      Alert.alert('Conteúdo Externo', `Deseja abrir "${action.label}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: () => {
            // Linking.openURL(url);
          },
        },
      ]);
    } else {
      throw new Error('contentId ou url não fornecido');
    }
  };

  const handleSOS = async (action: NathiaAction) => {
    // Aciona modal de emergência
    (navigation.navigate as (screen: string, params?: any) => void)('SOSModal', {
      source: 'nathia-action',
      context: action.data,
    });
  };

  // Analytics helper
  const trackActionConversion = (action: NathiaAction) => {
    // TODO: Integrar com analytics service
    logger.info('NAT-IA Action Conversion', {
      actionType: action.type,
      label: action.label,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    processAction,
    isProcessing,
    lastProcessedAction,
  };
}
