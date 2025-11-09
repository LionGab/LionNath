#!/usr/bin/env node
/**
 * Script de Diagnóstico Netlify
 * Verifica configuração do projeto para deploy no Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico Netlify - Nossa Maternidade\n');
console.log('='.repeat(60));

let hasErrors = false;
let hasWarnings = false;

// 1. Verificar netlify.toml
console.log('\n📋 1. Verificando netlify.toml...');
const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  const netlifyToml = fs.readFileSync(netlifyTomlPath, 'utf-8');
  
  // Verificar build command
  if (netlifyToml.includes('pnpm install')) {
    console.log('  ✅ Build command usa pnpm');
  } else {
    console.log('  ⚠️  Build command pode não estar usando pnpm');
    hasWarnings = true;
  }
  
  // Verificar publish directory
  if (netlifyToml.includes('apps/mobile/dist')) {
    console.log('  ✅ Publish directory configurado corretamente');
  } else {
    console.log('  ❌ Publish directory pode estar incorreto');
    hasErrors = true;
  }
  
  // Verificar Node version
  if (netlifyToml.includes('NODE_VERSION')) {
    console.log('  ✅ Node version especificada');
  } else {
    console.log('  ⚠️  Node version não especificada');
    hasWarnings = true;
  }
} else {
  console.log('  ❌ netlify.toml não encontrado!');
  hasErrors = true;
}

// 2. Verificar estrutura do projeto
console.log('\n📁 2. Verificando estrutura do projeto...');
const appsMobilePath = path.join(__dirname, '..', 'apps', 'mobile');
if (fs.existsSync(appsMobilePath)) {
  console.log('  ✅ apps/mobile existe');
  
  // Verificar package.json do mobile
  const mobilePackageJsonPath = path.join(appsMobilePath, 'package.json');
  if (fs.existsSync(mobilePackageJsonPath)) {
    const mobilePackageJson = JSON.parse(fs.readFileSync(mobilePackageJsonPath, 'utf-8'));
    
    // Verificar script build:web
    if (mobilePackageJson.scripts && mobilePackageJson.scripts['build:web']) {
      console.log('  ✅ Script build:web existe');
    } else {
      console.log('  ❌ Script build:web não encontrado em apps/mobile/package.json');
      hasErrors = true;
    }
  } else {
    console.log('  ❌ apps/mobile/package.json não encontrado');
    hasErrors = true;
  }
} else {
  console.log('  ❌ apps/mobile não encontrado');
  hasErrors = true;
}

// 3. Verificar pnpm-workspace.yaml
console.log('\n📦 3. Verificando configuração do monorepo...');
const pnpmWorkspacePath = path.join(__dirname, '..', 'pnpm-workspace.yaml');
if (fs.existsSync(pnpmWorkspacePath)) {
  console.log('  ✅ pnpm-workspace.yaml existe');
} else {
  console.log('  ⚠️  pnpm-workspace.yaml não encontrado (pode ser necessário)');
  hasWarnings = true;
}

// 4. Verificar .gitignore
console.log('\n🔒 4. Verificando segurança...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  
  if (gitignore.includes('.env')) {
    console.log('  ✅ .env está no .gitignore');
  } else {
    console.log('  ⚠️  .env pode não estar no .gitignore');
    hasWarnings = true;
  }
  
  if (gitignore.includes('node_modules')) {
    console.log('  ✅ node_modules está no .gitignore');
  }
} else {
  console.log('  ⚠️  .gitignore não encontrado');
  hasWarnings = true;
}

// 5. Verificar variáveis de ambiente necessárias
console.log('\n🌍 5. Verificando variáveis de ambiente...');
const envExamplePath = path.join(__dirname, '..', 'apps', 'mobile', '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('  ✅ .env.example existe em apps/mobile');
  const envExample = fs.readFileSync(envExamplePath, 'utf-8');
  
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      console.log(`  ✅ ${varName} documentado`);
    } else {
      console.log(`  ⚠️  ${varName} não encontrado no .env.example`);
      hasWarnings = true;
    }
  });
} else {
  console.log('  ⚠️  .env.example não encontrado em apps/mobile');
  hasWarnings = true;
}

// 6. Verificar GitHub repository
console.log('\n🔗 6. Verificando configuração do GitHub...');
const gitConfigPath = path.join(__dirname, '..', '.git', 'config');
if (fs.existsSync(gitConfigPath)) {
  const gitConfig = fs.readFileSync(gitConfigPath, 'utf-8');
  
  if (gitConfig.includes('github.com')) {
    console.log('  ✅ Repositório GitHub detectado');
    
    // Tentar extrair owner/repo
    const match = gitConfig.match(/github\.com[:\/]([^\/]+)\/([^\/]+)\.git/);
    if (match) {
      const owner = match[1];
      const repo = match[2].replace('.git', '');
      console.log(`  📍 Repositório: ${owner}/${repo}`);
      
      if (owner === 'LionGab' && repo === 'NossaMaternidade-LN') {
        console.log('  ✅ Nome do repositório correto');
      } else {
        console.log(`  ⚠️  Repositório esperado: LionGab/NossaMaternidade-LN`);
        console.log(`      Repositório atual: ${owner}/${repo}`);
        hasWarnings = true;
      }
    }
  }
} else {
  console.log('  ⚠️  Não foi possível verificar configuração do Git');
  hasWarnings = true;
}

// Resumo
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESUMO:\n');

if (hasErrors) {
  console.log('❌ ERROS ENCONTRADOS:');
  console.log('   Corrija os erros acima antes de fazer deploy no Netlify.\n');
  process.exit(1);
}

if (hasWarnings) {
  console.log('⚠️  AVISOS:');
  console.log('   Algumas configurações podem precisar de atenção.\n');
}

console.log('✅ Configuração do projeto parece estar correta!');
console.log('\n📝 PRÓXIMOS PASSOS:');
console.log('   1. Verifique se o Netlify App está instalado no GitHub:');
console.log('      https://github.com/settings/installations');
console.log('   2. Verifique se o repositório está conectado no Netlify:');
console.log('      https://app.netlify.com');
console.log('   3. Configure as variáveis de ambiente no Netlify Dashboard');
console.log('   4. Faça um deploy de teste\n');

console.log('📚 Documentação completa: docs/TROUBLESHOOTING_NETLIFY.md\n');

process.exit(0);
