/**
 * NAT-IA PII Protection Service
 * LGPD Compliant - Personal Identifiable Information Protection
 */

import { PIIDetectionResult, PIIType, PIIPosition } from './types';
import { PII_PATTERNS, PII_REPLACEMENTS } from './constants';

/**
 * Anonimiza uma mensagem removendo informações pessoais identificáveis
 * @param texto - Texto a ser anonimizado
 * @returns Objeto com resultado da detecção e texto sanitizado
 */
export function anonimizarMensagem(texto: string): PIIDetectionResult {
  if (!texto || texto.trim().length === 0) {
    return {
      hasPII: false,
      types: [],
      positions: [],
      sanitized: texto,
    };
  }

  let sanitized = texto;
  const positions: PIIPosition[] = [];
  const detectedTypes = new Set<PIIType>();

  // Processar cada tipo de PII
  const piiChecks: Array<{ type: PIIType; pattern: RegExp; replacement: string }> = [
    { type: PIIType.CPF, pattern: PII_PATTERNS.CPF, replacement: PII_REPLACEMENTS.CPF },
    { type: PIIType.PHONE, pattern: PII_PATTERNS.PHONE, replacement: PII_REPLACEMENTS.PHONE },
    { type: PIIType.EMAIL, pattern: PII_PATTERNS.EMAIL, replacement: PII_REPLACEMENTS.EMAIL },
    { type: PIIType.RG, pattern: PII_PATTERNS.RG, replacement: PII_REPLACEMENTS.RG },
    { type: PIIType.CNS, pattern: PII_PATTERNS.CNS, replacement: PII_REPLACEMENTS.CNS },
    { type: PIIType.BIRTH_DATE, pattern: PII_PATTERNS.BIRTH_DATE, replacement: PII_REPLACEMENTS.BIRTH_DATE },
    { type: PIIType.CREDIT_CARD, pattern: PII_PATTERNS.CREDIT_CARD, replacement: PII_REPLACEMENTS.CREDIT_CARD },
    { type: PIIType.ADDRESS, pattern: PII_PATTERNS.ADDRESS, replacement: PII_REPLACEMENTS.ADDRESS },
  ];

  // Detectar e substituir PII
  for (const check of piiChecks) {
    const matches = Array.from(sanitized.matchAll(check.pattern));

    if (matches.length > 0) {
      detectedTypes.add(check.type);

      for (const match of matches) {
        if (match.index !== undefined) {
          positions.push({
            type: check.type,
            start: match.index,
            end: match.index + match[0].length,
            value: match[0],
            anonymized: check.replacement,
          });
        }
      }

      // Substituir todas as ocorrências
      sanitized = sanitized.replace(check.pattern, check.replacement);
    }
  }

  // Validar CPF antes de considerar válido
  const cpfMatches = Array.from(texto.matchAll(PII_PATTERNS.CPF));
  for (const match of cpfMatches) {
    if (!validarCPF(match[0])) {
      // Remover CPF inválido das detecções
      detectedTypes.delete(PIIType.CPF);
    }
  }

  return {
    hasPII: detectedTypes.size > 0,
    types: Array.from(detectedTypes),
    positions,
    sanitized,
  };
}

/**
 * Valida se um payload contém PII sensível
 * @param payload - Dados a serem validados
 * @returns Resultado da detecção de PII
 */
export function validarDados(payload: Record<string, any>): PIIDetectionResult {
  // Converter payload para string para análise
  const textoCompleto = JSON.stringify(payload, null, 2);
  return anonimizarMensagem(textoCompleto);
}

/**
 * Sanitiza logs removendo PII antes de salvar
 * @param dados - Dados de log
 * @returns Dados sanitizados
 */
export function sanitizarLogs(dados: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(dados)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    // Se for string, anonimizar
    if (typeof value === 'string') {
      const result = anonimizarMensagem(value);
      sanitized[key] = result.sanitized;
    }
    // Se for objeto, recursão
    else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizarLogs(value);
    }
    // Se for array de strings
    else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === 'string') {
          return anonimizarMensagem(item).sanitized;
        }
        if (typeof item === 'object') {
          return sanitizarLogs(item);
        }
        return item;
      });
    }
    // Outros tipos (number, boolean)
    else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Valida CPF usando algoritmo oficial
 * @param cpf - CPF a ser validado
 * @returns true se válido, false caso contrário
 */
