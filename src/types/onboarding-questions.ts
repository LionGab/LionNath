/**
 * Types para perguntas de onboarding
 */

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: 'single_choice' | 'multi_choice';
  text: string;
  options: QuestionOption[];
  required: boolean;
  next: string | null;
}

export interface OnboardingAnswer {
  questionId: string;
  answer: string | string[];
  timestamp: string;
}

export interface OnboardingSession {
  userId?: string | null;
  answers: OnboardingAnswer[];
  completedAt?: string;
}
