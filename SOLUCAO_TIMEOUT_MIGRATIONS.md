# 🔧 SOLUÇÃO: Problema de Timeout nas Migrations

## ❌ Problema Atual

```
failed to connect to postgres: timeout
Remote migration versions not found in local migrations directory.
Migration: 20251108024428
```

## ✅ Soluções (Escolha uma)

### OPÇÃO 1: Reparar Migration via Dashboard (RECOMENDADO)

1. **Acesse o Supabase Dashboard:**

   ```
   https://supabase.com/dashboard/project/mnszbkeuerjcevjvdqme/database/migrations
   ```

2. **Encontre a migration `20251108024428`** na lista

3. **Marque como revertida** ou **delete** se não for necessária

4. **Ou execute manualmente no SQL Editor:**

   ```sql
   -- Remover migration problemática do histórico
   DELETE FROM supabase_migrations.schema_migrations
   WHERE version = '20251108024428';
   ```

5. **Depois tente novamente:**
   ```powershell
   supabase db push
   ```

---

### OPÇÃO 2: Aplicar Migrations Manualmente via SQL Editor

Se o CLI continuar com timeout, aplique as migrations manualmente:

1. **Acesse o SQL Editor:**

   ```
   https://supabase.com/dashboard/project/mnszbkeuerjcevjvdqme/editor
   ```

2. **Execute cada migration na ordem:**
   - `20250103_enable_extensions.sql`
   - `001_gemini_memory.sql`
   - `002_alert_logs.sql`
   - `20250104_rate_limiting_event_based.sql`
   - `20250105_onboarding_completo.sql`
   - `20250106_000000_consolidated_schema.sql`
   - `20250107_base_schema.sql`
   - `20250107_new_features_schema.sql`
   - `20250107_security_tables.sql`
   - `20250108_habits_system.sql`
   - `20250109_fix_schemas.sql`
   - `20250110_fix_all_schema_issues.sql`
   - `20250111_nathia_metrics_schema.sql`
   - `20250115_nathia_tables.sql`
   - `99999999999999_fix_critical_issues.sql`

3. **Ou use o script consolidado:**
   - Abra `supabase/EXECUTAR_AGORA.sql` no SQL Editor
   - Execute tudo de uma vez

---

### OPÇÃO 3: Usar Supabase DB Pull (Sincronizar)

Se você quer sincronizar o estado remoto com o local:

```powershell
# Puxar estado atual do banco remoto
supabase db pull

# Isso criará migrations locais baseadas no estado remoto
# Depois você pode fazer push novamente
supabase db push
```

**⚠️ ATENÇÃO:** Isso pode sobrescrever migrations locais!

---

### OPÇÃO 4: Tentar com Timeout Aumentado

```powershell
# Tentar com debug para ver mais detalhes
supabase db push --debug

# Ou tentar em horário diferente (pode ser problema temporário de rede)
```

---

## 🎯 Verificar se Funcionou

Depois de aplicar as migrations, verifique no SQL Editor:

```sql
-- Ver migrations aplicadas
SELECT version, name
FROM supabase_migrations.schema_migrations
ORDER BY version;

-- Ver tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 📝 Próximos Passos

Após resolver o problema de migrations:

1. ✅ **Deploy Edge Functions:**

   ```powershell
   node scripts/supabase-deploy.js functions
   ```

2. ✅ **Validar configuração:**

   ```powershell
   pnpm run validate:env
   ```

3. ✅ **Iniciar app:**
   ```powershell
   pnpm run dev
   ```

---

## 🔍 Troubleshooting Adicional

Se nada funcionar:

1. **Verifique sua conexão de internet**
2. **Tente usar VPN** (pode ser bloqueio de firewall)
3. **Verifique se o projeto Supabase está ativo:**
   ```
   https://supabase.com/dashboard/project/mnszbkeuerjcevjvdqme
   ```
4. **Entre em contato com suporte do Supabase** se o problema persistir
