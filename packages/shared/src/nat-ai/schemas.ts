/**
 * Schemas Zod - Sistema NAT-AI
 * 
 * Schemas de validação consolidados para entrada/saída do sistema de IA
 */

import { z } from 'zod';

// ============================================================================
// Model Router
// ============================================================================

export const AIModelSchema = z.enum(['claude', 'gemini', 'perplexity', 'manus', 'fallback']);

export const TaskTypeSchema = z.enum([
  'empathy',
  'moderation',
  'long-context',
  'research',
  'execution',
]);

export const ModelRouterConfigSchema = z.object({
  apiKeys: z.object({
    anthropic: z.string().optional(),
    gemini: z.string().optional(),
    perplexity: z.string().optional(),
    manus: z.string().optional(),
  }),
  preferences: z.record(TaskTypeSchema, AIModelSchema).optional(),
  fallback: AIModelSchema.optional(),
});

export const RoutingDecisionSchema = z.object({
  model: AIModelSchema,
  reason: z.string(),
  apiKey: z.string().optional(),
});

// ============================================================================
// Chat Messages
// ============================================================================

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  userId: z.string().uuid(),
  context: z.array(ChatMessageSchema).optional(),
  taskType: TaskTypeSchema.optional(),
});

// ============================================================================
// Risk Analysis
// ============================================================================

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const RiskAnalysisSchema = z.object({
  level: z.number().min(0).max(10), // 0-10 scale
  flags: z.array(z.string()), // ex: ["suicidal_ideation", "severe_depression"]
  requires_intervention: z.boolean(),
  suggested_resources: z.array(z.string()), // ex: ["cvv", "caps", "emergency"]
  reasoning: z.string(),
});

// ============================================================================
// Guardrails
// ============================================================================

export const GuardrailResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(
    z.object({
      type: z.enum(['safety', 'lgpd', 'medical', 'content']),
      severity: RiskLevelSchema,
      message: z.string(),
    })
  ),
  filteredContent: z.string().optional(),
});

// ============================================================================
// Context Manager
// ============================================================================

export const ContextChunkSchema = z.object({
  id: z.string(),
  content: z.string(),
  relevance: z.number().min(0).max(1),
  source: z.string().optional(),
  timestamp: z.number(),
});

export const ContextRequestSchema = z.object({
  userId: z.string().uuid(),
  query: z.string(),
  maxChunks: z.number().int().min(1).max(50).default(10),
  minRelevance: z.number().min(0).max(1).default(0.5),
});

// ============================================================================
// Team Notifier
// ============================================================================

export const NotificationSchema = z.object({
  type: z.enum(['risk', 'lgpd', 'escalation', 'error']),
  severity: RiskLevelSchema,
  userId: z.string().uuid(),
  message: z.string(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.number(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type AIModel = z.infer<typeof AIModelSchema>;
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type ModelRouterConfig = z.infer<typeof ModelRouterConfigSchema>;
export type RoutingDecision = z.infer<typeof RoutingDecisionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>;
export type GuardrailResult = z.infer<typeof GuardrailResultSchema>;
export type ContextChunk = z.infer<typeof ContextChunkSchema>;
export type ContextRequest = z.infer<typeof ContextRequestSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
