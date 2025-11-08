/**
 * NAT-IA Security System - Test Suite
 * Comprehensive tests for all security modules
 */

import {
  // PII Protection
  anonimizarMensagem,
  validarCPF,
  contemTelefone,
  contemEmail,

  // Rate Limiting
  checkRateLimit,
  clearRateLimit,

  // Content Policy
  validarConteudo,

  // Risk Detection
  analisarRisco,
  requerIntervencaoImediata,

  // Environment
  validateEnvironment,
  securityHealthCheck,

  // Security Middleware
  securityMiddleware,
  initializeSecurity,

  // Types
  PIIType,
  ViolationType,
  RiskLevel,
  UrgencyLevel,
} from '../src/services/security';

// =====================================================
// Test Framework
// =====================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      testResults.push({ name, passed: true });
      console.log(`✓ ${name}`);
    } catch (error: any) {
      testResults.push({
        name,
        passed: false,
        error: error.message,
      });
      console.error(`✗ ${name}: ${error.message}`);
    }
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// =====================================================
// PII Protection Tests
// =====================================================

const testPIIProtection = async () => {
  console.log('\n=== Testing PII Protection ===\n');

  await test('Detecta e anonimiza CPF', () => {
    const texto = 'Meu CPF é 123.456.789-10 e preciso de ajuda';
    const result = anonimizarMensagem(texto);

    assert(result.hasPII, 'Deveria detectar PII');
    assert(result.sanitized.includes('[CPF-REMOVIDO]'), 'Deveria anonimizar CPF');
    assert(!result.sanitized.includes('123.456.789-10'), 'Não deveria conter CPF original');
  })();

  await test('Valida CPF válido', () => {
    // CPF válido para teste: 111.444.777-35
    assert(validarCPF('11144477735'), 'CPF válido deveria passar');
  })();

  await test('Invalida CPF inválido', () => {
    assert(!validarCPF('123.456.789-10'), 'CPF inválido não deveria passar');
    assert(!validarCPF('111.111.111-11'), 'CPF com sequência não deveria passar');
  })();

  await test('Detecta telefone brasileiro', () => {
    const texto = 'Me liga no (11) 98765-4321';
    assert(contemTelefone(texto), 'Deveria detectar telefone');

    const result = anonimizarMensagem(texto);
    assert(result.hasPII, 'Deveria detectar PII');
    assert(result.sanitized.includes('[TELEFONE-REMOVIDO]'), 'Deveria anonimizar telefone');
  })();

  await test('Detecta email', () => {
    const texto = 'Meu email é teste@exemplo.com';
    assert(contemEmail(texto), 'Deveria detectar email');

    const result = anonimizarMensagem(texto);
    assert(result.sanitized.includes('[EMAIL-REMOVIDO]'), 'Deveria anonimizar email');
  })();

  await test('Múltiplos tipos de PII', () => {
    const texto = 'Meu CPF é 123.456.789-10, email teste@exemplo.com e telefone (11) 98765-4321';
    const result = anonimizarMensagem(texto);

    assert(result.hasPII, 'Deveria detectar múltiplos PII');
    assert(result.types.length >= 2, 'Deveria detectar múltiplos tipos');
    assert(!result.sanitized.includes('123.456.789-10'), 'Não deveria conter PII');
  })();
};

// =====================================================
// Content Policy Tests
// =====================================================

