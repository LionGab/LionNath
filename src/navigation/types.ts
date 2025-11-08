import { Question } from '@/types/onboarding-questions';

export type RootStackParamList = {
  SignIn: undefined;
  Onboarding: { onComplete?: () => void } | undefined;
  OnboardingQuestions: { questions: Question[] } | undefined;
  ReviewAnswers: { questions?: Question[]; answers?: Record<string, string | string[]> } | undefined;
  Home: undefined;
  Chat: { context?: string; initialPrompt?: string } | undefined;
  DailyPlan: undefined;
  Profile: undefined;
  Habits: undefined;
  Content: undefined;
  ContentDetail: { contentId: string };
  ComponentValidation: undefined;
};

export type TabParamList = {
  Home: undefined;
  Chat: { context?: string; initialPrompt?: string } | undefined;
  Habits: undefined;
  Content: undefined;
  Profile: undefined;
};

// Extensão para React Navigation
declare module '@react-navigation/native' {
  export type RootParamList = RootStackParamList;
}
