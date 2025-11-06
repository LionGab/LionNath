# 🎯 Recomendações de Agents e MCP para Nossa Maternidade

## 📊 Resumo do Projeto

- **Tipo:** React Native/Expo (monorepo)
- **Backend:** Supabase
- **Error Tracking:** Sentry
- **Pagamentos:** Stripe
- **IA:** NAT-AI (proprietário)
- **Linguagem:** TypeScript

---

## 🤖 Agents Recomendados

### 1. **Cursor Composer** ⭐ (Principal)
**Prioridade:** 🔴 Alta

**Por quê:**
- Melhor integração com código existente
- Entende React Native/Expo profundamente
- Suporta TypeScript nativamente
- Auto-complete inteligente

**Configuração:**
```json
{
  "agents": {
    "composer": {
      "enabled": true,
      "context": ["src/**/*", "apps/**/*"],
      "rules": [".cursorrules"]
    }
  }
}
```

**Uso:**
- ✅ Refatoração de código
- ✅ Implementação de features
- ✅ Correção de bugs
- ✅ Otimização de performance

---

### 2. **GitHub Copilot** ⭐⭐
**Prioridade:** 🟡 Média

**Por quê:**
- Integração com GitHub Issues/PRs
- Suporte a MCP configurado
- Automação via GitHub Actions

**Configuração:**
- Já configurado em `MCP_SETUP.md`
- Ambiente `copilot` no GitHub Settings
- Secrets com prefixo `COPILOT_MCP_`

**Uso:**
- ✅ Automação de tarefas repetitivas
- ✅ Code review automático
- ✅ Geração de PRs

---

### 3. **Aider** (CLI)
**Prioridade:** 🟢 Baixa

**Por quê:**
- Ferramenta CLI pura
- Bom para edições rápidas via terminal
- Não requer configuração complexa

**Uso:**
- ✅ Edições rápidas via terminal
- ✅ Scripts de automação

---

## 🔌 MCP Servers Recomendados

### 1. **GitHub MCP** ⭐⭐⭐
**Prioridade:** 🔴 Alta - **ESSENCIAL**

**Configuração:**
```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/readonly",
    "tools": ["*"]
  }
}
```

**Ferramentas:**
- `get_repository_info` - Info do repo
- `search_issues` - Buscar issues
- `get_pull_request` - Detalhes de PRs
- `list_commits` - Histórico de commits

**Por quê:**
- Integração nativa com GitHub
- Acesso a issues/PRs
- Entendimento do contexto do projeto

**Status:** ✅ Já configurado (ver `MCP_SETUP.md`)

---

### 2. **Filesystem MCP** ⭐⭐⭐
**Prioridade:** 🔴 Alta - **ESSENCIAL**

**Configuração:**
```json
{
  "filesystem": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"],
    "env": {}
  }
}
```

**Ferramentas:**
- `read_file` - Ler arquivos
- `list_directory` - Listar diretórios
- `search_files` - Buscar arquivos

**Por quê:**
- Essencial para navegação do código
- Permite agents entenderem estrutura
- Leitura segura de arquivos

**Status:** ✅ Já configurado (ver `MCP_SETUP.md`)

---

### 3. **Supabase MCP** ⭐⭐
**Prioridade:** 🟡 Média - **RECOMENDADO**

**Configuração:**
```json
{
  "supabase": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server"],
    "env": {
      "SUPABASE_URL": "${EXPO_PUBLIC_SUPABASE_URL}",
      "SUPABASE_ANON_KEY": "${EXPO_PUBLIC_SUPABASE_ANON_KEY}",
      "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
    }
  }
}
```

**Ferramentas:**
- `query_database` - Query SQL
- `manage_migrations` - Gerenciar migrations
- `get_table_info` - Info de tabelas
- `run_function` - Executar Edge Functions

**Por quê:**
- Backend principal é Supabase
- Permite agents entenderem schema
- Facilita queries e migrations

**Status:** ⚠️ **NÃO CONFIGURADO** - Recomendado adicionar

**Instalação:**
```bash
# Verificar se existe package oficial
npm search @supabase/mcp-server

# Se não existir, criar custom MCP server
# Ou usar Supabase Management API diretamente
```

---

### 4. **Sentry MCP** ⭐⭐
**Prioridade:** 🟡 Média - **RECOMENDADO**

**Configuração:**
```json
{
  "sentry": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@sentry/mcp-server@latest"],
    "env": {
      "SENTRY_AUTH_TOKEN": "${SENTRY_ACCESS_TOKEN}",
      "SENTRY_ORG": "${SENTRY_ORG}",
      "SENTRY_PROJECT": "${SENTRY_PROJECT}"
    }
  }
}
```

**Ferramentas:**
- `get_issue_details` - Detalhes de erros
- `get_issue_summary` - Resumo de erros
- `list_errors` - Listar erros recentes
- `analyze_stack_trace` - Analisar stack traces

**Por quê:**
- Error tracking já configurado
- Permite agents entenderem bugs
- Facilita debugging

**Status:** ⚠️ **NÃO CONFIGURADO** - Recomendado adicionar

---

### 5. **Brave Search MCP** ⭐
**Prioridade:** 🟢 Baixa - **OPCIONAL**

**Configuração:**
```json
{
  "brave-search": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "${BRAVE_API_KEY}"
    }
  }
}
```

**Ferramentas:**
- `search_web` - Buscar na web

