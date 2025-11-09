# Como Iniciar o Projeto Corretamente

## ⚠️ Problema

Você está executando `npx expo start` da raiz do projeto, mas o app real está em `apps/mobile/`.

## ✅ Solução

### Opção 1: Usar script da raiz (Recomendado)

```bash
# Parar o processo atual (Ctrl+C)
# Depois executar:
pnpm dev
```

Este script já está configurado no `package.json` da raiz e inicia o app corretamente.

### Opção 2: Iniciar diretamente do diretório mobile

```bash
# Parar o processo atual (Ctrl+C)
cd apps/mobile
npm start
# ou
npx expo start
```

### Opção 3: Se quiser continuar da raiz

Se você realmente precisa iniciar da raiz, precisa garantir que o Expo encontre o `app.config.js` correto. Mas **não é recomendado** porque o projeto está estruturado como monorepo.

## 🔍 Verificar se está funcionando

Após iniciar corretamente, você deve ver:

- Metro bundler iniciando
- QR code no terminal
- Opções para iOS (i), Android (a), Web (w)

## 📝 Nota sobre o erro anterior

O erro do `@react-native-voice/voice` foi resolvido removendo o plugin do `app.json` da raiz. O plugin está configurado corretamente em `apps/mobile/app.config.js` onde o pacote está instalado.
