/**
 * Risk Analyzer - fallback local para análise de risco emocional
 *
 * Detecção heurística baseada em palavras-chave. Para uso completo,
 * mantenha a lógica sensível em Edge Functions seguras no Supabase.
 */

import { getRiskLevel } from './guardrails';

export interface RiskAnalysis {
  level: number; // 0-10
  flags: string[]; // ex: ["suicidal_ideation", "severe_depression"]
  requires_intervention: boolean;
  suggested_resources: string[]; // ex: ["cvv", "caps", "emergency"]
  reasoning: string;
}

/**
 * Analisa risco emocional usando heurísticas locais.
 * Em produção, utilize a Edge Function `risk-classifier` para análise completa.
 */
export async function analyzeRisk(message: string): Promise<RiskAnalysis> {
  console.warn(
    '[RiskAnalyzer] Edge Function indisponível neste contexto compartilhado. Usando fallback local de detecção.'
  );
  return fallbackRiskAnalysis(message);
}

/**
 * Análise de risco usando fallback baseado em regex quando Claude API não está disponível
 *
 * Sistema de detecção de padrões que identifica palavras-chave relacionadas a crises
 * emocionais, ideação suicida, depressão pós-parto e outros riscos.
 *
 * @param {string} message - Mensagem da usuária a ser analisada
 * @returns {RiskAnalysis} Análise de risco com nível, flags e recursos sugeridos
 *
 * @example
 * ```typescript
 * const analysis = fallbackRiskAnalysis("Quero me matar");
 * // Retorna: { level: 10, flags: ['suicidal_ideation'], requires_intervention: true, ... }
 * ```
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
 * Gera uma resposta de intervenção apropriada baseada no nível de risco detectado
 *
 * Cria mensagens empáticas e direcionadas com recursos de ajuda profissional
 * adaptados à gravidade da situação (CVV, SAMU, CAPS, etc).
 *
 * @param {RiskAnalysis} analysis - Análise de risco da mensagem
 * @param {string} [userName='querida'] - Nome da usuária para personalizar a resposta
 * @returns {string} Mensagem de intervenção formatada (vazio se nível < 7)
 *
 * @example
 * ```typescript
 * const analysis = { level: 9, flags: ['suicidal_ideation'], ... };
 * const response = generateInterventionResponse(analysis, 'Maria');
 * // Retorna mensagem urgente com contatos de emergência
 * ```
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
