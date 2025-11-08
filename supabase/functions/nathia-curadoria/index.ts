/**
 * NAT-IA Curadoria - Edge Function para curadoria de conte�do
 *
 * Simplifica e adapta conte�do educacional para gestantes e m�es
 * usando linguagem simples e acess�vel.
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
      description: 'T�tulo curto e atrativo (m�x 60 caracteres)',
    },
    resumo: {
      type: 'string',
      description: 'Resumo em linguagem simples (150-200 palavras)',
    },
    pontos_principais: {
      type: 'array',
      items: { type: 'string' },
      description: '3-5 pontos principais em t�picos',
    },
    relevancia: {
      type: 'string',
      description: 'Por que isso importa para m�es/gestantes',
    },
    risco: {
      type: 'boolean',
      description: 'true se conte�do cont�m desinforma��o ou risco',
    },
  },
  required: ['titulo', 'resumo', 'pontos_principais', 'relevancia', 'risco'],
};

const FIVE_MIN_SCHEMA = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      description: 'T�tulo curto',
    },
    introducao: {
      type: 'string',
      description: 'Par�grafo de introdu��o (2-3 frases)',
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
      description: '3-4 se��es com subt�tulo e conte�do',
    },
    conclusao: {
      type: 'string',
      description: 'Conclus�o pr�tica (2-3 frases)',
    },
    risco: {
      type: 'boolean',
      description: 'true se conte�do cont�m desinforma��o',
    },
  },
  required: ['titulo', 'introducao', 'secoes', 'conclusao', 'risco'],
};

const CHECKLIST_SCHEMA = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      description: 'T�tulo da checklist',
    },
    descricao: {
      type: 'string',
      description: 'Breve descri��o (1-2 frases)',
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
      description: 'Lista de itens acion�veis com dicas',
    },
    risco: {
      type: 'boolean',
      description: 'true se conte�do cont�m desinforma��o',
    },
  },
  required: ['titulo', 'descricao', 'itens', 'risco'],
};

// System Prompts por tipo
const SYSTEM_PROMPTS = {
  resumo: `Voc� � um curador de conte�do especializado em maternidade e sa�de da mulher.

Sua tarefa � resumir textos complexos em linguagem simples e acess�vel para gestantes e m�es.

DIRETRIZES:
- Use linguagem coloquial, pr�xima e acolhedora
- Evite termos t�cnicos ou explique-os quando necess�rio
- Foque no que � pr�tico e aplic�vel
- Destaque informa��es mais relevantes
- Seja honesta sobre limita��es do conhecimento
- IDENTIFIQUE desinforma��o ou conselhos perigosos (risco: true)

IMPORTANTE:
- Se o conte�do sugerir tratamentos n�o comprovados � risco: true
- Se desencorajar vacina��o ou cuidados m�dicos � risco: true
- Se promover produtos sem evid�ncia cient�fica � risco: true
- Se dar conselhos m�dicos espec�ficos � risco: true`,

  '5min': `Voc� � um curador de conte�do educacional para gestantes e m�es.

Sua tarefa � transformar textos em leituras r�pidas de 5 minutos, bem estruturadas.

ESTRUTURA:
- Introdu��o: contexto e por que importa
- 3-4 se��es tem�ticas com subt�tulos claros
- Cada se��o: 2-3 par�grafos curtos
- Conclus�o: mensagem principal ou a��o pr�tica

ESTILO:
- Linguagem simples, conversacional
- Par�grafos curtos (3-4 linhas)
- Exemplos pr�ticos quando poss�vel
- Tom encorajador, n�o assustador

SEGURAN�A:
- Marque risco: true se conte�do for problem�tico
- N�o propague desinforma��o m�dica`,

  checklist: `Voc� � um organizador de conte�do pr�tico para gestantes e m�es.

Sua tarefa � transformar informa��es em checklists acion�veis e �teis.

FORMATO:
- T�tulo: claro e espec�fico
- Descri��o: contexto r�pido (quando/por que usar)
- Itens: a��es espec�ficas e pr�ticas
- Dica: informa��o adicional �til por item
- Opcional: marque itens n�o essenciais

DIRETRIZES:
- Itens devem ser a��es concretas
- Ordem l�gica ou cronol�gica
- 5-10 itens idealmente
- Linguagem imperativa e positiva
- Inclua dicas pr�ticas

SEGURAN�A:
- N�o inclua a��es m�dicas espec�ficas
- Marque risco: true se houver orienta��es perigosas`,
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
      return new Response(JSON.stringify({ error: 'texto, tipo e user_id s�o obrigat�rios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['resumo', '5min', 'checklist'].includes(tipo)) {
      return new Response(JSON.stringify({ error: 'tipo deve ser: resumo, 5min ou checklist' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
          error: 'Limite de requisi��es excedido',
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
      // Gerar novo conte�do
      const schema = tipo === 'resumo' ? RESUMO_SCHEMA : tipo === '5min' ? FIVE_MIN_SCHEMA : CHECKLIST_SCHEMA;
      const systemPrompt = SYSTEM_PROMPTS[tipo];

      const gemini = createGeminiClient();

      try {
        const { data } = await gemini.generateJSON<any>(
          systemPrompt,
          `Processe o seguinte conte�do:\n\n${texto}`,
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
            error: 'Erro ao processar conte�do',
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
