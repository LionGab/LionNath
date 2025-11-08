/**
 * Risk Analyzer - Análise híbrida de risco emocional
 *
 * Combina Edge Function segura (Gemini + Claude) com heurísticas locais
 * para detectar crises emocionais sem expor API keys no cliente.
 */

import { getRiskLevel } from './guardrails';

const RISK_CLASSIFIER_FUNCTION = 'risk-classifier';

export interface RiskAnalysis {
  level: number; // 0-10
  flags: string[]; // ex: ["suicidal_ideation", "severe_depression"]
  requires_intervention: boolean;
  suggested_resources: string[]; // ex: ["cvv", "caps", "emergency"]
  reasoning: string;
}

type RiskClassifierAction = 'none' | 'consult_doctor' | 'call_samu' | 'call_cvv';

interface RiskClassifierResponse {
  medicalRisk: number;
  psychologicalRisk: number;
  urgencyKeywords: string[];
  recommendedAction: RiskClassifierAction;
  confidence: number;
}

/**
 * Analisa risco emocional da mensagem usando Edge Function segura
 */
export async function analyzeRisk(message: string, userId?: string): Promise<RiskAnalysis> {
  const fallback = fallbackRiskAnalysis(message);

  try {
    const { supabase } = await import('@/services/supabase');
    const { data, error } = await supabase.functions.invoke<RiskClassifierResponse>(RISK_CLASSIFIER_FUNCTION, {
      body: {
        message,
        userId,
      },
    });

    if (error || !data) {
      if (error) {
        console.error('Risk classifier invocation failed:', error);
      }
      return fallback;
    }

    const edgeAnalysis = mapClassificationToRiskAnalysis(data, fallback);
    return mergeRiskAnalyses(fallback, edgeAnalysis);
  } catch (error: any) {
    console.error('Risk analysis edge invocation error:', error);
    return fallback;
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

function mapClassificationToRiskAnalysis(classification: RiskClassifierResponse, baseline: RiskAnalysis): RiskAnalysis {
  const level = Math.round(Math.max(classification.medicalRisk, classification.psychologicalRisk));
  const flags = new Set(baseline.flags);

  if (classification.medicalRisk >= 7) {
    flags.add('medical_emergency');
  } else if (classification.medicalRisk >= 4) {
    flags.add('medical_attention');
  }

  if (classification.psychologicalRisk >= 8) {
    flags.add('psychological_crisis');
  } else if (classification.psychologicalRisk >= 5) {
    flags.add('psychological_distress');
  }

  for (const keyword of classification.urgencyKeywords) {
    const normalized = normalizeKeyword(keyword);
    if (normalized.includes('suicid') || normalized.includes('morrer') || normalized.includes('me matar')) {
      flags.add('suicidal_ideation');
    }
    if (normalized.includes('machucar') && normalized.includes('bebe')) {
      flags.add('harm_to_baby');
    }
    if (normalized.includes('dor') || normalized.includes('sangr') || normalized.includes('desmaio')) {
      flags.add('acute_pain');
    }
  }

  const suggestedResources = new Set(baseline.suggested_resources);
  switch (classification.recommendedAction) {
    case 'call_samu':
      suggestedResources.add('emergency');
      break;
    case 'call_cvv':
      suggestedResources.add('cvv');
      break;
    case 'consult_doctor':
      suggestedResources.add('therapy');
      suggestedResources.add('medical_followup');
      break;
    default:
      break;
  }

  const requiresIntervention =
    level >= 8 ||
    classification.recommendedAction === 'call_samu' ||
    classification.recommendedAction === 'call_cvv' ||
    baseline.requires_intervention;

  const reasoningParts = [
    `Edge classifier: médico ${classification.medicalRisk.toFixed(1)}, psicológico ${classification.psychologicalRisk.toFixed(
      1
    )}, ação "${classification.recommendedAction}"`,
  ];
  if (classification.urgencyKeywords.length > 0) {
    reasoningParts.push(`Palavras-chave críticas: ${classification.urgencyKeywords.join(', ')}`);
  }
  reasoningParts.push(baseline.reasoning);

  return {
    level,
    flags: Array.from(flags),
    requires_intervention: requiresIntervention,
    suggested_resources: Array.from(suggestedResources),
    reasoning: reasoningParts.join(' | '),
  };
}

function mergeRiskAnalyses(base: RiskAnalysis, edge: RiskAnalysis): RiskAnalysis {
  return {
    level: Math.max(base.level, edge.level),
    flags: Array.from(new Set([...base.flags, ...edge.flags])),
    requires_intervention: base.requires_intervention || edge.requires_intervention,
    suggested_resources: Array.from(new Set([...base.suggested_resources, ...edge.suggested_resources])),
    reasoning: `Análise híbrida → ${edge.reasoning}`,
  };
}

function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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
