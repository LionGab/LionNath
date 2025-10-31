#!/usr/bin/env node

/**
 * Script de verificação do status do app
 * Verifica o que está configurado e o que falta
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VERIFICANDO STATUS DO APP - Nossa Maternidade\n');
console.log('=' .repeat(60));

let allGood = true;

// 1. Verificar node_modules
console.log('\n1️⃣  Verificando dependências...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ node_modules existe (dependências instaladas)');
} else {
  console.log('   ❌ node_modules NÃO existe (rode: npm install)');
  allGood = false;
}

// 2. Verificar .env
console.log('\n2️⃣  Verificando arquivo .env...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('   ✅ Arquivo .env existe');
  
  // Ler e verificar se está preenchido
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  
  const hasSupabaseUrl = envContent.includes('EXPO_PUBLIC_SUPABASE_URL=') && 
                         !envContent.includes('EXPO_PUBLIC_SUPABASE_URL=your-');
  const hasSupabaseKey = envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=') && 
                         !envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('   ✅ Credenciais do Supabase configuradas');
  } else {
    console.log('   ⚠️  Credenciais do Supabase NÃO configuradas');
    console.log('   ➡️  Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY');
    allGood = false;
  }
} else {
  console.log('   ❌ Arquivo .env NÃO existe');
  allGood = false;
}

// 3. Verificar Schema SQL
console.log('\n3️⃣  Verificando Schema SQL...');
const schemaPath = path.join(__dirname, 'supabase', 'schema-nossa-maternidade-completo.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSize = fs.statSync(schemaPath).size;
  console.log(`   ✅ Schema SQL existe (${Math.round(schemaSize/1024)}KB)`);
  console.log('   ⚠️  Verifique se já executou no Supabase Dashboard');
} else {
  console.log('   ❌ Schema SQL NÃO encontrado');
  allGood = false;
}

// 4. Verificar Edge Function
console.log('\n4️⃣  Verificando Edge Function...');
const edgeFunctionPath = path.join(__dirname, 'supabase', 'functions', 'nathia-chat', 'index.ts');
if (fs.existsSync(edgeFunctionPath)) {
  const functionSize = fs.statSync(edgeFunctionPath).size;
  console.log(`   ✅ Edge Function existe (${Math.round(functionSize/1024)}KB)`);
  console.log('   ⚠️  Verifique se já fez deploy com: supabase functions deploy nathia-chat');
} else {
  console.log('   ❌ Edge Function NÃO encontrada');
  allGood = false;
}

// 5. Verificar package.json
console.log('\n5️⃣  Verificando package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`   ✅ Projeto: ${pkg.name} v${pkg.version}`);
  
  const criticalDeps = [
    'expo',
    '@supabase/supabase-js',
    '@react-navigation/native',
    'react-native'
  ];
  
  const missingDeps = criticalDeps.filter(dep => !pkg.dependencies[dep]);
  if (missingDeps.length === 0) {
    console.log('   ✅ Todas dependências críticas configuradas');
  } else {
    console.log(`   ⚠️  Dependências faltando: ${missingDeps.join(', ')}`);
  }
} else {
  console.log('   ❌ package.json NÃO encontrado');
  allGood = false;
}

// 6. Verificar estrutura de pastas
console.log('\n6️⃣  Verificando estrutura de pastas...');
const criticalFolders = [
  'src',
  'src/components',
  'src/screens',
  'src/services',
  'src/navigation'
];

let allFoldersExist = true;
criticalFolders.forEach(folder => {
  if (!fs.existsSync(path.join(__dirname, folder))) {
    console.log(`   ❌ Pasta faltando: ${folder}`);
    allFoldersExist = false;
  }
});

if (allFoldersExist) {
  console.log('   ✅ Todas pastas críticas existem');
}

// 7. Verificar documentação
console.log('\n7️⃣  Verificando documentação...');
const docs = [
  'COMO-DEIXAR-APP-FUNCIONAL.md',
  'STATUS-APP.md',
  'README.md'
];

docs.forEach(doc => {
  if (fs.existsSync(path.join(__dirname, doc))) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ⚠️  ${doc} não encontrado`);
  }
});

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESUMO:\n');

if (allGood) {
  console.log('✅ TUDO CONFIGURADO! Você pode rodar: npm start\n');
} else {
  console.log('⚠️  CONFIGURAÇÃO INCOMPLETA\n');
  console.log('📖 Próximos passos:\n');
  console.log('   1. Leia: COMO-DEIXAR-APP-FUNCIONAL.md');
  console.log('   2. Complete as etapas faltantes');
  console.log('   3. Rode este script novamente para verificar\n');
}

console.log('=' .repeat(60));
console.log('\n💡 Dica: Leia o arquivo STATUS-APP.md para ver o progresso completo\n');
