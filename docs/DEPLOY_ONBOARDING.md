# Deploy do Onboarding - Nossa Maternidade

**Data:** 2025-01-08  
**Versão:** 1.0

---

## Visão Geral

Este documento descreve o processo de build e deploy do onboarding para ambientes de teste e produção.

---

## Pré-requisitos

1. Expo CLI instalado (`npm install -g expo-cli`)
2. EAS CLI instalado (`npm install -g eas-cli`)
3. Conta Expo configurada
4. Variáveis de ambiente configuradas (`.env`)

---

## Configuração de Variáveis de Ambiente

### Desenvolvimento Local

1. Copie `.env.example` para `.env`:

   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis no `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   EXPO_PUBLIC_USE_MOCKS=true
   ```

### EAS Build (Produção)

Configure secrets no EAS:

```bash
# Configurar Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://seu-projeto.supabase.co"

# Configurar Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sua-chave-anonima"

# Configurar modo mock (false para produção)
eas secret:create --scope project --name EXPO_PUBLIC_USE_MOCKS --value "false"
```

---

## Build Local (Desenvolvimento)

### iOS Simulator

```bash
# Iniciar Metro bundler
npm start

# Em outro terminal, build para iOS simulator
npx expo run:ios
```

### Android Emulator

```bash
# Iniciar Metro bundler
npm start

# Em outro terminal, build para Android emulator
npx expo run:android
```

### Web

```bash
npm start -- --web
```

---

## Build com EAS (TestFlight / Internal)

### Configurar EAS

1. Login no EAS:

   ```bash
   eas login
   ```

2. Configurar projeto:

   ```bash
   eas build:configure
   ```

3. Verificar `eas.json`:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": false
         }
       },
       "production": {
         "distribution": "store"
       }
     }
   }
   ```

### Build para TestFlight (iOS)

```bash
# Build de preview para TestFlight
eas build --platform ios --profile preview

# Ou build de produção
eas build --platform ios --profile production
```

### Build para Internal (Android)

```bash
# Build de preview para Internal Testing
eas build --platform android --profile preview

# Ou build de produção
eas build --platform android --profile production
```

---

## Instruções de Instalação para Demo

### iOS (TestFlight)

1. Build concluído, receba o link de instalação
2. Abra o link no dispositivo iOS
3. Instale via TestFlight (se disponível) ou link direto
4. Abra o app e teste o fluxo de onboarding

### Android (Internal Testing)

1. Build concluído, receba o link de download (.apk ou .aab)
2. Baixe o arquivo no dispositivo Android
3. Permita instalação de fontes desconhecidas (se necessário)
4. Instale o APK
5. Abra o app e teste o fluxo de onboarding

---

## Checklist de Deploy

### Antes do Build

- [ ] Variáveis de ambiente configuradas (`.env` ou EAS Secrets)
- [ ] Migration do Supabase executada (`supabase/migrations/20250108_onboarding_answers.sql`)
- [ ] Testes locais passando
- [ ] Type check passando (`npm run type-check`)
- [ ] Lint passando (`npm run lint`)

### Durante o Build

- [ ] Build iniciado com perfil correto (preview/production)
- [ ] Variáveis de ambiente carregadas corretamente
- [ ] Build concluído sem erros

### Após o Build

- [ ] App instalado no dispositivo de teste
- [ ] Onboarding funciona corretamente
- [ ] Persistência funciona (mock ou Supabase)
- [ ] Navegação funciona (Onboarding → Home)
- [ ] Acessibilidade testada (VoiceOver/TalkBack)

---

## Troubleshooting

### Erro: "EXPO*PUBLIC*\* variáveis não encontradas"

**Causa:** Variáveis não estão configuradas ou não estão sendo carregadas.

**Solução:**

1. Verifique se `.env` existe e tem as variáveis
2. Reinicie o Metro bundler (`npm start`)
3. Para EAS Build, verifique se secrets estão configurados

### Erro: "Supabase não configurado"

**Causa:** `EXPO_PUBLIC_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_ANON_KEY` não configuradas.

**Solução:**

1. Configure variáveis no `.env` ou EAS Secrets
2. Se usar mock, configure `EXPO_PUBLIC_USE_MOCKS=true`

### Erro: "Tabela onboarding_answers não existe"

**Causa:** Migration não foi executada no Supabase.

**Solução:**

1. Execute migration via Supabase Dashboard ou CLI
2. Verifique se tabela existe: `select * from onboarding_answers limit 1;`

### Build falha no EAS

**Causa:** Dependências ou configuração incorreta.

**Solução:**

1. Verifique `package.json` e `eas.json`
2. Execute `npm install` localmente para verificar dependências
3. Verifique logs do build no EAS Dashboard

---

## Comandos Rápidos

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Testes (se configurados)
npm test

# Start desenvolvimento
npm start

# Build iOS local
npx expo run:ios

# Build Android local
npx expo run:android

# Build EAS preview
eas build --platform all --profile preview

# Build EAS production
eas build --platform all --profile production
```

---

## Próximos Passos

1. ✅ Configurar variáveis de ambiente
2. ✅ Executar migration Supabase
3. ✅ Build de teste (preview)
4. ✅ Testar em dispositivo real
5. ✅ Ajustar conforme feedback
6. ✅ Build de produção
7. ✅ Deploy para lojas (App Store / Play Store)

---

**Documentado por:** DevOps Agent  
**Última atualização:** 2025-01-08
