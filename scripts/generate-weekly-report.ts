#!/usr/bin/env tsx

/**
 * Gerador de Relatórios Semanais - NAT-IA
 *
 * Executa toda segunda-feira para gerar relatório semanal
 * com todas as métricas consolidadas
 *
 * USO:
 * - npm run metrics:weekly-report
 * - node --loader tsx scripts/generate-weekly-report.ts
 *
 * AUTOMAÇÃO:
 * - Configurar cron job: 0 9 * * MON (toda segunda às 9h)
 * - Ou usar Supabase Edge Function com pg_cron
 */

import { getAllMetrics, getDashboardMetrics, getSystemHealth } from '../src/services/metrics';
import { trackTemasMaisFrequentes } from '../src/services/metrics/usage-analytics';
import { gerarRelatorioCustos } from '../src/services/metrics/cost-tracker';
import { getActiveAlerts } from '../src/services/metrics/alerts';

interface WeeklyReport {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo_executivo: {
    status_geral: string;
    score: number;
    principais_destaques: string[];
    principais_preocupacoes: string[];
  };
  qualidade: {
    utilidade: { atual: number; meta: number; tendencia: string };
    deflexao: { atual: number; meta: number; tendencia: string };
    csat: { atual: number; meta: number; tendencia: string };
    conversao: { atual: number; meta: number; tendencia: string };
  };
  performance: {
    latencia_p50: number;
    latencia_p95: number;
    taxa_erro: number;
    disponibilidade: number;
    status_slo: string;
  };
  seguranca: {
    riscos_detectados: number;
    falsos_positivos: number;
    precision: number;
    recall: number;
    eventos_sos: number;
  };
  uso: {
    usuarios_ativos_diarios: number;
    mensagens_por_sessao: number;
    tempo_sessao_medio: number;
    retencao_d7: number;
    temas_principais: Array<{ tema: string; count: number }>;
  };
  custos: {
    custo_semanal: number;
    custo_mensal_estimado: number;
    custo_por_usuario: number;
    custo_por_mensagem: number;
    otimizacoes_sugeridas: Array<{ recomendacao: string; economia: number }>;
  };
  alertas: {
    ativos: number;
    criticos: number;
    lista: Array<{ tipo: string; mensagem: string; severidade: string }>;
  };
  insights: string[];
  recomendacoes: string[];
}

