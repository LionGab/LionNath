# 💡 COMO USAR O SISTEMA DE MEMÓRIA

## 🎯 O QUE É ISSO?

Sistema de "memória artificial" para o Claude manter contexto entre sessões.

---

## 🚀 USO BÁSICO

### **Nova Sessão:**

Diga ao Claude:

```
"Leia a memória"
```

Ou:

```
"Carrega o contexto de .claude/memory/"
```

Claude lê automaticamente e sabe:

- O que foi feito
- O que está pendente
- Próximos passos

---

### **Ver Status Rápido:**

```bash
cat .claude/memory/RESUMO-ULTRA-COMPACTO.md
```

Mostra:

- Score geral
- Problemas críticos
- Próximas ações

---

### **Ver Checklist Atual:**

```bash
cat .claude/memory/checklists/phase-1.md
```

---

### **Executar Scripts:**

```bash
# Correção de API keys
bash .claude/memory/scripts/fix-api-keys.sh

# SQL para banco (copiar e colar no Supabase)
cat .claude/memory/scripts/fix-database.sql
```

---

## 🔄 QUANDO COMPACTAR

**Compactar contexto quando:**

- Conversa muito longa (>100 mensagens)
- Claude avisa que está perto do limite
- Quer "resetar" e começar limpo

**Como:**

```
"Compacta o contexto agora"
```

Claude salva tudo e continua só com essencial.

---

## 📊 ARQUIVOS IMPORTANTES

| Arquivo                    | Quando Usar        |
| -------------------------- | ------------------ |
| `RESUMO-ULTRA-COMPACTO.md` | Visão geral rápida |
| `session-context.md`       | Contexto detalhado |
| `priority-actions.md`      | O que fazer agora  |
| `checklists/phase-1.md`    | Checklist atual    |
| `scripts/*.sh`             | Scripts prontos    |

---

## ✅ EXEMPLO DE USO

**Cenário:** Você fechou o computador e voltou no dia seguinte.

1. Abre o projeto
2. Inicia conversa com Claude
3. Diz: "Leia a memória"
4. Claude responde: "✅ Contexto carregado! Você estava na Fase 1, faltam 3 itens..."
5. Continue de onde parou!

---

**Sistema funciona 100% via arquivos - persiste entre sessões!**
