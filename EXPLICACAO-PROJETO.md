# 🤰 Nossa Maternidade - Explicação Completa do Projeto

## 📋 Visão Geral

**Nossa Maternidade** é um aplicativo mobile React Native desenvolvido para apoiar mães, gestantes e tentantes brasileiras durante toda a jornada da maternidade. O app oferece uma assistente virtual inteligente chamada **NathIA**, treinada especificamente para questões de maternidade, com suporte a conversas naturais, planos diários personalizados e conteúdo exclusivo.

### 🎯 Objetivo Principal

Oferecer suporte acessível e confiável para mães brasileiras da classe C-D, fornecendo:
- Informações médicas confiáveis sobre maternidade
- Suporte emocional através de uma IA empática
- Conteúdo personalizado baseado no perfil da usuária
- Ferramentas práticas para acompanhamento da gravidez e pós-parto

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológico

**Frontend:**
- **React Native** com **Expo SDK 52** (framework mobile multiplataforma)
- **TypeScript** (type safety)
- **React Navigation** (navegação entre telas)
- **React Native Gifted Chat** (interface de chat)
- **Zustand** (gerenciamento de estado)
- **Design System Bubblegum** (sistema de design próprio)

**Backend:**
- **Supabase** (BaaS - Backend as a Service)
  - Banco de dados PostgreSQL
  - Autenticação
  - Edge Functions (serverless)
  - Row Level Security (RLS)

**Integrações de IA:**
- **Google Gemini 2.0 Flash** (assistente virtual principal - NathIA)
- **OpenAI GPT-4** (validação e geração de conteúdo adicional)
- **Claude AI** (Anthropic) - para futuras integrações

**Outras Ferramentas:**
- **Stripe** (pagamentos - assinatura premium)
- **AsyncStorage** (armazenamento local offline)
- **Expo Notifications** (notificações push)

---

## 📁 Estrutura do Projeto

```
nossa-maternidade/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── chat/            # Componentes específicos de chat
│   │   ├── Button.tsx       # Botão do design system
│   │   ├── Card.tsx         # Card do design system
│   │   ├── Input.tsx        # Input do design system
│   │   └── ...
│   ├── screens/             # Telas da aplicação
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── DailyPlanScreen.tsx
│   │   ├── HabitsScreen.tsx
│   │   ├── ContentFeedScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/            # Serviços e integrações
│   │   ├── ai.ts            # Integração com APIs de IA
│   │   ├── auth.ts          # Autenticação Supabase
│   │   ├── supabase.ts      # Cliente Supabase
│   │   ├── notifications.ts
│   │   └── payments.ts
│   ├── hooks/               # Custom hooks React
│   │   ├── useChatOptimized.ts
│   │   ├── useDailyInteractions.ts
│   │   └── useUserProfile.ts
│   ├── theme/               # Design System
│   │   ├── colors.ts
│   │   └── index.ts
│   ├── contexts/            # React Contexts
│   │   └── ThemeContext.tsx
│   ├── navigation/          # Navegação
│   │   └── index.tsx
│   └── utils/               # Utilitários
│       ├── helpers.ts
│       ├── logger.ts
│       └── retry.ts
│
├── supabase/
│   └── functions/           # Edge Functions (serverless)
│       ├── nathia-chat/     # Função principal da NathIA
│       ├── risk-classifier/ # Classificação de risco
│       ├── moderation-service/ # Moderação de conteúdo
│       ├── behavior-analysis/  # Análise de comportamento
│       └── lgpd-requests/   # Solicitações LGPD
│
├── .cursor/                 # Configurações do Cursor IDE
│   ├── agents/              # Configurações de agentes
│   ├── prompts/             # Prompts reutilizáveis
│   └── rules/               # Regras de código
│
├── .vscode/                 # Configurações VS Code/Cursor
│   └── mcp.json             # Servidores MCP configurados
│
├── App.tsx                  # Entry point da aplicação
├── package.json             # Dependências
├── tsconfig.json            # Configuração TypeScript
└── app.json                 # Configuração Expo
```

---

## 🧩 Funcionalidades Principais

