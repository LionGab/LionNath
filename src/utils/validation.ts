/**
 * Sistema de validação completo para formulários e inputs
 * Valida dados de usuário, onboarding, chat e outros formulários
 */

import type { ValidationResult, ValidationError, UserType } from '@/types';

// ==================== VALIDATION CONSTANTS ====================

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MIN_PREGNANCY_WEEK = 1;
const MAX_PREGNANCY_WEEK = 42;
const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 500;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Valida nome completo do usuário
 */
export const validateName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'O nome é obrigatório',
      code: 'REQUIRED',
    });
  } else if (name.trim().length < MIN_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `O nome deve ter pelo menos ${MIN_NAME_LENGTH} caracteres`,
      code: 'MIN_LENGTH',
    });
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres`,
      code: 'MAX_LENGTH',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida tipo de usuário
 */
export const validateUserType = (type: UserType | null | undefined): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!type) {
    errors.push({
      field: 'type',
      message: 'Por favor, selecione uma opção',
      code: 'REQUIRED',
    });
  } else if (!['gestante', 'mae', 'tentante'].includes(type)) {
    errors.push({
      field: 'type',
      message: 'Tipo de usuário inválido',
      code: 'INVALID_VALUE',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida semana de gravidez
 */
export const validatePregnancyWeek = (week: string | number | null | undefined): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!week && week !== 0) {
    errors.push({
      field: 'pregnancyWeek',
      message: 'Por favor, informe a semana de gravidez',
      code: 'REQUIRED',
    });
    return {
      isValid: false,
      errors,
    };
  }

  const weekNumber = typeof week === 'string' ? parseInt(week, 10) : week;

  if (isNaN(weekNumber)) {
    errors.push({
      field: 'pregnancyWeek',
      message: 'A semana deve ser um número válido',
      code: 'INVALID_FORMAT',
    });
  } else if (weekNumber < MIN_PREGNANCY_WEEK || weekNumber > MAX_PREGNANCY_WEEK) {
    errors.push({
      field: 'pregnancyWeek',
      message: `A semana deve estar entre ${MIN_PREGNANCY_WEEK} e ${MAX_PREGNANCY_WEEK}`,
      code: 'OUT_OF_RANGE',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida email (opcional)
 */
export const validateEmail = (email: string | null | undefined): ValidationResult => {
  const errors: ValidationError[] = [];

  // Email é opcional, mas se fornecido deve ser válido
  if (email && email.trim().length > 0) {
    if (!EMAIL_REGEX.test(email.trim())) {
      errors.push({
        field: 'email',
        message: 'Por favor, informe um email válido',
        code: 'INVALID_FORMAT',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida mensagem de chat
 */
export const validateChatMessage = (message: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!message || message.trim().length === 0) {
    errors.push({
      field: 'message',
      message: 'A mensagem não pode estar vazia',
      code: 'REQUIRED',
    });
  } else if (message.trim().length < MIN_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: 'A mensagem é muito curta',
      code: 'MIN_LENGTH',
    });
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres`,
      code: 'MAX_LENGTH',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida dados de onboarding completos
 */
export const validateOnboardingData = (data: {
  name: string;
  type: UserType | null;
  pregnancyWeek?: string;
  typeIsGestante: boolean;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar nome
  const nameValidation = validateName(data.name);
  errors.push(...nameValidation.errors);

  // Validar tipo
  const typeValidation = validateUserType(data.type);
  errors.push(...typeValidation.errors);

  // Validar semana de gravidez se for gestante
  if (data.typeIsGestante && data.type === 'gestante') {
    const weekValidation = validatePregnancyWeek(data.pregnancyWeek);
    errors.push(...weekValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida preferências selecionadas
 */
export const validatePreferences = (preferences: string[]): ValidationResult => {
  const errors: ValidationError[] = [];

  // Preferências são opcionais, mas se houver, devem ser strings válidas
  if (preferences && Array.isArray(preferences)) {
    const invalidPreferences = preferences.filter((p) => !p || typeof p !== 'string' || p.trim().length === 0);

    if (invalidPreferences.length > 0) {
      errors.push({
        field: 'preferences',
        message: 'Algumas preferências são inválidas',
        code: 'INVALID_VALUE',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida ID de usuário
 */
export const validateUserId = (userId: string | null | undefined): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!userId || userId.trim().length === 0) {
    errors.push({
      field: 'userId',
      message: 'ID de usuário é obrigatório',
      code: 'REQUIRED',
    });
  } else if (userId.length < 10) {
    errors.push({
      field: 'userId',
      message: 'ID de usuário inválido',
      code: 'INVALID_FORMAT',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida formato de data (YYYY-MM-DD)
 */
export const validateDate = (date: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!date || date.trim().length === 0) {
    errors.push({
      field: 'date',
      message: 'Data é obrigatória',
      code: 'REQUIRED',
    });
    return {
      isValid: false,
      errors,
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    errors.push({
      field: 'date',
      message: 'Data deve estar no formato YYYY-MM-DD',
      code: 'INVALID_FORMAT',
    });
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push({
        field: 'date',
        message: 'Data inválida',
        code: 'INVALID_VALUE',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Função helper para obter primeira mensagem de erro de um campo
 */
export const getFirstError = (result: ValidationResult, field: string): string | null => {
  const error = result.errors.find((e) => e.field === field);
  return error ? error.message : null;
};

/**
 * Função helper para verificar se um campo específico tem erro
 */
export const hasFieldError = (result: ValidationResult, field: string): boolean => {
  return result.errors.some((e) => e.field === field);
};