**Por quê:**
- Útil para pesquisar documentação
- Buscar soluções para problemas

**Status:** ✅ Já configurado (ver `MCP_SETUP.md`)

---

### 6. **PostgreSQL MCP** ⭐⭐
**Prioridade:** 🟡 Média - **RECOMENDADO**

**Configuração:**
```json
{
  "postgres": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "POSTGRES_CONNECTION_STRING": "${SUPABASE_DB_URL}"
    }
  }
}
```

**Ferramentas:**
- `query` - Executar queries SQL
- `get_tables` - Listar tabelas
- `describe_table` - Descrever tabela

**Por quê:**
- Supabase usa PostgreSQL
- Permite agents entenderem schema
- Facilita queries complexas

**Status:** ⚠️ **NÃO CONFIGURADO** - Recomendado adicionar

**Nota:** Requer connection string do Supabase (não usar anon key, usar direct connection)

---

### 7. **SQLite MCP** (Local Dev)
**Prioridade:** 🟢 Baixa - **OPCIONAL**

**Configuração:**
```json
{
  "sqlite": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sqlite"],
    "env": {
      "SQLITE_DB_PATH": "./local.db"
    }
  }
}
```

**Por quê:**
- Útil para testes locais
- Mock de banco de dados

**Status:** ⚠️ **NÃO CONFIGURADO** - Opcional

---

## 📋 Configuração Completa Recomendada

### `.vscode/mcp.json` (Cursor) ✅ CRIADO

**Arquivo criado em:** `.vscode/mcp.json`

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/readonly",
      "tools": ["*"]
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"],
      "env": {}
    },
    "git": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "${workspaceFolder}"],
      "env": {}
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${SUPABASE_DB_URL}"
      }
    },
    "brave-search": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**Nota:** Sentry MCP não incluído porque não há package oficial disponível ainda. Considere usar Sentry API diretamente ou aguardar release oficial.

---

## 🔐 Variáveis de Ambiente Necessárias

### `.env.example` (adicionar)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Sentry
SENTRY_ACCESS_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Brave Search (opcional)
BRAVE_API_KEY=
```

---

## 📊 Priorização por Tipo de Trabalho

### 🐛 **Debugging & Error Fixing**
1. **Sentry MCP** - Ver erros em produção
2. **Filesystem MCP** - Navegar código
3. **GitHub MCP** - Ver histórico de bugs

### 🚀 **Feature Development**
1. **Filesystem MCP** - Entender estrutura
2. **GitHub MCP** - Ver issues relacionadas
3. **PostgreSQL MCP** - Entender schema

### 🔧 **Database Work**
1. **PostgreSQL MCP** - Query direto
2. **Supabase MCP** (se disponível) - Gerenciar migrations
3. **Filesystem MCP** - Ver arquivos SQL

### 📝 **Code Review**
1. **GitHub MCP** - Ver PRs e diffs
2. **Filesystem MCP** - Ver código

### 🧪 **Testing**
1. **Filesystem MCP** - Ver testes
2. **PostgreSQL MCP** - Setup de test DB

---

## ✅ Checklist de Implementação

### Alta Prioridade (Essencial)
- [x] GitHub MCP - ✅ Configurado em `.vscode/mcp.json`
- [x] Filesystem MCP - ✅ Configurado em `.vscode/mcp.json`
- [x] Git MCP - ✅ Configurado em `.vscode/mcp.json`
- [x] PostgreSQL MCP - ✅ Configurado em `.vscode/mcp.json` (requer `SUPABASE_DB_URL`)

### Média Prioridade (Recomendado)
- [ ] Sentry MCP - ⚠️ **VERIFICAR DISPONIBILIDADE** (package pode não existir ainda)
- [ ] Supabase MCP (se disponível) - ⚠️ **VERIFICAR**

### Baixa Prioridade (Opcional)
- [x] Brave Search MCP - ✅ Configurado em `.vscode/mcp.json` (requer `BRAVE_API_KEY`)
- [ ] SQLite MCP (local dev) - ⚠️ Opcional

---

## 🚀 Próximos Passos

1. **✅ Configurar PostgreSQL MCP** (JÁ FEITO)
   ```bash
   # Verificar se package existe
   npm search @modelcontextprotocol/server-postgres
   
   # Adicionar SUPABASE_DB_URL ao .env
   # Formato: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

2. **Verificar Sentry MCP**
   ```bash
   # Verificar disponibilidade
   npm search @sentry/mcp-server
   
   # Se não existir, usar Sentry API diretamente via scripts
   # Ou aguardar release oficial
   ```

3. **Verificar Supabase MCP**
   ```bash
   # Verificar se existe package oficial
   npm search @supabase/mcp-server
   
   # Se não existir, PostgreSQL MCP já cobre as necessidades
   ```

4. **Configurar Variáveis de Ambiente**
   ```bash
   # Adicionar ao .env.local ou .env
   SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   BRAVE_API_KEY=your-key-here  # Opcional
   ```

---

## 📚 Recursos

- [MCP Specification](https://modelcontextprotocol.io)
- [Cursor MCP Docs](https://cursor.sh/docs)
- [GitHub Copilot MCP](https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol)
- [Supabase Management API](https://supabase.com/docs/guides/api)
- [Sentry API](https://docs.sentry.io/api/)

---

**Última atualização:** Janeiro 2025  
**Status:** Análise completa do repositório
