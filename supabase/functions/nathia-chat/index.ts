import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import {
  checkSafety,
  extractSymptoms,
  isMedicalQuestion,
  getMedicalDisclaimer,
  suggestSupportResources,
  SafetyLevel,
} from '../_shared/safety.ts';
import { RateLimiter, RATE_LIMITS, addRateLimitHeaders } from '../_shared/rate-limit.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const CLAUDE_MODEL = Deno.env.get('CLAUDE_MODEL') ?? 'claude-3-5-sonnet-20241022';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const RESPONSE_VERSION = '2025.11.07';

const SYSTEM_PROMPT = `Você é NAT-IA, assistente virtual brasileira que acolhe gestantes e mães.

IDENTIDADE
- Linguagem simples, calorosa, sem julgamentos
- Valide sentimentos e ofereça pequenas estratégias práticas
- Emojis apenas quando reforçam acolhimento (máx. 2)

REGRAS CRÍTICAS
1. Nunca forneça diagnósticos, tratamentos ou medicamentos
2. Sempre incentive contato com profissionais de saúde quando houver risco
3. Reforce limites: você oferece apoio emocional e informações gerais
4. Proteja privacidade e use tom empático

SAÍDA ESTRUTURADA
- Responda EXCLUSIVAMENTE em JSON válido conforme o schema recebido
- Campos obrigatórios: reply, actions, suggested_replies, mood, topics, recommendations, safety_notes
- reply deve ser texto curto (até ~220 palavras), acolhedor e prático

AÇÕES VÁLIDAS
- consultar_medico, buscar_apoio, ler_conteudo, juntar_circulo, iniciar_habito, sos

Lembre-se: você é companhia emocional, não profissional de saúde.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    actions: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: {
            type: 'string',
            enum: ['consultar_medico', 'buscar_apoio', 'ler_conteudo', 'juntar_circulo', 'iniciar_habito', 'sos'],
          },
          label: { type: 'string' },
          target: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
          payload: { type: 'object' },
        },
        required: ['type', 'label'],
      },
    },
    suggested_replies: {
      type: 'array',
      default: [],
      items: { type: 'string' },
      maxItems: 4,
    },
    mood: { type: 'string' },
    topics: {
      type: 'array',
      default: [],
      items: { type: 'string' },
    },
    recommendations: {
      type: 'object',
      default: {},
      additionalProperties: false,
      properties: {
        content: {
          type: 'array',
          default: [],
          items: { type: 'string' },
        },
        circles: {
          type: 'array',
          default: [],
          items: { type: 'string' },
        },
        habit: {
          anyOf: [{ type: 'string' }, { type: 'null' }],
        },
      },
    },
    safety_notes: {
      type: 'array',
      default: [],
      items: { type: 'string' },
    },
  },
  required: ['reply'],
} as const;

type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: Array<{ type: 'text'; text: string }>;
};

interface ClaudeAction {
  type: string;
  label?: string;
  target?: string | null;
  payload?: Record<string, unknown> | null;
}

interface ClaudeStructuredResponse {
  reply: string;
  actions?: ClaudeAction[];
  suggested_replies?: string[];
  mood?: string;
  topics?: string[];
  recommendations?: {
    content?: string[];
    circles?: string[];
    habit?: string | null;
  };
  safety_notes?: string[];
}

interface ClaudeUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

interface PreviousMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  user_id: string;
  message: string;
  context?: {
    stage?: string;
    mood?: string;
    pregnancyWeek?: number;
    concerns?: string[];
    previousMessages?: PreviousMessage[];
  };
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface NathiaAction {
  type: 'openScreen' | 'joinCircle' | 'startHabit' | 'showContent' | 'sos';
  label: string;
  data?: Record<string, unknown>;
}

interface NathiaChatResponse {
  response: string;
  actions: NathiaAction[];
  suggestedReplies: string[];
  contextUpdate: {
    mood?: string;
    riskLevel?: RiskLevel;
    needsModeration?: boolean;
  };
  safety: {
    level: SafetyLevel;
    reasons: string[];
    warning?: string;
    disclaimer?: string;
    supportResources: string[];
  };
  recommendations: {
    content: string[];
    circles: string[];
    habit?: string | null;
  };
  metadata: {
    timestamp: string;
    model: string;
    version: string;
    latencyMs: number;
    topics: string[];
  };
  usage?: ClaudeUsage;
}

interface SanitizedClaudeResponse {
  reply: string;
  actions: ClaudeAction[];
  suggestedReplies: string[];
  mood?: string;
  topics: string[];
  recommendations: {
    content: string[];
    circles: string[];
    habit?: string | null;
  };
  safetyNotes: string[];
}

function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`${key} não configurada`);
  }
  return value;
}

function toClaudeMessage(role: 'user' | 'assistant', text: string): ClaudeMessage {
  return {
    role,
    content: [
      {
        type: 'text',
        text: text.trim(),
      },
    ],
  };
}

async function loadHistory(supabase: SupabaseClient, userId: string): Promise<ClaudeMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, message, response')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) {
    return [];
  }

  const history: ClaudeMessage[] = [];
  data.reverse().forEach((row) => {
    if (row.message) {
      history.push(toClaudeMessage('user', row.message));
    }
    if (row.response) {
      history.push(toClaudeMessage('assistant', row.response));
    }
  });

  return history.slice(-10);
}

function buildUserPrompt(request: ChatRequest): string {
  const contextLines: string[] = [];
  const { context } = request;

  if (context?.stage) {
    contextLines.push(`Estágio: ${context.stage}`);
  }
  if (typeof context?.pregnancyWeek === 'number') {
    contextLines.push(`Semana de gestação: ${context.pregnancyWeek}`);
  }
  if (context?.mood) {
    contextLines.push(`Humor declarado: ${context.mood}`);
  }
  if (context?.concerns?.length) {
    contextLines.push(`Preocupações principais: ${context.concerns.join(', ')}`);
  }

  const header = contextLines.length > 0 ? `Contexto da usuária:\n- ${contextLines.join('\n- ')}\n\n` : '';
  return `${header}Mensagem:\n${request.message.trim()}`;
}

function buildClaudeMessages(request: ChatRequest, history: ClaudeMessage[]): ClaudeMessage[] {
  const messages: ClaudeMessage[] = [...history];

  const previous = request.context?.previousMessages ?? [];
  previous
    .slice(-6)
    .forEach((msg) => {
      if (msg.content && msg.content.trim().length > 0) {
        messages.push(toClaudeMessage(msg.role, msg.content));
      }
    });

  messages.push(toClaudeMessage('user', buildUserPrompt(request)));

  return messages.slice(-12);
}

function normalizeStringArray(value?: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function sanitizeClaudeResponse(raw: ClaudeStructuredResponse): SanitizedClaudeResponse {
  const recommendations = raw.recommendations ?? {};

  return {
    reply: typeof raw.reply === 'string' ? raw.reply.trim() : '',
    actions: Array.isArray(raw.actions) ? raw.actions : [],
    suggestedReplies: normalizeStringArray(raw.suggested_replies).slice(0, 4),
    mood: raw.mood && raw.mood.trim().length > 0 ? raw.mood.trim() : undefined,
    topics: normalizeStringArray(raw.topics),
    recommendations: {
      content: normalizeStringArray(recommendations.content),
      circles: normalizeStringArray(recommendations.circles),
      habit:
        typeof recommendations.habit === 'string' && recommendations.habit.trim().length > 0
          ? recommendations.habit.trim()
          : recommendations.habit === null
          ? null
          : undefined,
    },
    safetyNotes: normalizeStringArray(raw.safety_notes),
  };
}

function mapRiskLevel(level: SafetyLevel): RiskLevel {
  switch (level) {
    case 'urgent':
      return 'critical';
    case 'warning':
      return 'high';
    case 'caution':
      return 'medium';
    case 'safe':
    default:
      return 'low';
  }
}

function mapActions(claudeActions: ClaudeAction[] | undefined): NathiaAction[] {
  if (!claudeActions || claudeActions.length === 0) {
    return [];
  }

  return claudeActions
    .map<NathiaAction | null>((action) => {
      const label = action.label?.trim() && action.label.trim().length > 0 ? action.label.trim() : 'Ver detalhes';
      const payload = action.payload ?? {};

      switch (action.type) {
        case 'consultar_medico':
          return {
            type: 'openScreen',
            label,
            data: { screenName: 'EmergencyResources', ...payload },
          };
        case 'buscar_apoio':
        case 'juntar_circulo':
          return {
            type: 'joinCircle',
            label,
            data: { circleId: action.target ?? undefined, ...payload },
          };
        case 'ler_conteudo':
          return {
            type: 'showContent',
            label,
            data: { contentId: action.target ?? undefined, ...payload },
          };
        case 'iniciar_habito':
          return {
            type: 'startHabit',
            label,
            data: { habitId: action.target ?? undefined, ...payload },
          };
        case 'sos':
          return {
            type: 'sos',
            label,
            data: payload,
          };
        default:
          return {
            type: 'showContent',
            label,
            data: { contentId: action.target ?? undefined, ...payload },
          };
      }
    })
    .filter((item): item is NathiaAction => item !== null);
}

function parseClaudeResponse(raw: string): ClaudeStructuredResponse {
  const sanitized = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(sanitized) as ClaudeStructuredResponse;
}

async function callClaude(apiKey: string, messages: ClaudeMessage[]): Promise<{ data: ClaudeStructuredResponse; usage: ClaudeUsage }> {
  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    temperature: 0.4,
    system: SYSTEM_PROMPT,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'NathiaChatResponse',
        schema: RESPONSE_SCHEMA,
        strict: true,
      },
    },
    messages,
  };

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const textPart = Array.isArray(data.content)
    ? data.content.find((part: { type: string }) => part.type === 'text')
    : undefined;
  const rawText = typeof textPart?.text === 'string' ? textPart.text.trim() : '';

  if (!rawText) {
    throw new Error('Resposta vazia do Claude');
  }

  const structured = parseClaudeResponse(rawText);

  const usage: ClaudeUsage = {
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
    totalTokens:
      typeof data.usage?.total_tokens === 'number'
        ? data.usage.total_tokens
        : typeof data.usage?.input_tokens === 'number' && typeof data.usage?.output_tokens === 'number'
        ? data.usage.input_tokens + data.usage.output_tokens
        : undefined,
  };

  return {
    data: structured,
    usage,
  };
}

function jsonError(status: number, message: string, details?: unknown): Response {
  const body: Record<string, unknown> = { error: message };
  if (details) {
    body.details = details;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'POST' });
    return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405, headers });
  }

  const startTime = Date.now();

  try {
    const payload = (await req.json()) as ChatRequest;

    if (!payload?.user_id || typeof payload.user_id !== 'string') {
      return jsonError(400, 'user_id é obrigatório');
    }

    if (!payload?.message || typeof payload.message !== 'string') {
      return jsonError(400, 'message é obrigatório');
    }

    payload.message = payload.message.trim();

    if (payload.message.length === 0) {
      return jsonError(400, 'Mensagem vazia');
    }

    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const claudeKey = getRequiredEnv('CLAUDE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rateLimiter = new RateLimiter(supabase, RATE_LIMITS.CHAT);
    const rateLimit = await rateLimiter.check(payload.user_id, 'nathia-chat');

    if (!rateLimit.allowed) {
      const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' });
      addRateLimitHeaders(headers, rateLimit);
      return new Response(
        JSON.stringify({ error: 'Limite de requisições excedido', retryAfter: rateLimit.retryAfter }),
        { status: 429, headers }
      );
    }

    const safety = checkSafety(payload.message);
    const symptoms = extractSymptoms(payload.message);
    const medicalQuestion = isMedicalQuestion(payload.message);

    const history = await loadHistory(supabase, payload.user_id);
    const messages = buildClaudeMessages(payload, history);

    let claudeResult: { data: ClaudeStructuredResponse; usage: ClaudeUsage };

    try {
      claudeResult = await callClaude(claudeKey, messages);
    } catch (error) {
      console.error('[NAT-IA Chat] Claude error:', error);
      claudeResult = {
        data: {
          reply:
            'Desculpe, estou enfrentando instabilidade agora. Tente novamente em alguns instantes ou procure apoio nos círculos da comunidade. 💙',
          actions: [
            {
              type: 'buscar_apoio',
              label: 'Ir para círculos de apoio',
            },
          ],
          suggested_replies: ['Quero desabafar', 'Preciso de ajuda agora'],
          mood: 'neutro',
          topics: [],
          recommendations: {},
          safety_notes: [],
        },
        usage: {},
      };
    }

    const structured = sanitizeClaudeResponse(claudeResult.data);

    const disclaimerFromSafety = getMedicalDisclaimer(safety.level);
    const fallbackDisclaimer = medicalQuestion ? 'ℹ️ Estas informações não substituem orientação médica profissional.' : '';
    const disclaimer = (disclaimerFromSafety || fallbackDisclaimer).trim();
    const supportResources = suggestSupportResources(safety, symptoms);

    let finalReply = structured.reply.length > 0 ? structured.reply : 'Estou aqui com você, mas preciso de um tempinho para responder melhor. Pode tentar novamente em instantes? 💙';

    if (disclaimer) {
      finalReply = `${finalReply}\n\n${disclaimer}`;
    }

    if (safety.suggestedAction) {
      finalReply = `${finalReply}\n\n${safety.suggestedAction}`;
    }

    if (structured.safetyNotes.length > 0) {
      finalReply = `${finalReply}\n\n${structured.safetyNotes.join('\n')}`;
    }

    if (supportResources.length > 0) {
      finalReply = `${finalReply}\n\n${supportResources.join('\n')}`;
    }

    const riskLevel = mapRiskLevel(safety.level);
    const actions = mapActions(structured.actions);
    const needsModeration =
      riskLevel === 'high' ||
      riskLevel === 'critical' ||
      safety.shouldEscalate ||
      structured.safetyNotes.some((note) => note.toLowerCase().includes('moderação'));

    const responsePayload: NathiaChatResponse = {
      response: finalReply,
      actions,
      suggestedReplies: structured.suggestedReplies,
      contextUpdate: {
        mood: structured.mood,
        riskLevel,
        needsModeration,
      },
      safety: {
        level: safety.level,
        reasons: safety.reasons,
        warning: safety.suggestedAction,
        disclaimer: disclaimer || undefined,
        supportResources,
      },
      recommendations: {
        content: structured.recommendations.content,
        circles: structured.recommendations.circles,
        habit: structured.recommendations.habit ?? null,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        model: CLAUDE_MODEL,
        version: RESPONSE_VERSION,
        latencyMs: Date.now() - startTime,
        topics: structured.topics,
      },
      usage: claudeResult.usage,
    };

    await supabase.from('chat_messages').insert({
      user_id: payload.user_id,
      message: payload.message,
      response: responsePayload.response,
      role: 'user',
      context_data: {
        stage: payload.context?.stage,
        mood: responsePayload.contextUpdate.mood ?? payload.context?.mood,
        riskLevel: responsePayload.contextUpdate.riskLevel,
        safetyLevel: safety.level,
        actions: responsePayload.actions,
      },
      created_at: new Date().toISOString(),
    });

    await supabase.from('nathia_analytics').insert({
      event_type: 'chat',
      user_id: payload.user_id,
      metadata: {
        safety_level: safety.level,
        mood: responsePayload.contextUpdate.mood ?? 'desconhecido',
        risk_level: responsePayload.contextUpdate.riskLevel,
        topics: responsePayload.metadata.topics,
        response_time_ms: responsePayload.metadata.latencyMs,
        tokens_used: responsePayload.usage?.totalTokens,
      },
      created_at: new Date().toISOString(),
    });

    const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' });
    addRateLimitHeaders(headers, rateLimit);

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[NAT-IA Chat] Error:', error);
    const details = error instanceof Error ? error.message : 'unknown';
    return jsonError(500, 'Erro interno', details);
  }
});
