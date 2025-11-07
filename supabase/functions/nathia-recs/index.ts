/**
 * NAT-IA Recomendações - Edge Function para recomendações personalizadas
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createGeminiClient } from '../_shared/gemini-client.ts';
import { RateLimiter, RATE_LIMITS } from '../_shared/rate-limit.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const RECS_SCHEMA = {
  type: 'object',
  properties: {
    conteudo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          relevancia: { type: 'string' },
        },
      },
      description: '3-5 conteúdos recomendados',
    },
    circulos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          razao: { type: 'string' },
        },
      },
      description: '1-3 círculos recomendados',
    },
    habito: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descricao: { type: 'string' },
        frequencia: { type: 'string' },
      },
      description: 'Hábito/objetivo sugerido',
    },
    justificativa: {
      type: 'string',
      description: 'Por que essas recomendações',
    },
  },
  required: ['conteudo', 'circulos', 'justificativa'],
};

const SYSTEM_PROMPT = \`Você é um sistema de recomendação personalizado para gestantes e mães.

Analise o contexto da usuária e sugira:
- Conteúdo educacional relevante
- Círculos de apoio apropriados
- Hábito/objetivo prático

Seja específica e justifique suas recomendações.\`;

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { user_id, context } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateLimiter = new RateLimiter(supabase, RATE_LIMITS.RECS);
    const rateLimit = await rateLimiter.check(user_id, 'recs');

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Limite excedido' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar histórico recente (últimos 7 dias)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: history } = await supabase
      .from('chat_messages')
      .select('message, context_data')
      .eq('user_id', user_id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(10);

    const historyText = (history || [])
      .map((h: any) => h.message)
      .join('
');

    const gemini = createGeminiClient();

    const { data } = await gemini.generateJSON<any>(
      SYSTEM_PROMPT,
      \`Contexto da usuária: \${JSON.stringify(context)}

Mensagens recentes:
\${historyText}

Gere recomendações personalizadas.\`,
      RECS_SCHEMA
    );

    await supabase.from('nathia_analytics').insert({
      event_type: 'recs',
      user_id,
      metadata: { num_conteudos: data.conteudo?.length, num_circulos: data.circulos?.length },
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[NAT-IA Recs] Error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