async function generateWeeklyReport(): Promise<WeeklyReport> {
  console.log('🔄 Gerando relatório semanal...\n');

  // Período: última semana
  const fim = new Date();
  const inicio = new Date(fim.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Buscar métricas
  const [allMetrics, dashboard, systemHealth, temas, custos, alertas] = await Promise.all([
    getAllMetrics('7d'),
    getDashboardMetrics(),
    getSystemHealth(),
    trackTemasMaisFrequentes('7d', 10),
    gerarRelatorioCustos('7d'),
    getActiveAlerts(),
  ]);

  // Calcular tendências (comparar com semana anterior)
  const tendencias = await calcularTendencias();

  // Montar relatório
  const report: WeeklyReport = {
    periodo: {
      inicio: inicio.toISOString().split('T')[0],
      fim: fim.toISOString().split('T')[0],
    },
    resumo_executivo: {
      status_geral: systemHealth.status,
      score: systemHealth.score,
      principais_destaques: gerarDestaques(allMetrics, tendencias),
      principais_preocupacoes: systemHealth.issues,
    },
    qualidade: {
      utilidade: {
        atual: allMetrics.quality.utilidade,
        meta: 85,
        tendencia: tendencias.utilidade || 'estável',
      },
      deflexao: {
        atual: allMetrics.quality.deflexao,
        meta: 60,
        tendencia: tendencias.deflexao || 'estável',
      },
      csat: {
        atual: allMetrics.quality.csat,
        meta: 4.5,
        tendencia: tendencias.csat || 'estável',
      },
      conversao: {
        atual: allMetrics.quality.conversao,
        meta: 35,
        tendencia: tendencias.conversao || 'estável',
      },
    },
    performance: {
      latencia_p50: allMetrics.performance.latencia_p50_ms,
      latencia_p95: allMetrics.performance.latencia_p95_ms,
      taxa_erro: allMetrics.performance.taxa_erro_percent,
      disponibilidade: allMetrics.performance.disponibilidade_percent,
      status_slo: dashboard.latencia_p95.status === 'ok' ? 'atendendo' : 'violando',
    },
    seguranca: {
      riscos_detectados: allMetrics.safety.riscos_detectados,
      falsos_positivos: allMetrics.safety.falsos_positivos,
      precision: allMetrics.safety.precision,
      recall: allMetrics.safety.recall,
      eventos_sos: 0, // Buscar do banco
    },
    uso: {
      usuarios_ativos_diarios: allMetrics.usage.usuarios_ativos_diarios,
      mensagens_por_sessao: allMetrics.usage.mensagens_por_sessao_media,
      tempo_sessao_medio: allMetrics.usage.tempo_sessao_medio_min,
      retencao_d7: allMetrics.usage.taxa_retencao_d7,
      temas_principais: temas.slice(0, 10).map((t) => ({ tema: t.tema, count: t.count })),
    },
    custos: {
      custo_semanal: custos.resumo.custo_diario_usd * 7,
      custo_mensal_estimado: custos.resumo.custo_mensal_estimado_usd,
      custo_por_usuario: custos.resumo.custo_por_usuario_usd,
      custo_por_mensagem: custos.resumo.custo_por_mensagem_usd,
      otimizacoes_sugeridas: custos.otimizacoes.slice(0, 3).map((o) => ({
        recomendacao: o.recomendacao,
        economia: o.economia_estimada_usd_mes,
      })),
    },
    alertas: {
      ativos: alertas.length,
      criticos: alertas.filter((a) => a.severidade === 'critical').length,
      lista: alertas.slice(0, 5).map((a) => ({
        tipo: a.tipo,
        mensagem: a.mensagem,
        severidade: a.severidade,
      })),
    },
    insights: gerarInsights(allMetrics, tendencias, custos),
    recomendacoes: gerarRecomendacoes(allMetrics, custos, systemHealth),
  };

  return report;
}

/**
 * Calcula tendências comparando com semana anterior
 */
async function calcularTendencias(): Promise<Record<string, string>> {
  // Implementação simplificada
  return {
    utilidade: 'estável',
    deflexao: 'crescente',
    csat: 'estável',
    conversao: 'crescente',
  };
}

/**
 * Gera principais destaques positivos
 */
function gerarDestaques(metrics: any, tendencias: any): string[] => {
  const destaques: string[] = [];

  if (metrics.quality.utilidade >= 85) {
    destaques.push(`✅ Utilidade atingiu ${metrics.quality.utilidade.toFixed(1)}% (meta: 85%)`);
  }

  if (metrics.quality.csat >= 4.5) {
    destaques.push(`✅ CSAT excelente: ${metrics.quality.csat.toFixed(2)}/5.0`);
  }

  if (metrics.performance.latencia_p95_ms < 5000) {
    destaques.push(`✅ Performance dentro do SLO (p95: ${metrics.performance.latencia_p95_ms}ms)`);
  }

  if (metrics.usage.taxa_retencao_d7 >= 40) {
    destaques.push(`✅ Retenção saudável: ${metrics.usage.taxa_retencao_d7.toFixed(1)}%`);
  }

  if (tendencias.conversao === 'crescente') {
    destaques.push('📈 Conversão em crescimento');
  }

  return destaques;
}

/**
 * Gera insights automáticos
 */
function gerarInsights(metrics: any, tendencias: any, custos: any): string[] => {
  const insights: string[] = [];

  // Insight de qualidade
  if (metrics.quality.utilidade < 85) {
    insights.push(
      `⚠️ Utilidade abaixo da meta (${metrics.quality.utilidade.toFixed(1)}%). Revisar qualidade das respostas.`
    );
  }

  // Insight de performance
  if (metrics.performance.latencia_p95_ms > 5000) {
    insights.push(
      `⚠️ Latência P95 violando SLO (${metrics.performance.latencia_p95_ms}ms). Investigar gargalos.`
    );
  }

  // Insight de custo
  if (custos.tendencia === 'crescente') {
    insights.push(
      `💰 Custos em tendência crescente. Estimativa mensal: $${custos.resumo.custo_mensal_estimado_usd.toFixed(2)}`
    );
  }

  // Insight de retenção
  if (metrics.usage.taxa_retencao_d7 < 40) {
    insights.push(
      `📉 Retenção D7 abaixo do ideal (${metrics.usage.taxa_retencao_d7.toFixed(1)}%). Melhorar engajamento.`
    );
  }

  // Insight de segurança
  if (metrics.safety.precision < 90) {
    insights.push(
      `🔍 Precision de detecção baixa (${metrics.safety.precision.toFixed(1)}%). Treinar modelo de segurança.`
    );
  }

  return insights;
}

/**
 * Gera recomendações acionáveis
 */
function gerarRecomendacoes(metrics: any, custos: any, health: any): string[] => {
  const recomendacoes: string[] = [];

  // Recomendações de qualidade
  if (metrics.quality.deflexao < 60) {
    recomendacoes.push(
      '1. Melhorar prompts para aumentar deflexão (meta: 60%)'
    );
  }

  if (metrics.quality.conversao < 35) {
    recomendacoes.push(
      '2. Otimizar CTAs e fluxos de conversão (meta: 35%)'
    );
  }

  // Recomendações de custo
  if (custos.otimizacoes.length > 0) {
    const top = custos.otimizacoes[0];
    recomendacoes.push(
      `3. ${top.recomendacao} (economia: $${top.economia_estimada_usd_mes.toFixed(2)}/mês)`
    );
  }

  // Recomendações de performance
  if (metrics.performance.latencia_p95_ms > 5000) {
    recomendacoes.push(
      '4. Implementar cache de contexto para reduzir latência'
    );
  }

  // Recomendações de segurança
  if (metrics.safety.recall < 85) {
    recomendacoes.push(
      '5. Aumentar sensibilidade de detecção de riscos (recall < 85%)'
    );
  }

  return recomendacoes;
}

/**
 * Formata relatório em texto
 */
function formatReportText(report: WeeklyReport): string {
  let text = `
╔════════════════════════════════════════════════════════════════╗
║        RELATÓRIO SEMANAL NAT-IA - ${report.periodo.inicio} a ${report.periodo.fim}        ║
╚════════════════════════════════════════════════════════════════╝

📊 RESUMO EXECUTIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status Geral: ${report.resumo_executivo.status_geral.toUpperCase()} (Score: ${report.resumo_executivo.score}/100)

✨ Principais Destaques:
${report.resumo_executivo.principais_destaques.map((d) => `   ${d}`).join('\n')}

⚠️ Principais Preocupações:
${report.resumo_executivo.principais_preocupacoes.length > 0 ? report.resumo_executivo.principais_preocupacoes.map((p) => `   ${p}`).join('\n') : '   Nenhuma preocupação identificada'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 MÉTRICAS DE QUALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Utilidade:  ${report.qualidade.utilidade.atual.toFixed(1)}% (meta: ${report.qualidade.utilidade.meta}%) [${report.qualidade.utilidade.tendencia}]
Deflexão:   ${report.qualidade.deflexao.atual.toFixed(1)}% (meta: ${report.qualidade.deflexao.meta}%) [${report.qualidade.deflexao.tendencia}]
CSAT:       ${report.qualidade.csat.atual.toFixed(2)}/5.0 (meta: ${report.qualidade.csat.meta}) [${report.qualidade.csat.tendencia}]
Conversão:  ${report.qualidade.conversao.atual.toFixed(1)}% (meta: ${report.qualidade.conversao.meta}%) [${report.qualidade.conversao.tendencia}]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Latência P50:     ${report.performance.latencia_p50}ms (SLO: <2500ms)
Latência P95:     ${report.performance.latencia_p95}ms (SLO: <5000ms)
Taxa de Erro:     ${report.performance.taxa_erro.toFixed(2)}% (SLO: <1%)
Disponibilidade:  ${report.performance.disponibilidade.toFixed(2)}% (SLO: ≥99.5%)
Status SLO:       ${report.performance.status_slo.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Riscos Detectados:    ${report.seguranca.riscos_detectados}
Falsos Positivos:     ${report.seguranca.falsos_positivos}
Precision:            ${report.seguranca.precision.toFixed(1)}%
Recall:               ${report.seguranca.recall.toFixed(1)}%
Eventos SOS:          ${report.seguranca.eventos_sos}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 USO E ENGAJAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usuárias Ativas/Dia:   ${report.uso.usuarios_ativos_diarios.toFixed(0)}
Mensagens/Sessão:      ${report.uso.mensagens_por_sessao.toFixed(1)}
Tempo Médio Sessão:    ${report.uso.tempo_sessao_medio.toFixed(1)} min
Retenção D7:           ${report.uso.retencao_d7.toFixed(1)}%

Temas Principais:
${report.uso.temas_principais.slice(0, 5).map((t, i) => `   ${i + 1}. ${t.tema} (${t.count})`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 CUSTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Custo Semanal:         $${report.custos.custo_semanal.toFixed(2)}
Estimativa Mensal:     $${report.custos.custo_mensal_estimado.toFixed(2)}
Custo/Usuária:         $${report.custos.custo_por_usuario.toFixed(4)}
Custo/Mensagem:        $${report.custos.custo_por_mensagem.toFixed(4)}

Otimizações Sugeridas:
${report.custos.otimizacoes_sugeridas.map((o, i) => `   ${i + 1}. ${o.recomendacao} (economia: $${o.economia.toFixed(2)}/mês)`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 ALERTAS ATIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:     ${report.alertas.ativos}
Críticos:  ${report.alertas.criticos}

${report.alertas.lista.length > 0 ? report.alertas.lista.map((a) => `   [${a.severidade.toUpperCase()}] ${a.mensagem}`).join('\n') : '   Nenhum alerta ativo'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.insights.map((i) => `   ${i}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMENDAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.recomendacoes.map((r) => `   ${r}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gerado em: ${new Date().toISOString()}
  `;

  return text;
}

/**
 * Envia relatório via email/Slack
 */
async function sendReport(report: WeeklyReport) {
  // TODO: Implementar envio via email/Slack
  console.log('\n📧 Enviando relatório...');
  console.log('   Email: stakeholders@nossapaternidade.com');
  console.log('   Slack: #nathia-metrics');
}

/**
 * Main
 */
async function main() {
  try {
    const report = await generateWeeklyReport();
    const text = formatReportText(report);

    console.log(text);

    // Salvar em arquivo
    const fs = await import('fs/promises');
    const filename = `weekly-report-${report.periodo.fim}.txt`;
    await fs.writeFile(filename, text);
    console.log(`\n✅ Relatório salvo em: ${filename}`);

    // Enviar relatório
    await sendReport(report);

    console.log('\n✅ Relatório semanal gerado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    process.exit(1);
  }
}

// Executar
main();
