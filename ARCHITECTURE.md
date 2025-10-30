# LionNath Architecture & Integration Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Developer Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Local Development         GitHub Repository      Copilot Agent│
│  ┌──────────────────┐    ┌──────────────────┐   ┌────────────┐│
│  │   VS Code IDE    │    │   GitHub Repo    │   │ Copilot    ││
│  │  + Extensions    │───→│  + Workflows     │──→│ Coding     ││
│  │  + MCP Config    │    │  + MCP Config    │   │ Agent      ││
│  └──────────────────┘    └──────────────────┘   └────────────┘│
│         │                        │                     │        │
│         └────────────────────────┼─────────────────────┘        │
│                                  │                              │
│                          Commits & PRs                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 MCP Server Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Copilot                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MCP Server Configuration (JSON)             │   │
│  │                                                     │   │
│  │  {                                                  │   │
│  │    "mcpServers": {                                  │   │
│  │      "github": { ... },                             │   │
│  │      "sentry": { ... },                             │   │
│  │      "filesystem": { ... }                          │   │
│  │    }                                                │   │
│  │  }                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│              │              │              │                 │
│              ▼              ▼              ▼                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│  │  GitHub MCP      │ │  Sentry MCP      │ │ Filesystem   │ │
│  │  Server          │ │  Server          │ │ MCP Server   │ │
│  │                  │ │                  │ │              │ │
│  │ • Repository     │ │ • Exceptions     │ │ • Read Files │ │
│  │ • Issues         │ │ • Error Details  │ │ • List Dirs  │ │
│  │ • PRs            │ │ • Stack Traces   │ │ • Search     │ │
│  └──────────────────┘ └──────────────────┘ └──────────────┘ │
│              │              │              │                 │
└──────────────┼──────────────┼──────────────┼─────────────────┘
               ▼              ▼              ▼
          External Services (GitHub, Sentry, Filesystem)
```

## 🔐 Security & Secret Management

```
┌─────────────────────────────────────────────┐
│     GitHub Repository Settings              │
├─────────────────────────────────────────────┤
│                                             │
│  Environment: "copilot"                     │
│  ┌───────────────────────────────────────┐  │
│  │    Environment Secrets                │  │
│  │    (COPILOT_MCP_ prefix required)     │  │
│  │                                       │  │
│  │  • COPILOT_MCP_GITHUB_TOKEN    ──┐   │  │
│  │  • COPILOT_MCP_SENTRY_TOKEN    ──┼──→│  │
│  │  • COPILOT_MCP_API_KEY         ──┘   │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                  │                          │
│                  ▼                          │
│  MCP Configuration (JSON)                  │
│  References secrets in "env" object        │
│                                             │
│  Example:                                   │
│  "env": {                                   │
│    "TOKEN": "COPILOT_MCP_GITHUB_TOKEN"     │
│  }                                          │
└─────────────────────────────────────────────┘
```

## 📦 Configuration File Hierarchy

```
LionNath/
│
├── .vscode/
│   ├── settings.json           (Editor settings - shared)
│   ├── extensions.json         (Recommended extensions)
│   ├── launch.json             (Debug configurations)
│   └── mcp.json                (Local MCP servers)
│
├── .github/
│   ├── workflows/
│   │   └── copilot-setup-steps.yml  (Setup for Copilot agent)
│   │
│   └── (MCP configuration)     (In GitHub Settings UI)
│
├── .env.example                (Template for environment vars)
├── .gitignore                  (Git ignore rules)
│
└── Documentation/
    ├── CONFIGURATION_SUMMARY.md
    ├── MCP_SETUP.md
    ├── VSCODE_BEST_PRACTICES.md
    ├── QUICK_REFERENCE.md
    └── ARCHITECTURE.md (this file)
```

## 🔄 Development Workflow

```
┌─────────────────────────────────────────────────────┐
│              Developer Daily Workflow               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Start Development                              │
│     npm install                                     │
│     cp .env.example .env                            │
│     (Configure environment variables)               │
│                                                     │
│  2. Code with Copilot                              │
│     • Copilot Chat: Ctrl+Shift+I                   │
│     • Code completion: Tab                         │
│     • Inline suggestions                           │
│                                                     │
│  3. Automatic Code Quality                         │
│     • Format on save (Prettier)                    │
│     • Lint on save (ESLint)                        │
│     • Type check (TypeScript)                      │
│                                                     │
│  4. Manual Quality Checks                          │
│     npm run lint                                    │
│     npm run type-check                             │
│     npm run build                                   │
│                                                     │
│  5. Commit & Push                                  │
│     git add .                                       │
│     git commit -m "feat: description"              │
│     git push origin feature/branch-name            │
│                                                     │
│  6. Create Pull Request                            │
│     • GitHub UI → Create PR                        │
│     • Assign to Copilot (optional)                 │
│     • Get code review                              │
│                                                     │
│  7. Copilot Coding Agent (Optional)                │
│     • Assign issue to Copilot                      │
│     • Copilot accesses MCP servers                 │
│     • Automatic code generation                    │
│     • Creates PR with changes                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📊 MCP Server Capabilities

