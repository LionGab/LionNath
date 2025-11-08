# Plano de Migração LGPD-Compliant (VERSÃO AJUSTADA)

## Nossa Maternidade - Roadmap de Conformidade

**Versão**: 2.0 (Ajustada com feedback crítico)
**Data**: 30 de outubro de 2025
**Prazo Total**: 180 dias (6 meses)
**Investimento**: R$ 180.000 (ajustado para realidade SP)

---

## ⚠️ AJUSTES CRÍTICOS DESTA VERSÃO

### Mudanças em relação à v1.0:

1. **Fase 1 estendida**: 7 dias → **21 dias** (realista)
2. **Autenticação**: Anônima → **Email real com verificação simplificada**
3. **Migração retroativa**: Adicionado tratamento de dados pré-existentes
4. **Anonimização**: Total → **Pseudonimização reversível**
5. **Custos**: R$ 80k → **R$ 180k** (realista para SP)
6. **Testes**: Adicionados testes de conformidade antes de lançar
7. **Disclaimers médicos**: Adicionada seção específica

---

## 📊 FASE 1 - IMEDIATO (21 dias) - R$ 35.000

### Semana 1: Documentação Legal (7 dias)

**Responsável**: Advogado LGPD + Redator

#### 1.1 Política de Privacidade Completa

**Arquivo**: `docs/legal/politica-privacidade.md`
**Prazo**: 3 dias
**Custo**: R$ 15.000

**Conteúdo obrigatório**:

- [ ] Identificação do controlador (Nossa Maternidade)
- [ ] Contato do DPO: dpo@nossa-maternidade.com.br
- [ ] Lista completa de dados coletados (ver inventário)
- [ ] Finalidades de cada tratamento
- [ ] Bases legais (consentimento, legítimo interesse)
- [ ] **Seção destacada sobre dados sensíveis de saúde**
- [ ] Lista de terceiros processadores:
  - Anthropic (Claude) - EUA
  - OpenAI (GPT-4) - EUA
  - Supabase - EUA/UE
  - Stripe - EUA/Irlanda
- [ ] Mecanismo de transferência internacional (SCCs)
- [ ] Direitos dos titulares (Art. 18)
- [ ] Política de retenção (30 dias chat, 90 dias planos)
- [ ] Política de cookies (se aplicável)
- [ ] Como exercer direitos (formulário + email)
- [ ] Data de vigência e histórico de alterações

**Aprovação**: Escritório especializado em LGPD

#### 1.2 Termos de Uso

**Arquivo**: `docs/legal/termos-uso.md`
**Prazo**: 2 dias
**Custo**: R$ 5.000

**Conteúdo obrigatório**:

- [ ] **Disclaimer médico destacado**:
  > "Este aplicativo NÃO substitui consultas médicas profissionais. As informações fornecidas pela IA são de caráter informativo e educacional. Em caso de emergência, ligue 192 (SAMU) imediatamente."
- [ ] Limitações de responsabilidade
- [ ] Proibição de uso por menores de 18 anos sem responsável
- [ ] Suspensão de conta por violação
- [ ] Jurisdição: Foro de [Cidade], Brasil
- [ ] Lei aplicável: LGPD + CDC + Marco Civil

#### 1.3 Termo de Consentimento Específico

**Arquivo**: `docs/legal/termo-consentimento.md`
**Prazo**: 2 dias
**Custo**: R$ 3.000

**Formato**: Checkboxes separados com linguagem clara

```markdown
## TERMO DE CONSENTIMENTO - NOSSA MATERNIDADE

### 1. Dados Cadastrais Básicos (OBRIGATÓRIO)

[ ] Autorizo a coleta de: nome, email, data de cadastro
Finalidade: Identificação e comunicação
Base legal: Consentimento (Art. 7º, I)

### 2. Dados Sensíveis de Saúde (OBRIGATÓRIO PARA USO COMPLETO)

⚠️ ATENÇÃO: Dados sensíveis sob proteção especial (Art. 11, LGPD)

[ ] Autorizo a coleta de: - Status de maternidade (gestante/mãe/tentante) - Semana de gestação - Preferências de saúde - Histórico de conversas sobre saúde

Finalidade: Personalização de planos diários e respostas da IA
Base legal: Consentimento específico (Art. 11, §1º)
Retenção: 30 dias para chats, 90 dias para planos

### 3. Compartilhamento com Inteligências Artificiais (OPCIONAL)

[ ] Autorizo o envio de dados PSEUDONIMIZADOS para: - Anthropic Claude (EUA) - geração de respostas - OpenAI GPT-4 (EUA) - planos diários e conteúdo

⚠️ Transferência internacional com proteção:

- Dados anonimizados/pseudonimizados
- Cláusulas Contratuais Padrão (SCCs)
- Data Processing Agreements assinados

❌ Se você NEGAR este consentimento:

- Funcionalidades de IA avançada ficarão limitadas
- Planos diários serão templates genéricos
- Chat ficará desabilitado

### 4. Comunicações e Notificações (OPCIONAL)

[ ] Autorizo receber: - Emails sobre atualizações do app - Notificações push com dicas de saúde - Newsletter semanal

Você pode revogar a qualquer momento em Configurações.

---

**IMPORTANTE**: Você pode revogar qualquer consentimento a qualquer momento através de:

- Menu Perfil > Meus Dados > Gerenciar Consentimentos
- Email: dpo@nossa-maternidade.com.br

Li e compreendi os termos acima: [ ]
Data: **/**/\_\_\_\_
```

### Semana 2: Implementação de Consentimento (7 dias)

**Responsável**: Dev Frontend + Backend

#### 2.1 Criar ConsentScreen.tsx

**Arquivo**: `src/screens/ConsentScreen.tsx` (NOVO)
**Prazo**: 3 dias

**Features**:

- [ ] Scroll obrigatório (botão "Aceitar" só ativa após scroll completo)
- [ ] Checkboxes separados (conforme termo acima)
- [ ] Links inline para Política Completa e Termos
- [ ] Validação: checkboxes 1 e 2 obrigatórios
- [ ] Botão "Continuar sem IAs" (aceita 1 e 2, nega 3)
- [ ] Versão da política exibida (ex: v1.0 - 30/10/2025)

**Implementação**:

```typescript
// src/screens/ConsentScreen.tsx
import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, CheckBox } from 'react-native';

export default function ConsentScreen() {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [consents, setConsents] = useState({
    basic: false,
    healthData: false,
    aiSharing: false,
    communications: false,
  });

  const handleContinue = async () => {
    // Registrar consentimentos
    await saveConsents({
      user_id: userId,
      basic_data: consents.basic,
      health_data: consents.healthData,
      ai_sharing: consents.aiSharing,
      communications: consents.communications,
      policy_version: '1.0',
      timestamp: new Date(),
      ip_address: await getIPAddress(),
    });
  };

  // ...
}
```

#### 2.2 Criar Tabela user_consents

**Arquivo**: `supabase/migrations/003_user_consents.sql`
**Prazo**: 1 dia

```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL, -- 'basic_data', 'health_data', 'ai_sharing', 'communications'
  granted BOOLEAN NOT NULL,
  policy_version VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  revoked_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, consent_type, revoked_at)
);

-- RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 2.3 **AJUSTE: Autenticação com Email Real**

**Arquivo**: Atualizar `OnboardingScreen.tsx:84-87`
**Prazo**: 2 dias

**ANTES (ERRADO)**:

```typescript
const {
  data: { user },
} = await supabase.auth.signUp({
  email: `${Date.now()}@temp.com`, // ❌ Temporário
  password: `${Date.now()}-${Math.random()}`, // ❌ Inseguro
});
```

**DEPOIS (CORRETO)**:

```typescript
// Opção 1: Magic Link (Sem senha, link por email)
const { data, error } = await supabase.auth.signInWithOtp({
  email: userEmail, // Email real fornecido pelo usuário
  options: {
    emailRedirectTo: 'nossa-maternidade://onboarding-complete',
  },
});

