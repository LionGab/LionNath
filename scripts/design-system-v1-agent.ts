#!/usr/bin/env tsx
/**
 * Agente Design System v1 - Nossa Maternidade
 *
 * Gera prompt de ativação e relatório com tokens principais para execução via Cursor Composer.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { nossaMaternidadeDesignTokens } from '../src/theme/themes/v1-nossa-maternidade';

const REQUIRED_FLAG = '--ultrathinking';

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function buildPaletteTable(): string {
  const entries = Object.entries(nossaMaternidadeDesignTokens.palette.neutrals);
  const header = '| Stop | Hex |\n| --- | --- |';
  const rows = entries
    .map(([stop, value]) => `| ${stop} | ${value} |`)
    .join('\n');
  return `${header}\n${rows}`;
}

function buildSpacingList(): string {
  return Object.entries(nossaMaternidadeDesignTokens.spacing)
    .map(([token, value]) => `- ${token}: ${value}px`)
    .join('\n');
}

function buildRadiusList(): string {
  return Object.entries(nossaMaternidadeDesignTokens.radius)
    .map(([token, value]) => `- ${token}: ${value}px`)
    .join('\n');
}

function buildTypographySummary(): string {
  return Object.entries(nossaMaternidadeDesignTokens.typography)
    .map(([name, token]) => `- ${name}: ${token.fontSize}px / ${token.lineHeight}px · peso ${token.fontWeight}`)
    .join('\n');
}

function main(): void {
  const hasRequiredFlag = process.argv.includes(REQUIRED_FLAG);

  if (!hasRequiredFlag) {
    console.error('❌ Execute com "pnpm design:system:v1 -- --ultrathinking" para ativar o agente.');
    process.exit(1);
  }

  const promptDir = join(process.cwd(), '.cursor', 'agents', 'prompts');
  const reportsDir = join(process.cwd(), '.cursor', 'agents', 'reports');

  ensureDir(promptDir);
  ensureDir(reportsDir);

  const promptContent = `# Agent Design System v1 — Nossa Maternidade\n\n` +
    `## Contexto Emocional\n` +
    `- Sensações alvo: acolhimento, segurança, não julgamento, cuidado\n` +
    `- Linguagem visual: mobile-first, tons pastéis (#6DA9E4, #FF8BA3, #FFF8F3, #DCEBFA, #6A5450)\n` +
    `- Microinterações suaves, feedback caloroso, zero ruído\n\n` +
    `## Objetivos\n` +
    `1. Gerar visual language board (home, chat empático, feed anônimo, onboarding calmante)\n` +
    `2. Mapear tokens do Design System v1 (cores, tipografia, spacing, bordas, sombras)\n` +
    `3. Conectar tokens ao NativeWind e garantir uso consistente\n\n` +
    `## Restrições\n` +
    `- Sem neon, sem clima corporativo/clinical/gaming\n` +
    `- Respeitar acessibilidade (contraste 4.5:1+, áreas 44x44px)\n` +
    `- Apenas tons suaves, linguagem calma, sem ícones agressivos\n\n` +
    `## Pipeline — use --ultrathinking\n` +
    `1. Carregar tokens exportados em src/theme/themes/v1-nossa-maternidade.ts\n` +
    `2. Confirmar tabela de neutros 100–900 e feedback colors\n` +
    `3. Validar tipografia (display → overline) com pesos e line-height\n` +
    `4. Revisar spacing base-4 generoso (até 80px)\n` +
    `5. Revisar radius (sm 12px → full) e sombras soft/medium\n` +
    `6. Gerar recomendações de UI para cada tela citada, sempre com copy humanizada\n\n` +
    `## Entregáveis Necessários\n` +
    `- Moodboard textual + referência cromática\n` +
    `- Guidelines de tipografia e spacing aplicados\n` +
    `- Sugestões de componentes nativos com tokens aplicados\n` +
    `- Checklist de acessibilidade + microinterações calorosas\n\n` +
    `## Formato de Resposta\n` +
    `1. RESUMO VISUAL (bullet curto)\n` +
    `2. TOKENS VALIDADOS (cores, tipografia, spacing, radius, shadow)\n` +
    `3. TELAS (home, chat, feed anônimo, onboarding) — layout + copy + microinterações\n` +
    `4. CHECKLIST FINAL (acessibilidade, performance, emoção)\n\n` +
    `## Guardrails\n` +
    `- Referenciar sempre tokens oficiais\n` +
    `- Citar ajustes de tom/linguagem em Português acolhedor\n` +
    `- Propor variações leves (alt text, animações, haptics suaves)\n` +
    `- Sugerir testes: contraste, leitura, latência de animações\n`;

  const promptPath = join(promptDir, 'agent-design-system-v1.md');
  writeFileSync(promptPath, `${promptContent}\n`, 'utf-8');

  const reportContent = `# 📦 Design System v1 — Tokens Atuais\n\n` +
    `## 🎨 Paleta Central\n` +
    `- Primary: ${nossaMaternidadeDesignTokens.palette.primary}\n` +
    `- Accent: ${nossaMaternidadeDesignTokens.palette.accent}\n` +
    `- Background: ${nossaMaternidadeDesignTokens.palette.background}\n` +
    `- Surface: ${nossaMaternidadeDesignTokens.palette.surface}\n` +
    `- Text: ${nossaMaternidadeDesignTokens.palette.text}\n\n` +
    `### Neutros 100–900\n${buildPaletteTable()}\n\n` +
    `### Feedback\n` +
    `- Success: ${nossaMaternidadeDesignTokens.palette.feedback.success} (contraste ${nossaMaternidadeDesignTokens.palette.feedback.successContrast})\n` +
    `- Warning: ${nossaMaternidadeDesignTokens.palette.feedback.warning} (contraste ${nossaMaternidadeDesignTokens.palette.feedback.warningContrast})\n` +
    `- Danger: ${nossaMaternidadeDesignTokens.palette.feedback.danger} (contraste ${nossaMaternidadeDesignTokens.palette.feedback.dangerContrast})\n` +
    `- Info: ${nossaMaternidadeDesignTokens.palette.feedback.info} (contraste ${nossaMaternidadeDesignTokens.palette.feedback.infoContrast})\n\n` +
    `## 🔤 Tipografia Mobile-First\n${buildTypographySummary()}\n\n` +
    `## 📏 Espaçamento (base 4)\n${buildSpacingList()}\n\n` +
    `## 🟢 Bordas\n${buildRadiusList()}\n\n` +
    `## 🌫 Sombras\n` +
    `- Soft: ${nossaMaternidadeDesignTokens.shadow.soft.boxShadow}\n` +
    `- Medium: ${nossaMaternidadeDesignTokens.shadow.medium.boxShadow}\n\n` +
    `⚠️ Sempre validar contraste e tempo de animação ≤ 200ms (ease-out suave).`;

  const reportPath = join(reportsDir, 'agent-design-system-v1-report.md');
  writeFileSync(reportPath, `${reportContent}\n`, 'utf-8');

  console.log('✅ Prompt salvo em .cursor/agents/prompts/agent-design-system-v1.md');
  console.log('✅ Relatório salvo em .cursor/agents/reports/agent-design-system-v1-report.md');
  console.log('👩‍🎨 Abra o Composer e cole o prompt. Lembre-se: modelo precisa estar em modo --ultrathinking.');
}

main();


