-- ============================================
-- CORREÇÕES CRÍTICAS DE BANCO DE DADOS
-- Execute via Supabase Dashboard > SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- 1. RENOMEAR TABELAS DUPLICADAS
-- ============================================

-- Renomear nathia_analytics duplicada
ALTER TABLE IF EXISTS nathia_analytics
  RENAME TO nathia_analytics_aggregated;

COMMENT ON TABLE nathia_analytics_aggregated IS 'Dados agregados (migration antiga)';

-- ============================================
-- 2. CORRIGIR FOREIGN KEYS
-- ============================================

-- Corrigir FK de nathia_messages.conversation_id
ALTER TABLE nathia_messages
  DROP CONSTRAINT IF EXISTS nathia_messages_conversation_id_fkey;

-- Opção A: Converter para TEXT (se conversations usa TEXT)
ALTER TABLE nathia_messages
  ALTER COLUMN conversation_id TYPE TEXT;

ALTER TABLE nathia_messages
  ADD CONSTRAINT nathia_messages_conversation_id_fkey
  FOREIGN KEY (conversation_id)
  REFERENCES nathia_conversations(conversation_id)
  ON DELETE CASCADE;

-- ============================================
-- 3. CRIAR user_profiles SE NÃO EXISTIR
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy básica
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- 4. ADICIONAR ÍNDICES FALTANTES
-- ============================================

-- Índice composto para nathia_messages
CREATE INDEX IF NOT EXISTS idx_nathia_messages_user_created
  ON nathia_messages(user_id, created_at DESC);

-- Índice parcial para mensagens recentes
CREATE INDEX IF NOT EXISTS idx_nathia_messages_recent
  ON nathia_messages(user_id, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '90 days';

-- Índices GIN para JSONB
CREATE INDEX IF NOT EXISTS idx_nathia_conversations_metadata
  ON nathia_conversations USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_nathia_messages_metadata
  ON nathia_messages USING GIN (metadata);

-- ============================================
-- 5. CORRIGIR RLS POLICY DE RATE_LIMITS
-- ============================================

DROP POLICY IF EXISTS "System can manage rate limits" ON nathia_rate_limits;

CREATE POLICY "Service role can manage rate limits"
  ON nathia_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own rate limits"
  ON nathia_rate_limits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. ADICIONAR CONSTRAINTS FALTANTES
-- ============================================

-- Constraint de data em nathia_experiments
ALTER TABLE nathia_experiments
  ADD CONSTRAINT check_experiment_dates
  CHECK (end_date IS NULL OR end_date > start_date);

COMMIT;

-- ============================================
-- VALIDAÇÃO PÓS-EXECUÇÃO
-- ============================================

-- Verificar FKs quebradas
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 0;
-- Deve retornar 0 linhas

-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'nathia_%';
-- Todas devem ter rowsecurity = true

-- Verificar índices criados
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'nathia_%'
ORDER BY tablename, indexname;
