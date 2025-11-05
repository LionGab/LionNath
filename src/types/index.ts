/**
 * Tipos centralizados da Nossa Maternidade
 * Remove necessidade de usar 'any' e garante type-safety
 */

import type { UserProfile, ChatMessage, DailyPlan } from '@nossa-maternidade/shared-types';

// Re-exportar tipos compartilhados
export type { UserProfile, ChatMessage, DailyPlan };

// ==================== USER TYPES ====================

export type UserType = 'gestante' | 'mae' | 'tentante';

export interface UserProfileFormData {
  name: string;
  type: UserType;
  pregnancyWeek?: number;
  babyName?: string;
  preferences: string[];
}

export interface UserProfileLocal extends Omit<UserProfile, 'createdAt' | 'updatedAt'> {
  id: string;
  email?: string;
  name: string;
  type: UserType;
  pregnancy_week?: number;
  baby_name?: string;
  preferences: string[];
  subscription_tier: 'free' | 'premium';
  created_at: string;
  daily_interactions: number;
  last_interaction_date: string;
}

// ==================== CHAT TYPES ====================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageLocal extends Omit<ChatMessage, 'timestamp'> {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
  context_data?: Record<string, unknown>;
}

export interface ChatContext {
  type?: UserType;
  pregnancy_week?: number;
  baby_name?: string;
  preferences?: string[];
}

export interface ChatHistoryItem {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// ==================== DAILY PLAN TYPES ====================

export interface DailyPlanLocal extends Omit<DailyPlan, 'date' | 'createdAt'> {
  id: string;
  user_id: string;
  date: string; // ISO date string
  priorities: string[];
  tip: string;
  tip_video_url?: string;
  recipe: string;
  created_at: string;
}

export interface DailyPlanGenerated {
  priorities: string[];
  tip: string;
  recipe: string;
  tip_video_url?: string;
}

// ==================== NAVIGATION TYPES ====================

export type RootStackParamList = {
  Onboarding: { onComplete?: () => void } | undefined;
  Home: undefined;
  Chat: undefined;
  DailyPlan: undefined;
  Profile: undefined;
  Habits: undefined;
  Content: undefined;
  ContentDetail: { contentId: string };
};

export type TabParamList = {
  Home: undefined;
  Chat: undefined;
  Habits: undefined;
  Content: undefined;
  Profile: undefined;
};

// ==================== VALIDATION TYPES ====================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ==================== REPOSITORY TYPES ====================

export interface RepositoryResult<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ==================== COMPONENT PROP TYPES ====================

export interface QuickActionProps {
  iconName: string;
  title: string;
  onPress: () => void;
  accessibilityLabel: string;
}

// ==================== HELPER TYPES ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Type guards
export const isGestante = (type: UserType): boolean => type === 'gestante';
export const isMae = (type: UserType): boolean => type === 'mae';
export const isTentante = (type: UserType): boolean => type === 'tentante';
