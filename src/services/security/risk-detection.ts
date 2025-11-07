/**
 * NAT-IA Risk Detection Service
 * Crisis Detection & Mental Health Risk Assessment
 * CRÍTICO: Usar com sensibilidade - contexto de saúde materna
 */

import {
  RiskAnalysisResult,
  RiskLevel,
  UrgencyLevel,
  RiskSignal,
  RiskSignalType,
  RecommendedAction,
  SecurityContext,
} from './types';
import {
  SELF_HARM_KEYWORDS,
  SUICIDE_IDEATION_KEYWORDS,
  PANIC_KEYWORDS,
  SEVERE_DEPRESSION_KEYWORDS,
  POSTPARTUM_PSYCHOSIS_KEYWORDS,
  VIOLENCE_KEYWORDS,
  RISK_SCORES,
  RISK_THRESHOLDS,
  EMERGENCY_RESOURCES,
} from './constants';

/**
 * Analisa risco de uma mensagem
 * @param mensagem - Mensagem a ser analisada
 * @param contexto - Contexto da usuária
 * @returns Resultado da análise de risco
 */
export function analisarRisco(
  mensagem: string,
  contexto?: SecurityContext
): RiskAnalysisResult {
  if (!mensagem || mensagem.trim().length === 0) {
    return {
      level: RiskLevel.NONE,
      score: 0,
      signals: [],
      urgency: UrgencyLevel.ROUTINE,
      recommendedAction: RecommendedAction.NONE,
      needsHumanReview: false,
    };
  }

  const mensagemLower = mensagem.toLowerCase();
  const signals: RiskSignal[] = [];
  let totalScore = 0;

  // 1. Detectar autoagressão
  const selfHarmSignal = detectarAutoagressao(mensagemLower);
  if (selfHarmSignal) {
    signals.push(selfHarmSignal);
    totalScore += RISK_SCORES.SELF_HARM;
  }

  // 2. Detectar ideação suicida
  const suicideSignal = detectarIdeacaoSuicida(mensagemLower);
  if (suicideSignal) {
    signals.push(suicideSignal);
    totalScore += RISK_SCORES.SUICIDE_IDEATION;
  }

  // 3. Detectar ataque de pânico
  const panicSignal = detectarPanico(mensagemLower);
  if (panicSignal) {
    signals.push(panicSignal);
    totalScore += RISK_SCORES.PANIC_ATTACK;
  }

  // 4. Detectar depressão severa
  const depressionSignal = detectarDepressaoSevera(mensagemLower);
  if (depressionSignal) {
    signals.push(depressionSignal);
    totalScore += RISK_SCORES.SEVERE_DEPRESSION;
  }

  // 5. Detectar psicose pós-parto
  const psychosisSignal = detectarPsicosePosParto(mensagemLower);
  if (psychosisSignal) {
    signals.push(psychosisSignal);
    totalScore += RISK_SCORES.POSTPARTUM_PSYCHOSIS;
  }

  // 6. Detectar violência/abuso
  const violenceSignal = detectarViolencia(mensagemLower);
  if (violenceSignal) {
    signals.push(violenceSignal);
    totalScore += RISK_SCORES.VIOLENCE_THREAT;
  }

  // Normalizar score (0-100)
  const normalizedScore = Math.min(100, totalScore);

  // Determinar nível de risco
  const level = determinarNivelRisco(normalizedScore);

  // Determinar urgência
  const urgency = determinarUrgencia(signals, level);

  // Determinar ação recomendada
  const recommendedAction = determinarAcaoRecomendada(level, urgency, signals);

  // Determinar se precisa de revisão humana
  const needsHumanReview = level >= RiskLevel.HIGH || urgency >= UrgencyLevel.URGENT;

  return {
    level,
    score: normalizedScore,
    signals,
    urgency,
    recommendedAction,
    needsHumanReview,
  };
}

/**
 * Detecta sinais de autoagressão
 */
function detectarAutoagressao(mensagem: string): RiskSignal | null {
  const matches: string[] = [];

  for (const keyword of SELF_HARM_KEYWORDS) {
    if (mensagem.includes(keyword)) {
      matches.push(keyword);
    }
  }

  if (matches.length > 0) {
    return {
      type: RiskSignalType.SELF_HARM,
      indicator: 'Menção explícita de autoagressão',
      confidence: 0.9,
      context: `Detectadas ${matches.length} menções`,
    };
  }

  return null;
}

/**
 * Detecta ideação suicida
 */
function detectarIdeacaoSuicida(mensagem: string): RiskSignal | null {
  const matches: string[] = [];

  for (const keyword of SUICIDE_IDEATION_KEYWORDS) {
    if (mensagem.includes(keyword)) {
      matches.push(keyword);
    }
  }

  if (matches.length > 0) {
    return {
      type: RiskSignalType.SUICIDE_IDEATION,
      indicator: 'Ideação suicida detectada',
      confidence: 0.95,
      context: `Detectadas ${matches.length} menções críticas`,
    };
  }

  return null;
}

/**
 * Detecta ataque de pânico
 */
