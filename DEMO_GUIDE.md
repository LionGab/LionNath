# Guia Rápido - Modo Demo para Influenciadora

## 🚀 Início Rápido

### Opção 1: Modo Demo (Sem Backend)

Para apresentar o app sem configurar Supabase:

1. **Copie o arquivo de exemplo:**

   ```bash
   cp .env.example .env
   ```

2. **Configure o modo demo no `.env`:**

   ```env
   EXPO_PUBLIC_USE_MOCKS=true
   EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
   ```

3. **Instale dependências (se necessário):**

   ```bash
   pnpm install
   ```

4. **Execute o app:**

   ```bash
   pnpm dev
   ```

5. **Credenciais de demo:**
   - Email: `demo@demo.com`
   - Senha: `Demo1234`

### Opção 2: Com Supabase Real

1. **Configure `.env` com suas credenciais:**

   ```env
   EXPO_PUBLIC_USE_MOCKS=false
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

2. **Execute:**
   ```bash
   pnpm dev
   ```

## ✅ Validação Pré-Demo

Antes da apresentação, execute:

```bash
pnpm run validate:demo
```

Este script verifica:

- ✓ Dependências instaladas
- ✓ Variáveis de ambiente configuradas
- ✓ Arquivos críticos existem
- ✓ TypeScript sem erros
- ✓ Lint sem erros críticos
- ✓ Testes básicos passando
- ✓ Telas principais existem
- ✓ Componentes de loading existem

## 📱 Fluxo de Teste Recomendado

1. **Login/Signup**
   - Teste login com credenciais demo
   - Verifique navegação após login

2. **Onboarding**
   - Complete o fluxo de perguntas
   - Verifique salvamento de respostas

3. **Home/Feed**
   - Verifique carregamento de conteúdo
   - Teste scroll e performance
   - Verifique dica diária

4. **Chat (NathIA)**
   - Envie mensagens
   - Verifique loading states
   - Teste ações rápidas

5. **Perfil**
   - Edite informações
   - Teste upload de foto (se implementado)

6. **Navegação**
   - Teste navegação entre telas
   - Verifique botão voltar (Android)
   - Teste deep linking (se configurado)

## 🐛 Troubleshooting

### App não inicia

- Verifique se `.env` existe e está configurado
- Execute `pnpm install` novamente
- Limpe cache: `rm -rf node_modules .expo` e reinstale

### Erro de Supabase

- Se em modo demo (`USE_MOCKS=true`), ignore erros de conexão
- Verifique se variáveis de ambiente estão corretas
- Em modo demo, o app funciona completamente offline

### Telas em branco

- Verifique console para erros
- Certifique-se que ErrorBoundary está capturando erros
- Em modo demo, todas as telas devem funcionar

## 📝 Notas Importantes

- **Modo Demo (`USE_MOCKS=true`)**: Funciona completamente offline, ideal para apresentações sem internet
- **Modo Produção**: Requer Supabase configurado e funcionando
- **Credenciais Demo**: Use apenas para demonstração, nunca em produção
- **Builds**: Para TestFlight/Internal Testing, configure Supabase real ou use modo demo

## 🎯 Checklist Final Antes da Demo

- [ ] `pnpm run validate:demo` passa sem erros
- [ ] App inicia sem crashes
- [ ] Login funciona (demo ou real)
- [ ] Todas as telas principais são navegáveis
- [ ] Chat responde (mock ou real)
- [ ] Feed carrega conteúdo
- [ ] Performance aceitável (sem lag visível)
- [ ] Sem erros visíveis no console
- [ ] Build TestFlight/Internal criado e testado em dispositivo físico

## 📞 Suporte

Em caso de problemas durante a demo:

1. Verifique logs do console
2. Execute `pnpm run validate:demo` para diagnóstico
3. Consulte `docs/` para documentação detalhada
