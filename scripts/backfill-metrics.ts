#!/usr/bin/env tsx

/**
 * Backfill de Métricas - NAT-IA
 *
 * Script para migração histórica de dados para o novo sistema de métricas
 *
 * USO:
 * - npm run metrics:backfill
 * - node --loader tsx scripts/backfill-metrics.ts [--days=30] [--dry-run]
 *
 * ATENÇÃO:
 * - Execute primeiro com --dry-run para validar
 * - Pode demorar para processar muitos dados
 * - Não gera métricas em tempo real (apenas backfill)
 */

import { supabase } from '../src/services/supabase';

interface BackfillOptions {
  days: number;
  dryRun: boolean;
  verbose: boolean;
}

interface BackfillStats {
  mensagens_processadas: number;
  sessoes_criadas: number;
  temas_extraidos: number;
  sentimentos_calculados: number;
  tokens_estimados: number;
  erros: number;
}

/**
 * Parse argumentos CLI
 */
function parseArgs(): BackfillOptions {
  const args = process.argv.slice(2);

  let days = 30;
  let dryRun = false;
  let verbose = false;

  args.forEach((arg) => {
    if (arg.startsWith('--days=')) {
      days = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    }
  });

  return { days, dryRun, verbose };
}

/**
 * Busca mensagens históricas
 */
async function fetchHistoricalMessages(days: number) {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - days);

  console.log(`📚 Buscando mensagens dos últimos ${days} dias...`);

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .gte('created_at', dataInicio.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  console.log(`   ✅ ${data?.length || 0} mensagens encontradas\n`);

  return data || [];
}

/**
 * Extrai tema da mensagem (classificação simples)
 */
function extrairTema(message: string): {
  tema: string;
  categoria: 'saude' | 'emocional' | 'pratico' | 'informacao' | 'emergencia';
} {
  const msg = message.toLowerCase();

  // Palavras-chave por categoria
  const keywords = {
    saude: [
      'dor',
      'sangue',
      'médico',
      'consulta',
      'sintoma',
      'febre',
      'enjoo',
      'cansaço',
      'vitamina',
    ],
    emocional: [
      'ansiedade',
      'medo',
      'triste',
      'preocup',
      'sozinha',
      'apoio',
      'ajuda',
      'depressão',
      'choro',
    ],
    pratico: [
      'enxoval',
      'bolsa',
      'carrinho',
      'berço',
      'amamentação',
      'fralda',
      'organizar',
      'lista',
    ],
    informacao: [
      'semana',
      'trimestre',
      'bebê',
      'desenvolvimento',
      'parto',
      'cesárea',
      'normal',
      'hospital',
    ],
    emergencia: [
      'urgente',
      'emergência',
      'socorro',
      'sangrando',
      'muito sangue',
      'desmaio',
      'convulsão',
    ],
  };

  // Detectar categoria
  for (const [categoria, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (msg.includes(word)) {
        return {
          tema: word,
          categoria: categoria as any,
        };
      }
    }
  }

  return {
    tema: 'geral',
    categoria: 'informacao',
  };
}

/**
 * Calcula sentimento simplificado
 */
function calcularSentimento(message: string, response: string): number {
  const text = (message + ' ' + response).toLowerCase();

  const positivos = [
    'feliz',
    'alegre',
    'bem',
    'ótimo',
    'excelente',
    'obrigad',
    'ajudou',
    'melhor',
    'gostei',
  ];
  const negativos = [
    'triste',
    'mal',
    'dor',
    'ruim',
    'difícil',
    'problema',
    'preocup',
    'medo',
    'sozinha',
  ];

  let score = 0;

  positivos.forEach((word) => {
    if (text.includes(word)) score += 0.2;
  });

  negativos.forEach((word) => {
    if (text.includes(word)) score -= 0.2;
  });

  return Math.max(-1, Math.min(1, score));
}

/**
 * Estima tokens (aproximação)
 */
function estimarTokens(text: string): { input: number; output: number } {
  // Aproximação: 1 token ≈ 4 caracteres
  const tokens = Math.ceil(text.length / 4);

  return {
    input: Math.ceil(tokens * 0.4), // 40% input
    output: Math.ceil(tokens * 0.6), // 60% output
  };
}

/**
 * Processa backfill
 */
