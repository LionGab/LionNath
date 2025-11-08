#!/usr/bin/env node

/**
 * Script de Teste - NAT-IA Edge Functions
 *
 * Testa as Edge Functions localmente sem precisar de API keys reais
 * Usa mocks para simular respostas da IA
 */

const readline = require('readline');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Mock responses para simular as Edge Functions
const mockResponses = {
  'nathia-chat': {
    reply:
      'Olá! Eu sou a NAT-IA, sua assistente virtual empática. 💙\n\nEntendo que você está com enjoos. Isso é muito comum no primeiro trimestre e, apesar de desconfortável, geralmente é um sinal de que os hormônios estão fazendo seu trabalho.\n\nAlgumas dicas que podem ajudar:\n• Coma pequenas porções ao longo do dia\n• Mantenha biscoitos ao lado da cama\n• Evite alimentos gordurosos\n• Experimente gengibre (chá ou bala)\n\nQuer que eu te recomende algum conteúdo sobre como lidar com enjoos?',
    actions: ['ler_conteudo', 'agendar_consulta'],
    safety: {
      level: 'safe',
      reasons: [],
      warning: null,
    },
    labels: {
      mood: 'preocupada',
      topics: ['enjoo', 'alimentacao', 'primeiro_trimestre'],
    },
    recs: {
      content: ['Enjoos na Gravidez: Como Aliviar', 'Alimentação no 1º Trimestre'],
      circles: ['Gestantes 1º Trimestre', 'Alimentação na Gravidez'],
      habit: 'Alimentação fracionada (5-6 refeições/dia)',
    },
    usage: {
      promptTokens: 450,
      completionTokens: 180,
      totalTokens: 630,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0-mock',
      model: 'mock-gemini-2.0-flash',
    },
  },

  'nathia-curadoria': {
    titulo: 'Alimentação Saudável na Gravidez',
    resumo:
      'Durante a gravidez, uma alimentação equilibrada é essencial para o desenvolvimento do bebê e para a saúde da mãe. Priorize alimentos naturais, ricos em vitaminas e minerais. Consuma bastante água, frutas, vegetais e proteínas magras. Evite alimentos crus, processados e com excesso de açúcar.',
    pontos_principais: [
      '🥗 Coma pequenas porções a cada 2-3 horas',
      '💧 Beba pelo menos 2 litros de água por dia',
      '🍎 Inclua 5 porções de frutas e vegetais',
      '🥩 Consuma proteínas magras (frango, peixe, ovos)',
      '🚫 Evite alimentos crus (sushi, queijos não pasteurizados)',
      '☕ Limite cafeína a 200mg/dia (1-2 xícaras de café)',
    ],
    relevancia:
      'A alimentação adequada previne anemia, diabetes gestacional e garante nutrientes essenciais para o desenvolvimento do bebê, como ácido fólico, cálcio e ferro.',
    risco: false,
    cached: false,
    metadata: {
      timestamp: new Date().toISOString(),
      tipo: 'resumo',
      model: 'mock-gemini-2.0-flash',
    },
  },

  'nathia-moderacao': {
    labels: ['ok'],
    severity: 'none',
    sugestao: null,
    rationale:
      'Mensagem positiva e acolhedora. Não contém julgamento, toxicidade ou conteúdo inapropriado. Adequada para a comunidade.',
    auto_approve: true,
    metadata: {
      timestamp: new Date().toISOString(),
      model: 'mock-gemini-2.0-flash',
    },
  },

  'nathia-onboarding': {
    welcomeMessage: 'Bem-vinda! 🎉 Com base nas suas respostas, preparei recomendações especiais para você.',
    starterPack: {
      circles: [
        {
          id: 'circle-1',
          name: 'Gestantes 1º Trimestre',
          reason: 'Você está no início da gravidez e pode trocar experiências com outras mães neste momento',
        },
        {
          id: 'circle-2',
          name: 'Controle de Ansiedade',
          reason: 'Você mencionou ansiedade como preocupação principal',
        },
      ],
      habits: [
        {
          id: 'habit-1',
          name: 'Respiração Consciente (5min/dia)',
          reason: 'Ajuda a controlar a ansiedade e promove relaxamento',
        },
        {
          id: 'habit-2',
          name: 'Alimentação Fracionada',
          reason: 'Reduz enjoos e mantém energia ao longo do dia',
        },
      ],
      content: [
        {
          id: 'content-1',
          title: 'Enjoos na Gravidez: Como Aliviar',
          reason: 'Você mencionou enjoos como desafio',
        },
        {
          id: 'content-2',
          title: 'Ansiedade na Gestação: É Normal?',
          reason: 'Conteúdo sobre como lidar com ansiedade',
        },
        {
          id: 'content-3',
          title: 'Primeiro Trimestre: O Que Esperar',
          reason: 'Guia completo sobre as primeiras semanas',
        },
      ],
    },
  },

  'nathia-recs': {
    conteudo: [
      {
        titulo: 'Sono do Bebê aos 3 Meses',
        tipo: 'artigo',
        relevancia: 'Baseado em suas mensagens sobre dificuldades com o sono do bebê',
      },
      {
        titulo: 'Rotina Flexível: Encontrando o Equilíbrio',
        tipo: 'video',
        relevancia: 'Para ajudar a organizar o dia sem pressão',
      },
    ],
    circulos: [
      {
        nome: 'Mães de Bebês 0-6 Meses',
        razao: 'Troca de experiências sobre rotina e sono',
      },
      {
        nome: 'Autocuidado para Mães',
        razao: 'Espaço para cuidar de você também',
      },
    ],
    habito: {
      titulo: 'Rotina de Sono Consistente',
      descricao: 'Estabelecer horários regulares para dormir e acordar, mesmo nos fins de semana',
      frequencia: 'diaria',
    },
    justificativa:
      'Você mencionou dificuldades com o sono do bebê e cansaço. Essas recomendações podem ajudar a criar uma rotina mais previsível.',
  },
};

