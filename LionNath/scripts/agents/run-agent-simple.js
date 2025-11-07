#!/usr/bin/env node

/**
 * Run Agent Simple - Versão simplificada para executar agentes
 * Usa tsx para executar TypeScript diretamente
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentType = process.argv[2];

if (!agentType) {
  console.error('Usage: node run-agent-simple.js <agent-type>');
  process.exit(1);
}

const agentFile = path.join(__dirname, 'agents', `${agentType}-agent.ts`);

if (!fs.existsSync(agentFile)) {
  console.error(`Agent file not found: ${agentFile}`);
  process.exit(1);
}

// Executa agente usando tsx
const childProcess = spawn('npx', ['tsx', agentFile], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..', '..'),
});

childProcess.on('error', (error) => {
  console.error(`Error running agent: ${error.message}`);
  process.exit(1);
});

childProcess.on('exit', (code) => {
  process.exit(code || 0);
});