async function processBackfill(
  messages: any[],
  options: BackfillOptions
): Promise<BackfillStats> {
  const stats: BackfillStats = {
    mensagens_processadas: 0,
    sessoes_criadas: 0,
    temas_extraidos: 0,
    sentimentos_calculados: 0,
    tokens_estimados: 0,
    erros: 0,
  };

  const sessoes = new Set<string>();

  console.log('🔄 Processando backfill...\n');

  for (const msg of messages) {
    try {
      const session_id = msg.user_id; // Simplificação: user_id como session_id

      // Registrar sessão única
      if (!sessoes.has(session_id)) {
        sessoes.add(session_id);
        stats.sessoes_criadas++;
      }

      // Extrair tema
      const { tema, categoria } = extrairTema(msg.message);

      if (!options.dryRun) {
        await supabase.from('nathia_temas').insert({
          session_id,
          tema,
          categoria,
          timestamp: msg.created_at,
        });
      }

      stats.temas_extraidos++;

      // Calcular sentimento
      const sentimento_score = calcularSentimento(msg.message, msg.response);

      if (!options.dryRun) {
        await supabase.from('nathia_sentimentos').insert({
          session_id,
          sentimento_score,
          timestamp: msg.created_at,
        });
      }

      stats.sentimentos_calculados++;

      // Estimar tokens e custo
      const tokens = estimarTokens(msg.message + msg.response);
      const cost_usd = (tokens.input / 1000) * 0.0001 + (tokens.output / 1000) * 0.0003;

      if (!options.dryRun) {
        await supabase.from('nathia_token_usage').insert({
          model: 'gemini-2.0-flash',
          input_tokens: tokens.input,
          output_tokens: tokens.output,
          cost_usd,
          session_id,
          timestamp: msg.created_at,
        });
      }

      stats.tokens_estimados += tokens.input + tokens.output;
      stats.mensagens_processadas++;

      // Logging verbose
      if (options.verbose && stats.mensagens_processadas % 100 === 0) {
        console.log(`   Processadas: ${stats.mensagens_processadas}/${messages.length}`);
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar mensagem ${msg.id}:`, error);
      stats.erros++;
    }
  }

  return stats;
}

/**
 * Gera métricas agregadas históricas
 */
async function gerarMetricasAgregadas(days: number, options: BackfillOptions) {
  console.log('\n📊 Gerando métricas agregadas...\n');

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - days);

  // Agrupar por dia
  const hoje = new Date();
  const diasParaProcessar: string[] = [];

  for (let i = 0; i < days; i++) {
    const dia = new Date(dataInicio);
    dia.setDate(dia.getDate() + i);
    diasParaProcessar.push(dia.toISOString().split('T')[0]);
  }

  for (const dia of diasParaProcessar) {
    try {
      if (options.verbose) {
        console.log(`   Processando ${dia}...`);
      }

      // Buscar métricas do dia
      const diaInicio = new Date(dia + 'T00:00:00Z');
      const diaFim = new Date(dia + 'T23:59:59Z');

      // Temas do dia
      const { data: temas } = await supabase
        .from('nathia_temas')
        .select('categoria')
        .gte('timestamp', diaInicio.toISOString())
        .lte('timestamp', diaFim.toISOString());

      // Sentimentos do dia
      const { data: sentimentos } = await supabase
        .from('nathia_sentimentos')
        .select('sentimento_score')
        .gte('timestamp', diaInicio.toISOString())
        .lte('timestamp', diaFim.toISOString());

      // Tokens do dia
      const { data: tokens } = await supabase
        .from('nathia_token_usage')
        .select('cost_usd')
        .gte('timestamp', diaInicio.toISOString())
        .lte('timestamp', diaFim.toISOString());

      // Calcular métricas agregadas
      const usage_metrics = {
        mensagens_diarias: temas?.length || 0,
        sentimento_medio:
          sentimentos?.reduce((acc, s) => acc + s.sentimento_score, 0) /
            (sentimentos?.length || 1) || 0,
      };

      const cost_metrics = {
        custo_diario_usd: tokens?.reduce((acc, t) => acc + t.cost_usd, 0) || 0,
      };

      // Salvar métricas agregadas
      if (!options.dryRun) {
        await supabase.from('nathia_metrics').upsert(
          {
            date: dia,
            usage_metrics,
            cost_metrics,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'date',
          }
        );
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar dia ${dia}:`, error);
    }
  }

  console.log(`   ✅ ${diasParaProcessar.length} dias processados\n`);
}

/**
 * Exibe relatório final
 */
function exibirRelatorio(stats: BackfillStats, options: BackfillOptions) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   RELATÓRIO DE BACKFILL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nModo:                  ${options.dryRun ? '🧪 DRY RUN (sem salvar)' : '✅ PRODUÇÃO'}`);
  console.log(`Período:               ${options.days} dias`);
  console.log(`\nMensagens Processadas: ${stats.mensagens_processadas}`);
  console.log(`Sessões Criadas:       ${stats.sessoes_criadas}`);
  console.log(`Temas Extraídos:       ${stats.temas_extraidos}`);
  console.log(`Sentimentos Calc.:     ${stats.sentimentos_calculados}`);
  console.log(`Tokens Estimados:      ${stats.tokens_estimados.toLocaleString()}`);
  console.log(`Erros:                 ${stats.erros}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (options.dryRun) {
    console.log('⚠️  DRY RUN: Nenhum dado foi salvo no banco.');
    console.log('   Execute sem --dry-run para aplicar as mudanças.\n');
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║     BACKFILL DE MÉTRICAS NAT-IA                    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const options = parseArgs();

  console.log(`Configuração:`);
  console.log(`   Dias:     ${options.days}`);
  console.log(`   Dry Run:  ${options.dryRun ? 'Sim' : 'Não'}`);
  console.log(`   Verbose:  ${options.verbose ? 'Sim' : 'Não'}\n`);

  try {
    // 1. Buscar mensagens históricas
    const messages = await fetchHistoricalMessages(options.days);

    if (messages.length === 0) {
      console.log('⚠️  Nenhuma mensagem encontrada para processar.');
      return;
    }

    // 2. Processar backfill
    const stats = await processBackfill(messages, options);

    // 3. Gerar métricas agregadas
    await gerarMetricasAgregadas(options.days, options);

    // 4. Exibir relatório
    exibirRelatorio(stats, options);

    if (stats.erros === 0) {
      console.log('✅ Backfill concluído com sucesso!\n');
    } else {
      console.log(`⚠️  Backfill concluído com ${stats.erros} erros.\n`);
    }
  } catch (error) {
    console.error('\n❌ Erro durante backfill:', error);
    process.exit(1);
  }
}

// Executar
main();
