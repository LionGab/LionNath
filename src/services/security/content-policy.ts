/**
 * NAT-IA Content Policy Service
 * Community Guidelines & Content Moderation
 */

import { ContentValidationResult, ContentViolation, ViolationType, SeverityLevel } from './types';
import { SPAM_KEYWORDS, HATE_SPEECH_PATTERNS, COMMERCIAL_PATTERNS } from './constants';

/**
 * Valida conteúdo de uma mensagem contra políticas da comunidade
 * @param mensagem - Mensagem a ser validada
 * @param contexto - Contexto adicional (opcional)
 * @returns Resultado da validação
 */
export function validarConteudo(
  mensagem: string,
  contexto?: {
    isFirstMessage?: boolean;
    userHistory?: string[];
    previousViolations?: number;
  }
): ContentValidationResult {
  if (!mensagem || mensagem.trim().length === 0) {
    return {
      allowed: false,
      confidence: 1.0,
      reasons: [
        {
          type: ViolationType.INAPPROPRIATE,
          severity: SeverityLevel.LOW,
          description: 'Mensagem vazia',
        },
      ],
    };
  }

  const violations: ContentViolation[] = [];

  // 1. Detectar SPAM
  const spamResult = detectarSpam(mensagem, contexto);
  if (spamResult) {
    violations.push(spamResult);
  }

  // 2. Detectar conteúdo comercial não autorizado
  const comercialResult = detectarConteudoComercial(mensagem);
  if (comercialResult) {
    violations.push(comercialResult);
  }

  // 3. Detectar hate speech / linguagem ofensiva
  const hateSpeechResult = detectarHateSpeech(mensagem);
  if (hateSpeechResult) {
    violations.push(hateSpeechResult);
  }

  // 4. Detectar assédio / bullying
  const harassmentResult = detectarAssedio(mensagem);
  if (harassmentResult) {
    violations.push(harassmentResult);
  }

  // 5. Detectar conteúdo inapropriado
  const inappropriateResult = detectarConteudoInapropriado(mensagem);
  if (inappropriateResult) {
    violations.push(inappropriateResult);
  }

  // 6. Validar comprimento
  const lengthResult = validarComprimento(mensagem);
  if (lengthResult) {
    violations.push(lengthResult);
  }

  // Calcular confiança baseada em violações
  const confidence = calcularConfianca(violations);

  // Decidir se permite
  const highSeverityViolations = violations.filter(
    (v) => v.severity === SeverityLevel.HIGH || v.severity === SeverityLevel.CRITICAL
  );

  const allowed = highSeverityViolations.length === 0;

  // Gerar sugestões
  const suggestions = gerarSugestoes(violations);

  return {
    allowed,
    confidence,
    reasons: violations,
    suggestions,
  };
}

/**
 * Detecta SPAM
 */
function detectarSpam(
  mensagem: string,
  contexto?: {
    isFirstMessage?: boolean;
    userHistory?: string[];
    previousViolations?: number;
  }
): ContentViolation | null {
  const mensagemLower = mensagem.toLowerCase();

  // Verificar palavras-chave de spam
  const spamMatches = SPAM_KEYWORDS.filter((keyword) => mensagemLower.includes(keyword));

  if (spamMatches.length > 0) {
    return {
      type: ViolationType.SPAM,
      severity: SeverityLevel.MEDIUM,
      description: 'Mensagem contém linguagem comercial/spam',
      matched: spamMatches.join(', '),
    };
  }

  // Detectar repetição excessiva
  if (contexto?.userHistory) {
    const repeticoes = contexto.userHistory.filter((msg) => msg.toLowerCase() === mensagemLower).length;

    if (repeticoes >= 3) {
      return {
        type: ViolationType.SPAM,
        severity: SeverityLevel.HIGH,
        description: 'Mensagem repetida múltiplas vezes',
      };
    }
  }

  // Detectar caracteres repetidos excessivos
  if (/(.)\1{10,}/.test(mensagem)) {
    return {
      type: ViolationType.SPAM,
      severity: SeverityLevel.LOW,
      description: 'Mensagem contém caracteres repetidos excessivamente',
    };
  }

  // Detectar CAPS LOCK excessivo
  const capsRatio = (mensagem.match(/[A-Z]/g) || []).length / mensagem.length;
  if (mensagem.length > 20 && capsRatio > 0.7) {
    return {
      type: ViolationType.SPAM,
      severity: SeverityLevel.LOW,
      description: 'Uso excessivo de maiúsculas',
    };
  }

  return null;
}

