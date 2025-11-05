/**
 * Analytics - Amplitude Integration
 *
 * Integração com Amplitude para tracking de eventos e funil de conversão
 */

// Client-side only (browser/mobile)
let amplitudeClient: any = null;
let isInitialized = false;

/**
 * Inicializa o cliente Amplitude
 */
export function initAnalytics(apiKey: string, userId?: string, options?: {
  enableLogging?: boolean;
  defaultTracking?: {
    pageViews?: boolean;
    sessions?: boolean;
    formInteractions?: boolean;
  };
}) {
  if (typeof window === 'undefined') {
    // Server-side rendering (Edge Functions)
    return;
  }

  try {
    // Dynamic import para evitar bundle no server
    // Usar type assertion para evitar erro de tipo quando módulo não está instalado
    const loadAmplitude = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Amplitude = await import('@amplitude/analytics-browser' as string);
        if (Amplitude && typeof Amplitude.init === 'function') {
          amplitudeClient = Amplitude.init(apiKey, userId, {
            defaultTracking: {
              pageViews: options?.defaultTracking?.pageViews ?? true,
              sessions: options?.defaultTracking?.sessions ?? true,
              formInteractions: options?.defaultTracking?.formInteractions ?? true,
            },
            ...options,
          });
          isInitialized = true;
        }
      } catch (err) {
        console.warn('Amplitude not available:', err);
      }
    };
    loadAmplitude();
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
}

/**
 * Rastreia um evento
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!isInitialized || !amplitudeClient) {
    console.warn('Amplitude not initialized. Event not tracked:', eventName);
    return;
  }

  try {
    amplitudeClient.track(eventName, {
      ...properties,
      timestamp: Date.now(),
      platform: typeof window !== 'undefined' ? 'web' : 'mobile',
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Eventos de conversão pré-definidos
 */
export const ConversionEvents = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_ABANDONED: 'onboarding_abandoned',
  
  // Chat
  CHAT_FIRST_MESSAGE: 'chat_first_message',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_MESSAGE_RECEIVED: 'chat_message_received',
  
  // Daily Plan
  DAILY_PLAN_VIEWED: 'daily_plan_viewed',
  DAILY_PLAN_GENERATED: 'daily_plan_generated',
  DAILY_PLAN_COMPLETED: 'daily_plan_completed',
  
  // Profile
  PROFILE_VIEWED: 'profile_viewed',
  PROFILE_COMPLETED: 'profile_completed',
  PROFILE_UPDATED: 'profile_updated',
  
  // Gamification
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  POINTS_EARNED: 'points_earned',
  
  // Engagement
  APP_OPENED: 'app_opened',
  APP_CLOSED: 'app_closed',
  SCREEN_VIEWED: 'screen_viewed',
} as const;

/**
 * Rastreia um evento de conversão
 */
export function trackConversion(
  event: keyof typeof ConversionEvents | string,
  properties?: Record<string, any>
) {
  const eventName = ConversionEvents[event as keyof typeof ConversionEvents] || event;
  trackEvent(eventName, {
    ...properties,
    conversion_step: event,
  });
}

/**
 * Rastreia visualização de tela
 */
export function trackScreenView(screenName: string, properties?: Record<string, any>) {
  trackEvent(ConversionEvents.SCREEN_VIEWED, {
    screen: screenName,
    ...properties,
  });
}

/**
 * Rastreia erro (combinado com Sentry)
 */
export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent('error_occurred', {
    error_name: error.name,
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}

/**
 * Define identificador do usuário
 */
export function setUserId(userId: string) {
  if (!isInitialized || !amplitudeClient) return;
  
  try {
    amplitudeClient.setUserId(userId);
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}

/**
 * Define propriedades do usuário
 */
export function setUserProperties(properties: Record<string, any>) {
  if (!isInitialized || !amplitudeClient) return;
  
  try {
    amplitudeClient.identify(new (amplitudeClient as any).Identify().set(properties));
  } catch (error) {
    console.error('Failed to set user properties:', error);
  }
}
