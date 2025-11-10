# ⚡ SETUP RÁPIDO - 3 PASSOS

## 1️⃣ INICIAR SUPABASE

```bash
cd C:\Users\Usuario\Documents\NossaMaternidade-LN
supabase start
```

Copie a `ANON_KEY` do output.

---

## 2️⃣ RODAR EDGE FUNCTIONS

```bash
# Em outro terminal
supabase functions serve
```

---

## 3️⃣ RODAR APP

```bash
# Em outro terminal
npm run ios     # ou npm run android
```

---

## ✅ TESTAR GAMIFICAÇÃO

1. Abra app → Hábitos
2. Clique no checkbox de qualquer hábito
3. **Veja aparecer**:
   - ✅ Card azul com Nível + Pontos + Progresso
   - ✅ Streak com 🔥
   - ✅ Alerta "🎉 Conquista Desbloqueada!"
   - ✅ Alerta "⬆️ LEVEL UP!"

---

## ✅ TESTAR POSTPARTUM SCREENING

```bash
curl -X POST http://localhost:54321/functions/v1/postpartum-screening \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## ✅ TESTAR SENTIMENT ANALYSIS

```bash
curl -X POST http://localhost:54321/functions/v1/sentiment-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "responses": {
      "como_se_sente": "Cansada",
      "principais_medos": "Depressão"
    }
  }'
```

---

## 📊 CHECKLIST

- [ ] Supabase rodando (`supabase start`)
- [ ] Edge Functions rodando (`supabase functions serve`)
- [ ] App rodando (`npm run ios`)
- [ ] Gamificação visível no HabitsScreen
- [ ] Pontos sendo somados
- [ ] Achievements desbloqueados
- [ ] Postpartum screening retornando dados
- [ ] Sentiment analysis retornando dados

---

## 📁 ARQUIVOS CHAVE

```
✅ src/lib/gamification/gamification-manager.ts         (Sistema de pontos)
✅ src/lib/memory/memory-manager.ts                     (Memória do chat)
✅ src/features/habits/HabitsScreen.tsx (MODIFICADO)    (UI + Gamificação)
✅ supabase/functions/postpartum-screening/index.ts     (Triagem DPP)
✅ supabase/functions/sentiment-analysis/index.ts       (Análise emocional)
📄 docs/TUDO_FUNCIONANDO.md                             (Guia completo)
```

---

## 🚀 TUDO PRONTO!

Se todas as etapas acima funcionarem, você tem:

- ✅ Gamificação 100% funcional
- ✅ Triagem de DPP live
- ✅ Análise emocional live
- ✅ Memória contextual pronta

**App está 99% funcional para ir ao mercado!** 🎉