// OU Opção 2: Email + Senha simples
const {
  data: { user },
} = await supabase.auth.signUp({
  email: userEmail,
  password: password, // Mínimo 8 caracteres, validado
  options: {
    data: {
      name: userName,
      type: userType, // gestante/mãe/tentante
    },
  },
});
```

**Nova tela**: `EmailVerificationScreen.tsx`

- Input de email com validação
- Opção: "Continuar com email" ou "Continuar sem conta" (limitado)

#### 2.4 Migração Retroativa de Usuários Existentes

**Arquivo**: `src/screens/RetroactiveConsentScreen.tsx` (NOVO)
**Prazo**: 1 dia

**Problema**: E se já houver usuários cadastrados com sistema antigo?

**Solução**:

```typescript
// Detectar usuários sem consentimento
const userNeedsConsent = await supabase.from('user_consents').select('id').eq('user_id', userId).single();

if (!userNeedsConsent) {
  // Exibir tela de consentimento retroativo
  navigation.navigate('RetroactiveConsent');
}
```

**Tela**:

```
⚠️ ATUALIZAÇÃO DE PRIVACIDADE

Atualizamos nossa Política de Privacidade para maior proteção dos seus dados de saúde.

Por favor, revise e forneça novo consentimento para continuar usando o app.

[Ver o que mudou]
[Ler Política Completa]

[ ] Aceito os novos termos
[ ] Autorizo uso de dados de saúde com as novas proteções

[Aceitar e Continuar]
[Excluir Minha Conta]
```

**Prazo para consentimento**: 30 dias

- Após 30 dias sem consentimento → conta suspensa
- Após 60 dias → dados excluídos automaticamente

### Semana 3: Segurança Crítica (7 dias)

**Responsável**: Dev Backend + DevOps

#### 3.1 Criptografar AsyncStorage

**Arquivo**: `src/services/secureStorage.ts` (NOVO)
**Prazo**: 2 dias

**Implementação**:

```bash
npm install expo-secure-store
```

```typescript
// src/services/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  // Para objetos JSON
  async setObject(key: string, value: object): Promise<void> {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },

  async getObject<T>(key: string): Promise<T | null> {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  },
};
```

**Migração de dados existentes**:

```typescript
// scripts/migrate-to-secure-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '../src/services/secureStorage';

async function migrate() {
  const keys = ['userProfile', 'userId', 'onboarded'];

  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      await secureStorage.setItem(key, value);
      await AsyncStorage.removeItem(key);
      console.log(`Migrated ${key}`);
    }
  }
}
```

**Substituir em todos os arquivos**:

- `OnboardingScreen.tsx:111`
- `useUserProfile.ts:29`
- `App.tsx:27`

#### 3.2 Implementar Logger Seguro

**Arquivo**: `src/utils/logger.ts` (NOVO)
**Prazo**: 1 dia

```typescript
// src/utils/logger.ts
import { __DEV__ } from 'react-native';

interface LogMetadata {
  userId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private sanitize(data: any): any {
    if (typeof data !== 'object') return data;

    const sensitive = ['email', 'password', 'token', 'api_key', 'pregnancy_week', 'baby_name'];
    const sanitized = { ...data };

    for (const key in sanitized) {
      if (sensitive.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  error(message: string, error?: unknown, metadata?: LogMetadata) {
    const sanitizedMetadata = this.sanitize(metadata);

    if (__DEV__) {
      console.error(`[ERROR] ${message}`, {
        error: error instanceof Error ? error.message : String(error),
        ...sanitizedMetadata,
      });
    }

    // Em produção: enviar para Sentry (opcional)
    // Sentry.captureException(error, { extra: sanitizedMetadata });
  }

  warn(message: string, metadata?: LogMetadata) {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, this.sanitize(metadata));
    }
  }

  info(message: string, metadata?: LogMetadata) {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, this.sanitize(metadata));
    }
  }
}

export const logger = new Logger();
```

**Substituir todos os console.log/error**:

```typescript
// ANTES
console.error('Erro ao chamar API:', error.response?.data);

// DEPOIS
logger.error('Erro ao chamar API', error, { action: 'claude_api_call' });
```

#### 3.3 Mover Credenciais para Edge Functions

**Prazo**: 2 dias

**Passos**:

1. Remover `.env.local` do git

```bash
git rm --cached .env.local
echo ".env.local" >> .gitignore
```

2. Configurar secrets públicos no Expo (apenas Supabase)

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

3. Criar `supabase/functions/.env` com as chaves privadas

```bash
cat <<'EOF' > supabase/functions/.env
CLAUDE_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
EOF
```

4. Validar na inicialização (Edge Functions)
   **Arquivo**: `supabase/functions/nat-ai-chat/index.ts`

```typescript
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

if (!claudeApiKey) {
  throw new Error('CRITICAL: CLAUDE_API_KEY not configured. Check supabase/functions/.env');
}