```
┌───────────────────────────────────────────────────┐
│         MCP Server Capabilities Matrix            │
├───────────────────────────────────────────────────┤
│                                                   │
│ GitHub MCP Server                                 │
│ ├─ Type: HTTP (Remote)                           │
│ ├─ Authentication: Personal Access Token         │
│ ├─ Tools:                                         │
│ │  ├─ get_repository_info                        │
│ │  ├─ search_issues                              │
│ │  ├─ get_pull_request                           │
│ │  ├─ list_commits                               │
│ │  └─ ... (read-only)                            │
│ └─ Risk Level: ✅ Low (read-only)                 │
│                                                   │
│ Sentry MCP Server                                 │
│ ├─ Type: Local                                    │
│ ├─ Authentication: Sentry API Token              │
│ ├─ Tools:                                         │
│ │  ├─ get_issue_details                          │
│ │  ├─ get_issue_summary                          │
│ │  ├─ list_errors                                │
│ │  └─ ... (error analysis)                       │
│ └─ Risk Level: ✅ Low (read-only)                 │
│                                                   │
│ Filesystem MCP Server                             │
│ ├─ Type: Local                                    │
│ ├─ Authentication: N/A                           │
│ ├─ Tools:                                         │
│ │  ├─ read_file                                  │
│ │  ├─ list_directory                             │
│ │  ├─ search_files                               │
│ │  └─ ... (safe operations only)                 │
│ └─ Risk Level: ⚠️  Medium (use whitelists)        │
│                                                   │
└───────────────────────────────────────────────────┘
```

## 🚀 Deployment Flow

```
┌──────────────────────────────────────────────────┐
│         GitHub Actions Deployment Flow           │
├──────────────────────────────────────────────────┤
│                                                  │
│  Push to Repository                              │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ copilot-setup-steps.yml Triggered        │   │
│  │ (workflow_dispatch)                      │   │
│  └──────────────────────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ Setup Environment                        │   │
│  │ • Node.js 18 installed                   │   │
│  │ • Dependencies cached/installed          │   │
│  └──────────────────────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ Verification Steps                       │   │
│  │ • npm install                            │   │
│  │ • npm run build                          │   │
│  │ • (Optional) npm run test               │   │
│  └──────────────────────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ Load MCP Servers                         │   │
│  │ • Initialize configured MCP servers     │   │
│  │ • Verify tool availability              │   │
│  │ • Ready for Copilot agent               │   │
│  └──────────────────────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ✅ Ready for Copilot Coding Agent              │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 🔑 Key Components Explained

### VS Code Configuration

- **Centralized Settings:** Team uses same formatting, linting rules
- **Extensions:** Recommended for consistency across developers
- **Launch Config:** Debug configurations for local development
- **MCP Config:** Local MCP servers during development

### GitHub Integration

- **Workflows:** Automated setup and verification
- **Secrets Management:** Secure credential handling
- **Environments:** Separate staging for Copilot
- **MCP Configuration:** Server definitions in repository settings

### Security Layers

1. **Secret Prefix:** `COPILOT_MCP_` ensures only MCP secrets are used
2. **Read-Only Access:** Tools limited to necessary permissions
3. **Environment Isolation:** Separate `copilot` environment
4. **Audit Trail:** GitHub logs all Copilot actions

## 🎓 Learning Path

```
Step 1: Quick Start (5 min)
└─→ QUICK_REFERENCE.md

Step 2: VS Code Setup (10 min)
└─→ VSCODE_BEST_PRACTICES.md

Step 3: MCP Configuration (20 min)
└─→ MCP_SETUP.md

Step 4: Full Understanding (30 min)
└─→ CONFIGURATION_SUMMARY.md

Step 5: Advanced Topics (ongoing)
└─→ GitHub Copilot Docs & MCP Protocol Docs
```

---

**Document Type:** Architecture & Integration Guide  
**Last Updated:** October 30, 2025  
**Audience:** Developers, Team Leads, Architects
