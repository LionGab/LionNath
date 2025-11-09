# Guia de Configuração Netlify - Visualização Web Mobile

## 🚀 Configuração Rápida

### 1. Variáveis de Ambiente no Netlify Dashboard

Acesse: **Site Settings > Environment Variables** no Netlify Dashboard

#### Para Modo Demo (Recomendado para apresentação):

```
EXPO_PUBLIC_USE_MOCKS=true
EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
```

#### Para Modo Produção:

```
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-real
EXPO_PUBLIC_SENTRY_DSN=https://seu-dsn-sentry.io/...
```

### 2. Build Automático

O Netlify está configurado para:

- ✅ Build automático a cada push na `main`
- ✅ Deploy previews para cada PR
- ✅ Build otimizado para web mobile

### 3. Verificação do Deploy

Após o deploy, verifique:

1. **URL do site**: Acesse a URL fornecida pelo Netlify
2. **Mobile view**: Abra no navegador mobile ou use DevTools (F12 > Toggle device toolbar)
3. **Login demo**: Use `demo@demo.com` / `Demo1234` se `USE_MOCKS=true`

## 📱 Configurações Web Mobile

O app está configurado para funcionar perfeitamente em navegadores mobile:

### Viewport Mobile-First

- Viewport otimizado para dispositivos móveis
- `user-scalable=no` para evitar zoom indesejado
- `viewport-fit=cover` para suportar notch/recortes

### PWA Ready

- Meta tags para "Add to Home Screen"
- Apple mobile web app capable
- Theme color configurado

### Performance

- Cache de assets estáticos (JS/CSS/Images)
- Headers de segurança configurados
- Redirects SPA para navegação

## 🔧 Troubleshooting

### Build Falha no Netlify

**Problema**: Build falha com erro de dependências
**Solução**:

```bash
# Verificar se pnpm está instalado
# O Netlify usa pnpm automaticamente se detectar pnpm-lock.yaml
```

### Variáveis de Ambiente Não Funcionam

**Problema**: App não detecta variáveis de ambiente
**Solução**:

1. Verifique se as variáveis começam com `EXPO_PUBLIC_`
2. Rebuild o site após adicionar variáveis
3. Verifique logs do build no Netlify Dashboard

### App Não Carrega no Mobile

**Problema**: Tela branca ou erro no mobile
**Solução**:

1. Verifique console do navegador (Chrome DevTools > Remote debugging)
2. Verifique se `EXPO_PUBLIC_USE_MOCKS` está configurado
3. Verifique se Supabase está configurado (se não usar mocks)

### AsyncStorage Não Funciona no Web

**Problema**: Dados não persistem no navegador
**Solução**:

- O `@react-native-async-storage/async-storage` já usa `localStorage` automaticamente no web
- Verifique se não há bloqueio de cookies/localStorage no navegador

## 📋 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Netlify Dashboard
- [ ] Build passa sem erros
- [ ] Site carrega corretamente
- [ ] Login funciona (demo ou real)
- [ ] Navegação funciona em todas as telas
- [ ] Responsividade mobile funciona
- [ ] PWA pode ser adicionado à tela inicial
- [ ] Performance aceitável (sem lag)

## 🔗 Links Úteis

- **Netlify Dashboard**: https://app.netlify.com
- **Documentação Netlify**: https://docs.netlify.com
- **Expo Web**: https://docs.expo.dev/workflow/web/

## 🎯 Próximos Passos

1. Configure variáveis de ambiente no Netlify
2. Faça push na `main` para triggerar build
3. Acesse a URL do deploy preview ou produção
4. Teste no dispositivo mobile ou DevTools mobile
5. Compartilhe URL com a influenciadora para teste
