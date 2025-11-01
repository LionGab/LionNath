# 🔧 Configuração Completa de MCP Servers

Este documento explica todos os MCP (Model Context Protocol) servers configurados no projeto **Nossa Maternidade**.

## 📋 Visão Geral

O arquivo `.vscode/mcp.json` contém **15 servidores MCP** configurados para auxiliar no desenvolvimento:

## 🤖 Servidores MCP Configurados

### 1. GitHub MCP Server ✅

**Tipo**: HTTP (Remoto)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"github": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/readonly",
  "tools": ["*"]
}
```

**Ferramentas disponíveis**:
- Acesso read-only a repositórios
- Visualizar issues e pull requests
- Buscar código no GitHub
- Acessar discussions

**Uso**: O Cursor pode acessar informações do repositório GitHub diretamente.

---

### 2. Filesystem MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"filesystem": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "${workspaceFolder}"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- `read_file`: Ler arquivos do projeto
- `list_directory`: Listar diretórios
- `search_files`: Buscar arquivos por padrão

**Uso**: Permite ao Cursor ler e navegar arquivos do projeto de forma segura.

---

### 3. PostgreSQL MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Requer configuração  
**Configuração**: Adicionar connection string do Supabase

```json
"postgres": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres"
  ],
  "env": {
    "POSTGRES_CONNECTION_STRING": ""
  }
}
```

**Como configurar**:

1. Obter connection string do Supabase:
   - Acesse https://supabase.com/dashboard
   - Vá em Settings → Database
   - Copie a connection string (modo "URI" ou "Connection Pooling")
   - Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "POSTGRES_CONNECTION_STRING": "postgresql://postgres:senha@db.xxxxx.supabase.co:5432/postgres"
   }
   ```

**Ferramentas disponíveis**:
- Executar queries SQL no banco Supabase
- Visualizar schema do banco
- Analisar tabelas e relacionamentos

**Uso**: Permite ao Cursor consultar diretamente o banco de dados Supabase do projeto.

---

### 4. SQLite MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"sqlite": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-sqlite",
    "${workspaceFolder}/local.db"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- Criar e gerenciar banco SQLite local
- Executar queries SQLite
- Útil para testes locais

**Uso**: Banco de dados local para desenvolvimento e testes, sem precisar do Supabase.

---

### 5. Brave Search MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Opcional - requer API key  
**Configuração**: Adicionar chave de API

```json
"brave-search": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-brave-search"
  ],
  "env": {
    "BRAVE_API_KEY": ""
  }
}
```

**Como configurar**:

1. Obter API key:
   - Acesse https://brave.com/search/api/
   - Crie uma conta (se necessário)
   - Gere uma API key

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "BRAVE_API_KEY": "sua-chave-api-aqui"
   }
   ```

**Ferramentas disponíveis**:
- Buscar informações na web
- Obter resultados de busca atualizados
- Pesquisar documentação e soluções

**Uso**: Permite ao Cursor buscar informações na web quando necessário.

---

### 6. Sentry MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Opcional - requer configuração  
**Configuração**: Adicionar tokens do Sentry

```json
"sentry": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-sentry"
  ],
  "env": {
    "SENTRY_AUTH_TOKEN": "",
    "SENTRY_ORG": "",
    "SENTRY_PROJECT": ""
  }
}
```

**Como configurar**:

1. Obter Auth Token do Sentry:
   - Acesse https://sentry.io/settings/account/api/auth-tokens/
   - Crie um novo token com permissões: `org:read`, `project:read`
   - Anote seu Organization slug e Project slug

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "SENTRY_AUTH_TOKEN": "sua-auth-token",
     "SENTRY_ORG": "sua-org-slug",
     "SENTRY_PROJECT": "seu-project-slug"
   }
   ```

**Ferramentas disponíveis**:
- Visualizar issues de erro
- Analisar stack traces
- Ver estatísticas de erros
- Buscar eventos relacionados

**Uso**: Permite ao Cursor acessar informações de erros e exceções do Sentry.

---

### 7. Puppeteer MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"puppeteer": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-puppeteer"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- Automação de browser
- Web scraping
- Screenshots de páginas
- Testes end-to-end