function detectarPanico(mensagem: string): RiskSignal | null {
  const matches: string[] = [];

  for (const keyword of PANIC_KEYWORDS) {
    if (mensagem.includes(keyword)) {
      matches.push(keyword);
    }
  }

  if (matches.length >= 2) {
    // Requer múltiplos sintomas
    return {
      type: RiskSignalType.PANIC_ATTACK,
      indicator: 'Sintomas de ataque de pânico',
      confidence: 0.8,
      context: `Detectados ${matches.length} sintomas`,
    };
  }

  return null;
}

/**
 * Detecta depressão severa
 */
function detectarDepressaoSevera(mensagem: string): RiskSignal | null {
  const matches: string[] = [];

  for (const keyword of SEVERE_DEPRESSION_KEYWORDS) {
    if (mensagem.includes(keyword)) {
      matches.push(keyword);
    }
  }

  if (matches.length >= 2) {
    return {
      type: RiskSignalType.SEVERE_DEPRESSION,
      indicator: 'Sinais de depressão severa',
      confidence: 0.75,
      context: `Detectados ${matches.length} indicadores`,
    };
  }

  return null;
}

/**
 * Detecta psicose pós-parto (CRÍTICO)
 */
function detectarPsicosePosParto(mensagem: string): RiskSignal | null {
  const matches: string[] = [];

  for (const keyword of POSTPARTUM_PSYCHOSIS_KEYWORDS) {
    if (mensagem.includes(keyword)) {
      matches.push(keyword);
    }
  }

  if (matches.length > 0) {
    return {
      type: RiskSignalType.POSTPARTUM_PSYCHOSIS,
      indicator: 'Possível psicose pós-parto',
      confidence: 0.9,
      context: `EMERGÊNCIA: Detectados ${matches.length} sinais críticos`,
    };
  }

  return null;
}

/**
 * Detecta violência/abuso
 */
function detectarViolencia(mensagem: string): RiskSignal | null {
  const matches: string[] = [];

  for (const keyword of VIOLENCE_KEYWORDS) {
    if (mensagem.includes(keyword)) {
      matches.push(keyword);
    }
  }

  if (matches.length > 0) {
    return {
      type: RiskSignalType.ABUSE_REPORT,
      indicator: 'Relato de violência ou abuso',
      confidence: 0.85,
      context: `Detectadas ${matches.length} menções`,
    };
  }

  return null;
}

/**
 * Determina nível de risco baseado no score
 */
function determinarNivelRisco(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.CRITICAL) return RiskLevel.CRITICAL;
  if (score >= RISK_THRESHOLDS.HIGH) return RiskLevel.HIGH;
  if (score >= RISK_THRESHOLDS.MEDIUM) return RiskLevel.MEDIUM;
  if (score >= RISK_THRESHOLDS.LOW) return RiskLevel.LOW;
  return RiskLevel.NONE;
}

/**
 * Determina urgência baseada nos sinais
 */
function determinarUrgencia(signals: RiskSignal[], level: RiskLevel): UrgencyLevel {
  // Psicose pós-parto ou ideação suicida = EMERGÊNCIA
  const hasCriticalSignals = signals.some(
    (s) =>
      s.type === RiskSignalType.POSTPARTUM_PSYCHOSIS ||
      s.type === RiskSignalType.SUICIDE_IDEATION
  );

  if (hasCriticalSignals) return UrgencyLevel.EMERGENCY;

  // Autoagressão ou violência = URGENTE
  const hasUrgentSignals = signals.some(
    (s) =>
      s.type === RiskSignalType.SELF_HARM ||
      s.type === RiskSignalType.VIOLENCE_THREAT ||
      s.type === RiskSignalType.ABUSE_REPORT
  );

  if (hasUrgentSignals) return UrgencyLevel.URGENT;

  // Baseado no nível
  if (level === RiskLevel.CRITICAL) return UrgencyLevel.EMERGENCY;
  if (level === RiskLevel.HIGH) return UrgencyLevel.URGENT;
  if (level === RiskLevel.MEDIUM) return UrgencyLevel.ELEVATED;

  return UrgencyLevel.ROUTINE;
}

/**
 * Determina ação recomendada
 */
function determinarAcaoRecomendada(
  level: RiskLevel,
  urgency: UrgencyLevel,
  signals: RiskSignal[]
): RecommendedAction {
  // EMERGÊNCIA: Contato imediato
  if (urgency === UrgencyLevel.EMERGENCY) {
    return RecommendedAction.EMERGENCY_CONTACT;
  }

  // URGENTE: Escalar para moderador
  if (urgency === UrgencyLevel.URGENT) {
    return RecommendedAction.ESCALATE_TO_MODERATOR;
  }

  // ALTO: Flag para revisão
  if (level === RiskLevel.HIGH) {
    return RecommendedAction.FLAG_FOR_REVIEW;
  }

  // MÉDIO: Monitorar
  if (level === RiskLevel.MEDIUM) {
    return RecommendedAction.MONITOR;
  }

  return RecommendedAction.NONE;
}

/**
 * Gera mensagem de resposta apropriada para risco detectado
 */
