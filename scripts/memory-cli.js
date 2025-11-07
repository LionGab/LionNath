const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

// Diretório raiz das memórias persistentes
const MEMORY_DIR = path.resolve(__dirname, '..', '.claude', 'memory');
const COMMANDS = [
  'summary',
  'status',
  'decisions',
  'todos',
  'log',
  'context',
  'preferences',
  'search',
  'update',
  'export',
  'stats',
  'help'
];

function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    console.error('❌ Diretório de memória não encontrado em', MEMORY_DIR);
    process.exit(1);
  }
}

function readJson(fileName) {
  const filePath = path.join(MEMORY_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo ausente: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Falha ao parsear JSON (${fileName}): ${(error).message}`);
  }
}

function readText(fileName) {
  const filePath = path.join(MEMORY_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo ausente: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

function cmdSummary() {
  const context = readJson('context.json');
  const decisions = readJson('decisions.json');
  const todos = readJson('todo_history.json');

  printHeader('Resumo do Projeto');
  console.log(`Projeto: ${context.project_name}`);
  console.log(`Sessão atual: ${context.session_id}`);
  console.log(`Última atualização registrada: ${context.last_updated}`);

  const nextScreens = Object.entries(context.current_state.screens)
    .filter(([, value]) => value.status !== 'refactored')
    .map(([name, value]) => `${name} (${value.status})`);

  if (nextScreens.length > 0) {
    printHeader('Próximas Telas a Migrar');
    nextScreens.forEach((text) => console.log(`- ${text}`));
  }

  printHeader('Decisões Recentes');
  decisions.decisions.slice(-3).forEach((decision) => {
    console.log(`- [${decision.id}] ${decision.decision} (${decision.status}, impacto ${decision.impact})`);
  });

  printHeader('TODOs Críticos');
  todos.active_todos
    .filter((todo) => todo.priority === 'critical')
    .forEach((todo) => {
      console.log(`- [${todo.id}] ${todo.title} (${todo.estimated_hours}h, sprint ${todo.sprint})`);
    });

  const conversationLog = readText('conversation_log.md');
  const lastLines = conversationLog.trim().split(/\r?\n/).slice(-20);
  printHeader('Resumo da Última Sessão');
  lastLines.forEach((line) => console.log(line));
}

function cmdStatus() {
  const context = readJson('context.json');
  const todos = readJson('todo_history.json');

  const totalScreens = Object.keys(context.current_state.screens).length;
  const migratedScreens = Object.values(context.current_state.screens)
    .filter((screen) => screen.status === 'refactored').length;

  printHeader('Status Geral');
  console.log(`Progresso de telas: ${(migratedScreens / totalScreens * 100).toFixed(1)}% (${migratedScreens}/${totalScreens})`);
  console.log(`Sprint atual: ${todos.current_sprint}`);
  console.log(`Período: ${todos.sprint_start_date} → ${todos.sprint_end_date}`);

  printHeader('Componentes Implementados');
  Object.entries(context.current_state.components).forEach(([name, details]) => {
    console.log(`- ${name}: ${details.status}${details.file ? ` (${details.file})` : ''}`);
  });

  printHeader('Bloqueadores');
  const blockers = todos.active_todos.filter((todo) => todo.dependencies && todo.dependencies.length > 0);
  if (blockers.length === 0) {
    console.log('- Nenhum bloqueador registrado.');
  } else {
    blockers.forEach((todo) => console.log(`- ${todo.id}: depende de ${todo.dependencies.join(', ')}`));
  }
}

function cmdDecisions(options) {
  const decisions = readJson('decisions.json');
  let list = decisions.decisions;

  const recentIndex = options.indexOf('--recent');
  if (recentIndex !== -1) {
    const numberArg = options[recentIndex + 1];
    const count = numberArg ? Number.parseInt(numberArg, 10) : 3;
    list = list.slice(-count);
  }

  printHeader('Decisões Estratégicas');
  list.forEach((decision) => {
    console.log(`- [${decision.id}] ${decision.date} | ${decision.category} | impacto ${decision.impact} | ${decision.status}`);
    console.log(`  ${decision.decision}`);
    if (decision.rationale) {
      console.log(`  → Motivo: ${decision.rationale}`);
    }
  });
}

function cmdTodos(options) {
  const todos = readJson('todo_history.json');
  let list = todos.active_todos;

  if (options.includes('--critical')) {
    list = list.filter((todo) => todo.priority === 'critical');
  }

  printHeader('TODOs Pendentes');
  list.forEach((todo) => {
    console.log(`- [${todo.id}] ${todo.title} | prioridade ${todo.priority} | ${todo.estimated_hours}h`);
    if (todo.dependencies && todo.dependencies.length > 0) {
      console.log(`  Depende de: ${todo.dependencies.join(', ')}`);
    }
    console.log(`  Sprint: ${todo.sprint}`);
  });
}

function cmdLog(options) {
  const conversationLog = readText('conversation_log.md');
  const lines = conversationLog.split(/\r?\n/);

  const sessionIndex = options.indexOf('--session');
  if (sessionIndex !== -1) {
    const sessionId = options[sessionIndex + 1];
    if (!sessionId) {
      console.error('Informe o identificador da sessão após --session');
      process.exit(1);
    }
    const marker = `## 📅 Sessão ${sessionId}`;
    const start = lines.findIndex((line) => line.startsWith(marker));
    if (start === -1) {
      console.error(`Sessão ${sessionId} não encontrada.`);
      process.exit(1);
    }
    const end = lines.findIndex((line, index) => index > start && line.startsWith('## 📅 Sessão'));
    const slice = lines.slice(start, end === -1 ? undefined : end);
    slice.forEach((line) => console.log(line));
    return;
  }

  lines.forEach((line) => console.log(line));
}

