/**
 * Safety - Detecção de risco e segurança
 *
 * Identifica conteúdo sensível, situações de risco e necessidade de
 * encaminhamento para profissionais de saúde.
 */

export type SafetyLevel = 'safe' | 'caution' | 'warning' | 'urgent';

export interface SafetyCheck {
  level: SafetyLevel;
  reasons: string[];
  shouldEscalate: boolean;
  suggestedAction?: string;
  emergencyContact?: boolean;
}

// Palavras-chave de risco crítico (emergência médica)
const CRITICAL_KEYWORDS = [
  'sangramento intenso',
  'sangramento muito forte',
  'hemorragia',
  'dor muito forte',
  'dor insuportável',
  'desmaiei',
  'desmaiando',
  'não consigo respirar',
  'falta de ar grave',
  'convulsão',
  'pressão muito alta',
  'visão embaçada',
  'inchaço súbito',
  'contrações muito frequentes',
  'bebe não mexe',
  'bebê parou de mexer',
  'febre alta',
  'perda de líquido',
  'rompi a bolsa',
];

// Palavras-chave de alerta (consultar médico em breve)
const WARNING_KEYWORDS = [
  'sangramento',
  'corrimento com cheiro',
  'dor forte',
  'dor constante',
  'enjoo extremo',
  'vômito constante',
  'não consigo comer',
  'perdi peso',
  'febre',
  'calafrios',
  'ardência ao urinar',
  'inchaço',
  'pressão alta',
  'tontura',
  'muito cansada',
  'bebê mexendo menos',
  'contrações regulares',
  'dor nas costas intensa',
];

// Palavras-chave de atenção (monitorar)
const CAUTION_KEYWORDS = [
  'preocupada',
  'ansiosa',
  'medo',
  'insegura',
  'triste',
  'sozinha',
  'não aguento',
  'exausta',
  'sem dormir',
  'choro muito',
  'não consigo',
  'difícil',
  'complicado',
  'estressada',
];

// Tópicos sensíveis de saúde mental
const MENTAL_HEALTH_KEYWORDS = [
  'depressão',
  'suicídio',
  'me matar',
  'acabar com tudo',
  'não quero viver',
  'desistir',
  'não aguento mais',
  'não quero o bebê',
  'odeio estar grávida',
  'me arrependo',
  'violência',
  'abuso',
  'apanho',
  'me bate',
  'tenho medo dele',
];

/**
 * Verifica segurança do conteúdo e identifica riscos
 */
export function checkSafety(text: string): SafetyCheck {
  const lowerText = text.toLowerCase();

  // Verifica risco crítico (emergência)
  const criticalMatches = CRITICAL_KEYWORDS.filter((keyword) => lowerText.includes(keyword));

  if (criticalMatches.length > 0) {
    return {
      level: 'urgent',
      reasons: criticalMatches,
      shouldEscalate: true,
      emergencyContact: true,
      suggestedAction: 'URGENTE: Procure atendimento médico imediatamente ou ligue para emergência (192/SAMU).',
    };
  }

  // Verifica saúde mental crítica
  const mentalHealthMatches = MENTAL_HEALTH_KEYWORDS.filter((keyword) => lowerText.includes(keyword));

  if (mentalHealthMatches.length > 0) {
    return {
      level: 'urgent',
      reasons: mentalHealthMatches,
      shouldEscalate: true,
      emergencyContact: true,
      suggestedAction:
        'É importante conversar com um profissional. CVV (188) está disponível 24h. Recomendo também consultar seu médico ou psicólogo.',
    };
  }

  // Verifica sintomas de alerta
  const warningMatches = WARNING_KEYWORDS.filter((keyword) => lowerText.includes(keyword));

  if (warningMatches.length >= 2) {
    return {
      level: 'warning',
      reasons: warningMatches,
      shouldEscalate: true,
      suggestedAction: 'Recomendo agendar consulta com seu médico em breve para avaliar esses sintomas.',
    };
  }

  if (warningMatches.length === 1) {
    return {
      level: 'caution',
      reasons: warningMatches,
      shouldEscalate: false,
      suggestedAction: 'Fique atenta a esses sintomas. Se piorarem ou persistirem, consulte seu médico.',
    };
  }

  // Verifica questões emocionais
  const cautionMatches = CAUTION_KEYWORDS.filter((keyword) => lowerText.includes(keyword));

  if (cautionMatches.length >= 3) {
    return {
      level: 'caution',
      reasons: cautionMatches,
      shouldEscalate: false,
      suggestedAction: 'Percebo que você está passando por um momento difícil. Conversar com outras mães pode ajudar.',
    };
  }

  // Sem riscos identificados
  return {
    level: 'safe',
    reasons: [],
    shouldEscalate: false,
  };
}

