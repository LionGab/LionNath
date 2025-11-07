/**
 * NAT-IA Moderação - Edge Function para moderação assistida
 *
 * Classifica mensagens de círculos e sugere edições gentis
 * para manter ambiente acolhedor e seguro.
 *
 * Endpoint: POST /nathia-moderacao
 * Body: { message_id?, texto, author_context? }
 * Response: { labels[], sugestao?, rationale, auto_approve }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createGeminiClient } from '../_shared/gemini-client.ts';
import { RateLimiter, RATE_LIMITS, addRateLimitHeaders } from '../_shared/rate-limit.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const MODERACAO_SCHEMA = {
  type: 'object',
  properties: {
    labels: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['ok', 'julgamento', 'toxidade', 'sensivel', 'spam', 'comercial'],
      },
      description: 'Classificações da mensagem',
    },
    severity: {
      type: 'string',
      enum: ['none', 'low', 'medium', 'high'],
      description: 'Severidade de problemas identificados',
    },
    sugestao: {
      type: 'string',
      description: 'Reescrita gentil da mensagem (se necessário)',
    },
    rationale: {
      type: 'string',
      description: 'Explicação breve da classificação',
    },
    auto_approve: {
      type: 'boolean',
      description: 'true se mensagem pode ser aprovada automaticamente',
    },
  },
  required: ['labels', 'severity', 'rationale', 'auto_approve'],
};

const SYSTEM_PROMPT = \`Você é um moderador assistido especializado em comunidades de maternidade.

Sua missão é manter um ambiente acolhedor, seguro e livre de julgamentos para mães e gestantes.

## CLASSIFICAÇÕES

**ok**: Mensagem positiva, acolhedora e apropriada
- Compartilha experiência pessoal de forma respeitosa
- Oferece apoio genuíno
- Faz perguntas construtivas
- Celebra conquistas

**julgamento**: Contém julgamento ou crítica velada
- "Mãe de verdade não faz X"
- "Eu nunca faria isso"
- "Como você pode pensar em X?"
- Comparações depreciativas
- Críticas à escolhas pessoais (amamentação, parto, sono, etc)

**toxidade**: Linguagem ofensiva ou hostil
- Xingamentos ou insultos
- Ataques pessoais
- Linguagem agressiva
- Bullying ou assédio

**sensivel**: Tópico sensível que requer cuidado
- Perda gestacional
- Depressão pós-parto
- Violência doméstica
- Abuso
- Suicídio

**spam**: Conteúdo repetitivo ou irrelevante
- Mensagens duplicadas
- Conteúdo fora de contexto

**comercial**: Promove produtos ou serviços
- Links para vendas
- Divulgação de produtos
- MLM/pirâmide

## SEVERIDADE

- **none**: Mensagem completamente apropriada
- **low**: Pequena nuance que poderia ser melhorada
- **medium**: Problemas claros mas não graves
- **high**: Conteúdo inadequado ou prejudicial

## REESCRITA GENTIL

Quando sugerir reescrita:
- Mantenha a essência e intenção da mensagem
- Remova julgamento mas preserve a opinião pessoal
- Use linguagem "eu" em vez de "você deveria"
- Adicione empatia e validação
- Seja específica e prática

Exemplos:
❌ "Como você deixa seu filho chorar? Mãe de verdade não faz isso"
✅ "Entendo que é difícil. Aqui em casa, não consigo deixar chorar muito tempo, mas sei que cada família encontra seu jeito"

❌ "Fórmula é veneno, só preguiçosa não amamenta"
✅ "Amamentar foi importante pra mim, mas sei que cada jornada é única. O que importa é o bebê estar bem alimentado"

## AUTO-APROVAÇÃO

auto_approve: true quando:
- labels contém apenas "ok"
- severity é "none" ou "low"
- Nenhum conteúdo problemático

auto_approve: false quando:
- labels contém "toxidade", "spam" ou "comercial"
- severity é "high"
- Requer revisão humana\`;

interface ModeracaoRequest {
  message_id?: string;
  texto: string;
  author_context?: {
    user_id: string;
    previous_violations?: number;
  };
}

interface ModeracaoResponse {
  labels: string[];
  severity: string;
  sugestao?: string;
  rationale: string;
  auto_approve: boolean;
  metadata: {
    timestamp: string;
    model: string;
  };
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();

  try {
    const { message_id, texto, author_context }: ModeracaoRequest = await req.json();

    if (!texto) {
      return new Response(JSON.stringify({ error: 'texto é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (author_context?.user_id) {
      const rateLimiter = new RateLimiter(supabase, RATE_LIMITS.MODERACAO);
      const rateLimit = await rateLimiter.check(author_context.user_id, 'moderacao');

      if (!rateLimit.allowed) {
        const headers = new Headers({ ...corsHeaders, 'Content-Type': 'application/json' });
        addRateLimitHeaders(headers, rateLimit);

        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido', retryAfter: rateLimit.retryAfter }),
          { status: 429, headers }
        );
      }
    }

    let contextPrompt = texto;
    if (author_context?.previous_violations && author_context.previous_violations > 0) {
      contextPrompt = \`[Autor tem \${author_context.previous_violations} violação(ões) anterior(es)]

\${texto}\`;
    }

    const gemini = createGeminiClient();
    let response: ModeracaoResponse;

    try {
      const { data } = await gemini.generateJSON<any>(
        SYSTEM_PROMPT,
        \`Analise a seguinte mensagem:

\${contextPrompt}\`,
        MODERACAO_SCHEMA
      );

      response = {
        ...data,
        metadata: { timestamp: new Date().toISOString(), model: 'gemini-2.0-flash-exp' },
      };
    } catch (aiError: any) {
      console.error('[NAT-IA Moderação] AI Error:', aiError);
      response = {
        labels: ['sensivel'],
        severity: 'medium',
        rationale: 'Erro ao processar. Recomenda-se revisão humana.',
        auto_approve: false,
        metadata: { timestamp: new Date().toISOString(), model: 'fallback' },
      };
    }

    if (message_id) {
      await supabase.from('nathia_moderacao_log').insert({
        message_id,
        labels: response.labels,
        severity: response.severity,
        auto_approved: response.auto_approve,
        sugestao: response.sugestao,
        created_at: new Date().toISOString(),
      });
    }

    if (author_context?.user_id) {
      await supabase.from('nathia_analytics').insert({
        event_type: 'moderacao',
        user_id: author_context.user_id,
        metadata: {
          labels: response.labels,
          severity: response.severity,
          auto_approved: response.auto_approve,
          response_time_ms: Date.now() - startTime,
        },
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[NAT-IA Moderação] Error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
