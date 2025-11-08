#!/usr/bin/env tsx

/**
 * Review Keeper Agent
 *
 * Aprova todas as mudanças pendentes marcando a decisão como "keep".
 * Faz parte do fluxo automático para pular review manual no Cursor.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

interface AutoApproveConfig {
  version: string;
  description: string;
  enabled: boolean;
  skip_all_permissions: boolean;
  auto_approve: {
    enabled: boolean;
    all_changes: boolean;
    review_changes: boolean;
    write_operations: boolean;
    shell_commands: boolean;
    read_operations: boolean;
    skip_all_confirmations: boolean;
  };
  skip_awaiting_review: {
    enabled: boolean;
    for_all_operations: boolean;
    skip_all: boolean;
  };
  keep_review_changes: {
    enabled: boolean;
    auto_approve: boolean;
    default_action: 'keep_all';
    always_keep: boolean;
  };
  approval_rules: {
    default_action: 'approve';
    timeout: number;
    skip_interactive: boolean;
    auto_approve_on_review: boolean;
    skip_all_permissions: boolean;
    auto_accept_all: boolean;
  };
  permissions: {
    skip_all: boolean;
    require_approval: boolean;
    auto_approve_all: boolean;
    write: {
      require_approval: boolean;
      auto_approve: boolean;
      keep_changes: boolean;
      skip_permission: boolean;
    };
    shell: {
      require_approval: boolean;
      auto_approve: boolean;
      keep_changes: boolean;
      skip_permission: boolean;
    };
    read: {
      require_approval: boolean;
      auto_approve: boolean;
      skip_permission: boolean;
    };
  };
  review_workflow: {
    auto_approve: boolean;
    keep_all_changes: boolean;
    skip_awaiting: boolean;
    approve_on_review: boolean;
    default_action: 'approve_and_keep';
    skip_all_permissions: boolean;
  };
}

interface PendingApproval {
  id: string;
  action: string;
  file?: string;
  severity?: string;
  agent_id?: string;
}

interface ApprovalLogEntry {
  timestamp: string;
  agent_id: string;
  action: string;
  file: string | null;
  severity: string | null;
  result: 'auto_approved';
  approval_id: string;
  approved_by: 'review-keeper-agent';
  approved_at: string;
  decision: 'keep';
}

const ROOT_DIR = path.resolve(__dirname, '..');
const CURSOR_DIR = path.join(ROOT_DIR, '.cursor');
const REVIEW_LOG_DIR = path.join(CURSOR_DIR, 'review-logs');
const PENDING_APPROVALS_PATH = path.join(REVIEW_LOG_DIR, 'pending-approvals.json');
const AUTO_APPROVE_PATH = path.join(CURSOR_DIR, 'auto-approve-config.json');

const AUTO_APPROVE_TEMPLATE: AutoApproveConfig = {
  version: '1.0.0',
  description:
    'Configuração automática para manter todas as mudanças durante review. Gerado por review-keeper-agent.ts.',
  enabled: true,
  skip_all_permissions: true,
  auto_approve: {
    enabled: true,
    all_changes: true,
    review_changes: true,
    write_operations: true,
    shell_commands: true,
    read_operations: true,
    skip_all_confirmations: true,
  },
  skip_awaiting_review: {
    enabled: true,
    for_all_operations: true,
    skip_all: true,
  },
  keep_review_changes: {
    enabled: true,
    auto_approve: true,
    default_action: 'keep_all',
    always_keep: true,
  },
  approval_rules: {
    default_action: 'approve',
    timeout: 0,
    skip_interactive: true,
    auto_approve_on_review: true,
    skip_all_permissions: true,
    auto_accept_all: true,
  },
  permissions: {
    skip_all: true,
    require_approval: false,
    auto_approve_all: true,
    write: {
      require_approval: false,
      auto_approve: true,
      keep_changes: true,
      skip_permission: true,
    },
    shell: {
      require_approval: false,
      auto_approve: true,
      keep_changes: true,
      skip_permission: true,
    },
    read: {
      require_approval: false,
      auto_approve: true,
      skip_permission: true,
    },
  },
  review_workflow: {
    auto_approve: true,
    keep_all_changes: true,
    skip_awaiting: true,
    approve_on_review: true,
    default_action: 'approve_and_keep',
    skip_all_permissions: true,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sanitizePendingApproval(value: unknown): PendingApproval {
  if (!isRecord(value)) {
    throw new Error('Item inválido em pending-approvals.json');
  }

  const { id, action, file, severity, agent_id } = value;

  if (typeof id !== 'string' || typeof action !== 'string') {
    throw new Error('Item de aprovação pendente sem id ou action válidos');
  }

  const approval: PendingApproval = { id, action };

  if (typeof file === 'string') {
    approval.file = file;
  }

  if (typeof severity === 'string') {
    approval.severity = severity;
  }

  if (typeof agent_id === 'string') {
    approval.agent_id = agent_id;
  }

  return approval;
}

function isApprovalLogEntry(value: unknown): value is ApprovalLogEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.timestamp === 'string' &&
    typeof value.agent_id === 'string' &&
    typeof value.action === 'string' &&
    ('file' in value ? value.file === null || typeof value.file === 'string' : false) &&
    ('severity' in value ? value.severity === null || typeof value.severity === 'string' : false) &&
    value.result === 'auto_approved' &&
    typeof value.approval_id === 'string' &&
    value.approved_by === 'review-keeper-agent' &&
    typeof value.approved_at === 'string' &&
    value.decision === 'keep'
  );
}

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`❌ Falha ao criar diretório ${dirPath}:`, error);
    throw error;
  }
}

async function ensureAutoApproveConfig(): Promise<void> {
  await ensureDir(path.dirname(AUTO_APPROVE_PATH));
  const formatted = `${JSON.stringify(AUTO_APPROVE_TEMPLATE, null, 2)}\n`;

  try {
    const current = await fs.readFile(AUTO_APPROVE_PATH, 'utf-8');
    if (current === formatted) {
      console.log('• Configuração de auto-aprovação já está alinhada 👍');
      return;
    }
  } catch {
    // Arquivo inexistente, será criado abaixo.
  }

  await fs.writeFile(AUTO_APPROVE_PATH, formatted, 'utf-8');
  console.log('• Configuração de auto-aprovação atualizada ✅');
}

async function loadPendingApprovals(): Promise<PendingApproval[]> {
  await ensureDir(REVIEW_LOG_DIR);

  try {
    const raw = await fs.readFile(PENDING_APPROVALS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('pending-approvals.json precisa ser um array');
    }

    return parsed.map(sanitizePendingApproval);
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') {
      // Sem aprovações pendentes é um caso esperado.
      return [];
    }

    throw error;
  }
}

function buildLogEntry(approval: PendingApproval): ApprovalLogEntry {
  const now = new Date().toISOString();

  return {
    timestamp: now,
    agent_id: approval.agent_id ?? 'auto-approver',
    action: approval.action,
    file: approval.file ?? null,
    severity: approval.severity ?? null,
    result: 'auto_approved',
    approval_id: approval.id,
    approved_by: 'review-keeper-agent',
    approved_at: now,
    decision: 'keep',
  };
}

async function appendLog(entries: ApprovalLogEntry[]): Promise<void> {
  if (entries.length === 0) {
    return;
  }

  await ensureDir(REVIEW_LOG_DIR);

  const today = new Date().toISOString().split('T')[0];
  const logFilePath = path.join(REVIEW_LOG_DIR, `review-${today}.json`);

  let existing: ApprovalLogEntry[] = [];

  try {
    const raw = await fs.readFile(logFilePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      existing = parsed.filter(isApprovalLogEntry);
    }
  } catch (error) {
    if ((error as { code?: string }).code !== 'ENOENT') {
      console.warn(`⚠️  Não foi possível ler ${logFilePath}, recriando do zero.`);
    }
  }

  const combined = [...existing, ...entries];
  await fs.writeFile(logFilePath, `${JSON.stringify(combined, null, 2)}\n`, 'utf-8');
}

async function clearPendingApprovals(): Promise<void> {
  await fs.writeFile(PENDING_APPROVALS_PATH, '[]\n', 'utf-8');
}

async function reviewAndKeep(): Promise<void> {
  console.log('\n🚀 Review Keeper Agent - iniciando varredura de aprovações\n');

  await ensureAutoApproveConfig();

  const pendingApprovals = await loadPendingApprovals();

  if (pendingApprovals.length === 0) {
    console.log('• Nenhuma aprovação pendente encontrada ✅');
    return;
  }

  console.log(`• Encontradas ${pendingApprovals.length} aprovação(ões) pendente(s)\n`);

  const logEntries: ApprovalLogEntry[] = [];

  for (const [index, approval] of pendingApprovals.entries()) {
    console.log(`➡️  Review next change #${index + 1}`);
    console.log(`   • Action: ${approval.action}`);
    console.log(`   • Arquivo: ${approval.file ?? 'N/A'}`);
    console.log('   • Decisão aplicada: keep (manter mudança)\n');

    logEntries.push(buildLogEntry(approval));
  }

  await appendLog(logEntries);
  await clearPendingApprovals();

  console.log('✅ Todas as mudanças foram marcadas como keep e logadas');
}

reviewAndKeep()
  .then(() => {
    console.log('\n🎯 Fluxo concluído com sucesso\n');
  })
  .catch((error) => {
    console.error('\n❌ Erro durante execução do Review Keeper Agent:\n', error);
    process.exit(1);
  });