export const config = {
  claude: {
    apiKey: claudeApiKey,
    baseURL: 'https://api.anthropic.com',
  },
  // ...
};
```

#### 3.4 Adicionar Links de Privacidade no Footer

**Arquivo**: Atualizar todas as telas
**Prazo**: 1 dia

```typescript
// src/components/PrivacyFooter.tsx (NOVO)
export function PrivacyFooter() {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => Linking.openURL('https://nossa-maternidade.com.br/privacidade')}>
        <Text style={styles.link}>Política de Privacidade</Text>
      </TouchableOpacity>
      <Text> | </Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://nossa-maternidade.com.br/termos')}>
        <Text style={styles.link}>Termos de Uso</Text>
      </TouchableOpacity>
      <Text> | </Text>
      <TouchableOpacity onPress={() => Linking.openURL('mailto:dpo@nossa-maternidade.com.br')}>
        <Text style={styles.link}>Contato DPO</Text>
      </TouchableOpacity>
    </View>
  );
}
```

Adicionar em: `OnboardingScreen`, `HomeScreen`, `ProfileScreen`, `ConsentScreen`.

---

## 🔥 FASE 2 - URGENTE (39 dias) - R$ 80.000

### 2.1 Direitos dos Titulares (10 dias)

#### 2.1.1 Criar MyDataScreen.tsx

**Arquivo**: `src/screens/MyDataScreen.tsx` (NOVO)
**Prazo**: 5 dias
**Custo**: R$ 25.000

**Seções**:

1. **Dados Cadastrais**
   - Nome
   - Email
   - Tipo (gestante/mãe/tentante)
   - Semana de gestação
   - Data de cadastro

2. **Histórico de Conversas**
   - Últimas 50 mensagens
   - Filtrar por data
   - Opção: "Ver todas"

3. **Planos Diários**
   - Últimos 30 dias
   - Prioridades, dicas, receitas geradas

4. **Consentimentos**
   - Lista de consentimentos concedidos
   - Data de cada consentimento
   - Botão "Revogar" para cada

5. **Logs de Acesso**
   - Últimos 10 acessos
   - IP, dispositivo, data/hora

**Ações**:

```
[Exportar Meus Dados (JSON)] [Editar Dados] [Solicitar Exclusão Total]
```

#### 2.1.2 Implementar Exportação (Portabilidade)

**Arquivo**: `src/services/dataExport.ts` (NOVO)
**Prazo**: 2 dias

```typescript
// src/services/dataExport.ts
export async function exportUserData(userId: string): Promise<string> {
  const [profile, chats, plans, consents, auditLogs] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('chat_messages').select('*').eq('user_id', userId),
    supabase.from('daily_plans').select('*').eq('user_id', userId),
    supabase.from('user_consents').select('*').eq('user_id', userId),
    supabase.from('audit_logs').select('*').eq('user_id', userId),
  ]);

  const exportData = {
    export_date: new Date().toISOString(),
    user_id: userId,
    profile: profile.data,
    chat_history: chats.data,
    daily_plans: plans.data,
    consents: consents.data,
    audit_logs: auditLogs.data,
  };

  return JSON.stringify(exportData, null, 2);
}
```

**Download**:

```typescript
const data = await exportUserData(userId);
const blob = new Blob([data], { type: 'application/json' });
FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'meus-dados.json', data);
Share.open({ url: FileSystem.documentDirectory + 'meus-dados.json' });
```

#### 2.1.3 Implementar Exclusão Completa

**Arquivo**: `src/services/dataSubjectRights.ts` (NOVO)
**Prazo**: 3 dias

```typescript
// src/services/dataSubjectRights.ts
export async function requestDataDeletion(userId: string): Promise<void> {
  // 1. Marcar para exclusão (período de carência 7 dias)
  await supabase
    .from('user_profiles')
    .update({
      deletion_requested_at: new Date(),
      status: 'pending_deletion',
    })
    .eq('id', userId);

  // 2. Enviar email de confirmação
  await sendEmail({
    to: userEmail,
    subject: 'Solicitação de Exclusão de Dados',
    body: `Sua solicitação foi recebida. Você tem 7 dias para cancelar.
           Para cancelar, acesse: https://nossa-maternidade.com.br/cancel-deletion?token=...`,
  });

  // 3. Após 7 dias (cron job):
  // - Deletar de: user_profiles, chat_messages, daily_plans, user_consents, audit_logs
  // - Deletar auth.users
  // - Notificar terceiros (Anthropic, OpenAI) via API (se disponível)
  // - Enviar confirmação de exclusão
}
```

**Cron job** (Supabase Edge Function):

```typescript
// supabase/functions/process-deletions/index.ts
Deno.serve(async () => {
  const { data } = await supabase
    .from('user_profiles')
    .select('id, email')
    .eq('status', 'pending_deletion')
    .lt('deletion_requested_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  for (const user of data) {
    await deleteUserCompletely(user.id);
    await sendEmail(user.email, 'Seus dados foram excluídos.');
  }

  return new Response('OK');
});
```

### 2.2 Transferência Internacional (14 dias)

#### 2.2.1 Assinar Data Processing Agreements (DPAs)

**Responsável**: Jurídico
**Prazo**: 10 dias
**Custo**: R$ 20.000

**Terceiros**:

1. **Anthropic (Claude)**
   - Solicitar DPA: https://anthropic.com/legal/dpa
   - Incluir Cláusulas Contratuais Padrão (SCCs)
   - Especificar dados: mensagens de chat (pseudonimizadas)
   - Retenção: 0 dias (não armazenamento pela Anthropic)

2. **OpenAI (GPT-4, DALL-E)**
   - DPA: https://openai.com/policies/data-processing-addendum
   - SCCs incluídas
   - Especificar: prompts de planos diários (pseudonimizados)
   - Retenção: 30 dias (OpenAI policy)

3. **Supabase**
   - Verificar localização: Preferir região EU (Frankfurt) ao invés de US
   - DPA: https://supabase.com/legal/dpa
   - SCCs aplicáveis se EU

4. **Stripe**
   - DPA já incluso no contrato de merchant

**Documentar** em: `docs/legal/contratos-processadores/`

#### 2.2.2 **AJUSTE: Pseudonimização Reversível (não anonimização total)**

**Arquivo**: `src/utils/dataPseudonymization.ts` (NOVO)
**Prazo**: 4 dias
**Custo**: R$ 15.000

**Problema com anonimização total**:

- Remove contexto necessário para personalização
- "Semana arredondada" pode dar conselhos inadequados

**Solução: Pseudonimização**:

```typescript
// src/utils/dataPseudonymization.ts
import crypto from 'crypto';

interface UserContext {
  userId: string;
  name: string;
  type: 'gestante' | 'mae' | 'tentante';
  pregnancyWeek?: number;
  babyName?: string;
  preferences: string[];
}

interface PseudonymizedContext {
  sessionId: string; // Hash único por sessão
  type: 'gestante' | 'mae' | 'tentante';
  trimester?: 1 | 2 | 3; // Ao invés de semana exata
  interests: string[]; // Categorias genéricas
}

export function pseudonymizeForAI(context: UserContext): PseudonymizedContext {
  // Gerar session ID único (hash do userId + timestamp)
  const sessionId = crypto
    .createHash('sha256')
    .update(`${context.userId}-${Date.now()}`)
    .digest('hex')
    .substring(0, 16);

  // Converter semana → trimestre
  let trimester: 1 | 2 | 3 | undefined;
  if (context.pregnancyWeek) {
    if (context.pregnancyWeek <= 13) trimester = 1;
    else if (context.pregnancyWeek <= 27) trimester = 2;
    else trimester = 3;
  }

  // Generalizar preferências
  const interests = context.preferences.map((pref) => {
    // "yoga_prenatal" → "exercícios"
    // "amamentacao_exclusiva" → "nutrição"
    return categorizePreference(pref);
  });

  return {
    sessionId,
    type: context.type,
    trimester,
    interests,
  };
}

// Após conclusão da sessão, deletar mapeamento sessionId → userId
export function forgetSession(sessionId: string): void {
  // Remover do cache/banco temporário
}
```

**Aplicar em**:

- `ChatScreen.tsx:92-93`
- `DailyPlanScreen.tsx`
- `contentGenerator.ts`

**Exemplo**:

```typescript
// ANTES (RUIM)
const response = await claudeAPI.chat({
  message: userMessage,
  context: {
    name: 'Maria',
    week: 28,
    baby_name: 'João',
  },
});

// DEPOIS (BOM)
const pseudoContext = pseudonymizeForAI(userProfile);
const response = await claudeAPI.chat({
  message: userMessage,
  context: pseudoContext,
  // { sessionId: "a3f9...", type: "gestante", trimester: 3, interests: ["nutrição", "exercícios"] }
});

// Após resposta, esquecer sessão
forgetSession(pseudoContext.sessionId);
```

#### 2.2.3 Opt-out para IAs Internacionais

**Arquivo**: Atualizar `ConsentScreen.tsx`
**Prazo**: Já implementado na Fase 1 (checkbox separado)

**Lógica**:

```typescript
if (!user.consents.ai_sharing) {
  // Desabilitar chat com IA
  // Usar templates genéricos para planos diários
  // Mostrar mensagem: "Para habilitar IAs, vá em Configurações > Privacidade"
}
```

### 2.3 Governança (10 dias)

#### 2.3.1 Designar DPO (Encarregado de Dados)

**Responsável**: Gestão
**Prazo**: 3 dias
**Custo**: R$ 8.000/mês (contínuo)

**Opções**:

1. **DPO as a Service** (recomendado para MVP):
   - Empresas: iubenda, DataPrivacy, LegitLab
   - Custo: R$ 5-8k/mês
   - Inclui: consultoria, templates, atendimento a titulares

2. **DPO PF** (após crescimento):
   - Certificação EXIN/IAPP
   - Dedicação mínima 20h/mês

**Publicar**:

- Email: dpo@nossa-maternidade.com.br
- Política de Privacidade (seção "Contato")
- App: Perfil > Ajuda > "Falar com DPO"

#### 2.3.2 Registro de Atividades de Tratamento

**Arquivo**: `docs/governanca/registro-atividades-tratamento.xlsx`
**Prazo**: 3 dias
**Responsável**: DPO + Dev Lead

**Template**:
| Atividade | Finalidade | Base Legal | Dados Tratados | Armazenamento | Retenção | Terceiros | Transferência Intl. |
|-----------|------------|------------|----------------|---------------|----------|-----------|---------------------|
| Cadastro de usuário | Identificação | Consentimento | Nome, email | Supabase (UE) | Enquanto ativo | Não | Não |
| Coleta de dados de saúde | Personalização | Consentimento específico | Tipo, semana gestação, preferências | Supabase (UE) | 90 dias | Não | Não |
| Chat com IA | Assistência de saúde | Consentimento | Mensagens, contexto pseudonimizado | Supabase (30d) + Anthropic (0d) | 30 dias | Anthropic | SIM (EUA, SCCs) |
| Geração de planos | Planejamento de saúde | Consentimento | Perfil pseudonimizado | Supabase | 90 dias | OpenAI | SIM (EUA, SCCs) |
| Logs de auditoria | Segurança | Legítimo interesse | User ID, ação, timestamp, IP | Supabase | 5 anos | Não | Não |

#### 2.3.3 Relatório de Impacto (RIPD)

**Arquivo**: `docs/governanca/ripd-nossa-maternidade.pdf`
**Prazo**: 4 dias
**Responsável**: DPO + Advogado
**Custo**: R$ 12.000

**Estrutura**:

1. **Descrição do Tratamento**
   - Tipo: App de saúde para gestantes
   - Volume: Estimativa 10k usuárias/ano
   - Dados: Sensíveis de saúde (Art. 11)

2. **Necessidade e Proporcionalidade**
   - Por que coletar dados de saúde? Personalização essencial
   - Minimização: Apenas dados necessários
   - Alternativas consideradas: Templates genéricos (rejeitado por baixa qualidade)

3. **Riscos Identificados**
   - Vazamento de dados de gestantes
   - Uso indevido por IAs (mitigado com pseudonimização)
   - Acesso não autorizado (mitigado com RLS + criptografia)
   - Transferência internacional (mitigado com SCCs)

4. **Medidas Mitigadoras**
   - Criptografia (SecureStore)
   - Pseudonimização antes de IAs
   - DPAs assinados
   - Auditoria de acessos
   - Retenção limitada (30-90 dias)

5. **Conclusão**
   - Riscos aceitáveis com medidas implementadas
   - Benefício para titulares (assistência de saúde) justifica tratamento

**Aprovação**: DPO externo independente

### 2.4 Auditoria de Acesso (5 dias)

#### 2.4.1 Criar Tabela audit_logs

**Arquivo**: `supabase/migrations/004_audit_logs.sql`
**Prazo**: 1 dia

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'login', 'view_chat', 'export_data', 'delete_account'
  resource VARCHAR(100), -- 'chat_messages', 'daily_plans', 'user_profile'
  resource_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Retenção: 5 anos (compliance)
-- Particionamento por ano (performance)
```

