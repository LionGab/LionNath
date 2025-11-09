# Setup Supabase para Onboarding

**Data:** 2025-01-08  
**Versão:** 1.0

---

## Visão Geral

Este documento descreve como configurar o Supabase para o sistema de onboarding do app Nossa Maternidade.

---

## Pré-requisitos

1. Projeto Supabase criado
2. Supabase CLI instalado (opcional, para migrations locais)
3. Acesso ao dashboard do Supabase

---

## Passo 1: Executar Migration

### Opção A: Via Supabase Dashboard

1. Acesse o dashboard do seu projeto Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase/migrations/20250108_onboarding_answers.sql`
4. Execute o script

### Opção B: Via Supabase CLI

```bash
# Se você tem Supabase CLI instalado
supabase db push

# Ou execute a migration específica
supabase migration up
```

---

## Passo 2: Verificar Tabela Criada

No SQL Editor do Supabase, execute:

```sql
-- Verificar se a tabela foi criada
select * from onboarding_answers limit 1;

-- Verificar políticas RLS
select * from pg_policies where tablename = 'onboarding_answers';
```

---

## Passo 3: Configurar Variáveis de Ambiente

No arquivo `.env` do projeto, adicione:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
EXPO_PUBLIC_USE_MOCKS=false
```

### Onde encontrar as credenciais:

1. **SUPABASE_URL:**
   - Dashboard → Settings → API → Project URL

2. **SUPABASE_ANON_KEY:**
   - Dashboard → Settings → API → Project API keys → `anon` `public`

---

## Passo 4: Testar Conexão

### Teste com curl (Terminal)

```bash
# Substitua YOUR_SUPABASE_URL e YOUR_ANON_KEY
curl -X POST 'YOUR_SUPABASE_URL/rest/v1/onboarding_answers' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id": null,
    "question_id": "q1",
    "answer": "q1o1"
  }'
```

### Teste com JavaScript (Node.js)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teste de insert
async function testInsert() {
  const { data, error } = await supabase
    .from('onboarding_answers')
    .insert({
      user_id: null, // null para modo anônimo/demo
      question_id: 'q1',
      answer: 'q1o1',
    })
    .select();

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Sucesso:', data);
  }
}

testInsert();
```

---

## Estrutura da Tabela

```sql
onboarding_answers
├── id (uuid, primary key)
├── user_id (uuid, foreign key → auth.users)
├── question_id (text, not null)
├── answer (jsonb, not null)
└── created_at (timestamptz, default now())
```

### Formato do campo `answer`:

- **single_choice:** `"q1o1"` (string)
- **multi_choice:** `["q3o1", "q3o2"]` (array de strings)

---

## Políticas RLS (Row Level Security)

### Política Temporária para Demo

```sql
-- Permite inserts anônimos (para demo sem autenticação)
create policy "Allow anonymous inserts for demo"
  on onboarding_answers
  for insert
  to anon
  with check (true);
```

**⚠️ ATENÇÃO:** Esta política permite que qualquer pessoa insira dados sem autenticação. Em produção, remova ou ajuste esta política.

### Políticas para Produção

```sql
-- Usuários autenticados podem inserir suas próprias respostas
create policy "Users can insert their own answers"
  on onboarding_answers
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Usuários autenticados podem ler suas próprias respostas
create policy "Users can read their own answers"
  on onboarding_answers
  for select
  to authenticated
  using (auth.uid() = user_id);
```

---

## Queries Úteis

### Buscar todas as respostas de um usuário

```sql
select * from onboarding_answers
where user_id = 'user-uuid-aqui'
order by created_at asc;
```

### Buscar resposta específica de uma pergunta

```sql
select * from onboarding_answers
where user_id = 'user-uuid-aqui'
  and question_id = 'q1';
```

### Contar respostas por usuário

```sql
select user_id, count(*) as answer_count
from onboarding_answers
group by user_id;
```

### Verificar se usuário completou onboarding

```sql
select count(*) > 0 as has_completed
from onboarding_answers
where user_id = 'user-uuid-aqui';
```

---

## Troubleshooting

### Erro: "permission denied for table onboarding_answers"

**Causa:** RLS está bloqueando a operação.

**Solução:**

1. Verifique se as políticas RLS estão configuradas corretamente
2. Para demo, certifique-se de que a política "Allow anonymous inserts for demo" existe
3. Verifique se `EXPO_PUBLIC_USE_MOCKS=true` está configurado para usar modo mock

### Erro: "relation onboarding_answers does not exist"

**Causa:** Tabela não foi criada.

**Solução:**

1. Execute a migration novamente
2. Verifique se está no projeto correto do Supabase
3. Verifique logs no dashboard do Supabase

### Erro: "invalid input syntax for type uuid"

**Causa:** `user_id` está sendo enviado em formato incorreto.

**Solução:**

- Para modo anônimo/demo, envie `user_id: null`
- Para usuários autenticados, use o UUID retornado por `supabase.auth.getUser()`

---

## Modo Mock vs Modo Real

### Modo Mock (`EXPO_PUBLIC_USE_MOCKS=true`)

- Respostas salvas em AsyncStorage (local)
- Não requer conexão com Supabase
- Ideal para desenvolvimento e demo offline

### Modo Real (`EXPO_PUBLIC_USE_MOCKS=false`)

- Respostas salvas no Supabase
- Requer conexão com internet
- Requer credenciais Supabase configuradas
- Fallback automático para mock em caso de erro

---

## Próximos Passos

1. ✅ Executar migration
2. ✅ Configurar variáveis de ambiente
3. ✅ Testar conexão
4. ✅ Testar insert/select no app
5. ⚠️ Ajustar políticas RLS para produção (remover política anônima)

---

**Documentado por:** Backend Engineer Agent  
**Última atualização:** 2025-01-08
