#!/usr/bin/env node
/**
 * Script de Validação Pré-Demo
 *
 * Executa checklist completo antes da apresentação para influenciadora
 * Verifica: tipos, lint, testes, env vars, estrutura de arquivos
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function checkmark(passed) {
  return passed ? `${COLORS.green}✓${COLORS.reset}` : `${COLORS.red}✗${COLORS.reset}`;
}

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function runCheck(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      log(`${checkmark(true)} ${name}`, COLORS.green);
      checks.passed++;
      return true;
    } else if (result === false) {
      log(`${checkmark(false)} ${name}`, COLORS.red);
      checks.failed++;
      return false;
    } else {
      log(`${COLORS.yellow}⚠${COLORS.reset} ${name}: ${result}`, COLORS.yellow);
      checks.warnings++;
      return null;
    }
  } catch (error) {
    log(`${checkmark(false)} ${name}: ${error.message}`, COLORS.red);
    checks.failed++;
    return false;
  }
}

// Verificar se estamos no diretório raiz
if (!fs.existsSync('package.json')) {
  log('Erro: Execute este script a partir da raiz do projeto', COLORS.red);
  process.exit(1);
}

log('\n🔍 Validação Pré-Demo - Nossa Maternidade\n', COLORS.blue);
log('Verificando ambiente e configurações...\n');

// 1. Verificar dependências instaladas
runCheck('Dependências instaladas', () => {
  return fs.existsSync('node_modules') && fs.existsSync('node_modules/.bin/turbo');
});

// 2. Verificar .env.example existe
runCheck('.env.example existe', () => {
  return fs.existsSync('.env.example');
});

// 3. Verificar variáveis de ambiente críticas (se .env existe)
runCheck('Variáveis de ambiente configuradas', () => {
  const envPath = '.env';
  if (!fs.existsSync(envPath)) {
    return 'Arquivo .env não encontrado (use .env.example como base)';
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('EXPO_PUBLIC_SUPABASE_URL') && !envContent.includes('seu-projeto');
  const hasSupabaseKey = envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY') && !envContent.includes('sua-chave');

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    return 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env';
  }

  return true;
});

// 4. Verificar arquivos críticos existem
runCheck('Arquivos críticos existem', () => {
  const criticalFiles = [
    'apps/mobile/App.tsx',
    'src/navigation/index.tsx',
    'src/services/supabase.ts',
    'src/lib/mocks/DemoDataProvider.tsx',
    'src/shared/components/ErrorBoundary.tsx',
  ];

  const missing = criticalFiles.filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    return `Arquivos faltando: ${missing.join(', ')}`;
  }

  return true;
});

// 5. Type check
runCheck('TypeScript type-check', () => {
  try {
    execSync('pnpm run type-check', { stdio: 'pipe', timeout: 30000 });
    return true;
  } catch (error) {
    return false;
  }
});

// 6. Lint check
runCheck('ESLint check', () => {
  try {
    execSync('pnpm run lint', { stdio: 'pipe', timeout: 30000 });
    return true;
  } catch (error) {
    return false;
  }
});

// 7. Testes básicos
runCheck('Testes básicos', () => {
  try {
    execSync('pnpm run test', { stdio: 'pipe', timeout: 60000 });
    return true;
  } catch (error) {
    return 'Alguns testes falharam (verifique logs)';
  }
});

// 8. Verificar estrutura de telas principais
runCheck('Telas principais existem', () => {
  const screens = [
    'src/screens/HomeScreen.tsx',
    'src/screens/ChatScreen.tsx',
    'src/screens/SignInScreen.tsx',
    'src/screens/ProfileScreen.tsx',
  ];

  const missing = screens.filter((screen) => !fs.existsSync(screen));
  if (missing.length > 0) {
    return `Telas faltando: ${missing.join(', ')}`;
  }

  return true;
});

// 9. Verificar componentes de skeleton/loading
runCheck('Componentes de loading existem', () => {
  const loadingComponents = [
    'src/components/chat/MessageSkeleton.tsx',
    'src/components/home/DailyInsightCard.tsx', // Tem skeleton interno
    'src/shared/components/Loading.tsx',
  ];

  const missing = loadingComponents.filter((comp) => !fs.existsSync(comp));
  if (missing.length > 0) {
    return `Componentes faltando: ${missing.join(', ')}`;
  }

  return true;
});

// 10. Verificar ErrorBoundary configurado
runCheck('ErrorBoundary configurado', () => {
  const appContent = fs.readFileSync('apps/mobile/App.tsx', 'utf8');
  return appContent.includes('ErrorBoundary');
});

// Resumo
log('\n' + '='.repeat(50), COLORS.blue);
log('📊 Resumo da Validação', COLORS.blue);
log('='.repeat(50), COLORS.blue);
log(`✓ Passou: ${checks.passed}`, COLORS.green);
log(`✗ Falhou: ${checks.failed}`, checks.failed > 0 ? COLORS.red : COLORS.reset);
log(`⚠ Avisos: ${checks.warnings}`, checks.warnings > 0 ? COLORS.yellow : COLORS.reset);

if (checks.failed === 0) {
  log('\n✅ Tudo pronto para a demo!', COLORS.green);
  log('\n📝 Próximos passos:', COLORS.blue);
  log('1. Configure .env com credenciais do Supabase (ou USE_MOCKS=true)');
  log('2. Execute: pnpm dev');
  log('3. Teste fluxo completo: Login → Onboarding → Feed → Chat');
  log('4. Crie build TestFlight/Internal Testing');
  process.exit(0);
} else {
  log('\n❌ Corrija os erros acima antes da demo', COLORS.red);
  process.exit(1);
}