/**
 * Detecta conteúdo comercial não autorizado
 */
function detectarConteudoComercial(mensagem: string): ContentViolation | null {
  const matches: string[] = [];

  for (const pattern of COMMERCIAL_PATTERNS) {
    const found = mensagem.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }

  if (matches.length > 0) {
    return {
      type: ViolationType.COMMERCIAL,
      severity: SeverityLevel.MEDIUM,
      description: 'Mensagem contém conteúdo comercial não autorizado',
      matched: matches.join(', '),
    };
  }

  // Detectar URLs
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = mensagem.match(urlPattern);

  if (urls && urls.length > 0) {
    return {
      type: ViolationType.COMMERCIAL,
      severity: SeverityLevel.MEDIUM,
      description: 'Mensagem contém links externos',
      matched: urls.join(', '),
    };
  }

  return null;
}

/**
 * Detecta hate speech / linguagem ofensiva
 */
function detectarHateSpeech(mensagem: string): ContentViolation | null {
  const matches: string[] = [];

  for (const pattern of HATE_SPEECH_PATTERNS) {
    const found = mensagem.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }

  if (matches.length > 0) {
    return {
      type: ViolationType.HATE_SPEECH,
      severity: SeverityLevel.HIGH,
      description: 'Mensagem contém linguagem ofensiva ou discriminatória',
      matched: '[censurado]',
    };
  }

  return null;
}

/**
 * Detecta assédio / bullying
 */
function detectarAssedio(mensagem: string): ContentViolation | null {
  const mensagemLower = mensagem.toLowerCase();

  // Padrões de assédio
  const assedioPatterns = [
    /você é uma?\s+(burr[ao]|idiota|incompetente)/gi,
    /vou te\s+(processar|denunciar|destruir)/gi,
    /cala a? boca/gi,
    /ninguém (gosta|quer) você/gi,
  ];

  for (const pattern of assedioPatterns) {
    if (pattern.test(mensagem)) {
      return {
        type: ViolationType.HARASSMENT,
        severity: SeverityLevel.HIGH,
        description: 'Mensagem contém linguagem de assédio ou intimidação',
      };
    }
  }

  return null;
}

/**
 * Detecta conteúdo inapropriado
 */
function detectarConteudoInapropriado(mensagem: string): ContentViolation | null {
  const mensagemLower = mensagem.toLowerCase();

  // Conteúdo sexual explícito (em contexto de saúde materna, isso é delicado)
  const sexualExplicitPatterns = [/\b(pornô|porn|xxx|sexo explícito)\b/gi];

  for (const pattern of sexualExplicitPatterns) {
    if (pattern.test(mensagem)) {
      return {
        type: ViolationType.INAPPROPRIATE,
        severity: SeverityLevel.HIGH,
        description: 'Mensagem contém conteúdo sexual explícito',
      };
    }
  }

  return null;
}

/**
 * Valida comprimento da mensagem
 */
function validarComprimento(mensagem: string): ContentViolation | null {
  const MIN_LENGTH = 2;
  const MAX_LENGTH = 5000;

  if (mensagem.length < MIN_LENGTH) {
    return {
      type: ViolationType.INAPPROPRIATE,
      severity: SeverityLevel.LOW,
      description: 'Mensagem muito curta',
    };
  }

  if (mensagem.length > MAX_LENGTH) {
    return {
      type: ViolationType.SPAM,
      severity: SeverityLevel.MEDIUM,
      description: 'Mensagem muito longa (máximo 5000 caracteres)',
    };
  }

  return null;
}

