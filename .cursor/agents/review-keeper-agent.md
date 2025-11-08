# 🤖 Review Keeper Agent

Agente responsável por aprovar automaticamente todas as mudanças listadas em `Review Next Change`, sempre escolhendo a opção **Keep**.

## ✅ O que ele faz

- Regrava `.cursor/auto-approve-config.json` garantindo `keep_all`.
- Lê `.cursor/review-logs/pending-approvals.json`.
- Para cada item loga a decisão `keep` em `review-YYYY-MM-DD.json`.
- Limpa a fila de aprovações pendentes.

## ▶️ Como executar

```
pnpm review:keep
```

## 📝 Logs gerados

```
.cursor/review-logs/review-AAAA-MM-DD.json
```

Cada entrada fica assim:

```
{
  "timestamp": "...",
  "agent_id": "auto-approver",
  "action": "<acao>",
  "file": "<arquivo ou null>",
  "severity": "<nivel ou null>",
  "result": "auto_approved",
  "approval_id": "<id>",
  "approved_by": "review-keeper-agent",
  "approved_at": "...",
  "decision": "keep"
}
```

## 🛑 Pré-requisitos

- Node + pnpm instalados (já no projeto).
- Permissões de escrita em `.cursor/review-logs/`.
