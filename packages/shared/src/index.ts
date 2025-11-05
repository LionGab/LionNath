/**
 * @nossa/shared
 *
 * Pacote compartilhado com:
 * - Sistema de IA (NAT-AI)
 * - Schemas Zod para validação
 * - Design System (tema)
 * - Utilitários compartilhados
 */

// Sistema de IA (exports diretos)
export * from './nat-ai/system-prompt';
export * from './nat-ai/guardrails';
export * from './nat-ai/risk-analyzer';
export * from './nat-ai/context-manager';
export * from './nat-ai/team-notifier';
export * from './nat-ai/model-router';
// Schemas NAT-AI exportados com nomes específicos para evitar conflitos
export {
  AIModelSchema,
  TaskTypeSchema,
  ModelRouterConfigSchema,
  RoutingDecisionSchema,
  ChatMessageSchema as NATChatMessageSchema,
  ChatRequestSchema,
  RiskLevelSchema,
  RiskAnalysisSchema as NATRiskAnalysisSchema,
  GuardrailResultSchema,
  ContextChunkSchema,
  ContextRequestSchema,
  NotificationSchema,
  type AIModel,
  type TaskType,
  type ModelRouterConfig,
  type RoutingDecision,
  type ChatMessage as NATChatMessage,
  type ChatRequest,
  type RiskLevel,
  type RiskAnalysis as NATRiskAnalysis,
  type GuardrailResult,
  type ContextChunk,
  type ContextRequest,
  type Notification,
} from './nat-ai/schemas';

// Schemas Zod (database schemas - usando exports nomeados para evitar conflito)
export {
  ChatMessageSchema as DBChatMessageSchema,
  CreateChatMessageSchema,
  type ChatMessage as DBChatMessage,
  type CreateChatMessage,
} from './schemas/chat-message';

export {
  RiskAnalysisSchema as DBRiskAnalysisSchema,
  type RiskAnalysis as DBRiskAnalysis,
} from './schemas/risk-analysis';

// Design System
export * from './theme/colors';
export * from './theme/index';
