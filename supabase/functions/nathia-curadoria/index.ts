/**
 * NAT-IA Curadoria - Edge Function para curadoria de conteúdo
 *
 * Simplifica e adapta conteúdo educacional para gestantes e mães
 * usando linguagem simples e acessível.
 *
 * Endpoint: POST /nathia-curadoria
 * Body: { content_id?, texto, tipo: "resumo"|"5min"|"checklist" }
 * Response: { resumo?, five_min?, checklist?, risco, cached }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createGeminiClient } from '../_shared/gemini-client.ts';
import { RateLimiter, RATE_LIMITS, addRateLimitHeaders } from '../_shared/rate-limit.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

// Schemas de resposta por tipo
const RESUMO_SCHEMA = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      description: 'Título curto e atrativo (máx 60 caracteres)',
    },
    resumo: {
      type: 'string',
      description: 'Resumo em linguagem simples (150-200 palavras)',
    },
    pontos_principais: {
      type: 'array',
      items: { type: 'string' },
      description: '3-5 pontos principais em tópicos',
    },
    relevancia: {
      type: 'string',
      description: 'Por que isso importa para mães/gestantes',
    },
    risco: {
      type: 'boolean',
      description: 'true se conteúdo contém desinformação ou risco',
    },
  },
  required: ['titulo', 'resumo', 'pontos_principais', 'relevancia', 'risco'],
};

const FIVE_MIN_SCHEMA = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      description: 'Título curto',
    },
    introducao: {
      type: 'string',
      description: 'Parágrafo de introdução (2-3 frases)',
    },
    secoes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subtitulo: { type: 'string' },
          conteudo: { type: 'string' },
        },
      },
      description: '3-4 seções com subtítulo e conteúdo',
    },
    conclusao: {
      type: 'string',
      description: 'Conclusão prática (2-3 frases)',
    },
    risco: {
      type: 'boolean',
      description: 'true se conteúdo contém desinformação',
    },
  },
  required: ['titulo', 'introducao', 'secoes', 'conclusao', 'risco'],
};

const CHECKLIST_SCHEMA = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      description: 'Título da checklist',
    },
    descricao: {
      type: 'string',
      description: 'Breve descrição (1-2 frases)',
    },
    itens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          texto: { type: 'string' },
          dica: { type: 'string' },
          opcional: { type: 'boolean' },
        },
      },
      description: 'Lista de itens acionáveis com dicas',
    },
    risco: {
      type: 'boolean',
      description: 'true se conteúdo contém desinformação',
    },
  },
  required: ['titulo', 'descricao', 'itens', 'risco'],
};

// System Prompts por tipo
const SYSTEM_PROMPTS = {
  resumo: `Você é um curador de conteúdo especializado em maternidade e saúde da mulher.

Sua tarefa é resumir textos complexos em linguagem simples e acessível para gestantes e mães.

DIRETRIZES:
- Use linguagem coloquial, próxima e acolhedora
- Evite termos técnicos ou explique-os quando necessário
- Foque no que é prático e aplicável
- Destaque informações mais relevantes
- Seja honesta sobre limitações do conhecimento
- IDENTIFIQUE desinformação ou conselhos perigosos (risco: true)

IMPORTANTE:
- Se o conteúdo sugerir tratamentos não comprovados ’ risco: true
- Se desencorajar vacinação ou cuidados médicos ’ risco: true
- Se promover produtos sem evidência científica ’ risco: true
- Se dar conselhos médicos específicos ’ risco: true`,

  '5min': `Você é um curador de conteúdo educacional para gestantes e mães.

Sua tarefa é transformar textos em leituras rápidas de 5 minutos, bem estruturadas.

ESTRUTURA:
- Introdução: contexto e por que importa
- 3-4 seções temáticas com subtítulos claros
- Cada seção: 2-3 parágrafos curtos
- Conclusão: mensagem principal ou ação prática

ESTILO:
- Linguagem simples, conversacional
- Parágrafos curtos (3-4 linhas)
- Exemplos práticos quando possível
- Tom encorajador, não assustador

SEGURANÇA:
- Marque risco: true se conteúdo for problemático
- Não propague desinformação médica`,

  checklist: `Você é um organizador de conteúdo prático para gestantes e mães.

Sua tarefa é transformar informações em checklists acionáveis e úteis.

FORMATO:
- Título: claro e específico
- Descrição: contexto rápido (quando/por que usar)
- Itens: ações específicas e práticas
- Dica: informação adicional útil por item
- Opcional: marque itens não essenciais

DIRETRIZES:
- Itens devem ser ações concretas
- Ordem lógica ou cronológica
- 5-10 itens idealmente
- Linguagem imperativa e positiva
- Inclua dicas práticas

SEGURANÇA:
- Não inclua ações médicas específicas
- Marque risco: true se houver orientações perigosas`,
};

interface CuradoriaRequest {
  content_id?: string;
  texto: string;
  tipo: 'resumo' | '5min' | 'checklist';
  user_id: string;
}

interface CuradoriaResponse {
  [key: string]: any;
  risco: boolean;
  cached: boolean;
  metadata: {
    timestamp: string;
    tipo: string;
    model: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();

  try {
    // Parse request
    const { content_id, texto, tipo, user_id }: CuradoriaRequest = await req.json();

    if (!texto || !tipo || !user_id) {
      return new Response(
        JSON.stringify({ error: 'texto, tipo e user_id são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!['resumo', '5min', 'checklist'].includes(tipo)) {
      return new Response(
        JSON.stringify({ error: 'tipo deve ser: resumo, 5min ou checklist' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting
    const rateLimiter = new RateLimiter(supabase, RATE_LIMITS.CURADORIA);
    const rateLimit = await rateLimiter.check(user_id, 'curadoria');

    if (!rateLimit.allowed) {
      const headers = new Headers({
        ...corsHeaders,
        'Content-Type': 'application/json',
      });
      addRateLimitHeaders(headers, rateLimit);

      return new Response(
        JSON.stringify({
          error: 'Limite de requisições excedido',
          retryAfter: rateLimit.retryAfter,
        }),
        { status: 429, headers }
      );
    }

    // Verificar cache (24h) se content_id fornecido
    let cachedResult = null;
    if (content_id) {
      const { data: cached } = await supabase
        .from('nathia_curadoria_cache')
        .select('*')
        .eq('content_id', content_id)
        .eq('tipo', tipo)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (cached) {
        cachedResult = cached.resultado;
      }
    }

    let response: CuradoriaResponse;

    if (cachedResult) {
      // Retornar do cache
      response = {
        ...cachedResult,
        cached: true,
        metadata: {
          timestamp: new Date().toISOString(),
          tipo,
          model: 'cached',
        },
      };
    } else {
      // Gerar novo conteúdo
      const schema = tipo === 'resumo' ? RESUMO_SCHEMA : tipo === '5min' ? FIVE_MIN_SCHEMA : CHECKLIST_SCHEMA;
      const systemPrompt = SYSTEM_PROMPTS[tipo];

      const gemini = createGeminiClient();

      try {
        const { data } = await gemini.generateJSON<any>(
          systemPrompt,
          `Processe o seguinte conteúdo:\n\n${texto}`,
          schema
        );

        response = {
          ...data,
          cached: false,
          metadata: {
            timestamp: new Date().toISOString(),
            tipo,
            model: 'gemini-2.0-flash-exp',
          },
        };

        // Salvar no cache se content_id fornecido
        if (content_id) {
          await supabase.from('nathia_curadoria_cache').upsert({
            content_id,
            tipo,
            resultado: data,
            created_at: new Date().toISOString(),
          });
        }
      } catch (aiError: any) {
        console.error('[NAT-IA Curadoria] AI Error:', aiError);

        return new Response(
          JSON.stringify({
            error: 'Erro ao processar conteúdo',
            message: aiError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Log de analytics
    await supabase.from('nathia_analytics').insert({
      event_type: 'curadoria',
      user_id,
      metadata: {
        tipo,
        cached: response.cached,
        risco: response.risco,
        response_time_ms: Date.now() - startTime,
      },
      created_at: new Date().toISOString(),
    });

    // Headers com rate limit info
    const headers = new Headers({
      ...corsHeaders,
      'Content-Type': 'application/json',
    });
    addRateLimitHeaders(headers, rateLimit);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('[NAT-IA Curadoria] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Erro interno',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
