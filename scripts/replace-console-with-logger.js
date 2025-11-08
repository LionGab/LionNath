/**
 * Script para substituir console.* pelo logger
 * Preserva comentários que são exemplos de código
 */

const fs = require('fs');
const path = require('path');

// Diretórios para processar
const dirs = ['src/services/security', 'src/services/nathia', 'src/services/metrics'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Verificar se já tem import do logger
  const hasLoggerImport = content.includes("from '@/utils/logger'") || content.includes("from '@/lib/logger'");

  // Adicionar import do logger se não existir
  if (!hasLoggerImport && content.match(/console\.(log|warn|error)/)) {
    // Encontrar última linha de import
    const importRegex = /^import .* from .*;$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.indexOf(lastImport) + lastImport.length;

      content =
        content.substring(0, lastImportIndex) +
        "\nimport { logger } from '@/utils/logger';" +
        content.substring(lastImportIndex);
      modified = true;
    }
  }

  // Substituir console.log -> logger.info ou logger.debug
  content = content.replace(/console\.log\(/g, 'logger.info(');

  // Substituir console.warn -> logger.warn
  content = content.replace(/console\.warn\(/g, 'logger.warn(');

  // Substituir console.error -> logger.error
  content = content.replace(/console\.error\(/g, 'logger.error(');

  // Salvar arquivo se modificado
  if (content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${filePath}`);
    return true;
  }

  return false;
}

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  let count = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      count += processDir(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.test.ts')) {
      if (processFile(fullPath)) {
        count++;
      }
    }
  }

  return count;
}

// Processar diretórios
let totalFiles = 0;
for (const dir of dirs) {
  console.log(`\nProcessando ${dir}...`);
  const count = processDir(dir);
  totalFiles += count;
  console.log(`${count} arquivos modificados em ${dir}`);
}

console.log(`\n✓ Total: ${totalFiles} arquivos modificados`);
