# Nossa Maternidade 🤱

Aplicativo mobile-first para acolhimento emocional e apoio a mães, gestantes e tentantes.

## 🌟 Features Principais

### 💬 NathIA - Chat com IA

Conversação empática com assistente virtual especializada em maternidade, usando Gemini 2.0 Flash.

### 🌸 Dica Diária Personalizada

IA gera dicas contextualizadas baseadas no momento da usuária (gestação, puerpério, etc).

### 🎯 Sistema de Hábitos e Gamificação

- Tracking de hábitos saudáveis (hidratação, meditação, autocuidado)
- Streaks de dias consecutivos
- Pontos (XP) e níveis
- Badges e conquistas

### ❤️ MundoNath

Feed exclusivo com conteúdo autoral da Nathália Valente sobre maternidade real.

### 📚 MãeValente

Curadoria inteligente de artigos sobre maternidade usando Perplexity AI + Claude.

## 🏗️ Arquitetura

### Stack Tecnológica

- **Frontend**: React Native + Expo SDK 54
- **Navegação**: Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **IA**: Gemini 2.0 Flash (chat), Perplexity (curadoria), Claude (análise)
- **State**: Zustand + React Context
- **Styling**: StyleSheet + Theme System (dark mode)
- **Types**: TypeScript 5.3+

### Estrutura do Projeto

```
nossa-maternidade/
├── src/
│   ├── app/                    # Expo Router (file-based)
│   │   └── (tabs)/            # Tab navigation
│   │       ├── index.tsx      # Home
│   │       ├── nathia.tsx     # Chat
│   │       ├── mundo-nath.tsx # Feed
│   │       ├── habitos.tsx    # Hábitos
│   │       └── mae-valente.tsx# Curadoria
│   ├── components/            # Componentes reutilizáveis
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API services (Supabase, AI)
│   ├── contexts/              # React Context (Theme, Auth)
│   └── types/                 # TypeScript types
├── supabase/
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge Functions
│       ├── nathia-chat/       # Chat com Gemini
│       ├── personalize-tip/   # Dica diária
│       └── curate-articles/   # Curadoria de conteúdo
├── docs/                      # Documentação completa
├── __tests__/                 # Testes unitários (Vitest)
└── e2e/                       # Testes E2E (Maestro)
```

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18+
- **pnpm** 9.12.0+
- **Expo CLI**
- **Android Studio** (Android) ou **Xcode** (iOS)
- **Supabase CLI**

### Instalação

```bash
# Clonar repositório
git clone https://github.com/sua-org/nossa-maternidade.git
cd nossa-maternidade

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas keys

# Executar migrations
supabase link --project-ref YOUR_PROJECT_ID
supabase db push

# Iniciar app
pnpm dev
```

### Executar

```bash
# Development
pnpm dev

# Android
pnpm android

# iOS (macOS apenas)
pnpm ios
```

## 🗄️ Database Schema

### Tabelas Principais

- **`user_profiles`**: Dados do usuário (nome, tipo, gestação, etc)
- **`chat_messages`**: Histórico de conversas com NathIA
- **`daily_insights`**: Dicas diárias personalizadas
- **`habits`**: Hábitos ativos do usuário
- **`habit_logs`**: Registro diário de hábitos
- **`streaks`**: Sequências consecutivas
- **`user_gamification`**: Pontos, níveis, badges
- **`mundo_nath_posts`**: Posts do feed MundoNath
- **`curated_content`**: Artigos curados (MãeValente)

Ver: `docs/ARCHITECTURE.md` para detalhes.

### Seed Data (Desenvolvimento)

Para popular o banco local com dados de teste:

```bash
# Reset completo (migrations + seed)
supabase db reset

# Ou apenas seed
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

Ver: `supabase/seed.sql` e `docs/ONBOARDING.md` para mais detalhes.

## 🧪 Testes

### Unitários (Vitest)

```bash
# Executar testes
pnpm test

# Watch mode
pnpm test:watch