### 1. **Onboarding Personalizado** ✅
- Fluxo de 7 etapas para cadastro
- Coleta de informações:
  - Tipo de usuária (gestante, mãe ou tentante)
  - Semana de gravidez (se gestante)
  - Nome do bebê/filho
  - Preferências de conteúdo
- Personalização do perfil desde o início

### 2. **Chat com NathIA (Assistente Virtual)** ✅
- Conversas naturais em português brasileiro
- Linguagem empática e casual
- Histórico de conversas persistido no Supabase
- **Detecção de urgência**: Alertas automáticos para emergências
- **Moderação rigorosa**: Validação de todas as respostas
- **Suporte offline**: Mensagens salvas localmente quando sem internet
- **Rate limiting**: Proteção contra uso excessivo

### 3. **Plano Diário Personalizado** ✅
- Prioridades do dia baseadas no perfil
- Dica do dia personalizada
- Receita saudável sugerida
- Conteúdo adaptado ao estágio da gravidez/maternidade

### 4. **Acompanhamento de Hábitos** ✅
- Sistema de tracking de hábitos
- Visualização de progresso
- Lembretes personalizados

### 5. **Feed de Conteúdo** ✅
- Artigos e dicas sobre maternidade
- Sistema de favoritos
- Conteúdo filtrado por interesse

### 6. **Perfil e Configurações** ✅
- Visualização e edição de informações
- Histórico de interações
- Gerenciamento de assinatura (free/premium)

### 7. **Notificações Push** ✅
- Lembretes personalizados
- Dicas diárias
- Avisos importantes

---

## 🔒 Segurança e Privacidade

### LGPD Compliance
- Funções para exportação de dados pessoais
- Funções para exclusão de dados (direito ao esquecimento)
- Política de privacidade transparente

### Moderação de Conteúdo
- Validação rigorosa de todas as respostas da IA
- Guardrails implementados
- Análise de comportamento para melhorar respostas

### Detecção de Risco
- Classificação automática de mensagens urgentes
- Alertas para emergências médicas
- Encaminhamento para serviços de saúde quando necessário

### Autenticação Segura
- Supabase Auth com múltiplos métodos
- Row Level Security (RLS) no banco de dados
- Tokens seguros e renovação automática

---

## 🎨 Design System - Bubblegum

O projeto utiliza um design system próprio chamado **Bubblegum**:

### Características
- **Cores**: Paleta suave e acolhedora (rosa, azul, tons pastéis)
- **Tipografia**: Fontes acessíveis e legíveis
- **Componentes**: Biblioteca consistente de componentes reutilizáveis
- **Espaçamento**: Sistema de spacing padronizado
- **Dark Mode**: Suporte completo a tema claro/escuro

### Componentes Disponíveis
- **Button**: 5 variantes (primary, secondary, outline, ghost, danger)
- **Card**: 3 variantes (default, elevated, outlined)
- **Input**: Com validação integrada
- **Badge**: 4 tipos (info, success, warning, error)
- **Loading**: Spinner e skeleton screens

---

## 🤖 Servidores MCP Configurados

O projeto inclui configuração de **Model Context Protocol (MCP)** servers no arquivo `.vscode/mcp.json`:

### 1. **GitHub MCP Server** ✅
- Tipo: HTTP (remoto)
- Acesso read-only a repositórios, issues, PRs
- Sem configuração adicional necessária

### 2. **Filesystem MCP Server** ✅
- Tipo: Local (stdio)
- Operações seguras no sistema de arquivos
- Ferramentas: read_file, list_directory, search_files

### 3. **PostgreSQL MCP Server** ✅
- Tipo: Local (stdio)
- Conexão com bancos PostgreSQL (incluindo Supabase)
- **Configuração**: Adicione `POSTGRES_CONNECTION_STRING` no env
- Útil para: Consultas diretas ao banco Supabase

### 4. **SQLite MCP Server** ✅
- Tipo: Local (stdio)
- Banco local para desenvolvimento
- Ferramentas: Executar queries SQLite

### 5. **Brave Search MCP Server** ✅
- Tipo: Local (stdio)
- Busca na web via Brave Search API
- **Configuração**: Adicione `BRAVE_API_KEY` se necessário (opcional)

### 6. **Puppeteer MCP Server** ✅
- Tipo: Local (stdio)
- Automação de browser para testes
- Útil para: Web scraping, testes end-to-end