// Simular delay de rede
const simulateNetworkDelay = () => {
  return new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));
};

// Função para testar cada Edge Function
async function testFunction(functionName, payload) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}📡 Testando: ${functionName}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  console.log(`${colors.yellow}📤 Request:${colors.reset}`);
  console.log(JSON.stringify(payload, null, 2));

  console.log(`\n${colors.yellow}⏳ Processando...${colors.reset}`);

  await simulateNetworkDelay();

  const response = mockResponses[functionName];

  console.log(`\n${colors.green}✅ Response:${colors.reset}`);
  console.log(JSON.stringify(response, null, 2));

  console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

// Menu interativo
async function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.clear();
  console.log(`${colors.bright}${colors.magenta}`);
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🤖 NAT-IA Edge Functions - Ambiente de Teste      ║
║                                                           ║
║     Teste as funções localmente sem API keys reais       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  while (true) {
    console.log(`\n${colors.bright}${colors.cyan}📋 MENU DE TESTES:${colors.reset}\n`);
    console.log(`${colors.green}1${colors.reset} - Testar ${colors.bright}nathia-chat${colors.reset} (Chat Principal)`);
    console.log(
      `${colors.green}2${colors.reset} - Testar ${colors.bright}nathia-curadoria${colors.reset} (Curadoria de Conteúdo)`
    );
    console.log(
      `${colors.green}3${colors.reset} - Testar ${colors.bright}nathia-moderacao${colors.reset} (Moderação Assistida)`
    );
    console.log(
      `${colors.green}4${colors.reset} - Testar ${colors.bright}nathia-onboarding${colors.reset} (Onboarding Inteligente)`
    );
    console.log(`${colors.green}5${colors.reset} - Testar ${colors.bright}nathia-recs${colors.reset} (Recomendações)`);
    console.log(`${colors.green}6${colors.reset} - Testar ${colors.bright}TODAS${colors.reset} as funções`);
    console.log(`${colors.red}0${colors.reset} - Sair\n`);

    const choice = await question(`${colors.yellow}➜${colors.reset} Escolha uma opção: `);

    switch (choice.trim()) {
      case '1':
        await testFunction('nathia-chat', {
          user_id: 'test-user-123',
          message: 'Estou com muito enjoo, é normal?',
          context: {
            stage: 'gestante',
            pregnancy_week: 8,
            mood: 'preocupada',
          },
        });
        break;

      case '2':
        await testFunction('nathia-curadoria', {
          user_id: 'test-user-123',
          content_id: 'content-alimentacao-gravidez',
          texto: 'Artigo longo sobre alimentação na gravidez...',
          tipo: 'resumo',
        });
        break;

      case '3':
        await testFunction('nathia-moderacao', {
          message_id: 'msg-123',
          texto: 'Obrigada pelo apoio! Vocês são incríveis 💙',
          author_context: {
            user_id: 'test-user-123',
            previous_violations: 0,
          },
        });
        break;

      case '4':
        await testFunction('nathia-onboarding', {
          userId: 'test-user-123',
          answers: {
            stage: 'gestante',
            pregnancyWeek: 12,
            concerns: ['anxiety', 'breastfeeding'],
            expectations: ['info', 'support', 'community'],
          },
        });
        break;

      case '5':
        await testFunction('nathia-recs', {
          user_id: 'test-user-123',
          context: {
            stage: 'mae',
            baby_age_months: 3,
            recent_topics: ['sono', 'rotina', 'cansaco'],
          },
        });
        break;

      case '6':
        console.log(`\n${colors.bright}${colors.magenta}🚀 Testando TODAS as funções...${colors.reset}\n`);

        await testFunction('nathia-chat', {
          user_id: 'test-user-123',
          message: 'Estou com muito enjoo',
        });

        await testFunction('nathia-curadoria', {
          user_id: 'test-user-123',
          content_id: 'content-123',
          texto: 'Texto...',
          tipo: 'resumo',
        });

        await testFunction('nathia-moderacao', {
          message_id: 'msg-123',
          texto: 'Obrigada!',
        });

        await testFunction('nathia-onboarding', {
          userId: 'test-user-123',
          answers: { stage: 'gestante' },
        });

        await testFunction('nathia-recs', {
          user_id: 'test-user-123',
          context: { stage: 'mae' },
        });

        console.log(`\n${colors.bright}${colors.green}✅ Todos os testes concluídos!${colors.reset}\n`);
        break;

      case '0':
        console.log(`\n${colors.green}👋 Até logo!${colors.reset}\n`);
        rl.close();
        process.exit(0);

      default:
        console.log(`\n${colors.red}❌ Opção inválida. Tente novamente.${colors.reset}\n`);
    }
  }
}

// Verificar se tem argumentos CLI
if (process.argv.length > 2) {
  const functionName = process.argv[2];
  const payload = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  if (mockResponses[functionName]) {
    testFunction(functionName, payload).then(() => process.exit(0));
  } else {
    console.log(`${colors.red}❌ Função não encontrada: ${functionName}${colors.reset}`);
    console.log(`${colors.yellow}Funções disponíveis:${colors.reset}`);
    Object.keys(mockResponses).forEach((name) => {
      console.log(`  - ${name}`);
    });
    process.exit(1);
  }
} else {
  // Modo interativo
  showMenu();
}