#### 2.4.2 Implementar Logging de Acessos

**Arquivo**: `src/services/auditLogger.ts` (NOVO)
**Prazo**: 2 dias

```typescript
// src/services/auditLogger.ts
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';

export async function logAudit(
  userId: string,
  action: string,
  resource?: string,
  resourceId?: string,
  metadata?: object
) {
  const ipAddress = await getIPAddress();
  const userAgent = await DeviceInfo.getUserAgent();

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata,
  });
}

async function getIPAddress(): Promise<string> {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  return data.ip;
}
```

**Usar em**:

```typescript
// Login
await logAudit(userId, 'login');

// Visualizar chat
await logAudit(userId, 'view_chat', 'chat_messages');

// Exportar dados
await logAudit(userId, 'export_data', 'user_profile', userId);

// Solicitar exclusão
await logAudit(userId, 'request_deletion', 'user_profile', userId);
```

#### 2.4.3 Exibir Logs na MyDataScreen

**Prazo**: 2 dias

```typescript
// Em MyDataScreen.tsx
const [auditLogs, setAuditLogs] = useState([]);

useEffect(() => {
  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);

    setAuditLogs(data);
  };
  fetchLogs();
}, []);

// Renderizar
<View>
  <Text style={styles.sectionTitle}>Últimos Acessos</Text>
  {auditLogs.map(log => (
    <View key={log.id}>
      <Text>{log.action} - {new Date(log.timestamp).toLocaleString()}</Text>
      <Text>IP: {log.ip_address}</Text>
    </View>
  ))}
</View>
```

---

## 🟡 FASE 3 - IMPORTANTE (60 dias) - R$ 45.000

### 3.1 Retenção e Eliminação (15 dias)

#### 3.1.1 Implementar Política de Retenção

**Arquivo**: `supabase/migrations/005_retention_policy.sql`
**Prazo**: 5 dias

```sql
-- Função para deletar chats antigos (30 dias)
CREATE OR REPLACE FUNCTION delete_old_chats()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Função para deletar planos antigos (90 dias)
CREATE OR REPLACE FUNCTION delete_old_plans()
RETURNS void AS $$
BEGIN
  DELETE FROM daily_plans
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Função para marcar contas inativas (2 anos)
CREATE OR REPLACE FUNCTION mark_inactive_accounts()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET status = 'inactive',
      inactive_marked_at = NOW()
  WHERE last_activity_at < NOW() - INTERVAL '2 years'
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Notificar usuários 30 dias antes de deletar conta inativa
CREATE OR REPLACE FUNCTION notify_inactive_deletion()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT id, email FROM user_profiles
    WHERE inactive_marked_at < NOW() - INTERVAL '23 months'
      AND status = 'inactive'
      AND deletion_notified_at IS NULL
  LOOP
    -- Enviar email (via Edge Function)
    PERFORM net.http_post(
      url := 'https://nossa-maternidade.com.br/api/send-deletion-warning',
      body := jsonb_build_object('user_id', user_record.id, 'email', user_record.email)
    );

    UPDATE user_profiles
    SET deletion_notified_at = NOW()
    WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Deletar contas inativas após 30 dias de notificação
CREATE OR REPLACE FUNCTION delete_inactive_accounts()
RETURNS void AS $$
BEGIN
  DELETE FROM user_profiles
  WHERE deletion_notified_at < NOW() - INTERVAL '30 days'
    AND status = 'inactive';
  -- Cascade delete vai remover chats, planos, consents, etc.
END;
$$ LANGUAGE plpgsql;
```

**Cron Jobs** (pg_cron extension):

```sql
-- Instalar pg_cron (Supabase já tem)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Rodar diariamente às 02:00
SELECT cron.schedule('delete-old-chats', '0 2 * * *', 'SELECT delete_old_chats()');
SELECT cron.schedule('delete-old-plans', '0 2 * * *', 'SELECT delete_old_plans()');
SELECT cron.schedule('mark-inactive', '0 3 * * *', 'SELECT mark_inactive_accounts()');
SELECT cron.schedule('notify-inactive', '0 4 * * *', 'SELECT notify_inactive_deletion()');
SELECT cron.schedule('delete-inactive', '0 5 * * *', 'SELECT delete_inactive_accounts()');
```

#### 3.1.2 Atualizar last_activity_at

**Arquivo**: Middleware global
**Prazo**: 2 dias

```typescript
// src/middleware/activityTracker.ts (NOVO)
export async function updateLastActivity(userId: string) {
  await supabase.from('user_profiles').update({ last_activity_at: new Date() }).eq('id', userId);
}

// Chamar em:
// - Login
// - Enviar mensagem no chat
// - Gerar plano diário
// - Qualquer interação significativa
```

#### 3.1.3 Script de Anonimização em Massa

**Arquivo**: `scripts/anonymize-inactive-users.sql`
**Prazo**: 3 dias

```sql
-- Para usuários inativos há 1+ ano: manter apenas dados estatísticos
CREATE OR REPLACE FUNCTION anonymize_user(user_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET
    name = 'Usuário Anônimo',
    email = CONCAT('anon-', user_id_param::text, '@anonymous.local'),
    baby_name = NULL,
    preferences = '{}',
    anonymized_at = NOW()
  WHERE id = user_id_param;

  -- Deletar mensagens de chat (manter apenas contadores)
  DELETE FROM chat_messages WHERE user_id = user_id_param;

  -- Deletar planos (manter apenas contadores)
  DELETE FROM daily_plans WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Rodar mensalmente
SELECT cron.schedule('anonymize-old', '0 6 1 * *', $$
  SELECT anonymize_user(id) FROM user_profiles
  WHERE last_activity_at < NOW() - INTERVAL '1 year'
    AND anonymized_at IS NULL
$$);
```

#### 3.1.4 Atualizar Política de Privacidade

**Prazo**: 2 dias

Adicionar seção:

