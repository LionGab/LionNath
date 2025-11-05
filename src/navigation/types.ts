/**
 * Tipos de navegação da Nossa Maternidade
 */

export type RootStackParamList = {
  Onboarding: { onComplete?: () => void } | undefined;
  Home: undefined;
  Chat: undefined;
  DailyPlan: undefined;
  Profile: undefined;
  Habits: undefined;
  Content: undefined;
  ContentDetail: { contentId: string };
  Status: undefined;
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  Habits: undefined;
  Content: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