**Uso**: Útil para testes automatizados e scraping de dados.

---

### 8. Fetch MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"fetch": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-fetch"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- Fazer requisições HTTP
- Testar APIs REST
- Consumir webhooks
- Validar endpoints

**Uso**: Permite ao Cursor fazer requisições HTTP para testar APIs do projeto.

---

### 9. Git MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"git": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-git"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- Visualizar status do Git
- Ver histórico de commits
- Analisar diffs
- Verificar branches

**Uso**: Permite ao Cursor entender o estado atual do repositório Git.

---

### 10. Memory MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"memory": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-memory"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- Armazenar informações entre sessões
- Manter contexto de conversas anteriores
- Lembrar preferências e configurações

**Uso**: Permite ao Cursor manter memória contextual entre diferentes interações.

---

### 11. Linear MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Opcional - requer API key  
**Configuração**: Adicionar chave de API do Linear

```json
"linear": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-linear"
  ],
  "env": {
    "LINEAR_API_KEY": ""
  }
}
```

**Como configurar**:

1. Obter API key do Linear:
   - Acesse https://linear.app/settings/api
   - Crie uma Personal API key
   - Copie a chave

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "LINEAR_API_KEY": "sua-chave-api"
   }
   ```

**Ferramentas disponíveis**:
- Visualizar issues do Linear
- Criar e atualizar issues
- Buscar por projetos e times
- Ver roadmap

**Uso**: Permite ao Cursor integrar com o gerenciamento de tarefas Linear.

---

### 12. Slack MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Opcional - requer configuração  
**Configuração**: Adicionar tokens do Slack

```json
"slack": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-slack"
  ],
  "env": {
    "SLACK_BOT_TOKEN": "",
    "SLACK_TEAM_ID": ""
  }
}
```

**Como configurar**:

1. Criar Slack App:
   - Acesse https://api.slack.com/apps
   - Crie um novo app
   - Adicione scopes: `channels:read`, `chat:write`, `users:read`
   - Instale o app no seu workspace
   - Copie o Bot Token e Team ID

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "SLACK_BOT_TOKEN": "xoxb-seu-token",
     "SLACK_TEAM_ID": "T1234567890"
   }
   ```

**Ferramentas disponíveis**:
- Enviar mensagens no Slack
- Ler mensagens de canais
- Buscar usuários e canais
- Postar atualizações

**Uso**: Permite ao Cursor enviar notificações e interagir com o Slack.

---

### 13. Notion MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Opcional - requer API key  
**Configuração**: Adicionar chave de API do Notion

```json
"notion": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-notion"
  ],
  "env": {
    "NOTION_API_KEY": ""
  }
}
```

**Como configurar**:

1. Obter API key do Notion:
   - Acesse https://www.notion.so/my-integrations
   - Crie uma nova integração
   - Copie o Internal Integration Token
   - Compartilhe páginas/databases com a integração

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "NOTION_API_KEY": "secret_seu-token"
   }
   ```

**Ferramentas disponíveis**:
- Ler páginas do Notion
- Criar e atualizar páginas
- Buscar em databases
- Adicionar conteúdo

**Uso**: Permite ao Cursor acessar e atualizar documentação no Notion.

---

### 14. Google Drive MCP Server ⚙️

**Tipo**: Local (stdio)  
**Status**: Opcional - requer configuração  
**Configuração**: Adicionar credenciais OAuth

```json
"google-drive": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-google-drive"
  ],
  "env": {
    "GOOGLE_DRIVE_CREDENTIALS": ""
  }
}
```

**Como configurar**:

1. Criar credenciais OAuth:
   - Acesse https://console.cloud.google.com/
   - Crie um projeto ou selecione existente
   - Habilite Google Drive API
   - Crie credenciais OAuth 2.0
   - Baixe o arquivo JSON de credenciais

2. Editar `.vscode/mcp.json`:
   ```json
   "env": {
     "GOOGLE_DRIVE_CREDENTIALS": "{\"type\":\"service_account\",...}"
   }
   ```

**Ferramentas disponíveis**:
- Listar arquivos do Google Drive
- Ler conteúdo de arquivos
- Criar e atualizar arquivos
- Buscar arquivos

**Uso**: Permite ao Cursor acessar arquivos e documentos do Google Drive.

---

### 15. EverArt MCP Server ✅

**Tipo**: Local (stdio)  
**Status**: Funciona imediatamente  
**Configuração**: Nenhuma necessária

```json
"everart": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-everart"
  ],
  "env": {}
}
```

**Ferramentas disponíveis**:
- Gerar imagens com IA
- Criar arte digital
- Editar imagens

**Uso**: Permite ao Cursor gerar imagens e arte com IA quando necessário.

---

## ⚙️ Configuração Recomendada para Supabase

Para usar o PostgreSQL MCP Server com Supabase:

### Opção 1: Connection String Direta

1. No Supabase Dashboard:
   - Settings → Database
   - Scroll até "Connection string"
   - Escolha "URI" mode
   - Copie a string

2. Adicione ao `.vscode/mcp.json`:
   ```json
   "postgres": {
     "env": {
       "POSTGRES_CONNECTION_STRING": "postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
     }
   }
   ```

### Opção 2: Connection Pooling (Recomendado)

Para melhor performance em desenvolvimento:

```json
"POSTGRES_CONNECTION_STRING": "postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## ✅ Checklist de Configuração

