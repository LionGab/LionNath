/**
 * NAT-AI - Sistema de IA de Acolhimento Emocional
 * 
 * Exporta todos os módulos do sistema NAT-AI:
 * - System prompts
 * - Guardrails de segurança
 * - Risk analyzer
 * - Context manager
 * - Team notifier
 * - Model router
 * - Schemas Zod
 */

export * from './system-prompt';
export * from './guardrails';
export * from './risk-analyzer';
export * from './context-manager';
export * from './team-notifier';
export * from './model-router';
// Schemas exportados com nomes específicos para evitar conflitos
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
} from './schemas';