### 7. **Fetch MCP Server** ✅
- Tipo: Local (stdio)
- Requisições HTTP simplificadas
- Útil para: Testar APIs, webhooks

### 8. **Git MCP Server** ✅
- Tipo: Local (stdio)
- Operações Git via MCP
- Ferramentas: Status, commit, diff, etc.

### 9. **Memory MCP Server** ✅
- Tipo: Local (stdio)
- Armazenamento de memória contextual
- Útil para: Manter contexto entre sessões

---

## 📊 Status Atual do Projeto

### ✅ O Que Está Completo (75%)

1. **Código do App**: 100%
   - Todas as telas implementadas
   - Todos os componentes do design system
   - Navegação completa
   - Integrações de backend

2. **Backend/Supabase**: 100%
   - Schema SQL completo
   - Edge Functions implementadas
   - RLS configurado

3. **Documentação**: 100%
   - README completo
   - Guias de configuração
   - Arquitetura documentada

4. **Configuração MCP**: 100%
   - 9 servidores MCP configurados
   - Documentação completa

### ⏳ O Que Precisa ser Configurado (25%)

1. **Projeto Supabase**: Criar projeto e obter credenciais
2. **Arquivo .env**: Preencher variáveis de ambiente
3. **Gemini API**: Configurar chave de API
4. **Deploy Edge Functions**: Fazer deploy das funções no Supabase
5. **Configuração MCP**: Adicionar chaves de API opcionais (Postgres, Brave Search)
6. **Testes**: Rodar o app e testar funcionalidades

**Tempo estimado**: ~25 minutos

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase (gratuita)
- Chaves de API:
  - Google Gemini API (obrigatória)
  - OpenAI API (opcional)

### Passo a Passo

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar Supabase**
   - Criar projeto em https://supabase.com
   - Executar SQL schema: `supabase/schema-nossa-maternidade-completo.sql`
   - Anotar URL e anon key

3. **Configurar .env**
   - Copiar `.env.example` para `.env.local`
   - Preencher variáveis obrigatórias

4. **Configurar Gemini API**
   - Obter chave em https://makersuite.google.com/app/apikey
   - Adicionar secret no Supabase: `GEMINI_API_KEY`

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy nathia-chat
   ```

6. **Configurar MCP (Opcional)**
   - Editar `.vscode/mcp.json`
   - Adicionar `POSTGRES_CONNECTION_STRING` para conexão Supabase
   - Adicionar `BRAVE_API_KEY` se quiser usar busca

7. **Executar app**
   ```bash
   npm start
   # ou
   expo start
   ```

**Guia completo**: Veja `COMO-DEIXAR-APP-FUNCIONAL.md`

---

## 🧪 Testes e Qualidade

### Linting e Formatação
- **ESLint**: Configurado com regras React Native
- **Prettier**: Formatação automática de código
- **Husky**: Pre-commit hooks
- **Lint-staged**: Validação antes de commits

### Code Review
- Sistema de revisão de código automatizado
- Scripts para gerenciar revisões
- Padrões definidos em `.cursorrules`

---

## 📈 Roadmap Futuro

- [ ] Implementação completa de pagamentos premium
- [ ] Integração com serviços de áudio/vídeo
- [ ] Expansão do conteúdo personalizado
- [ ] Análise avançada de comportamento
- [ ] Suporte multilíngue
- [ ] Modo offline completo
- [ ] Integração com dispositivos wearables
- [ ] Comunidade de mães dentro do app

---

## 🤝 Contribuindo

O projeto segue padrões de código definidos em `.cursorrules`:
- TypeScript com tipos explícitos
- Componentes memoizados quando necessário
- Acessibilidade (WCAG 2.1 AA)
- Performance otimizada
- Segurança em todas as camadas

---

## 📞 Suporte e Documentação

- **README.md**: Documentação principal
- **STATUS-APP.md**: Status detalhado do projeto
- **COMO-DEIXAR-APP-FUNCIONAL.md**: Guia passo a passo para configurar
- **ARCHITECTURE.md**: Arquitetura detalhada do sistema
- **MCP_SETUP.md**: Guia completo de configuração MCP

---

**Desenvolvido com 💕 para mães brasileiras**
