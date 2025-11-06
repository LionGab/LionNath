/**
 * Risk Analyzer - Análise de risco emocional usando Claude API
 *
 * Sistema paralelo de análise de risco para detectar crises emocionais
 */

import axios from 'axios';
import { getRiskLevel } from './guardrails';
import type { RiskAnalysis } from './schemas';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * System prompt para Claude especializado em saúde mental materna
 */
const RISK_ANALYSIS_SYSTEM_PROMPT = `Você é especialista em saúde mental materna com foco em detecção de crise.

Analise a mensagem e retorne APENAS JSON válido com análise de risco.

NÍVEIS:
- 0-2: Desabafo normal/saudável
- 3-4: Estresse elevado mas manejável
- 5-6: Sobrecarga significativa, monitorar
- 7-8: Sinais de depressão/ansiedade clínica
- 9-10: CRISE - suicídio, psicose, risco de harm

FLAGS (use APENAS se houver evidência clara):
- suicidal_ideation: Ideação suicida ou pensamentos de morte
- harm_to_baby: Pensamentos de machucar o bebê
- psychosis: Psicose ou alucinações
- self_harm: Pensamentos de auto-agressão
- severe_depression: Depressão severa (não conseguir cuidar do bebê)
- ppd: Sinais de depressão pós-parto
- burnout: Burnout materno
- normal_stress: Estresse normal da maternidade

RECURSOS (recomende baseado em urgência):
- cvv: Centro de Valorização da Vida (188)
- caps: Centro de Atenção Psicossocial
- emergency: Emergência médica (SAMU 192)
- therapy: Terapia psicológica

Seja preciso mas sensível. Não inferir demais. Isso pode salvar vidas.

Retorne JSON no formato:
{
  "level": número (0-10),
  "flags": ["flag1", "flag2"],
  "requires_intervention": boolean,
  "suggested_resources": ["recurso1", "recurso2"],
  "reasoning": "explicação breve"
}`;

/**
 * Analisa risco emocional da mensagem usando Claude API
 */
