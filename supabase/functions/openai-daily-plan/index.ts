import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DailyPlanRequest {
  context: {
    type?: 'gestante' | 'mae' | 'tentante';
    pregnancy_week?: number;
    baby_name?: string;
    preferences?: string[];
  };
  userId: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const { context, userId }: DailyPlanRequest = await req.json();

    // Verificar se o usuário está acessando seus próprios dados
    if (userId !== user.id) {
      throw new Error('Forbidden: Cannot access other user data');
    }

    // 🔒 API Key segura - apenas no servidor
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Chamar OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de maternidade. Crie um plano diário personalizado para gestantes/mães em PT-BR casual.',
          },
          {
            role: 'user',
            content: `Crie plano diário para: ${context.type}, ${context.pregnancy_week} semanas. Inclua: 3 prioridades, 1 dica do dia, 1 receita econômica.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse simples do conteúdo
    const priorities = content.match(/(?<=Prioridades:)(.*?)(?=Dica)/s)?.[0]?.split('\n').filter(Boolean) || [];
    const tip = content.match(/(?<=Dica do Dia:)(.*?)(?=Receita)/s)?.[0]?.trim() || '';
    const recipe = content.match(/(?<=Receita:)(.*?)$/s)?.[0]?.trim() || '';

    return new Response(JSON.stringify({ priorities, tip, recipe }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error:', error);

    // Fallback em caso de erro
    const fallback = {
      priorities: ['💧 Beber 8 copos de água', '📅 Marcar consulta pré-natal', '🧘 Exercícios leves'],
      tip: 'Cuidar de você é cuidar do seu bebê! Tire um tempo para respirar hoje. 💕',
      recipe: 'Vitamina de Banana: 1 banana + 1 copo de leite + 1 colher de mel. Batido com gelo!',
    };

    return new Response(JSON.stringify(fallback), {
      status: error.message.includes('Unauthorized') || error.message.includes('Forbidden') ? 401 : 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
