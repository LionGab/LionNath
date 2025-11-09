#!/usr/bin/env node
/**
 * Script para facilitar deploy de migrations e Edge Functions no Supabase
 *
 * Uso:
 *   node scripts/supabase-deploy.js migrations
 *   node scripts/supabase-deploy.js functions
 *   node scripts/supabase-deploy.js all
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_DIR = path.join(__dirname, '..', 'supabase');
const MIGRATIONS_DIR = path.join(SUPABASE_DIR, 'migrations');
const FUNCTIONS_DIR = path.join(SUPABASE_DIR, 'functions');

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.error('❌ Supabase CLI não encontrado!');
    console.error('   Instale com: npm install -g supabase');
    console.error('   Ou siga: docs/INSTALAR_SUPABASE_CLI_WINDOWS.md');
    return false;
  }
}

function deployMigrations() {
  console.log('📦 Deployando migrations...\n');

  const migrations = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    console.log('⚠️  Nenhuma migration encontrada');
    return;
  }

  console.log(`📋 Encontradas ${migrations.length} migrations:`);
  migrations.forEach((m) => console.log(`   - ${m}`));
  console.log('');

  // Tentar com timeout aumentado e retry
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`);

      execSync('supabase db push', {
        stdio: 'inherit',
        cwd: SUPABASE_DIR,
        timeout: 120000, // 2 minutos de timeout
      });

      console.log('\n✅ Migrations aplicadas com sucesso!');
      return; // Sucesso, sair da função
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        console.log(`\n⚠️  Tentativa ${attempt} falhou. Aguardando 5 segundos antes de tentar novamente...\n`);
        // Aguardar antes de tentar novamente
        execSync('timeout /t 5 /nobreak', { stdio: 'ignore' });
      } else {
        console.error('\n❌ Erro ao aplicar migrations após', maxRetries, 'tentativas');
        console.error('\n💡 SOLUÇÕES ALTERNATIVAS:');
        console.error('   1. Aplicar migrations manualmente via SQL Editor:');
        console.error('      https://supabase.com/dashboard/project/mnszbkeuerjcevjvdqme/editor');
        console.error('   2. Ver SOLUCAO_TIMEOUT_MIGRATIONS.md para mais opções');
        console.error('   3. Tentar reparar migration problemática:');
        console.error('      supabase migration repair --status reverted 20251108024428');
        console.error('\n   Erro:', error.message);
        process.exit(1);
      }
    }
  }
}

function deployFunctions() {
  console.log('🚀 Deployando Edge Functions...\n');

  const functions = fs.readdirSync(FUNCTIONS_DIR).filter((dir) => {
    const dirPath = path.join(FUNCTIONS_DIR, dir);
    return fs.statSync(dirPath).isDirectory() && fs.existsSync(path.join(dirPath, 'index.ts'));
  });

  if (functions.length === 0) {
    console.log('⚠️  Nenhuma Edge Function encontrada');
    return;
  }

  console.log(`📋 Encontradas ${functions.length} Edge Functions:`);
  functions.forEach((f) => console.log(`   - ${f}`));
  console.log('');

  // Verificar se secrets estão configurados
  console.log('🔐 Verificando secrets...');
  try {
    execSync('supabase secrets list', {
      stdio: 'pipe',
      cwd: SUPABASE_DIR,
    });
  } catch {
    console.log('⚠️  Não foi possível verificar secrets');
    console.log('   Configure com: supabase secrets set GEMINI_API_KEY="..."');
  }
  console.log('');

  // Deploy de cada function
  for (const func of functions) {
    try {
      console.log(`📤 Deployando ${func}...`);
      execSync(`supabase functions deploy ${func}`, {
        stdio: 'inherit',
        cwd: SUPABASE_DIR,
      });
      console.log(`✅ ${func} deployada com sucesso!\n`);
    } catch (error) {
      console.error(`❌ Erro ao deployar ${func}:`, error.message);
      console.error('   Continuando com próxima function...\n');
    }
  }

  console.log('✅ Deploy de Edge Functions concluído!');
}

function main() {
  const command = process.argv[2] || 'all';

  console.log('🚀 Supabase Deploy Script\n');
  console.log('='.repeat(60) + '\n');

  if (!checkSupabaseCLI()) {
    process.exit(1);
  }

  switch (command) {
    case 'migrations':
      deployMigrations();
      break;
    case 'functions':
      deployFunctions();
      break;
    case 'all':
      deployMigrations();
      console.log('\n' + '='.repeat(60) + '\n');
      deployFunctions();
      break;
    default:
      console.error(`❌ Comando inválido: ${command}`);
      console.error('\nUso:');
      console.error('  node scripts/supabase-deploy.js migrations');
      console.error('  node scripts/supabase-deploy.js functions');
      console.error('  node scripts/supabase-deploy.js all');
      process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Deploy concluído!');
}

main();
