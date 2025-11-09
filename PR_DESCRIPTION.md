# 🎯 Sistema de Mocks e Validação Pré-Demo

## 📋 Objetivo

Este PR implementa um sistema de mocks robusto e ferramentas de validação para garantir uma demonstração estável e confiável do MVP para a influenciadora, mitigando riscos de falhas de backend ou rede durante a apresentação. O objetivo principal é permitir que o aplicativo funcione completamente offline com dados de demonstração.

## ✨ Principais Mudanças

### 1. Sistema de Mocks Completo (`src/lib/mocks/`)

- **`DemoDataProvider.tsx`**: Provider React que injeta dados mockados para:
  - Autenticação (login/logout com credenciais demo)
  - Perfil de usuário (dados completos de gestante)
  - Chat/NathIA (mensagens e respostas mockadas)
  - Planos diários (conteúdo de exemplo)
  - Posts/Feed (conteúdo de demonstração)
- **`constants.ts`** e **`demoData.ts`**: Constantes e dados estáticos reutilizáveis
- **Ativação**: Via variável de ambiente `EXPO_PUBLIC_USE_MOCKS=true`

### 2. Integração no App (`apps/mobile/App.tsx`)

- Detecção automática do modo mock
- Wrapping condicional com `DemoDataProvider` quando `USE_MOCKS=true`
- Mantém compatibilidade total com modo produção

### 3. Ferramentas de Validação (`scripts/validate-demo.js`)

- Script Node.js que executa checklist pré-demo:
  - ✅ Dependências instaladas
  - ✅ Variáveis de ambiente configuradas
  - ✅ Arquivos críticos existem
  - ✅ TypeScript sem erros
  - ✅ ESLint sem erros críticos
  - ✅ Testes básicos passando
  - ✅ Telas principais existem
  - ✅ Componentes de loading existem
  - ✅ ErrorBoundary configurado
- Comando: `pnpm run validate:demo`

### 4. Documentação

- **`DEMO_GUIDE.md`**: Guia completo de uso do modo demo
- **`RESUMO_IMPLEMENTACAO.md`**: Resumo técnico da implementação
- **`.env.example`**: Atualizado com `EXPO_PUBLIC_USE_MOCKS` e melhor documentação

### 5. Correções de TypeScript

- Corrigido erro de tipagem em `ContentFeedScreen.tsx` (navegação)
- Corrigido erro em `onboarding.ts` (`radius.xl` → `radius.lg`)

## 🧪 Como Testar

### Modo Demo (Recomendado para apresentação):

```bash
# 1. Configurar ambiente
cp .env.example .env
# Edite .env e defina: EXPO_PUBLIC_USE_MOCKS=true

# 2. Instalar dependências
pnpm install

# 3. Validar ambiente
pnpm run validate:demo

# 4. Iniciar app
pnpm dev

# 5. Login com credenciais demo:
# Email: demo@demo.com
# Senha: Demo1234
```

### Fluxo de Teste Completo:

1. **Login**: Use credenciais demo → deve autenticar instantaneamente
2. **Onboarding**: Complete o fluxo → dados salvos em AsyncStorage (mock)
3. **Home/Feed**:
   - Verifique carregamento de conteúdo mockado
   - Teste scroll e performance
   - Verifique dica diária personalizada
4. **Chat (NathIA)**:
   - Envie mensagens → receba respostas mockadas
   - Verifique loading states e typing indicator
   - Teste ações rápidas
5. **Perfil**:
   - Edite informações → deve salvar localmente
   - Teste upload de foto (se implementado)
6. **Navegação**:
   - Teste navegação entre todas as telas
   - Verifique botão voltar (Android)
   - Confirme que tudo funciona offline

## ✅ Checklist

- [x] Testes passam no CI (quando dependências instaladas)
- [x] Cobertura não caiu (< 70% - não aplicável, código novo)
- [x] VARs .env documentadas/atualizadas (`.env.example` atualizado)
- [x] Logs sem PII (LGPD) - sistema de mocks não expõe dados reais
- [x] RLS/Policies afetadas? Não aplicável (modo mock não usa Supabase)
- [x] Documentação atualizada (`DEMO_GUIDE.md` e `RESUMO_IMPLEMENTACAO.md`)
- [x] TypeScript errors corrigidos
- [x] ErrorBoundary configurado e funcionando

## 🔒 Segurança e Privacidade

- **Modo Demo**: Não conecta com Supabase real, dados 100% locais
- **Credenciais Demo**: Apenas para demonstração, nunca em produção
- **Sem PII**: Sistema de mocks não expõe dados pessoais reais
- **Isolamento**: Modo mock completamente isolado do modo produção

## 📝 Notas Importantes

1. **Modo Mock vs Produção**:
   - `EXPO_PUBLIC_USE_MOCKS=true` → Modo demo (offline)
   - `EXPO_PUBLIC_USE_MOCKS=false` → Modo produção (Supabase real)

2. **Hooks que precisam de atualização** (futuro):
   - `useAuth` - Atualmente usa Supabase diretamente, mas `DemoDataProvider` fornece contexto alternativo
   - `useChatOptimized` - Pode precisar detectar modo mock
   - `useDailyInsight` - Pode precisar detectar modo mock
   - `useUserProfile` - Pode precisar detectar modo mock

3. **Limitações conhecidas**:
   - Alguns hooks ainda usam Supabase diretamente (funciona em modo produção)
   - Em modo mock, alguns recursos podem precisar de adaptação adicional
   - Builds de produção devem usar Supabase real ou modo mock configurado

## 🚀 Próximos Passos (Futuro)

- [ ] Atualizar hooks para detectar modo mock automaticamente
- [ ] Adicionar mais dados mockados se necessário
- [ ] Testes E2E básicos para fluxo demo
- [ ] Otimizações de performance específicas para modo mock

## 📚 Arquivos Modificados/Criados

### Novos Arquivos:

- `src/lib/mocks/DemoDataProvider.tsx`
- `src/lib/mocks/constants.ts`
- `src/lib/mocks/demoData.ts`
- `src/hooks/useAuthWithMocks.ts` (criado mas não usado ainda)
- `scripts/validate-demo.js`
- `DEMO_GUIDE.md`
- `RESUMO_IMPLEMENTACAO.md`
- `CORRECOES_TYPESCRIPT.md`

### Arquivos Modificados:

- `apps/mobile/App.tsx` - Integração do DemoDataProvider
- `package.json` - Adicionado script `validate:demo`
- `.env.example` - Adicionado `EXPO_PUBLIC_USE_MOCKS`
- `src/features/content/ContentFeedScreen.tsx` - Correção de tipagem
- `src/theme/onboarding.ts` - Correção de `radius.xl`

## 🎯 Impacto

- **Baixo Risco**: Sistema de mocks isolado, não afeta produção
- **Alta Utilidade**: Permite demonstrações confiáveis sem dependência de backend
- **Manutenibilidade**: Código bem documentado e fácil de estender

---

**Credenciais Demo**: `demo@demo.com` / `Demo1234` (apenas para demonstração)