```markdown
## Retenção de Dados

Seus dados serão mantidos pelos seguintes períodos:

- **Mensagens de chat**: 30 dias
- **Planos diários**: 90 dias
- **Dados cadastrais**: Enquanto sua conta estiver ativa
- **Logs de auditoria**: 5 anos (requisito legal)

### Contas Inativas

Se você não usar o app por 2 anos:

1. Sua conta será marcada como inativa
2. Você receberá email 30 dias antes da exclusão
3. Você pode reativar clicando no link do email
4. Após 30 dias sem resposta, seus dados serão excluídos permanentemente

### Anonimização

Usuários inativos há 1+ ano terão dados anonimizados:

- Nome → "Usuário Anônimo"
- Email → endereço genérico
- Mensagens e planos → deletados
- Apenas estatísticas agregadas são mantidas (sem identificação)
```

### 3.2 Plano de Resposta a Incidentes (10 dias)

#### 3.2.1 Criar Plano Formal

**Arquivo**: `docs/governanca/plano-resposta-incidentes.md`
**Prazo**: 5 dias
**Responsável**: DPO + CTO
**Custo**: R$ 10.000

**Estrutura**:

```markdown
# Plano de Resposta a Incidentes de Dados

## Nossa Maternidade

### 1. Definição de Incidente

Incidente de segurança que pode acarretar risco aos direitos dos titulares:

- Acesso não autorizado a dados de usuárias
- Vazamento de dados para terceiros
- Perda de dados (sem backup)
- Modificação não autorizada
- Indisponibilidade prolongada (>24h)

**Não é incidente (mas deve ser monitorado)**:

- Tentativas de login falhadas isoladas
- Erros de API pontuais
- Bugs sem exposição de dados

### 2. Classificação de Severidade

| Nível       | Descrição                                      | Exemplo                          | Prazo Notificação ANPD |
| ----------- | ---------------------------------------------- | -------------------------------- | ---------------------- |
| **CRÍTICO** | Dados sensíveis de saúde expostos publicamente | Banco de dados vazado            | 72 horas               |
| **ALTO**    | Acesso não autorizado a múltiplos usuários     | Credencial de admin comprometida | 72 horas               |
| **MÉDIO**   | Acesso não autorizado a usuário único          | Conta individual hackeada        | 72 horas (se risco)    |
| **BAIXO**   | Potencial exposição sem confirmação            | Log com dados em servidor de dev | Monitorar              |

### 3. Equipe de Resposta

| Papel                  | Responsável   | Contato                                        |
| ---------------------- | ------------- | ---------------------------------------------- |
| **Líder de Incidente** | DPO           | dpo@nossa-maternidade.com.br / (XX) XXXXX-XXXX |
| **Técnico**            | CTO           | cto@nossa-maternidade.com.br / (XX) XXXXX-XXXX |
| **Jurídico**           | Advogado LGPD | juridico@nossa-maternidade.com.br              |
| **Comunicação**        | CEO           | ceo@nossa-maternidade.com.br                   |

### 4. Fluxo de Resposta

#### Fase 1: Detecção e Contenção (0-2 horas)

1. **Alertas automáticos** disparam (ex: acesso suspeito detectado)
2. **Técnico on-call** valida se é incidente real
3. **Se CRÍTICO/ALTO**: Acionar DPO imediatamente
4. **Contenção**:
   - Revogar credenciais comprometidas
   - Isolar sistema afetado
   - Bloquear acesso externo (se necessário)

#### Fase 2: Investigação (2-12 horas)

1. **Identificar**:
   - Quais dados foram expostos?
   - Quantos usuários afetados?
   - Causa raiz (vulnerabilidade, erro humano, ataque)
2. **Evidências**:
   - Logs de acesso
   - Snapshots de banco
   - Comunicações relacionadas
3. **Avaliar risco**:
   - Alto risco → Notificar ANPD e titulares
   - Baixo risco → Apenas mitigar

#### Fase 3: Notificação (12-72 horas)

**Se risco aos direitos dos titulares**:

1. **Notificar ANPD** (até 72h):
   - Canal: https://www.gov.br/anpd/pt-br/assuntos/noticias/comunicado-de-incidente
   - Template (ver seção 5)
   - Informações: natureza, dados afetados, medidas adotadas, consequências, contato DPO

2. **Notificar titulares afetadas**:
   - Email + notificação in-app
   - Linguagem clara e simples
   - Orientações de proteção
   - Canais de suporte

#### Fase 4: Mitigação (72h - 30 dias)

1. **Correção da vulnerabilidade**
2. **Auditoria de segurança**
3. **Relatório final para ANPD**
4. **Atualização de políticas/processos**

### 5. Templates de Notificação

#### Template ANPD
```

COMUNICAÇÃO DE INCIDENTE DE SEGURANÇA
Controlador: Nossa Maternidade LTDA
CNPJ: XX.XXX.XXX/0001-XX
DPO: [Nome], dpo@nossa-maternidade.com.br

1. NATUREZA DO INCIDENTE:
   [Descrição: vazamento, acesso não autorizado, perda, etc.]

2. DATA E HORA DA OCORRÊNCIA:
   [DD/MM/AAAA HH:MM]

3. DADOS AFETADOS:

- Categorias: [Ex: nome, email, dados de saúde]
- Quantidade de titulares: [Número aproximado]

4. MEDIDAS ADOTADAS:

- Contenção: [Ex: credenciais revogadas]
- Notificação aos titulares: [Sim/Não, data]

5. CONSEQUÊNCIAS PROVÁVEIS:
   [Ex: Risco de uso indevido de dados de saúde]

6. MEDIDAS PARA MITIGAR:
   [Ex: Mudança de senhas, auditoria completa]

7. CONTATO:
   DPO: [Nome], [Email], [Telefone]

```

#### Template Usuárias
```

Assunto: IMPORTANTE: Incidente de Segurança - Nossa Maternidade

Olá [Nome],

Estamos entrando em contato para informar sobre um incidente de segurança que pode ter afetado seus dados.

O QUE ACONTECEU?
[Explicação simples]

QUAIS DADOS FORAM AFETADOS?

- [Lista de dados]

O QUE ESTAMOS FAZENDO?

- [Medidas de contenção]
- [Investigação em andamento]
- [Notificação à ANPD]

O QUE VOCÊ DEVE FAZER?

- Altere sua senha: [Link]
- Fique atenta a emails/mensagens suspeitas
- Entre em contato se tiver dúvidas: dpo@nossa-maternidade.com.br

Lamentamos profundamente este incidente e estamos trabalhando para evitar que ocorra novamente.

Atenciosamente,
Equipe Nossa Maternidade

```

### 6. Contatos de Emergência

| Entidade | Contato | Quando |
|----------|---------|--------|
| **ANPD** | https://www.gov.br/anpd | Incidente com risco aos titulares |
| **Supabase Support** | support@supabase.com | Incidente em infraestrutura |
| **Anthropic Security** | security@anthropic.com | Vazamento via API Claude |
| **OpenAI Security** | security@openai.com | Vazamento via API GPT |
| **Stripe Security** | security@stripe.com | Incidente de pagamento |

### 7. Checklist de Incidente

- [ ] Incidente detectado e validado
- [ ] DPO acionado
- [ ] Contenção realizada (< 2h)
- [ ] Investigação iniciada
- [ ] Evidências coletadas
- [ ] Risco avaliado
- [ ] ANPD notificada (se aplicável, < 72h)
- [ ] Titulares notificados (se aplicável)
- [ ] Vulnerabilidade corrigida
- [ ] Auditoria realizada
- [ ] Relatório final enviado à ANPD
- [ ] Políticas atualizadas
- [ ] Equipe treinada sobre lições aprendidas

### 8. Pós-Incidente

Após resolução:
1. **Reunião de retrospectiva** (1 semana após)
2. **Relatório de lições aprendidas**
3. **Atualização deste plano**
4. **Treinamento da equipe**
5. **Auditoria de segurança completa**
```

#### 3.2.2 Implementar Sistema de Alertas

**Arquivo**: `src/services/securityAlerts.ts` (NOVO)
**Prazo**: 3 dias
**Custo**: R$ 5.000

