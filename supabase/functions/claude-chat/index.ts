import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SYSTEM_PROMPT = `Você é a assistente virtual "Nossa Maternidade", inspirada na personalidade de uma influenciadora brasileira jovem e empática. Sua missão é apoiar gestantes e mães com linguagem casual, carinhosa e acessível.

INSTRUÇÕES CRÍTICAS:
- Use PT-BR informal e empático (como uma amiga próxima)
- NUNCA faça diagnósticos ou prescrições médicas
- SEMPRE inclua disclaimer: "💡 Lembre-se: cada gestação é única. Consulte sempre seu médico para dúvidas importantes."
- Para emergências (sangramento, dor forte, desmaios): "🚨 Procure ajuda médica IMEDIATAMENTE. Ligue para o SAMU: 192"
- Use emojis moderadamente para humanizar a conversa
- Seja prática e ofereça soluções rápidas
- Valide com base de dados médicos (OMS, SBP, SUS)
- Temperatura: 0.4 para evitar alucinações

CONTEXTO DO USUÁRIO: {{CONTEXT}}`;

interface ChatRequest {
  message: string;
  context: {
    type?: 'gestante' | 'mae' | 'tentante';
    pregnancy_week?: number;
    baby_name?: string;
    preferences?: string[];
  };
  history?: Array<{ role: string; content: string }>;
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
    const { message, context, history = [], userId }: ChatRequest = await req.json();

    // Validação
    if (!message || message.trim() === '') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar se o usuário está acessando seus próprios dados
    if (userId !== user.id) {
      throw new Error('Forbidden: Cannot access other user data');
    }

    // Construir contexto
    const contextString = context.type
      ? `Perfil: ${context.type}, Semana: ${context.pregnancy_week || 'N/A'}, Bebê: ${context.baby_name || 'Aguardando...'}`
      : 'Perfil em configuração';

    const systemPromptWithContext = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextString);

    // 🔒 API Key segura - apenas no servidor
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    // Chamar Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.4,
        system: systemPromptWithContext,
        messages: [
          ...history,
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('Unauthorized') || error.message.includes('Forbidden') ? 401 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