export function validarCPF(cpf: string): boolean {
  // Remove formatação
  cpf = cpf.replace(/[^\d]/g, '');

  // Valida tamanho
  if (cpf.length !== 11) return false;

  // Valida sequências inválidas (111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto >= 10 ? 0 : resto;
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto >= 10 ? 0 : resto;
  if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Detecta nomes próprios em texto (heurística)
 * @param texto - Texto a analisar
 * @returns Array de nomes detectados
 */
export function detectarNomes(texto: string): string[] {
  const matches = texto.match(PII_PATTERNS.FULL_NAME);
  if (!matches) return [];

  // Filtrar falsos positivos comuns
  const falsosPositivos = [
    'Nossa Senhora',
    'Meu Deus',
    'Jesus Cristo',
    'São Paulo',
    'Rio Janeiro',
    'Belo Horizonte',
    // Adicionar mais conforme necessário
  ];

  return matches.filter((nome) => !falsosPositivos.some((fp) => nome.includes(fp)));
}

/**
 * Verifica se uma string contém endereço
 * @param texto - Texto a verificar
 * @returns true se contém endereço
 */
export function contemEndereco(texto: string): boolean {
  return PII_PATTERNS.ADDRESS.test(texto);
}

/**
 * Verifica se uma string contém telefone
 * @param texto - Texto a verificar
 * @returns true se contém telefone
 */
export function contemTelefone(texto: string): boolean {
  const matches = texto.match(PII_PATTERNS.PHONE);
  if (!matches) return false;

  // Validar se é realmente um telefone brasileiro
  for (const match of matches) {
    const digitos = match.replace(/\D/g, '');
    // Telefone brasileiro: 10 ou 11 dígitos (com DDD)
    if (digitos.length >= 10 && digitos.length <= 13) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica se uma string contém email
 * @param texto - Texto a verificar
 * @returns true se contém email
 */
export function contemEmail(texto: string): boolean {
  return PII_PATTERNS.EMAIL.test(texto);
}

/**
 * Cria hash anônimo de identificação (para tracking sem PII)
 * @param valor - Valor a ser hasheado
 * @returns Hash anônimo
 */
export async function criarHashAnonimo(valor: string): Promise<string> {
  // Usar Web Crypto API para hash SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(valor);

  if (typeof window !== 'undefined' && window.crypto) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback para Node.js (se necessário)
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(valor).digest('hex');
  }
}

/**
 * Máscara parcial para visualização segura
 * @param valor - Valor a ser mascarado
 * @param tipo - Tipo de PII
 * @returns Valor parcialmente mascarado
 */
export function mascaraParcial(valor: string, tipo: PIIType): string {
  switch (tipo) {
    case PIIType.EMAIL:
      const [local, dominio] = valor.split('@');
      if (!dominio) return '***@***.com';
      return `${local.slice(0, 2)}***@${dominio}`;

    case PIIType.PHONE:
      const digitos = valor.replace(/\D/g, '');
      if (digitos.length === 11) {
        return `(${digitos.slice(0, 2)}) *****-${digitos.slice(-4)}`;
      }
      return `(${digitos.slice(0, 2)}) ****-${digitos.slice(-4)}`;

    case PIIType.CPF:
      const cpfDigitos = valor.replace(/\D/g, '');
      return `***.${cpfDigitos.slice(3, 6)}.***-${cpfDigitos.slice(-2)}`;

    default:
      return valor.slice(0, 2) + '*'.repeat(valor.length - 2);
  }
}

/**
 * Verifica se texto é seguro para armazenamento (sem PII)
 * @param texto - Texto a verificar
 * @returns true se seguro
 */
export function isSeguroParaArmazenar(texto: string): boolean {
  const resultado = anonimizarMensagem(texto);
  return !resultado.hasPII;
}

/**
 * Extrai metadados sem PII de uma mensagem
 * @param mensagem - Mensagem original
 * @returns Metadados seguros
 */
export function extrairMetadados(mensagem: string): {
  comprimento: number;
  palavras: number;
  temPII: boolean;
  tiposPII: PIIType[];
} {
  const resultado = anonimizarMensagem(mensagem);

  return {
    comprimento: mensagem.length,
    palavras: mensagem.split(/\s+/).length,
    temPII: resultado.hasPII,
    tiposPII: resultado.types,
  };
}
