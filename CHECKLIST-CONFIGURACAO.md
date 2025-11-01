# ✅ CHECKLIST DE CONFIGURAÇÃO

**App:** Nossa Maternidade  
**Data:** 31/10/2025  
**Tempo estimado:** 25 minutos

---

## 📋 PARTE 1: PREPARAÇÃO (Já Feito ✅)

- [x] Código do app completo
- [x] Dependências instaladas (`npm install`)
- [x] Arquivo `.env` criado
- [x] Schema SQL preparado
- [x] Edge Function preparada
- [x] Documentação criada

---

## 📋 PARTE 2: SUPABASE (Você Precisa Fazer)

### Passo 1: Criar Projeto (5 min)

- [ ] Acessei https://supabase.com/dashboard
- [ ] Criei novo projeto "nossa-maternidade"
- [ ] Anotei a senha do database
- [ ] Aguardei criação do projeto (~2 min)

### Passo 2: Executar SQL (2 min)

- [ ] Abri SQL Editor no Supabase
- [ ] Copiei conteúdo de `supabase/schema-nossa-maternidade-completo.sql`
- [ ] Colei e executei no SQL Editor
- [ ] SQL executou sem erros
- [ ] Verifico que 10 tabelas foram criadas (Table Editor)

### Passo 3: Copiar Credenciais (2 min)

- [ ] Fui em Settings → API no Supabase
- [ ] Copiei **Project URL**
- [ ] Copiei **anon/public key**
- [ ] Anotei ambos em local seguro

---

## 📋 PARTE 3: CONFIGURAÇÃO LOCAL (Você Precisa Fazer)

### Passo 4: Preencher .env (3 min)

- [ ] Abri arquivo `.env` na raiz do projeto
- [ ] Substituí `EXPO_PUBLIC_SUPABASE_URL` pelo Project URL
- [ ] Substituí `EXPO_PUBLIC_SUPABASE_ANON_KEY` pela anon key
- [ ] Salvei o arquivo
- [ ] Rodei `npm run check` para verificar

---

## 📋 PARTE 4: GEMINI API (Você Precisa Fazer)

### Passo 5: Obter API Key (5 min)

- [ ] Acessei https://makersuite.google.com/app/apikey
- [ ] Fiz login com Google
- [ ] Criei nova API Key
- [ ] Copiei a key (começa com `AIza...`)

### Passo 6: Configurar no Supabase (2 min)

- [ ] No Dashboard Supabase → Edge Functions
- [ ] Cliquei em "Manage secrets"
- [ ] Adicionei secret:
  - Nome: `GEMINI_API_KEY`
  - Valor: [minha API key]
- [ ] Salvei

---

## 📋 PARTE 5: DEPLOY (Você Precisa Fazer)

### Passo 7: Deploy Edge Function (5 min)

- [ ] Instalei Supabase CLI: `npm install -g supabase`
- [ ] Rodei: `supabase login`
- [ ] Peguei Project Ref (Settings → General)
- [ ] Rodei: `supabase link --project-ref [SEU-REF]`
- [ ] Rodei: `supabase functions deploy nathia-chat`
- [ ] Deploy completou com sucesso
- [ ] Verifiquei no Dashboard (Edge Functions → nathia-chat deployed)

---

## 📋 PARTE 6: TESTE FINAL

### Passo 8: Rodar App (2 min)

- [ ] Rodei `npm run check` (tudo ✅?)
- [ ] Rodei `npm start`
- [ ] App iniciou sem erros
- [ ] Escaneei QR Code
- [ ] App abriu no dispositivo

### Passo 9: Testar Funcionalidades (5 min)

- [ ] Onboarding apareceu
- [ ] Completei cadastro (7 etapas)
- [ ] Home screen carregou
- [ ] Gerei plano diário (botão funcionou)
- [ ] Abri Chat (aba Chat)
- [ ] Enviei mensagem para NathIA
- [ ] Recebi resposta da IA
- [ ] Abri Hábitos (aba Hábitos)
- [ ] Marquei um hábito
- [ ] Abri Conteúdos (aba Conteúdos)
- [ ] Visualizei lista de artigos

---

## 🎉 PARABÉNS!

Se marcou tudo acima: **APP FUNCIONAL!** 🚀

---

## 📊 PROGRESSO

Conte quantos checkboxes marcou:

- **0-10:** Ainda na preparação
- **11-20:** Configuração em andamento
- **21-30:** Quase lá!
- **31-35:** APP FUNCIONAL! 🎉

---

## 🆘 AJUDA

**Se algo não funcionou:**

1. Veja qual passo travou
2. Leia `COMO-DEIXAR-APP-FUNCIONAL.md` → seção "Problemas Comuns"
3. Me chame com:
   - Qual passo travou
   - Mensagem de erro
   - Screenshot se possível

---

## 🔁 VERIFICAÇÃO RÁPIDA

**Rode a qualquer momento:**

```bash
npm run check
```

Este comando mostra o que está OK e o que falta.

---

## 📱 COMANDOS ÚTEIS

```bash
# Verificar status
npm run check

# Rodar app
npm start

# Android
npm run android

# iOS
npm run ios

# Parar app
Ctrl + C
```

---

## 📚 DOCUMENTAÇÃO

| Se precisar de... | Leia... |
|-------------------|---------|
| Passo-a-passo detalhado | `COMO-DEIXAR-APP-FUNCIONAL.md` |
| Visão geral do status | `STATUS-APP.md` |
| Início rápido | `INICIO-RAPIDO.md` |
| Solução de problemas | `COMO-DEIXAR-APP-FUNCIONAL.md` → Problemas Comuns |

---

**Bom trabalho! 🚀**

*Imprima ou salve este checklist para acompanhar seu progresso.*