```typescript
// src/services/securityAlerts.ts
import Slack from '@slack/webhook';

const slackWebhook = new Slack(process.env.SLACK_WEBHOOK_URL);

export async function alertSecurity(level: 'critical' | 'high' | 'medium' | 'low', message: string, metadata?: object) {
  // Log no banco
  await supabase.from('security_alerts').insert({
    level,
    message,
    metadata,
    timestamp: new Date(),
  });

  // Se crítico/alto, alertar equipe imediatamente
  if (level === 'critical' || level === 'high') {
    await slackWebhook.send({
      text: `🚨 ALERTA DE SEGURANÇA [${level.toUpperCase()}]`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Mensagem*: ${message}` },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Detalhes*:\n\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\`` },
        },
      ],
    });

    // Enviar SMS/push para DPO (opcional)
  }
}
```

**Usar em**:

```typescript
// Múltiplas tentativas de login
if (failedAttempts > 5) {
  await alertSecurity('high', `Múltiplas tentativas de login falhas`, {
    user_id: userId,
    ip: ipAddress,
    attempts: failedAttempts,
  });
}

// Acesso a dados de outro usuário (violação RLS)
if (requestedUserId !== authUserId) {
  await alertSecurity('critical', `Tentativa de acesso cross-user`, {
    auth_user: authUserId,
    requested_user: requestedUserId,
  });
}

// Erro de backup
if (backupFailed) {
  await alertSecurity('high', `Backup falhou`, { error: backupError });
}
```

#### 3.2.3 Teste de Simulação (Tabletop Exercise)

**Prazo**: 2 dias
**Custo**: R$ 3.000

**Cenário**:

> "Desenvolver percebe que credencial de API do Supabase está exposta em repositório público do GitHub por 6 horas. Possível que terceiros acessaram banco de dados."

**Exercício**:

1. Equipe se reúne
2. Cada membro descreve ações que tomaria
3. Cronometrar se conseguem:
   - Conter em < 2h
   - Investigar em < 12h
   - Notificar ANPD em < 72h
4. Identificar gaps no plano
5. Atualizar documentação

### 3.3 Segurança de Infraestrutura (20 dias)

#### 3.3.1 Configurar Backups Criptografados

**Prazo**: 5 dias
**Custo**: R$ 8.000

**Supabase**:

- Habilitar Point-in-Time Recovery (PITR)
- Backups diários automáticos
- Criptografia AES-256 em repouso (já ativo por padrão)

**Testar restauração**:

```sql
-- Mensalmente, fazer teste de restore
-- 1. Criar banco de teste
-- 2. Restaurar backup mais recente
-- 3. Validar integridade dos dados
-- 4. Documentar tempo de restauração
```

#### 3.3.2 Auditar Row Level Security (RLS)

**Prazo**: 5 dias
**Custo**: R$ 10.000 (auditor externo)

**Tabelas a auditar**:

- `user_profiles`
- `chat_messages`
- `daily_plans`
- `user_consents`
- `audit_logs`

**Teste**:

```sql
-- Como User A, tentar acessar dados de User B
SET request.jwt.claim.sub = '<user-a-uuid>';
SELECT * FROM user_profiles WHERE id = '<user-b-uuid>';
-- Deve retornar 0 rows
```

**Políticas esperadas**:

```sql
-- user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- chat_messages
CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- etc.
```

#### 3.3.3 Implementar Rate Limiting

**Arquivo**: `src/middleware/rateLimit.ts` (NOVO)
**Prazo**: 5 dias
**Custo**: R$ 5.000

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 mensagens/min
  message: 'Muitas mensagens. Aguarde 1 minuto.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id, // Por usuário
});

export const dailyPlanRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 dia
  max: 3, // 3 gerações/dia
  message: 'Você já gerou 3 planos hoje. Tente amanhã.',
  keyGenerator: (req) => req.user.id,
});

export const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5, // 5 tentativas/10min
  message: 'Muitas tentativas de login. Tente em 10 minutos.',
  keyGenerator: (req) => req.ip, // Por IP
});
```

**Aplicar**:

```typescript
// Em routes
app.post('/api/chat', chatRateLimiter, chatHandler);
app.post('/api/daily-plan', dailyPlanRateLimiter, dailyPlanHandler);
app.post('/api/login', loginRateLimiter, loginHandler);
```

#### 3.3.4 Segregação de Ambientes

**Prazo**: 5 dias
**Custo**: R$ 7.000

**Criar**:

- **Produção**: Banco real, credenciais reais
- **Staging**: Cópia anônima de produção (dados fake)
- **Desenvolvimento**: Dados de teste sintéticos

**Regras**:

- NUNCA usar dados reais em dev/staging
- Pipelines CI/CD separados
- Credenciais diferentes por ambiente

```bash
# .env.production
SUPABASE_URL=https://prod.supabase.co
CLAUDE_API_KEY=sk-prod-...

# .env.staging
SUPABASE_URL=https://staging.supabase.co
CLAUDE_API_KEY=sk-test-...

# .env.development
SUPABASE_URL=http://localhost:54321
CLAUDE_API_KEY=sk-mock-...
```

### 3.4 Disclaimers Médicos (5 dias)

#### 3.4.1 Criar Seção de Disclaimers nos Termos

**Arquivo**: Atualizar `docs/legal/termos-uso.md`
**Prazo**: 2 dias

```markdown
## AVISO MÉDICO IMPORTANTE

### Este app NÃO substitui acompanhamento médico profissional

O aplicativo Nossa Maternidade é uma ferramenta de **suporte informativo e educacional**. As informações fornecidas pela inteligência artificial:

✅ SÃO:

- Baseadas em literatura científica e guidelines de saúde pública
- Personalizadas com base no seu perfil
- Úteis para planejamento e organização

❌ NÃO SÃO:

- Diagnósticos médicos
- Prescrições de tratamento
- Substitutas de consultas com obstetra, pediatra ou outros profissionais
- Orientações para emergências

### Obrigatoriedade de Acompanhamento Profissional

Todo usuária DEVE:

- Realizar pré-natal regular com obstetra
- Seguir orientações do seu médico de confiança
- Realizar exames de rotina recomendados
- Consultar profissionais de saúde para dúvidas médicas

### Situações de Emergência

🚨 Em caso de emergência obstétrica (sangramento, dor intensa, perda de líquido, redução de movimentos fetais), NÃO use o app:

1. Ligue **192 (SAMU)** imediatamente
2. Dirija-se ao hospital mais próximo
3. Entre em contato com seu obstetra

O app não monitora em tempo real e NÃO pode detectar emergências.

### Limitação de Responsabilidade

A Nossa Maternidade não se responsabiliza por:

- Decisões médicas tomadas com base nas informações do app
- Atrasos em buscar atendimento profissional
- Interpretações incorretas de conteúdo
- Falhas técnicas que impeçam acesso em momentos críticos

**Sempre consulte um profissional de saúde habilitado para decisões médicas.**
```

#### 3.4.2 Adicionar Disclaimer na HomeScreen

**Arquivo**: `src/screens/HomeScreen.tsx`
**Prazo**: 1 dia

```typescript
<View style={styles.disclaimerCard}>
  <Icon name="alert-circle-outline" size={20} color={colors.warning} />
  <Text style={styles.disclaimerText}>
    Este app é informativo. Em caso de emergência, ligue 192 (SAMU).
  </Text>
  <TouchableOpacity onPress={() => navigation.navigate('MedicalDisclaimer')}>
    <Text style={styles.disclaimerLink}>Leia mais</Text>
  </TouchableOpacity>
</View>
```

#### 3.4.3 Criar Tela MedicalDisclaimerScreen

**Arquivo**: `src/screens/MedicalDisclaimerScreen.tsx` (NOVO)
**Prazo**: 1 dia

```typescript
export default function MedicalDisclaimerScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aviso Médico</Text>
      <Text style={styles.text}>
        Este aplicativo NÃO substitui consultas médicas...
        [Texto completo dos Termos]
      </Text>

      <Button
        title="Ligue 192 (SAMU) - Emergência"
        onPress={() => Linking.openURL('tel:192')}
        variant="destructive"
        icon="phone-alert"
      />

      <Button
        title="Entendi"
        onPress={() => navigation.goBack()}
        variant="primary"
      />
    </ScrollView>
  );
}
```