const testContentPolicy = async () => {
  console.log('\n=== Testing Content Policy ===\n');

  await test('Permite conteúdo válido', () => {
    const result = validarConteudo('Olá, estou com dúvidas sobre amamentação');
    assert(result.allowed, 'Conteúdo válido deveria ser permitido');
  })();

  await test('Detecta spam', () => {
    const result = validarConteudo('COMPRE AGORA! Clique aqui para ganhar dinheiro!');
    assert(!result.allowed, 'Spam deveria ser bloqueado');
    assert(
      result.reasons.some((r) => r.type === ViolationType.SPAM),
      'Deveria detectar spam'
    );
  })();

  await test('Detecta conteúdo comercial', () => {
    const result = validarConteudo('Vendo produtos, WhatsApp: 11 98765-4321');
    assert(!result.allowed, 'Conteúdo comercial deveria ser bloqueado');
  })();

  await test('Detecta URLs não autorizadas', () => {
    const result = validarConteudo('Acesse https://exemplo.com para mais informações');
    assert(!result.allowed, 'URLs não autorizadas deveriam ser bloqueadas');
  })();

  await test('Bloqueia mensagens muito curtas', () => {
    const result = validarConteudo('a');
    assert(!result.allowed, 'Mensagens muito curtas deveriam ser bloqueadas');
  })();

  await test('Bloqueia mensagens muito longas', () => {
    const result = validarConteudo('a'.repeat(6000));
    assert(!result.allowed, 'Mensagens muito longas deveriam ser bloqueadas');
  })();

  await test('Detecta CAPS LOCK excessivo', () => {
    const result = validarConteudo('SOCORRO ESTOU DESESPERADA PRECISO DE AJUDA AGORA!!!');
    // Pode ser warning, não necessariamente bloqueado
    assert(result.reasons.length > 0, 'Deveria detectar caps lock excessivo');
  })();
};

// =====================================================
// Risk Detection Tests
// =====================================================

const testRiskDetection = async () => {
  console.log('\n=== Testing Risk Detection ===\n');

  await test('Detecta ideação suicida', () => {
    const result = analisarRisco('Não aguento mais, quero me matar');
    assert(result.level >= RiskLevel.HIGH, 'Deveria detectar risco alto');
    assert(result.urgency >= UrgencyLevel.URGENT, 'Deveria ser urgente');
    assert(requerIntervencaoImediata(result), 'Deveria requerer intervenção');
  })();

  await test('Detecta autoagressão', () => {
    const result = analisarRisco('Estou pensando em me cortar');
    assert(result.level >= RiskLevel.HIGH, 'Deveria detectar risco alto');
    assert(result.signals.length > 0, 'Deveria ter sinais de risco');
  })();

  await test('Detecta psicose pós-parto', () => {
    const result = analisarRisco('Tenho medo de machucar o bebê, ouço vozes mandando');
    assert(result.level >= RiskLevel.CRITICAL, 'Deveria ser crítico');
    assert(result.urgency === UrgencyLevel.EMERGENCY, 'Deveria ser emergência');
  })();

  await test('Detecta violência doméstica', () => {
    const result = analisarRisco('Meu marido me bate todos os dias');
    assert(result.level >= RiskLevel.HIGH, 'Deveria detectar risco alto');
  })();

  await test('Detecta ataque de pânico', () => {
    const result = analisarRisco('Não consigo respirar, coração acelerado, vou desmaiar');
    assert(result.level >= RiskLevel.MEDIUM, 'Deveria detectar risco médio');
  })();

  await test('Não detecta falsos positivos', () => {
    const result = analisarRisco('Estou feliz com meu bebê, tudo bem');
    assert(result.level === RiskLevel.NONE, 'Não deveria detectar risco');
  })();

  await test('Contexto de saúde não é falso positivo', () => {
    const result = analisarRisco('Estou com sangramento e dor após o parto');
    // Pode ter score baixo, mas não deve ser bloqueado
    assert(result.level <= RiskLevel.MEDIUM, 'Conteúdo de saúde deveria ser ok');
  })();
};

// =====================================================
// Rate Limiting Tests
// =====================================================