# Coverage (threshold: 70%)
pnpm test:coverage
```

### E2E (Maestro)

```bash
# Android headless
pnpm e2e:android
```

## 📖 Documentação

- **[ONBOARDING.md](docs/ONBOARDING.md)**: Setup completo para desenvolvedores
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Arquitetura do sistema
- **[PRIVACY.md](docs/PRIVACY.md)**: Política de privacidade e LGPD
- **[SECURITY.md](docs/SECURITY.md)**: Segurança e boas práticas
- **[TROUBLESHOOTING_NETLIFY.md](docs/TROUBLESHOOTING_NETLIFY.md)**: Troubleshooting Netlify/GitHub
- **[HABITS_GAMIFICATION.md](docs/HABITS_GAMIFICATION.md)**: Sistema de hábitos
- **[PR_CHECKLIST.md](docs/PR_CHECKLIST.md)**: Checklist de PR
- **[CURSOR_2.0_BEST_PRACTICES.md](docs/CURSOR_2.0_BEST_PRACTICES.md)**: Best practices

## 🔒 Segurança

- ✅ **RLS (Row Level Security)**: Todas as tabelas protegidas
- ✅ **Input Validation**: Zod schema validation
- ✅ **API Keys**: Nunca expostas no client-side (apenas em Edge Functions)
- ✅ **Auth**: JWT token via Supabase Auth
- ✅ **Rate Limiting**: Proteção contra abuso (10 req/min)
- ✅ **Secret Scanning**: Habilitado no GitHub
- ✅ **Dependabot**: Atualizações automáticas de segurança

Ver: `docs/SECURITY.md` e `docs/PRIVACY.md`

## 🎨 Design System

### Tema

```typescript
const theme = {
  colors: {
    primary: '#FF69B4',
    background: '#FFFFFF',
    text: '#1A1A1A',
    // ... ver src/theme/
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};
```

### Dark Mode

Automático via `ThemeContext`.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feat/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feat/amazing-feature`)
5. Abra um Pull Request

**Importante**: Leia `docs/PR_CHECKLIST.md` antes de abrir PR!

## 📝 Scripts

```bash
# Development
pnpm dev                  # Iniciar Expo dev server
pnpm android              # Android emulator
pnpm ios                  # iOS simulator

# Quality
pnpm typecheck            # Type checking
pnpm lint                 # Linting
pnpm lint:fix             # Fix linting issues
pnpm format               # Format código (Prettier)

# Testing
pnpm test                 # Testes unitários
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report
pnpm e2e:android          # E2E Android

# Validation
pnpm validate             # Completa (type + lint + test + format)
pnpm validate:quick       # Rápida (type + lint)
```

## 🌍 Variáveis de Ambiente

```env
# Supabase (obrigatório)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Providers
GEMINI_API_KEY=your-gemini-key
PERPLEXITY_API_KEY=your-perplexity-key
CLAUDE_API_KEY=your-claude-key
LLM_PROVIDER=gemini

# Opcional
SENTRY_DSN=your-sentry-dsn
```

Ver `.env.example` para todas as variáveis.

## 📊 Status

- ✅ **Migrations**: 4 migrations criadas
- ✅ **Edge Functions**: 3 functions implementadas
- ✅ **Telas**: 5 telas principais completas
- ✅ **Testes**: Coverage >= 70%
- ✅ **Docs**: Completa

## 📄 Licença

MIT License - ver `LICENSE` para detalhes.

## 👥 Time

- **Nathália Valente**: Fundadora e Criadora de Conteúdo
- **Equipe de Desenvolvimento**: Backend, Frontend, QA

## 📞 Contato

- **Email**: contato@nossa-maternidade.com.br
- **Site**: [nossa-maternidade.com.br](https://nossa-maternidade.com.br)
- **Instagram**: [@nossa.maternidade](https://instagram.com/nossa.maternidade)

---

Made with 💕 for mães, gestantes e tentantes brasileiras.