#### 3.4.4 Integração com Canais Oficiais

**Prazo**: 1 dia

**Adicionar na HomeScreen**:

```typescript
<Card title="Recursos de Saúde Pública">
  <Button
    title="192 - SAMU (Emergências)"
    onPress={() => Linking.openURL('tel:192')}
    icon="ambulance"
  />
  <Button
    title="136 - Disque Saúde (Informações)"
    onPress={() => Linking.openURL('tel:136')}
    icon="phone"
  />
  <Button
    title="180 - Disque Denúncia Violência"
    onPress={() => Linking.openURL('tel:180')}
    icon="shield-alert"
  />
</Card>
```

### 3.5 Testes de Conformidade (10 dias)

#### 3.5.1 Teste com Usuárias Reais - Fluxo de Consentimento

**Prazo**: 3 dias
**Participantes**: 10 usuárias beta
**Custo**: R$ 5.000 (R$ 500/pessoa)

**Perguntas**:

1. Você entendeu quais dados são coletados?
2. Ficou claro que dados de saúde vão para EUA?
3. Você se sentiu pressionada a aceitar?
4. Conseguiu ler a Política completa antes de aceitar?
5. Entendeu a diferença entre consentimentos obrigatórios e opcionais?

**Critério de sucesso**: >80% responde "sim" em 1-4, "não" em 3.

#### 3.5.2 Teste de Exercício de Direitos

**Prazo**: 2 dias
**Participantes**: 5 usuárias beta

**Cenários**:

1. Solicitar exclusão de conta → Deve receber email em <24h
2. Exportar dados → JSON completo e legível
3. Corrigir dados → Atualização refletida imediatamente
4. Revogar consentimento de IA → Chat deve ficar desabilitado

**Critério**: 100% de sucesso.

#### 3.5.3 Teste de Estresse - Auditoria

**Prazo**: 2 dias

**Cenário**:

- Simular 1.000 ações simultâneas (logins, chats, exports)
- Verificar se audit_logs registra TODAS
- Verificar performance (latência <100ms)

#### 3.5.4 Revisão por Escritório Externo

**Prazo**: 3 dias
**Custo**: R$ 15.000

**Contratar**: Escritório especializado em LGPD
**Escopo**:

- Revisar TODA a documentação legal
- Validar RIPD
- Testar fluxo de consentimento
- Simular solicitação de exercício de direitos
- Emitir parecer de conformidade

**Entregável**: Relatório de auditoria + Certificado de Conformidade (se aprovado).

---

## 🟢 FASE 4 - OTIMIZAÇÕES (60 dias) - R$ 20.000

### 4.1 Segurança Avançada (20 dias)

#### 4.1.1 Autenticação 2FA (Opcional)

**Prazo**: 5 dias
**Custo**: R$ 5.000

```typescript
// Supabase já suporta 2FA
await supabase.auth.mfa.enroll({
  factorType: 'totp',
});
```

**UI**: Opção em Configurações > Segurança.

#### 4.1.2 Certificado Pinning (SSL)

**Prazo**: 5 dias
**Custo**: R$ 3.000

**Prevenir**: Man-in-the-middle attacks

```typescript
// react-native-ssl-pinning
import { fetch as sslFetch } from 'react-native-ssl-pinning';

await sslFetch('https://api.anthropic.com', {
  method: 'POST',
  sslPinning: {
    certs: ['anthropic-cert'], // Certificado no app bundle
  },
});
```

#### 4.1.3 Web Application Firewall (WAF)

**Prazo**: 10 dias
**Custo**: R$ 12.000 (setup + 3 meses)

**Opções**:

- Cloudflare (recomendado)
- AWS WAF

**Proteção**:

- DDoS
- SQL injection
- XSS
- Bots maliciosos

### 4.2 Transparência (15 dias)

#### 4.2.1 Criar Página de Transparência Pública

**Arquivo**: `public/transparencia.html`
**Prazo**: 5 dias

```markdown
# Relatório de Transparência - Nossa Maternidade

## Período: Q4 2025

### Estatísticas de Privacidade

- **Usuárias cadastradas**: 10.234
- **Solicitações de exclusão atendidas**: 45 (100%)
- **Tempo médio de resposta**: 18 horas
- **Solicitações de portabilidade**: 12 (100%)
- **Incidentes de segurança**: 0

### Solicitações de Autoridades

- **Requisições judiciais**: 2
- **Dados fornecidos**: 2 (com ordem judicial)
- **Dados negados**: 0

### Atualizações de Política

- **Versão atual**: 1.0
- **Última atualização**: 30/10/2025
- **Mudanças**: N/A (primeira versão)
```

#### 4.2.2 Dashboard de Compliance para Admin

**Prazo**: 10 dias
**Custo**: R$ 8.000

**Métricas**:

- Solicitações de exclusão pendentes
- Tempo médio de resposta
- Alertas de segurança (últimos 7 dias)
- Status de backups
- Conformidade de RLS (% de políticas ativas)

### 4.3 Privacy by Design (25 dias)

#### 4.3.1 Avaliar IAs Brasileiras/Europeias

**Prazo**: 10 dias

**Alternativas**:

- **Maritaca AI** (Brasil) - Baseada em LLaMA, treinada em português
- **Mistral** (França) - GDPR compliant
- **Cohere** (Canadá) - Com data residency EU

**Trade-offs**:

- Qualidade: Claude/GPT ainda superiores
- Custo: Maritaca mais barata
- Latência: Mistral EU mais rápido para Brasil

**Decisão**: Implementar fallback híbrido

- Usuárias que negam consentimento internacional → Maritaca AI
- Usuárias que aceitam → Claude (melhor qualidade)

#### 4.3.2 Implementar Minimização de Dados

**Prazo**: 10 dias

**Refatorar coleta**:

- ANTES: Coletar 10 preferências de saúde
- DEPOIS: Coletar apenas 3 prioritárias

- ANTES: Armazenar todo histórico de chat
- DEPOIS: Armazenar apenas resumos (embeddings vetoriais)

#### 4.3.3 Redesenhar Arquitetura com Privacidade

**Prazo**: 5 dias

**Padrão**: Privacy by Design + Security by Default

```
Usuária
  ↓ Consentimento explícito
App (criptografia local)
  ↓ Dados pseudonimizados
API Gateway (rate limit + auth)
  ↓ Validação + sanitização
Backend (logs sanitizados)
  ↓ Criptografia em trânsito
Supabase (RLS + criptografia em repouso)
  ↓ Apenas dados necessários
IAs (sem armazenamento permanente)
```

---

## 💰 INVESTIMENTO TOTAL AJUSTADO

| Fase       | Duração       | Custo Original | Custo Ajustado | Justificativa                                      |
| ---------- | ------------- | -------------- | -------------- | -------------------------------------------------- |
| **Fase 1** | 7 → 21 dias   | R$ 10.000      | **R$ 35.000**  | Prazo realista + consultoria jurídica profissional |
| **Fase 2** | 30 → 39 dias  | R$ 30.000      | **R$ 80.000**  | DPO mensal + DPAs + auditoria                      |
| **Fase 3** | 90 → 60 dias  | R$ 25.000      | **R$ 45.000**  | Testes de conformidade + auditoria externa         |
| **Fase 4** | 180 → 60 dias | R$ 15.000      | **R$ 20.000**  | WAF + dashboard                                    |
| **TOTAL**  | **6 meses**   | R$ 80.000      | **R$ 180.000** | Realista para SP                                   |

### Recursos Humanos Ajustados:

| Recurso                | Quantidade   | Custo/Mês | Duração    | Total          |
| ---------------------- | ------------ | --------- | ---------- | -------------- |
| **Dev Backend Sênior** | 1            | R$ 15.000 | 5 meses    | R$ 75.000      |
| **Dev Frontend Pleno** | 1            | R$ 12.000 | 4 meses    | R$ 48.000      |
| **Advogado LGPD**      | Consultoria  | R$ 20.000 | 2 meses    | R$ 40.000      |
| **DPO Terceirizado**   | Contínuo     | R$ 8.000  | 3 meses    | R$ 24.000      |
| **Auditor Segurança**  | Consultoria  | R$ 15.000 | 1 mês      | R$ 15.000      |
| **Redator Jurídico**   | Freelancer   | R$ 5.000  | 1 mês      | R$ 5.000       |
| **Testes UX**          | Beta testers | R$ 500    | 15 pessoas | R$ 7.500       |
| **Infraestrutura**     | WAF, backups | -         | -          | R$ 10.000      |
| **TOTAL**              | -            | -         | -          | **R$ 224.500** |

**Contingência 20%**: R$ 45.000
**TOTAL FINAL**: **R$ 270.000**

---

## ⏱️ CRONOGRAMA AJUSTADO

| Semana | Fase   | Atividades                                                        | Marco                     |
| ------ | ------ | ----------------------------------------------------------------- | ------------------------- |
| 1-3    | Fase 1 | Documentação legal + Consentimento + Segurança                    | ✅ Documentação completa  |
| 4-9    | Fase 2 | Direitos titulares + Transferência intl. + Governança + Auditoria | ✅ Pronto para beta       |
| 10-18  | Fase 3 | Retenção + Incidentes + Segurança infra + Disclaimers + Testes    | ✅ Pronto para lançamento |
| 19-26  | Fase 4 | 2FA + WAF + Transparência + Privacy by Design                     | ✅ Otimizado              |

**Prazo mínimo para lançamento beta**: **60 dias** (após Fase 2)
**Prazo para lançamento público**: **18 semanas** (~4.5 meses)

---

## ✅ CHECKLIST DE LANÇAMENTO (ATUALIZADO)

### Documentação ✅

- [ ] Política de Privacidade publicada (v1.0)
- [ ] Termos de Uso publicados (v1.0)
- [ ] Termo de Consentimento implementado (4 checkboxes separados)
- [ ] RIPD aprovado por DPO externo
- [ ] Registro de Atividades atualizado
- [ ] Plano de Resposta a Incidentes documentado
- [ ] Disclaimers médicos em Termos + HomeScreen + tela dedicada

### Consentimento ✅

- [ ] ConsentScreen.tsx funcional
- [ ] Scroll obrigatório até o fim
- [ ] Checkboxes: básico (obrig.), saúde (obrig.), IAs (opc.), comunicações (opc.)
- [ ] Consentimentos registrados em `user_consents` com timestamp + IP
- [ ] Migração retroativa para usuários antigos implementada
- [ ] Prazo de 30 dias para consentimento retroativo

### Segurança ✅

- [ ] SecureStore implementado (criptografia local)
- [ ] Logger seguro (sem dados sensíveis)
- [ ] Credenciais em Expo Secrets (sem .env.local no git)
- [ ] Validação de credenciais na inicialização
- [ ] Links de Privacidade em footer de todas as telas

### Autenticação ✅

- [ ] **Email real** (magic link ou senha)
- [ ] Verificação de email
- [ ] Opção: "Continuar sem conta" (funcionalidades limitadas)
- [ ] Migração de contas temporárias antigas

### Direitos dos Titulares ✅

- [ ] MyDataScreen.tsx funcional
- [ ] Exibe: cadastro, chat (50 msgs), planos, consentimentos, logs
- [ ] Exportação JSON completa (portabilidade)
- [ ] Exclusão completa (7 dias carência)
- [ ] Correção de dados
- [ ] Notificação de exclusão por email

### Terceiros ✅

- [ ] DPAs assinados: Anthropic, OpenAI, Supabase, Stripe
- [ ] SCCs incluídas nos contratos
- [ ] Lista de terceiros na Política de Privacidade
- [ ] **Pseudonimização** (não anonimização total) antes de IAs
- [ ] Opt-out para IAs internacionais funcionando

### Governança ✅

- [ ] DPO designado: dpo@nossa-maternidade.com.br
- [ ] Email/canal de contato ativo
- [ ] Registro de Atividades completo
- [ ] RIPD aprovado

### Auditoria ✅

- [ ] `audit_logs` tabela criada
- [ ] Logging de: login, view_chat, export_data, delete_account
- [ ] Exibição de logs em MyDataScreen
- [ ] Alertas de segurança configurados (Slack)

### Retenção ✅

- [ ] Política implementada: 30d chats, 90d planos, 2 anos inatividade
- [ ] Cron jobs configurados
- [ ] Notificação 30 dias antes de exclusão automática
- [ ] Script de anonimização para inativos 1+ ano

### Infraestrutura ✅

- [ ] Backups criptografados habilitados
- [ ] PITR (Point-in-Time Recovery) ativo
- [ ] RLS auditado por terceiro
- [ ] Rate limiting implementado (10 msgs/min, 3 planos/dia, 5 logins/10min)
- [ ] Ambientes segregados (prod, staging, dev)

### Incidentes ✅

- [ ] Plano de Resposta documentado
- [ ] Templates de notificação ANPD + usuárias
- [ ] Sistema de alertas funcionando
- [ ] Teste de simulação (tabletop) realizado

### Disclaimers Médicos ✅

- [ ] Seção nos Termos de Uso
- [ ] Disclaimer na HomeScreen
- [ ] Tela MedicalDisclaimerScreen.tsx
- [ ] Botões para SAMU 192, Disque Saúde 136, Disque 180

### Testes ✅

- [ ] Teste com 10 usuárias: fluxo de consentimento (>80% aprovação)
- [ ] Teste de exercício de direitos (100% sucesso)
- [ ] Teste de estresse: auditoria sob carga
- [ ] Revisão por escritório externo
- [ ] Certificado de Conformidade emitido

### Opcional (Fase 4) 🟢

- [ ] 2FA implementado
- [ ] Certificado pinning (SSL)
- [ ] WAF ativo
- [ ] Página de Transparência pública
- [ ] Dashboard de compliance para admin
- [ ] Maritaca AI como fallback para não-consentimento internacional

---

## 🎯 RECOMENDAÇÕES FINAIS

### 1. NÃO subestime prazos

21 dias (Fase 1) é o MÍNIMO realista para documentação legal aprovada por advogado.

### 2. Invista em DPO desde o início

R$ 8k/mês parece caro, mas evita multas de R$ 154 milhões.

### 3. Priorize testes de conformidade

Usuárias reais testando fluxo de consentimento são cruciais - elas dirão se está claro.

### 4. Migração retroativa é OBRIGATÓRIA

Se já há usuários, você DEVE solicitar novo consentimento. Não há exceção.

### 5. Pseudonimização > Anonimização

Manter trimestre (ao invés de semana) preserva funcionalidade sem expor demais.

### 6. Disclaimers médicos não são opcionais

App de saúde sem disclaimer = responsabilidade civil enorme.

### 7. Escritório externo é investimento, não custo

R$ 15k de auditoria previne R$ 50 milhões de multa.

---

## 📞 PRÓXIMOS PASSOS IMEDIATOS

1. **HOJE**: Aprovar este plano com stakeholder (Nathália Valente)
2. **AMANHÃ**: Contratar advogado LGPD especializado
3. **DIA 3**: Designar DPO (terceirizado)
4. **DIA 4**: Pausar desenvolvimento de features
5. **DIA 5-25**: Executar Fase 1 (21 dias)

---

**Versão**: 2.0 (Ajustada)
**Data**: 30/10/2025
**Próxima Revisão**: Após Fase 1 (21 dias)
**Responsável**: DPO + CTO

---

**⚠️ LEMBRETE FINAL**: Este é um app de **dados sensíveis de saúde de gestantes**. A responsabilidade ética, jurídica e moral é ENORME. Priorize conformidade e segurança acima de features e prazos de mercado. Um vazamento não apenas gera multa - pode arruinar vidas.
