/**
 * Types para Onboarding v2 - Nossa Maternidade
 * 5 blocos progressivos focados em conexão emocional e personalização
 */

export type OnboardingV2Step =
  | 'block1_identity'         // Apresentação & Identidade
  | 'block2_emotions'          // Autocuidado & Emoções
  | 'block3_challenges'        // Desafios & Necessidades
  | 'block4_support'           // Rede de Apoio
  | 'block5_expectations'      // Expectativas & Preferências
  | 'complete';

export type MaternalStage = 'tentante' | 'gestante' | 'puerpera_0_3m' | 'puerpera_3_12m' | 'mae_estabelecida';
export type EmotionalState = 'exausta' | 'ansiosa' | 'feliz' | 'insegura' | 'equilibrada' | 'triste' | 'outro';
export type SleepQuality = 'pessima' | 'ruim' | 'regular' | 'boa' | 'otima';
export type SelfCareFrequency = 'nunca' | '1x_semana' | '2_3x_semana' | 'diariamente';
export type SupportNetworkLevel = 'muito' | 'algum' | 'pouco' | 'nenhum';
export type CommunicationStyle = 'amigavel' | 'empatica' | 'direta' | 'formal';

export interface OnboardingV2Data {
  // Block 1: Apresentação & Identidade
  name?: string;
  gender?: string; // "mulher", "homem", "não-binário", "prefiro_nao_dizer"
  maternal_stage?: MaternalStage;
  gestation_week?: number;
  baby_name?: string;
  baby_age_months?: number;
  baby_age_years?: number;

  // Block 2: Autocuidado & Emoções
  self_care_frequency?: SelfCareFrequency;
  emotional_state?: EmotionalState[];  // Multi-select
  stress_level?: number; // 1-10
  sleep_quality?: SleepQuality;
  energy_level?: number; // 1-10

  // Block 3: Desafios & Necessidades
  main_challenges?: string[]; // Multi-select: sono, amamentacao, tempo, ansiedade, rotina, apoio, culpa, exaustao, duvidas, julgamento, relacionamento, trabalho
  specific_challenges_text?: string; // Campo livre
  support_needs?: string[]; // Até 3: descanso, organizacao, apoio_emocional, dicas_praticas, comunidade, autocuidado, informacoes, profissional, desabafar

  // Block 4: Rede de Apoio
  support_network_level?: SupportNetworkLevel;
  support_network_description?: string; // Campo livre

  // Block 5: Expectativas & Preferências
  what_brought_you_here?: string; // Campo livre
  main_goals?: string[]; // Multi-select: conectar, aprender, apoio_emocional, informacoes_praticas, reduzir_solidao, celebrar_conquistas
  content_preferences?: string[]; // Multi-select: alimentacao, exercicios, bem_estar_mental, parto, amamentacao, sono, desenvolvimento, relacionamento
  communication_style?: CommunicationStyle;

  // Metadata
  completed_at?: string;
  started_at?: string;
}

/**
 * Opções disponíveis para cada campo multi-select
 */