export function gerarRespostaDeRisco(result: RiskAnalysisResult): {
  mensagem: string;
  recursos: typeof EMERGENCY_RESOURCES;
  bloqueiaInteracao: boolean;
} {
  let mensagem = '';
  let bloqueiaInteracao = false;

  if (result.urgency === UrgencyLevel.EMERGENCY) {
    mensagem = `
⚠️ ATENÇÃO: Detectei que você pode estar em uma situação de emergência.

Por favor, busque ajuda imediata:

📞 CVV (Centro de Valorização da Vida): 188 - Disponível 24h
📞 SAMU: 192
📞 Polícia Militar: 190
📞 Central de Atendimento à Mulher: 180

Você não está sozinha. Profissionais qualificados podem te ajudar agora.
    `.trim();

    bloqueiaInteracao = true;
  } else if (result.urgency === UrgencyLevel.URGENT) {
    mensagem = `
Percebo que você está passando por um momento muito difícil.

É importante que você converse com um profissional de saúde o quanto antes. Aqui estão alguns recursos:

📞 CVV: 188 (24h)
📞 SAMU: 192

Nossa equipe de moderação será notificada para oferecer suporte adicional.
    `.trim();
  } else if (result.level === RiskLevel.HIGH) {
    mensagem = `
Entendo que você está enfrentando desafios. É importante cuidar da sua saúde mental.

Se precisar de apoio imediato:
📞 CVV: 188 (24h)

Estou aqui para conversar, mas recomendo também buscar um profissional de saúde.
    `.trim();
  }

  return {
    mensagem,
    recursos: EMERGENCY_RESOURCES,
    bloqueiaInteracao,
  };
}

/**
 * Analisa histórico de conversas para detectar padrões de risco
 */
export function analisarHistoricoRisco(
  mensagens: Array<{ texto: string; timestamp: Date }>
): {
  riscoCumulativo: number;
  tendencia: 'melhorando' | 'estável' | 'piorando';
  alertas: string[];
} {
  const analises = mensagens.map((msg) => analisarRisco(msg.texto));

  // Calcular risco cumulativo (média ponderada - mais recentes têm mais peso)
  let riscoCumulativo = 0;
  let pesoTotal = 0;

  for (let i = 0; i < analises.length; i++) {
    const peso = i + 1; // Mensagens mais recentes têm mais peso
    riscoCumulativo += analises[i].score * peso;
    pesoTotal += peso;
  }

  riscoCumulativo = riscoCumulativo / pesoTotal;

  // Determinar tendência
  let tendencia: 'melhorando' | 'estável' | 'piorando' = 'estável';

  if (analises.length >= 3) {
    const ultimos3 = analises.slice(-3);
    const primeirosScores = ultimos3.slice(0, 2).reduce((sum, a) => sum + a.score, 0) / 2;
    const ultimoScore = ultimos3[2].score;

    if (ultimoScore > primeirosScores + 10) {
      tendencia = 'piorando';
    } else if (ultimoScore < primeirosScores - 10) {
      tendencia = 'melhorando';
    }
  }

  // Gerar alertas
  const alertas: string[] = [];

  if (riscoCumulativo >= 70) {
    alertas.push('Risco cumulativo alto detectado');
  }

  if (tendencia === 'piorando') {
    alertas.push('Sinais de deterioração detectados');
  }

  const temSinaisCriticos = analises.some(
    (a) => a.urgency === UrgencyLevel.EMERGENCY
  );

  if (temSinaisCriticos) {
    alertas.push('Sinais críticos detectados em mensagens recentes');
  }

  return {
    riscoCumulativo,
    tendencia,
    alertas,
  };
}

/**
 * Verifica se mensagem requer intervenção imediata
 */
export function requerIntervencaoImediata(result: RiskAnalysisResult): boolean {
  return (
    result.urgency === UrgencyLevel.EMERGENCY ||
    result.recommendedAction === RecommendedAction.EMERGENCY_CONTACT ||
    result.signals.some(
      (s) =>
        s.type === RiskSignalType.POSTPARTUM_PSYCHOSIS ||
        s.type === RiskSignalType.SUICIDE_IDEATION
    )
  );
}

/**
 * Gera relatório de risco para moderadores
 */
export function gerarRelatorioRisco(
  result: RiskAnalysisResult,
  contexto?: SecurityContext
): string {
  const report = `
=== RELATÓRIO DE RISCO ===
Data: ${new Date().toISOString()}
Nível: ${result.level} (Score: ${result.score}/100)
Urgência: ${result.urgency}
Ação Recomendada: ${result.recommendedAction}
Revisão Humana: ${result.needsHumanReview ? 'SIM' : 'NÃO'}

Sinais Detectados:
${result.signals.map((s) => `- ${s.type}: ${s.indicator} (Confiança: ${s.confidence * 100}%)`).join('\n')}

${contexto ? `
Contexto do Usuário:
- Primeira vez: ${contexto.isFirstTime ? 'SIM' : 'NÃO'}
- Violações anteriores: ${contexto.previousViolations}
- Idade da conta: ${contexto.accountAge} dias
- Trust Score: ${contexto.trustScore}/100
` : ''}

=========================
  `.trim();

  return report;
}
