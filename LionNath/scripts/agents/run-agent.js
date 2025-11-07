#!/usr/bin/env node

/**
 * Run Agent - Executa um agente específico em loop contínuo
 */

import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentType = process.argv[2];

if (!agentType) {
  console.error('Usage: node run-agent.js <agent-type>');
  process.exit(1);
}

const projectRoot = path.join(__dirname, '../..');
const agentRunnerScript = path.join(__dirname, 'agents', 'agent-runner.ts');

console.log(`[${agentType}-agent] Starting agent runner...`);

// Executa agent-runner.ts usando tsx
const child = spawn('npx', ['tsx', agentRunnerScript, agentType], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, AGENT_TYPE: agentType },
});

child.on('error', (error) => {
  console.error(`[${agentType}-agent] Error:`, error);
});

child.on('exit', (code) => {
  console.log(`[${agentType}-agent] Exited with code ${code}`);
  process.exit(code || 0);
});

// Mantém processo vivo
process.stdin.resume();