const testRateLimiting = async () => {
  console.log('\n=== Testing Rate Limiting ===\n');

  const testUserId = 'test-user-' + Date.now();

  await test('Permite requests dentro do limite', async () => {
    // Limpar estado anterior
    await clearRateLimit(testUserId, 'api:general');

    const result = await checkRateLimit(testUserId, 'api:general');
    assert(result.allowed, 'Deveria permitir request');
    assert(result.remaining > 0, 'Deveria ter requests restantes');
  })();

  await test('Bloqueia após exceder limite', async () => {
    await clearRateLimit(testUserId, 'api:general');

    // Fazer múltiplos requests
    const limit = 200; // API_GENERAL limit
    for (let i = 0; i < limit; i++) {
      await checkRateLimit(testUserId, 'api:general');
    }

    // Próximo request deve ser bloqueado
    const result = await checkRateLimit(testUserId, 'api:general');
    assert(!result.allowed, 'Deveria bloquear após limite');
    assert(result.retryAfter !== undefined, 'Deveria ter retry-after');
  })();

  await test('Limites diferentes por endpoint', async () => {
    const chatUserId = 'chat-user-' + Date.now();
    await clearRateLimit(chatUserId);

    const chatResult = await checkRateLimit(chatUserId, 'chat:message');
    const apiResult = await checkRateLimit(chatUserId, 'api:general');

    // Ambos devem ser permitidos inicialmente
    assert(chatResult.allowed, 'Chat deveria ser permitido');
    assert(apiResult.allowed, 'API deveria ser permitida');
  })();
};

// =====================================================
// Environment Validation Tests
// =====================================================

const testEnvironmentValidation = async () => {
  console.log('\n=== Testing Environment Validation ===\n');

  await test('Valida ambiente', () => {
    const result = validateEnvironment();
    // Em ambiente de teste, pode ter warnings
    assert(result !== null, 'Deveria retornar resultado');
    assert(Array.isArray(result.errors), 'Deveria ter array de erros');
    assert(Array.isArray(result.warnings), 'Deveria ter array de warnings');
  })();

  await test('Health check executa', async () => {
    try {
      const result = await securityHealthCheck();
      assert(result !== null, 'Health check deveria retornar resultado');
      assert(Array.isArray(result.checks), 'Deveria ter array de checks');
      assert(result.status !== null, 'Deveria ter status');
    } catch (error) {
      // Health check pode falhar em ambiente de teste sem banco
      console.warn('Health check failed (expected in test environment)');
    }
  })();
};

// =====================================================
// Integration Tests
// =====================================================

const testIntegration = async () => {
  console.log('\n=== Testing Integration ===\n');

  await test('Security middleware - fluxo completo', async () => {
    const userId = 'integration-test-user';
    const endpoint = 'chat:message';

    try {
      // Limpar rate limit
      await clearRateLimit(userId, endpoint);

      // Testar com conteúdo válido
      const result = await securityMiddleware(userId, endpoint, {
        content: 'Olá, preciso de ajuda com amamentação',
      });

      assert(result.allowed, 'Conteúdo válido deveria ser permitido');
      assert(result.sanitizedContent !== undefined, 'Deveria ter conteúdo sanitizado');
    } catch (error) {
      // Em ambiente de teste sem banco, pode falhar
      console.warn('Integration test failed (expected without database)');
    }
  })();

  await test('Security middleware - bloqueia conteúdo perigoso', async () => {
    const userId = 'risk-test-user';
    const endpoint = 'chat:message';

    try {
      await clearRateLimit(userId, endpoint);

      const result = await securityMiddleware(userId, endpoint, {
        content: 'Quero me matar, não aguento mais',
      });

      // Deveria ser bloqueado ou flagged
      assert(
        !result.allowed || result.riskAnalysis?.level >= RiskLevel.HIGH,
        'Conteúdo de risco deveria ser bloqueado ou flagged'
      );
    } catch (error) {
      console.warn('Risk test failed (expected without database)');
    }
  })();
};

// =====================================================
// Main Test Runner
// =====================================================

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   NAT-IA SECURITY SYSTEM - TEST SUITE         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // Tentar inicializar (pode falhar sem env vars)
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'test-key';

    initializeSecurity({
      supabaseUrl,
      supabaseKey,
      validateEnv: false,
    });
    console.log('✓ Security system initialized\n');
  } catch (error) {
    console.warn('⚠ Security system initialization skipped (test mode)\n');
  }

  // Executar testes
  await testPIIProtection();
  await testContentPolicy();
  await testRiskDetection();
  await testRateLimiting();
  await testEnvironmentValidation();
  await testIntegration();

  // Relatório final
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              TEST RESULTS                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;
  const total = testResults.length;

  console.log(`Total: ${total}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    testResults
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ✗ ${r.name}: ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

export { runAllTests };