/**
 * Extrai sintomas físicos mencionados
 */
export function extractSymptoms(text: string): string[] {
  const symptoms = [
    'náusea',
    'enjoo',
    'vômito',
    'dor de cabeça',
    'tontura',
    'cansaço',
    'fadiga',
    'insônia',
    'azia',
    'constipação',
    'prisão de ventre',
    'inchaço',
    'dor nas costas',
    'cólica',
    'contrações',
    'corrimento',
    'sangramento',
    'febre',
    'tosse',
    'resfriado',
    'gripe',
  ];

  const lowerText = text.toLowerCase();
  return symptoms.filter((symptom) => lowerText.includes(symptom));
}

/**
 * Detecta se a mensagem é uma pergunta médica
 */
export function isMedicalQuestion(text: string): boolean {
  const medicalQuestionPatterns = [
    /posso tomar/i,
    /pode tomar/i,
    /é normal/i,
    /é perigoso/i,
    /faz mal/i,
    /é seguro/i,
    /médico/i,
    /remédio/i,
    /medicamento/i,
    /exame/i,
    /sintoma/i,
    /diagnóstico/i,
    /tratamento/i,
    /o que fazer/i,
    /devo ir/i,
    /preciso ir/i,
  ];

  return medicalQuestionPatterns.some((pattern) => pattern.test(text));
}

/**
 * Gera disclaimer médico apropriado
 */
export function getMedicalDisclaimer(safetyLevel: SafetyLevel): string {
  switch (safetyLevel) {
    case 'urgent':
      return '⚠️ Esta é uma orientação geral. Em caso de emergência, procure atendimento médico imediatamente.';

    case 'warning':
      return 'ℹ️ Lembre-se: estas são orientações gerais. Sempre consulte seu médico para avaliação adequada.';

    case 'caution':
      return 'ℹ️ Estas informações não substituem orientação médica profissional.';

    default:
      return '';
  }
}

/**
 * Verifica se precisa de ação imediata
 */
export function needsImmediateAction(safety: SafetyCheck): boolean {
  return safety.level === 'urgent' && safety.emergencyContact === true;
}

/**
 * Sugere recursos de apoio baseado no contexto
 */
export function suggestSupportResources(safety: SafetyCheck, symptoms: string[]): string[] {
  const resources: string[] = [];

  if (safety.level === 'urgent' && safety.emergencyContact) {
    resources.push('📞 SAMU: 192');
    resources.push('📞 CVV (apoio emocional): 188');
  }

  if (symptoms.some((s) => ['náusea', 'enjoo', 'vômito'].includes(s))) {
    resources.push('💡 Dica: Conteúdo sobre "Náuseas na Gravidez"');
  }

  if (symptoms.some((s) => ['insônia', 'cansaço', 'fadiga'].includes(s))) {
    resources.push('💡 Dica: Conteúdo sobre "Sono e Descanso"');
  }

  const emotionalKeywords = ['ansiosa', 'triste', 'preocupada', 'medo'];
  if (safety.reasons.some((r) => emotionalKeywords.includes(r))) {
    resources.push('💬 Que tal conversar com outras mães no Círculo de Apoio?');
  }

  return resources;
}
