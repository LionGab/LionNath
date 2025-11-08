/**
 * Types para Onboarding Conversacional
 * Perguntas que ajudam a NathIA entender o momento emocional e situacional da mãe
 */

export type OnboardingStep =
  | 'welcome'
  | 'basic_info'
  | 'maternal_stage'
  | 'emotional_state'
  | 'challenges'
  | 'support_needs'
  | 'goals'
  | 'preferences'
  | 'complete';

export interface OnboardingQuestion {
  id: string;
  step: OnboardingStep;
  question: string;
  type: 'text' | 'select' | 'multi_select' | 'scale' | 'textarea';
  options?: { label: string; value: string; icon?: string }[];
  required: boolean;
  helpText?: string;
  category: 'basic' | 'emotional' | 'situational' | 'needs';
}

export interface OnboardingResponse {
  questionId: string;
  value: string | string[] | number;
  timestamp: string;
}

export type SupportNetworkLevel = 'muito' | 'algum' | 'pouco' | 'nenhum';

export interface OnboardingData {
  // Informações Básicas
  name: string;
  age?: number;
  maternal_stage: 'tentante' | 'gestante' | 'puerperio' | 'mae_estabelecida';
  pregnancy_week?: number;
  baby_name?: string;
  baby_age_months?: number;
  baby_age_weeks?: number;

  // Estado Emocional
  emotional_state?: 'excelente' | 'bem' | 'ok' | 'cansada' | 'sobrecarregada' | 'ansiosa' | 'triste';
  stress_level?: number; // 1-10
  sleep_quality?: 'otimo' | 'bom' | 'regular' | 'ruim' | 'pessimo';
  energy_level?: number; // 1-10
  self_care_frequency?: 'nunca' | 'raramente' | 'as-vezes' | 'frequentemente';

  // Desafios Atuais
  main_challenges?: string[]; // ['solidão', 'culpa', 'exaustão', 'ansiedade', 'dúvidas', 'julgamento']
  specific_challenges?: string; // Texto livre sobre desafios específicos

  // Necessidades de Suporte
  support_needs?: string[]; // ['emocional', 'informações', 'comunidade', 'profissional', 'prático']
  support_network_level?: SupportNetworkLevel;
  support_network_description?: string;

  // Objetivos no App
  main_goals?: string[]; // ['conectar', 'aprender', 'desabafar', 'encontrar_ajuda', 'celebrar']
  what_brings_you_here?: string; // Texto livre

  // Preferências
  content_preferences?: string[];
  communication_style?: 'formal' | 'casual' | 'empatico' | 'direto';
  preferred_topics?: string[];

  // Contexto Familiar
  partner_support?: 'muito' | 'moderado' | 'pouco' | 'nenhum' | 'nao_tem';
  family_support?: 'muito' | 'moderado' | 'pouco' | 'nenhum';
  other_children?: boolean;
  other_children_count?: number;

  // Histórico (opcional)
  previous_experience?: 'primeira_vez' | 'segunda_vez' | 'terceira_vez' | 'mais';
  mental_health_history?: 'nenhum' | 'ansiedade' | 'depressao' | 'outro';
  seeking_professional_help?: boolean;

  // Respostas completas
  responses: OnboardingResponse[];
  completed_at?: string;
}