/**
 * Calcula confiança da validação
 */
function calcularConfianca(violations: ContentViolation[]): number {
  if (violations.length === 0) return 1.0;

  // Confiança baseada em severidade
  const severityScores = {
    [SeverityLevel.LOW]: 0.3,
    [SeverityLevel.MEDIUM]: 0.6,
    [SeverityLevel.HIGH]: 0.9,
    [SeverityLevel.CRITICAL]: 1.0,
  };

  const maxSeverity = Math.max(...violations.map((v) => severityScores[v.severity]));

  return maxSeverity;
}

/**
 * Gera sugestões para o usuário
 */
function gerarSugestoes(violations: ContentViolation[]): string[] {
  const suggestions: string[] = [];

  for (const violation of violations) {
    switch (violation.type) {
      case ViolationType.SPAM:
        suggestions.push('Evite repetir mensagens ou usar linguagem comercial.');
        break;
      case ViolationType.COMMERCIAL:
        suggestions.push('Links e conteúdo comercial não são permitidos neste espaço.');
        break;
      case ViolationType.HATE_SPEECH:
        suggestions.push('Por favor, use linguagem respeitosa. Nossa comunidade preza pelo respeito mútuo.');
        break;
      case ViolationType.HARASSMENT:
        suggestions.push('Comportamento agressivo não é tolerado. Seja gentil com todos.');
        break;
      case ViolationType.INAPPROPRIATE:
        suggestions.push('Por favor, mantenha o conteúdo apropriado para o contexto de saúde materna.');
        break;
    }
  }

  return [...new Set(suggestions)]; // Remover duplicatas
}

/**
 * Regras de comunidade (configuráveis)
 */
export const COMMUNITY_RULES = {
  // Permitir discussão de saúde sexual/reprodutiva
  allowHealthDiscussion: true,

  // Permitir menção de medicamentos
  allowMedicationMention: true,

  // Permitir questões sensíveis (aborto, violência, etc)
  allowSensitiveTopics: true,

  // Requerer moderação para tópicos críticos
  moderateCriticalTopics: true,

  // Limites de conteúdo
  maxMessageLength: 5000,
  minMessageLength: 2,
  maxMessagesPerHour: 20,
};

/**
 * Valida mensagem com regras customizadas
 */
export function validarComRegrasCustomizadas(
  mensagem: string,
  regras: Partial<typeof COMMUNITY_RULES>
): ContentValidationResult {
  const regrasMerged = { ...COMMUNITY_RULES, ...regras };

  // Validação básica
  let resultado = validarConteudo(mensagem);

  // Aplicar regras customizadas
  if (!regrasMerged.allowHealthDiscussion) {
    // Adicionar validação extra
  }

  return resultado;
}

/**
 * Whitelist de termos médicos/saúde que não devem ser bloqueados
 */
const MEDICAL_TERMS_WHITELIST = [
  'sangramento',
  'corrimento',
  'contrações',
  'dor',
  'cesariana',
  'parto',
  'amamentação',
  'mama',
  'seio',
  'vagina',
  'vulva',
  'útero',
  'colo do útero',
  'episiotomia',
  'períneo',
  // Adicionar mais conforme necessário
];

/**
 * Verifica se mensagem contém apenas termos médicos
 */
export function contemApenasTermosMedicos(mensagem: string): boolean {
  const mensagemLower = mensagem.toLowerCase();

  return MEDICAL_TERMS_WHITELIST.some((termo) => mensagemLower.includes(termo));
}

/**
 * Sanitiza mensagem removendo conteúdo problemático mas mantendo contexto
 */
export function sanitizarMensagem(mensagem: string): string {
  let sanitized = mensagem;

  // Remover URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[link removido]');

  // Remover menções de WhatsApp/telefone
  sanitized = sanitized.replace(/(?:whatsapp|wpp|zap)\s*:?\s*\d+/gi, '[contato removido]');

  return sanitized;
}
