/**
 * NAT-IA Onboarding - Edge Function para onboarding inteligente
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createGeminiClient } from '../_shared/gemini-client.ts';
import { RateLimiter, RATE_LIMITS } from '../_shared/rate-limit.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const ONBOARDING_SCHEMA = {
  type: 'object',
  properties: {
    stage: {
      type: 'string',
      enum: ['tentante', 'gestante', 'mae', 'outro'],
      description: 'Estágio da jornada',
    },
    pregnancy_week: { type: 'number', description: 'Semana de gestação (se aplicável)' },
    baby_age_months: { type: 'number', description: 'Idade do bebê em meses (se aplicável)' },
    concerns: {
      type: 'array',
      items: { type: 'string' },
      description: 'Principais preocupações identificadas',
    },
    emotional_profile: {
      type: 'string',
      enum: ['confiante', 'ansiosa', 'sobrecarregada', 'curiosa', 'exausta'],
      description: 'Perfil emocional',
    },
    starter_pack: {
      type: 'object',
      properties: {
        grupos: { type: 'array', items: { type: 'string' } },
        conteudo: { type: 'array', items: { type: 'string' } },
        primeiro_objetivo: { type: 'string' },
      },
    },
  },
  required: ['stage', 'concerns', 'emotional_profile', 'starter_pack'],
};

const SYSTEM_PROMPT = \`Você é um especialista em onboarding para comunidades de maternidade.

Sua tarefa é analisar respostas de onboarding e extrair:
1. Estágio da jornada (tentante, gestante, mãe)
2. Preocupações principais (3-5 tópicos)
3. Perfil emocional
4. Recomendações iniciais personalizadas

Seja empática e atenta a nuances emocionais.\`;

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { user_id, respostas } = await req.json();

    if (!user_id || !respostas || !Array.isArray(respostas)) {
      return new Response(JSON.stringify({ error: 'user_id e respostas[] são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateLimiter = new RateLimiter(supabase, RATE_LIMITS.ONBOARDING);
    const rateLimit = await rateLimiter.check(user_id, 'onboarding');

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Limite excedido' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const gemini = createGeminiClient();
    const respostasText = respostas.map((r: any, i: number) => \`P\${i + 1}: \${r.question}
R\${i + 1}: \${r.answer}\`).join('

');

    const { data } = await gemini.generateJSON<any>(
      SYSTEM_PROMPT,
      \`Analise estas respostas de onboarding:

\${respostasText}\`,
      ONBOARDING_SCHEMA
    );

    await supabase.from('nathia_onboarding_results').insert({
      user_id,
      respostas,
      resultado: data,
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[NAT-IA Onboarding] Error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno', message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