### Servidores que Funcionam Imediatamente (7):
- [x] GitHub MCP
- [x] Filesystem MCP
- [x] SQLite MCP
- [x] Puppeteer MCP
- [x] Fetch MCP
- [x] Git MCP
- [x] Memory MCP
- [x] EverArt MCP

### Servidores que Requerem Configuração (7):
- [ ] PostgreSQL MCP (adicionar connection string do Supabase)
- [ ] Brave Search MCP (adicionar API key - opcional)
- [ ] Sentry MCP (adicionar tokens - opcional)
- [ ] Linear MCP (adicionar API key - opcional)
- [ ] Slack MCP (adicionar tokens - opcional)
- [ ] Notion MCP (adicionar API key - opcional)
- [ ] Google Drive MCP (adicionar credenciais - opcional)

---

## 🚀 Como Testar os MCPs

### Teste Básico
1. Reinicie o Cursor completamente
2. Abra o chat do Cursor
3. Teste cada MCP:

**GitHub:**
```
Liste os últimos commits deste repositório
```

**Filesystem:**
```
Leia o arquivo package.json
```

**Git:**
```
Qual é o status atual do Git?
```

**PostgreSQL (se configurado):**
```
Liste as tabelas do banco de dados Supabase
```

**Sentry (se configurado):**
```
Mostre os últimos erros do Sentry
```

---

## 🔒 Segurança

### ⚠️ Importante

1. **Nunca commite** o arquivo `.vscode/mcp.json` com credenciais preenchidas
2. Use variáveis de ambiente para secrets
3. Adicione `.vscode/mcp.json` ao `.gitignore` se necessário
4. Ou use placeholders no repo e documente a configuração local

### Exemplo de .gitignore

```
# MCP config local (com secrets)
.vscode/mcp.local.json

# Manter apenas template no repo
.vscode/mcp.json.example
```

---

## 📚 Recursos Adicionais

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Servers Directory](https://github.com/modelcontextprotocol/servers)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Cursor MCP Documentation](https://cursor.sh/docs)

---

## 🐛 Troubleshooting

### MCP não inicia
- Verifique se Node.js está instalado: `node --version`
- Verifique se npx está disponível: `npx --version`
- Reinicie o Cursor completamente

### PostgreSQL não conecta
- Verifique se a connection string está correta
- Teste a conexão com psql ou outro cliente
- Verifique se o IP não está bloqueado no Supabase (Settings → Database → Connection Pooling)

### Brave Search não funciona
- Verifique se a API key está válida
- Teste a API key manualmente

### Sentry não funciona
- Verifique se os tokens estão corretos
- Confirme que o Organization e Project slugs estão corretos
- Verifique as permissões do token

---

**Última atualização**: Janeiro 2025  
**Versão**: 2.0.0  
**Total de Servidores**: 15
