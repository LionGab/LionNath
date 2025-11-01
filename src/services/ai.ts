// 🔒 SEGURANÇA: Chamadas de IA agora usam Edge Functions do Supabase
// API keys ficam protegidas no servidor, impossível extrair do bundle

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

export interface ChatContext {
  type?: 'gestante' | 'mae' | 'tentante';
  pregnancy_week?: number;
  baby_name?: string;
  preferences?: string[];
}

/**
 * Chat com NAT-IA via Edge Function (Gemini 2.0 Flash)
 * Usa nathia-chat Edge Function do Supabase
 */
export const chatWithNATIA = async (
  message: string,
  context: ChatContext,
  userId: string
): Promise<string> => {
  try {
    const { supabase } = await import('./supabase');

    const { data, error } = await supabase.functions.invoke('nathia-chat', {
      body: {
        userId,
        message,
        context,
      },
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data?.response) {
      throw new Error('Resposta vazia da Edge Function');
    }

    return data.response;
  } catch (error: any) {
    // Re-throw para ser tratado pelo retry system
    throw new Error(`NAT-IA API error: ${error.message}`);
  }
};

/**
 * Chat com Claude via Edge Function (SEGURO - API key no servidor)
 * @deprecated Use chatWithNATIA para produção (Gemini é mais rápido)
 */
export const chatWithAI = async (
  message: string,
  context: ChatContext,
  history: any[] = [],
  userId: string
): Promise<string> => {
  try {
    const { supabase } = await import('./supabase');

    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        userId,
        message,
        context,
        history,
      },
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data?.response) {
      throw new Error('Resposta vazia da Edge Function');
    }

    return data.response;
  } catch (error: any) {
    // Re-throw para ser tratado pelo retry system
    throw new Error(`Claude API error: ${error.message}`);
  }
};

/**
 * Valida resposta de IA com GPT via Edge Function (SEGURO - API key no servidor)
 */
export const validateWithGPT = async (message: string, userId: string): Promise<boolean> => {
  try {
    const { supabase } = await import('./supabase');

    const { data, error } = await supabase.functions.invoke('openai-validate', {
      body: {
        userId,
        message,
      },
    });

    if (error) {
      console.error('Erro na validação GPT:', error);
      return true; // Permite resposta em caso de erro
    }

    return data?.isValid ?? true;
  } catch (error) {
    console.error('Erro na validação GPT:', error);
    return true; // Permite resposta em caso de erro
  }
};

/**
 * Gera plano diário com GPT via Edge Function (SEGURO - API key no servidor)
 */
export const generateDailyPlan = async (context: ChatContext, userId: string): Promise<any> => {
  try {
    const { supabase } = await import('./supabase');

    const { data, error } = await supabase.functions.invoke('openai-daily-plan', {
      body: {
        userId,
        context,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao gerar plano diário:', error);
    return {
      priorities: ['💧 Beber 8 copos de água', '📅 Marcar consulta pré-natal', '🧘 Exercícios leves'],
      tip: 'Cuidar de você é cuidar do seu bebê! Tire um tempo para respirar hoje. 💕',
      recipe: 'Vitamina de Banana: 1 banana + 1 copo de leite + 1 colher de mel. Batido com gelo!',
    };
  }
};

/**
 * Gera imagem com DALL-E via Edge Function (SEGURO - API key no servidor)
 */
export const generateImage = async (prompt: string, userId: string): Promise<string> => {
  try {
    const { supabase } = await import('./supabase');

    const { data, error } = await supabase.functions.invoke('openai-image-gen', {
      body: {
        userId,
        prompt,
      },
    });

    if (error) {
      throw error;
    }

    return data?.imageUrl || '';
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    return '';
  }
};

export const detectUrgency = (message: string): boolean => {
  const urgencyKeywords = [
    'sangrando', 'sangramento', 'sangue',
    'dor forte', 'muita dor', 'dor insuportável',
    'desmaio', 'desmaiei',
    'febre alta',
    'convulsão',
    'não me sinto bem',
    'emergência',
    'urgente',
  ];

  const lowerMessage = message.toLowerCase();
  return urgencyKeywords.some(keyword => lowerMessage.includes(keyword));
};