export async function analyzeRisk(message: string): Promise<RiskAnalysis> {
  try {
    if (!CLAUDE_API_KEY) {
      console.warn('CLAUDE_API_KEY não configurada, usando fallback');
      return fallbackRiskAnalysis(message);
    }

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.3, // Consistência
        system: RISK_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analise esta mensagem de uma mãe buscando apoio emocional:\n\n"${message}"`,
          },
        ],
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 segundos timeout
      }
    );

    const content = response.data.content[0].text;

    // Tentar extrair JSON da resposta
    let analysis: RiskAnalysis;
    try {
      // Procurar JSON no texto
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta Claude:', parseError);
      // Usar fallback se não conseguir parsear
      return fallbackRiskAnalysis(message);
    }

    // Validar estrutura
    if (
      typeof analysis.level !== 'number' ||
      !Array.isArray(analysis.flags) ||
      typeof analysis.requires_intervention !== 'boolean'
    ) {
      return fallbackRiskAnalysis(message);
    }

    // Garantir que level está entre 0-10
    analysis.level = Math.max(0, Math.min(10, analysis.level));

    // Garantir requires_intervention se level >= 9
    if (analysis.level >= 9) {
      analysis.requires_intervention = true;
    }

    return analysis;
  } catch (error: any) {
    console.error('Erro ao analisar risco com Claude:', error);
    // Usar fallback em caso de erro
    return fallbackRiskAnalysis(message);
  }
}

/**
 * Análise de risco usando fallback (regex-based)
 */
export function fallbackRiskAnalysis(message: string): RiskAnalysis {
  const lowerMessage = message.toLowerCase();
  const normalizedMessage = lowerMessage
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  let level = getRiskLevel(message); // Usa função dos guardrails
  const flags: string[] = [];
  const suggestedResources: string[] = [];

  // Detecção específica de flags
  if (
    normalizedMessage.includes('suicidio') ||
    normalizedMessage.includes('me matar') ||
    normalizedMessage.includes('quero morrer') ||
    normalizedMessage.includes('não vale a pena viver')
  ) {
    flags.push('suicidal_ideation');
    level = Math.max(level, 10);
    suggestedResources.push('cvv', 'emergency');
  }

  if (
    normalizedMessage.includes('machucar o bebe') ||
    normalizedMessage.includes('fazer mal ao bebe') ||
    normalizedMessage.includes('quero machucar o bebe')
  ) {
    flags.push('harm_to_baby');
    level = Math.max(level, 10);
    suggestedResources.push('emergency', 'caps');
  }

  if (
    normalizedMessage.includes('ouvir vozes') ||
    normalizedMessage.includes('ver coisas') ||
    normalizedMessage.includes('delirio')
  ) {
    flags.push('psychosis');
    level = Math.max(level, 9);
    suggestedResources.push('emergency', 'caps');
  }

  if (
    normalizedMessage.includes('me cortar') ||
    normalizedMessage.includes('me machucar') ||
    normalizedMessage.includes('auto-agressão')
  ) {
    flags.push('self_harm');
    level = Math.max(level, 8);
    suggestedResources.push('cvv', 'therapy');
  }

  if (
    normalizedMessage.includes('não consigo levantar') ||
    normalizedMessage.includes('não consigo cuidar do bebe') ||
    normalizedMessage.includes('não saio da cama')
  ) {
    flags.push('severe_depression');
    level = Math.max(level, 7);
    suggestedResources.push('therapy', 'caps');
  }

  if (
    normalizedMessage.includes('depressão pós-parto') ||
    normalizedMessage.includes('depressao pos parto') ||
    normalizedMessage.includes('ppd')
  ) {
    flags.push('ppd');
    level = Math.max(level, 6);
    suggestedResources.push('therapy', 'caps');
  }

  if (
    normalizedMessage.includes('não aguento mais') ||
    normalizedMessage.includes('sem energia') ||
    normalizedMessage.includes('exausta')
  ) {
    flags.push('burnout');
    level = Math.max(level, 4);
  }

  if (level <= 2) {
    flags.push('normal_stress');
  }

  return {
    level,
    flags,
    requires_intervention: level >= 7,
    suggested_resources: suggestedResources.length > 0 ? suggestedResources : [],
    reasoning: `Análise baseada em detecção de padrões: nível ${level} detectado${flags.length > 0 ? ` com flags: ${flags.join(', ')}` : ''}.`,
  };
}

/**
 * Gera resposta de intervenção baseada na análise
 */
export function generateInterventionResponse(analysis: RiskAnalysis, userName: string = 'querida'): string {
  if (analysis.level >= 9) {
    // CRISE - Resposta URGENTE
    return `Querida ${userName}, preciso ser direta com você agora. O que você compartilhou é muito sério, e você precisa de ajuda profissional urgente. Por favor:

🚨 **Se você estiver em perigo imediato**: Ligue para o SAMU - 192

💝 **Se você estiver pensando em se machucar**: Ligue para o CVV - 188 (disponível 24h, gratuito e anônimo)

🏥 **Procure um CAPS** (Centro de Atenção Psicossocial) mais próximo de você

Se você tiver um plano concreto de se machucar, vá imediatamente ao hospital mais próximo ou ligue 192.

Você não está sozinha. Há ajuda disponível, e você merece cuidado e apoio profissional agora. Não hesite em buscar ajuda.

Estou aqui para você, mas a ajuda profissional é essencial neste momento. 💝`;
  }

  if (analysis.level >= 7) {
    // Situação séria mas menos alarmante
    return `Oi ${userName}! Obrigada por compartilhar isso comigo. Sinto muito que você esteja passando por um momento tão difícil.

O que você está enfrentando parece ser algo que requer atenção profissional. Por favor, considere:

💝 **CVV - 188** (24h, gratuito e anônimo) para apoio imediato
🏥 **CAPS** ou um psicólogo especializado em saúde mental materna
💊 Se já tiver acompanhamento médico, fale com seu médico sobre isso

Você não está sozinha, e há ajuda disponível. Buscar apoio é um ato de coragem e cuidado com você mesma.

Estou aqui sempre que precisar. 🤗`;
  }

  // Nível < 7: Sem intervenção específica necessária
  return '';
}

// Re-export type from schemas for convenience
export type { RiskAnalysis } from './schemas';
