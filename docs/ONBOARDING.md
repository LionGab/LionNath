# Onboarding - Nossa Maternidade

Guia completo para configurar o ambiente de desenvolvimento.

## Pré-requisitos

### Sistema Operacional

- **Windows 10/11**: PowerShell 5.1+ ou PowerShell Core 7+
- **macOS**: Catalina ou superior
- **Linux**: Ubuntu 20.04+ ou equivalente

### Ferramentas Obrigatórias

- **Node.js**: 18.x ou superior ([Download](https://nodejs.org))
- **pnpm**: 9.12.0+ (`npm install -g pnpm`)
- **Git**: 2.30+ ([Download](https://git-scm.com))
- **Expo CLI**: `npm install -g expo-cli`

### Mobile Development

#### Android

1. **Android Studio**: [Download](https://developer.android.com/studio)
2. **Android SDK**: API Level 33+ (Android 13)
3. **Java JDK**: OpenJDK 17 (incluído no Android Studio)
4. Configurar `ANDROID_HOME` environment variable:

   ```bash
   # Windows (PowerShell)
   $env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"

   # macOS/Linux
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```

#### iOS (macOS apenas)

1. **Xcode**: 14.0+ (via Mac App Store)
2. **CocoaPods**: `sudo gem install cocoapods`
3. **iOS Simulator**: Instalado via Xcode

## Setup do Projeto

### 1. Clonar Repositório

```bash
git clone https://github.com/sua-org/nossa-maternidade.git
cd nossa-maternidade
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

#### Mobile App

Copie `.env.example` para `.env` na pasta `apps/mobile`:

```bash
# Windows (PowerShell)
Copy-Item apps/mobile/.env.example apps/mobile/.env

# macOS/Linux
cp apps/mobile/.env.example apps/mobile/.env
```

Edite `apps/mobile/.env` e preencha as variáveis:

```env
# Supabase (obrigatório)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Opcional
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

⚠️ **Importante**: Chaves de API de IA (Gemini, Claude, Perplexity) NÃO devem estar aqui. Elas devem estar apenas em `supabase/functions/.env` (Edge Functions).

#### Edge Functions (Supabase)

Para desenvolvimento local das Edge Functions:

```bash
# Copiar exemplo
cp supabase/functions/.env.example supabase/functions/.env

# Editar e preencher chaves de API
# (Gemini, Claude, Perplexity, Service Role Key)
```

⚠️ **Segurança**: Nunca commite arquivos `.env`. Eles já estão no `.gitignore`.

### 4. Configurar Supabase

#### Instalar Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# macOS
brew install supabase/tap/supabase

# Linux
# Ver: https://supabase.com/docs/guides/cli
```

#### Linkar Projeto

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

#### Executar Migrations

```bash
supabase db push
```

#### Popular Banco com Dados de Teste (Seed)

Para desenvolvimento local, você pode popular o banco com dados de teste:

```bash
# Opção 1: Reset completo (apaga tudo e recria com migrations + seed)
supabase db reset

# Opção 2: Apenas executar seed (se banco já existe)
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/seed.sql
```

**Dados de teste incluídos:**
- ✅ 3 usuárias de teste (gestante, mãe estabelecida, tentante)
- ✅ Hábitos e logs de exemplo
- ✅ Streaks e gamificação
- ✅ Mensagens de chat com NathIA
- ✅ Dicas diárias
- ✅ Posts e conteúdo curado

**Credenciais de teste:**
- `gestante@test.com` / `senha123`
- `mae@test.com` / `senha123`
- `tentante@test.com` / `senha123`

⚠️ **Atenção**: O seed é apenas para desenvolvimento. NUNCA execute em produção!

#### Verificar Schema

```bash
supabase db diff
```

### 5. Executar Edge Functions Localmente (Opcional)

```bash
supabase functions serve
```

## Executar o App

### Modo Development

```bash
pnpm dev
```

Isso inicia o Expo Dev Server em `http://localhost:8081`.

### Android

```bash
# Abrir no Android Studio emulator
pnpm android

# Ou via ADB se dispositivo físico conectado
adb devices
```

### iOS (macOS apenas)

```bash
pnpm ios
```

### Web (desenvolvimento)

```bash
pnpm web
```

## Testes

### Testes Unitários (Vitest)

```bash
# Executar testes
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Testes E2E (Maestro)

```bash
# Android (headless)
pnpm e2e:android
```

## Validação Completa

Antes de fazer commit, execute:

```bash
pnpm validate
```

Isso executa:

- ✅ Type checking (TypeScript)
- ✅ Linting (ESLint)
- ✅ Testes unitários
- ✅ Formatação (Prettier)

## Troubleshooting

### Erro: "Supabase CLI not found"

- Reinstale o Supabase CLI seguindo [instruções oficiais](https://supabase.com/docs/guides/cli)

### Erro: "Metro bundler failed to start"

- Limpe cache: `npx expo start --clear`
- Delete `node_modules` e reinstale: `rm -rf node_modules && pnpm install`

### Erro: "Android build failed"

- Limpe build: `cd android && ./gradlew clean && cd ..`
- Verifique `ANDROID_HOME` está configurado
- Sincronize Gradle no Android Studio

### Erro: "iOS build failed"

- Limpe build: `rm -rf ios/build`
- Reinstale pods: `cd ios && pod install && cd ..`
- Abra Xcode e verifique signing certificates

## Recursos

- **Documentação**: `docs/`
- **Arquitetura**: `docs/ARCHITECTURE.md`
- **Segurança**: `docs/SECURITY.md`
- **Privacidade**: `docs/PRIVACY.md`
- **Edge Functions**: `docs/EDGE_FUNCTIONS.md`
- **Cursor 2.0**: `docs/CURSOR_2.0_BEST_PRACTICES.md`
- **Seed Data**: `supabase/seed.sql` (dados de teste)

## Suporte

- **Issues**: [GitHub Issues](https://github.com/sua-org/nossa-maternidade/issues)
- **Slack**: #nossa-maternidade
- **Email**: dev@nossa-maternidade.com.br