export const ONBOARDING_V2_OPTIONS = {
  maternal_stage: [
    { value: 'tentante', label: 'Tentante', icon: 'heart-multiple' },
    { value: 'gestante', label: 'Gestante', icon: 'baby-carriage' },
    { value: 'puerpera_0_3m', label: 'Puérpera (0-3 meses)', icon: 'baby-face' },
    { value: 'puerpera_3_12m', label: 'Puérpera (3-12 meses)', icon: 'baby' },
    { value: 'mae_estabelecida', label: 'Mãe estabelecida', icon: 'mother-nurse' },
  ],

  gender: [
    { value: 'mulher', label: 'Mulher' },
    { value: 'homem', label: 'Homem' },
    { value: 'nao_binario', label: 'Não-binário' },
    { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
  ],

  emotional_state: [
    { value: 'exausta', label: '😫 Exausta e sobrecarregada', emoji: '😫' },
    { value: 'ansiosa', label: '😰 Ansiosa e preocupada', emoji: '😰' },
    { value: 'feliz', label: '😊 Feliz e realizada', emoji: '😊' },
    { value: 'insegura', label: '😕 Insegura', emoji: '😕' },
    { value: 'equilibrada', label: '😌 Equilibrada', emoji: '😌' },
    { value: 'triste', label: '😢 Triste', emoji: '😢' },
    { value: 'outro', label: 'Outro' },
  ],

  self_care_frequency: [
    { value: 'nunca', label: 'Nunca ou quase nunca' },
    { value: '1x_semana', label: '1x por semana' },
    { value: '2_3x_semana', label: '2-3x por semana' },
    { value: 'diariamente', label: 'Diariamente' },
  ],

  sleep_quality: [
    { value: 'pessima', label: 'Péssima - acordo várias vezes' },
    { value: 'ruim', label: 'Ruim - durmo pouco' },
    { value: 'regular', label: 'Regular - poderia ser melhor' },
    { value: 'boa', label: 'Boa - durmo razoavelmente bem' },
    { value: 'otima', label: 'Ótima' },
  ],

  main_challenges: [
    { value: 'sono', label: 'Sono do bebê', icon: 'sleep' },
    { value: 'amamentacao', label: 'Amamentação', icon: 'baby-bottle' },
    { value: 'tempo', label: 'Falta de tempo para mim', icon: 'clock-outline' },
    { value: 'ansiedade', label: 'Ansiedade e preocupação', icon: 'alert-circle' },
    { value: 'rotina', label: 'Organizar a rotina', icon: 'calendar-clock' },
    { value: 'apoio', label: 'Falta de apoio', icon: 'account-off' },
    { value: 'solidao', label: 'Solidão', icon: 'account-off' },
    { value: 'culpa', label: 'Culpa materna', icon: 'heart-broken' },
    { value: 'exaustao', label: 'Exaustão', icon: 'sleep-off' },
    { value: 'duvidas', label: 'Dúvidas e inseguranças', icon: 'help-circle' },
    { value: 'julgamento', label: 'Julgamento social', icon: 'account-remove' },
    { value: 'relacionamento', label: 'Relacionamento', icon: 'heart-multiple' },
    { value: 'trabalho', label: 'Trabalho e maternidade', icon: 'briefcase' },
    { value: 'outro', label: 'Outro' },
  ],

  support_needs: [
    { value: 'descanso', label: 'Descanso e recuperação', icon: 'bedtime' },
    { value: 'organizacao', label: 'Organização da rotina', icon: 'calendar-check' },
    { value: 'apoio_emocional', label: 'Apoio emocional', icon: 'sentiment-very-satisfied' },
    { value: 'dicas_praticas', label: 'Dicas práticas', icon: 'lightbulb' },
    { value: 'comunidade', label: 'Conexão com outras mães', icon: 'groups' },
    { value: 'autocuidado', label: 'Tempo para autocuidado', icon: 'spa' },
    { value: 'informacoes', label: 'Informações práticas', icon: 'book-open' },
    { value: 'profissional', label: 'Ajuda profissional', icon: 'doctor' },
    { value: 'desabafar', label: 'Espaço para desabafar', icon: 'message-text' },
  ],

  support_network_level: [
    { value: 'muito', label: 'Sim, tenho muito apoio' },
    { value: 'algum', label: 'Tenho algum apoio' },
    { value: 'pouco', label: 'Tenho pouco apoio' },
    { value: 'nenhum', label: 'Não tenho apoio' },
  ],

  main_goals: [
    { value: 'conectar', label: 'Conectar com outras mães', icon: 'account-group' },
    { value: 'aprender', label: 'Aprender sobre maternidade', icon: 'school' },
    { value: 'apoio_emocional', label: 'Apoio emocional', icon: 'heart' },
    { value: 'informacoes_praticas', label: 'Informações práticas', icon: 'lightbulb' },
    { value: 'reduzir_solidao', label: 'Reduzir solidão', icon: 'heart-plus' },
    { value: 'celebrar_conquistas', label: 'Celebrar conquistas', icon: 'party-popper' },
  ],

  content_preferences: [
    { value: 'alimentacao', label: 'Alimentação saudável', icon: 'food-apple' },
    { value: 'exercicios', label: 'Exercícios físicos', icon: 'run' },
    { value: 'bem_estar_mental', label: 'Bem-estar mental', icon: 'meditation' },
    { value: 'parto', label: 'Preparação para o parto', icon: 'baby-carriage' },
    { value: 'amamentacao', label: 'Amamentação', icon: 'baby-bottle' },
    { value: 'sono', label: 'Sono do bebê', icon: 'sleep' },
    { value: 'desenvolvimento', label: 'Desenvolvimento do bebê', icon: 'baby-face' },
    { value: 'relacionamento', label: 'Relacionamento e família', icon: 'heart-multiple' },
  ],

  communication_style: [
    { value: 'amigavel', label: 'Amigável e acolhedor', description: 'Como conversar com uma amiga' },
    { value: 'empatica', label: 'Empática e acolhedora', description: 'Com muita compreensão e suporte' },
    { value: 'direta', label: 'Direta e objetiva', description: 'Informações diretas ao ponto' },
    { value: 'formal', label: 'Formal e respeitosa', description: 'Com linguagem mais profissional' },
  ],
} as const;

/**
 * Calcula progresso do onboarding v2
 */
export function calculateOnboardingV2Progress(currentStep: OnboardingV2Step): number {
  const steps: OnboardingV2Step[] = [
    'block1_identity',
    'block2_emotions',
    'block3_challenges',
    'block4_support',
    'block5_expectations',
    'complete',
  ];
  const currentIndex = steps.indexOf(currentStep);
  return (currentIndex + 1) / 5; // 5 blocks total
}

/**
 * Valida se um bloco está completo
 */
export function validateOnboardingV2Block(
  block: OnboardingV2Step,
  data: Partial<OnboardingV2Data>
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  switch (block) {
    case 'block1_identity':
      // Nome e estágio maternal são obrigatórios
      if (!data.maternal_stage) missingFields.push('maternal_stage');
      break;

    case 'block2_emotions':
      // Pelo menos 1 sentimento e stress level
      if (!data.emotional_state || data.emotional_state.length === 0) missingFields.push('emotional_state');
      if (data.stress_level === undefined) missingFields.push('stress_level');
      break;

    case 'block3_challenges':
      // Pelo menos 1 desafio
      if (!data.main_challenges || data.main_challenges.length === 0) missingFields.push('main_challenges');
      break;

    case 'block4_support':
      // Pelo menos 1 necessidade e resposta sobre rede de apoio
      if (!data.support_needs || data.support_needs.length === 0) missingFields.push('support_needs');
      if (!data.support_network_level) missingFields.push('support_network_level');
      break;

    case 'block5_expectations':
      // Pelo menos 1 objetivo e estilo de comunicação
      if (!data.main_goals || data.main_goals.length === 0) missingFields.push('main_goals');
      if (!data.communication_style) missingFields.push('communication_style');
      break;

    default:
      break;
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Gera perfil JSON para NathIA baseado no onboarding v2
 */
export function generateNathIAProfile(data: Partial<OnboardingV2Data>): Record<string, any> {
  return {
    // Identidade
    name: data.name || 'anônimo',
    maternal_stage: data.maternal_stage,
    gestation_week: data.gestation_week,
    baby_name: data.baby_name,
    baby_age_months: data.baby_age_months,
    baby_age_years: data.baby_age_years,

    // Emoções
    self_care_frequency: data.self_care_frequency,
    emotional_state: data.emotional_state,
    stress_level: data.stress_level,
    sleep_quality: data.sleep_quality,
    energy_level: data.energy_level,

    // Desafios
    main_challenges: data.main_challenges,
    specific_challenges: data.specific_challenges_text,
    support_needs: data.support_needs,

    // Apoio
    has_support_network: data.support_network_level !== 'nenhum',
    support_network_level: data.support_network_level,
    support_network_description: data.support_network_description,

    // Expectativas
    what_brought_you_here: data.what_brought_you_here,
    main_goals: data.main_goals,
    content_preferences: data.content_preferences,
    communication_style: data.communication_style,
  };
}