/**
 * Perguntas do Onboarding Conversacional
 */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // STEP 1: Informações Básicas
  {
    id: 'name',
    step: 'basic_info',
    question: 'Qual é o seu nome?',
    type: 'text',
    required: true,
    category: 'basic',
  },
  {
    id: 'maternal_stage',
    step: 'maternal_stage',
    question: 'Como você se identifica?',
    type: 'select',
    required: true,
    options: [
      { label: 'Tentante', value: 'tentante', icon: 'heart-multiple' },
      { label: 'Gestante', value: 'gestante', icon: 'baby-carriage' },
      { label: 'Puerpério (até 1 ano)', value: 'puerperio', icon: 'baby-face' },
      { label: 'Mãe estabelecida', value: 'mae_estabelecida', icon: 'mother-nurse' },
    ],
    category: 'basic',
  },
  {
    id: 'pregnancy_week',
    step: 'basic_info',
    question: 'Em que semana de gestação você está?',
    type: 'text',
    required: false,
    helpText: 'Apenas se você estiver grávida',
    category: 'basic',
  },
  {
    id: 'baby_name',
    step: 'basic_info',
    question: 'Qual é o nome do seu bebê?',
    type: 'text',
    required: false,
    helpText: 'Ou deixe em branco se preferir',
    category: 'basic',
  },
  {
    id: 'baby_age_months',
    step: 'basic_info',
    question: 'Qual a idade do seu bebê? (em meses)',
    type: 'text',
    required: false,
    helpText: 'Ex: 6 meses',
    category: 'basic',
  },
  {
    id: 'self_care_frequency',
    step: 'emotional_state',
    question: 'Com que frequência você consegue fazer algo para você?',
    type: 'select',
    required: true,
    options: [
      { label: 'Nunca ou quase nunca', value: 'nunca' },
      { label: 'Raramente (1x por semana)', value: 'raramente' },
      { label: 'Às vezes (2-3x por semana)', value: 'as-vezes' },
      { label: 'Frequentemente (diariamente)', value: 'frequentemente' },
    ],
    category: 'emotional',
  },

  // STEP 2: Estado Emocional
  {
    id: 'emotional_state',
    step: 'emotional_state',
    question: 'Como você está se sentindo hoje?',
    type: 'select',
    required: true,
    options: [
      { label: '😫 Exausta e sobrecarregada', value: 'exausta' },
      { label: '😰 Ansiosa e preocupada', value: 'ansiosa' },
      { label: '😊 Feliz e realizada', value: 'feliz' },
      { label: '😕 Confusa e insegura', value: 'confusa' },
      { label: '😌 Equilibrada', value: 'equilibrada' },
      { label: '😢 Triste', value: 'triste' },
    ],
    category: 'emotional',
    helpText: 'Não se preocupe, estamos aqui para te ajudar. Este é um espaço seguro e sem julgamento.',
  },
  {
    id: 'stress_level',
    step: 'emotional_state',
    question: 'Em uma escala de 1 a 10, qual seu nível de estresse hoje?',
    type: 'scale',
    required: true,
    options: Array.from({ length: 10 }, (_, i) => ({
      label: `${i + 1}`,
      value: `${i + 1}`,
    })),
    category: 'emotional',
    helpText: '1 = muito tranquila, 10 = extremamente estressada',
  },
  {
    id: 'sleep_quality',
    step: 'emotional_state',
    question: 'Como está a qualidade do seu sono?',
    type: 'select',
    required: true,
    options: [
      { label: 'Péssima - acordo várias vezes', value: 'pessima' },
      { label: 'Ruim - durmo pouco', value: 'ruim' },
      { label: 'Regular - poderia ser melhor', value: 'regular' },
      { label: 'Boa - durmo razoavelmente bem', value: 'boa' },
      { label: 'Ótima', value: 'otimo' },
    ],
    category: 'emotional',
  },
  {
    id: 'energy_level',
    step: 'emotional_state',
    question: 'Em uma escala de 1 a 10, qual seu nível de energia hoje?',
    type: 'scale',
    required: true,
    options: Array.from({ length: 10 }, (_, i) => ({
      label: `${i + 1}`,
      value: `${i + 1}`,
    })),
    category: 'emotional',
    helpText: '1 = sem energia, 10 = cheia de energia',
  },

  // STEP 3: Desafios
  {
    id: 'main_challenges',
    step: 'challenges',
    question: 'Quais são seus principais desafios no momento?',
    type: 'multi_select',
    required: true,
    options: [
      { label: 'Sono do bebê', value: 'sono', icon: 'sleep' },
      { label: 'Amamentação', value: 'amamentacao', icon: 'breastfeeding' },
      { label: 'Falta de tempo para mim', value: 'tempo', icon: 'clock-outline' },
      { label: 'Ansiedade e preocupação', value: 'ansiedade', icon: 'alert-circle' },
      { label: 'Organizar a rotina', value: 'rotina', icon: 'calendar-clock' },
      { label: 'Falta de apoio', value: 'apoio', icon: 'account-off' },
      { label: 'Solidão', value: 'solidao', icon: 'account-off' },
      { label: 'Culpa materna', value: 'culpa', icon: 'heart-broken' },
      { label: 'Exaustão', value: 'exaustao', icon: 'sleep-off' },
      { label: 'Dúvidas e inseguranças', value: 'duvidas', icon: 'help-circle' },
      { label: 'Julgamento social', value: 'julgamento', icon: 'account-remove' },
      { label: 'Dificuldades com o bebê', value: 'dificuldades_bebe', icon: 'baby-buggy' },
      { label: 'Relacionamento', value: 'relacionamento', icon: 'heart-multiple' },
      { label: 'Trabalho e maternidade', value: 'trabalho', icon: 'briefcase' },
    ],
    category: 'situational',
    helpText: 'Selecione todos que se aplicam. Não se preocupe, você não está sozinha.',
  },
  {
    id: 'specific_challenges',
    step: 'challenges',
    question: 'Quer compartilhar mais sobre algum desafio específico?',
    type: 'textarea',
    required: false,
    helpText: 'Fique à vontade para desabafar. Este é um espaço seguro e sem julgamento.',
    category: 'situational',
  },

  // STEP 4: Necessidades de Suporte
  {
    id: 'support_needs',
    step: 'support_needs',
    question: 'O que você mais precisa agora? (selecione até 3)',
    type: 'multi_select',
    required: true,
    options: [
      { label: 'Descanso e recuperação', value: 'descanso', icon: 'sleep' },
      { label: 'Organização da rotina', value: 'organizacao', icon: 'calendar-clock' },
      { label: 'Apoio emocional', value: 'apoio-emocional', icon: 'heart' },
      { label: 'Dicas práticas', value: 'dicas-praticas', icon: 'lightbulb' },
      { label: 'Conexão com outras mães', value: 'comunidade', icon: 'account-group' },
      { label: 'Tempo para autocuidado', value: 'autocuidado', icon: 'spa' },
      { label: 'Informações práticas', value: 'informacoes', icon: 'book-open' },
      { label: 'Ajuda profissional', value: 'profissional', icon: 'doctor' },
      { label: 'Espaço para desabafar', value: 'desabafar', icon: 'message-text' },
    ],
    category: 'needs',
  },
  {
    id: 'support_network_level',
    step: 'support_needs',
    question: 'Você tem uma rede de apoio (família, amigos, parceiro)?',
    type: 'select',
    required: true,
    options: [
      { label: 'Sim, tenho muito apoio', value: 'muito' },
      { label: 'Tenho algum apoio', value: 'algum' },
      { label: 'Tenho pouco apoio', value: 'pouco' },
      { label: 'Não tenho apoio', value: 'nenhum' },
    ],
    category: 'needs',
  },
  {
    id: 'support_network_description',
    step: 'support_needs',
    question: 'Quer contar mais sobre sua rede de apoio?',
    type: 'textarea',
    required: false,
    helpText: 'Como é o suporte que você recebe?',
    category: 'needs',
  },

  // STEP 5: Objetivos
  {
    id: 'main_goals',
    step: 'goals',
    question: 'O que você espera encontrar aqui?',
    type: 'multi_select',
    required: true,
    options: [
      { label: 'Conectar com outras mães', value: 'conectar', icon: 'account-group' },
      { label: 'Aprender sobre maternidade', value: 'aprender', icon: 'school' },
      { label: 'Ter um espaço para desabafar', value: 'desabafar', icon: 'message-text' },
      { label: 'Encontrar ajuda profissional', value: 'encontrar_ajuda', icon: 'doctor' },
      { label: 'Celebrar conquistas', value: 'celebrar', icon: 'party-popper' },
      { label: 'Reduzir solidão', value: 'reduzir_solidao', icon: 'heart-plus' },
      { label: 'Encontrar informações práticas', value: 'informacoes', icon: 'book-open' },
    ],
    category: 'needs',
  },
  {
    id: 'what_brings_you_here',
    step: 'goals',
    question: 'O que te trouxe até aqui hoje?',
    type: 'textarea',
    required: false,
    helpText: 'Fique à vontade para compartilhar o que está passando pela sua cabeça.',
    category: 'needs',
  },

  // STEP 6: Preferências
  {
    id: 'content_preferences',
    step: 'preferences',
    question: 'Quais conteúdos te interessam mais?',
    type: 'multi_select',
    required: false,
    options: [
      { label: 'Alimentação saudável', value: 'alimentacao', icon: 'food-apple' },
      { label: 'Exercícios físicos', value: 'exercicios', icon: 'run' },
      { label: 'Bem-estar mental', value: 'bem_estar', icon: 'meditation' },
      { label: 'Preparação para o parto', value: 'parto', icon: 'baby-carriage' },
      { label: 'Amamentação', value: 'amamentacao', icon: 'breastfeeding' },
      { label: 'Sono do bebê', value: 'sono', icon: 'sleep' },
      { label: 'Desenvolvimento do bebê', value: 'desenvolvimento', icon: 'baby-face' },
      { label: 'Relacionamento e família', value: 'relacionamento', icon: 'heart-multiple' },
    ],
    category: 'basic',
  },
  {
    id: 'communication_style',
    step: 'preferences',
    question: 'Como você prefere que eu me comunique com você?',
    type: 'select',
    required: false,
    options: [
      { label: 'Casual e amigável (como uma amiga)', value: 'casual' },
      { label: 'Empático e acolhedor', value: 'empatico' },
      { label: 'Direto e objetivo', value: 'direto' },
      { label: 'Formal e respeitoso', value: 'formal' },
    ],
    category: 'basic',
    helpText: 'Isso vai ajudar a NathIA a conversar com você do jeito que você prefere',
  },
];

/**
 * Agrupa perguntas por step
 */
export function getQuestionsByStep(step: OnboardingStep): OnboardingQuestion[] {
  return ONBOARDING_QUESTIONS.filter((q) => q.step === step);
}

/**
 * Calcula progresso do onboarding
 */
export function calculateProgress(currentStep: OnboardingStep): number {
  const steps: OnboardingStep[] = [
    'welcome',
    'basic_info',
    'maternal_stage',
    'emotional_state',
    'challenges',
    'support_needs',
    'goals',
    'preferences',
    'complete',
  ];
  const currentIndex = steps.indexOf(currentStep);
  return Math.round(((currentIndex + 1) / steps.length) * 100);
}