function cmdContext() {
  const context = readJson('context.json');
  printHeader('Visão Geral');
  console.log(JSON.stringify(context.project_overview, null, 2));
  printHeader('Stack Tecnológica');
  console.log(JSON.stringify(context.technology_stack, null, 2));
  printHeader('Design System');
  console.log(JSON.stringify(context.design_system, null, 2));
}

function cmdPreferences() {
  const preferences = readJson('preferences.json');
  printHeader('Preferências do Usuário');
  console.log(JSON.stringify(preferences.user_preferences, null, 2));
  printHeader('Prioridades do Projeto');
  console.log(JSON.stringify(preferences.project_priorities, null, 2));
  printHeader('Stakeholder');
  console.log(JSON.stringify(preferences.stakeholder_preferences, null, 2));
}

function cmdSearch(options) {
  const keyword = options[0];
  if (!keyword) {
    console.error('Uso: /memory search <palavra-chave>');
    process.exit(1);
  }

  const files = ['context.json', 'decisions.json', 'preferences.json', 'conversation_log.md', 'todo_history.json'];
  const regex = new RegExp(keyword, 'i');
  let hits = 0;

  files.forEach((file) => {
    const content = readText(file);
    if (regex.test(content)) {
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          console.log(`[${file}:${index + 1}] ${line.trim()}`);
          hits += 1;
        }
      });
    }
  });

  if (hits === 0) {
    console.log(`Nenhum resultado encontrado para "${keyword}".`);
  }
}

function cmdUpdate() {
  const logPath = path.join(MEMORY_DIR, 'conversation_log.md');
  const timestamp = new Date().toISOString();
  const entry = [
    '',
    `## 🔄 Atualização Manual - ${timestamp}`,
    '',
    'Atualização manual registrada via CLI de memória.',
    ''
  ].join(os.EOL);

  fs.appendFileSync(logPath, entry, 'utf8');
  console.log('✅ Atualização manual registrada no conversation_log.md');
}

function cmdExport() {
  const backupDir = path.join(MEMORY_DIR, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
  const archiveName = `memory-backup-${timestamp}.tar.gz`;
  const archivePath = path.join(backupDir, archiveName);

  const result = spawnSync('tar', ['-czf', archivePath, '.'], {
    cwd: MEMORY_DIR,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    console.error('Falha ao criar backup com tar. Verifique se o utilitário está instalado.');
    process.exit(result.status || 1);
  }

  console.log(`✅ Backup criado em ${archivePath}`);
}

function cmdStats() {
  const decisions = readJson('decisions.json');
  const todos = readJson('todo_history.json');

  const files = fs.readdirSync(MEMORY_DIR).filter((file) => !fs.lstatSync(path.join(MEMORY_DIR, file)).isDirectory());
  const totalSize = files.reduce((sum, file) => sum + fs.statSync(path.join(MEMORY_DIR, file)).size, 0);

  printHeader('Estatísticas da Memória');
  console.log(`Tamanho total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`Decisões registradas: ${decisions.statistics.total_decisions}`);
  console.log(`TODOs ativos: ${todos.active_todos.length}`);
  console.log(`TODOs completos: ${todos.completed_todos.length}`);
}

function cmdHelp() {
  console.log('Uso: /memory <comando>');
  console.log('Comandos disponíveis:');
  COMMANDS.forEach((name) => console.log(`- ${name}`));
  console.log('\nExemplos:');
  console.log('/memory');
  console.log('/memory status');
  console.log('/memory decisions --recent 3');
  console.log('/memory todos --critical');
  console.log('/memory search gemini');
}

function run() {
  ensureMemoryDir();

  const [, , ...argv] = process.argv;
  const [rawCommand, ...options] = argv;
  const command = rawCommand ? rawCommand.toLowerCase() : 'summary';

  switch (command) {
    case 'summary':
    case undefined:
      cmdSummary();
      break;
    case 'status':
      cmdStatus();
      break;
    case 'decisions':
      cmdDecisions(options);
      break;
    case 'todos':
      cmdTodos(options);
      break;
    case 'log':
      cmdLog(options);
      break;
    case 'context':
      cmdContext();
      break;
    case 'preferences':
      cmdPreferences();
      break;
    case 'search':
      cmdSearch(options);
      break;
    case 'update':
      cmdUpdate();
      break;
    case 'export':
      cmdExport();
      break;
    case 'stats':
      cmdStats();
      break;
    case 'help':
      cmdHelp();
      break;
    default:
      console.error(`Comando inválido: ${command}`);
      cmdHelp();
      process.exit(1);
  }
}

run();
