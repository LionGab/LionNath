-- ============================================
-- CORREÇÕES CRÍTICAS DE BANCO DE DADOS
-- Data: 2025-11-07
-- Execute via: Supabase Dashboard > SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- 1. RENOMEAR TABELAS DUPLICADAS
-- ============================================

-- Verificar se nathia_analytics existe antes de renomear
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'nathia_analytics'
  ) THEN
    -- Renomear para evitar conflito
    ALTER TABLE nathia_analytics RENAME TO nathia_analytics_legacy;
    RAISE NOTICE 'Tabela nathia_analytics renomeada para nathia_analytics_legacy';
  END IF;
END $$;

-- ============================================
-- 2. CORRIGIR FOREIGN KEYS
-- ============================================

-- Remover FK antiga se existir
ALTER TABLE IF EXISTS nathia_messages
  DROP CONSTRAINT IF EXISTS nathia_messages_conversation_id_fkey;

-- Verificar tipo de conversation_id e ajustar
DO $$
BEGIN
  -- Se nathia_conversations usa TEXT para conversation_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nathia_conversations'
    AND column_name = 'conversation_id'
    AND data_type = 'text'
  ) THEN
    -- Converter nathia_messages.conversation_id para TEXT se necessário
    ALTER TABLE nathia_messages
      ALTER COLUMN conversation_id TYPE TEXT;

    -- Adicionar FK correta
    ALTER TABLE nathia_messages
      ADD CONSTRAINT nathia_messages_conversation_id_fkey
      FOREIGN KEY (conversation_id)
      REFERENCES nathia_conversations(conversation_id)
      ON DELETE CASCADE;

    RAISE NOTICE 'FK nathia_messages.conversation_id corrigida para TEXT';
  END IF;
END $$;

-- ============================================
-- 3. CRIAR user_profiles SE NÃO EXISTIR
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user',
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. ADICIONAR ÍNDICES FALTANTES
-- ============================================

-- Índice composto para consultas comuns de mensagens
CREATE INDEX IF NOT EXISTS idx_nathia_messages_user_created
  ON nathia_messages(user_id, created_at DESC);

-- Índice parcial para mensagens recentes (últimos 90 dias)
CREATE INDEX IF NOT EXISTS idx_nathia_messages_recent
  ON nathia_messages(user_id, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '90 days';

-- Índices GIN para buscas em JSONB
CREATE INDEX IF NOT EXISTS idx_nathia_conversations_metadata
  ON nathia_conversations USING GIN (metadata)
  WHERE metadata IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nathia_messages_metadata
  ON nathia_messages USING GIN (metadata)
  WHERE metadata IS NOT NULL;

-- Índice para performance logs
CREATE INDEX IF NOT EXISTS idx_nathia_performance_endpoint_time
  ON nathia_performance_logs(endpoint, timestamp DESC)
  WHERE endpoint IS NOT NULL;

-- ============================================
-- 5. CORRIGIR RLS POLICIES
-- ============================================

-- Rate Limits - apenas service role pode gerenciar
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'nathia_rate_limits') THEN
    DROP POLICY IF EXISTS "System can manage rate limits" ON nathia_rate_limits;

    CREATE POLICY "Service role can manage rate limits"
      ON nathia_rate_limits FOR ALL TO service_role
      USING (true) WITH CHECK (true);

    CREATE POLICY "Users can view own rate limits"
      ON nathia_rate_limits FOR SELECT TO authenticated
      USING (auth.uid() = user_id);

    RAISE NOTICE 'RLS policies de nathia_rate_limits corrigidas';
  END IF;
END $$;

-- ============================================
-- 6. ADICIONAR CONSTRAINTS FALTANTES
-- ============================================

-- Constraint de datas em experiments
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'nathia_experiments') THEN
    ALTER TABLE nathia_experiments
      DROP CONSTRAINT IF EXISTS check_experiment_dates;

    ALTER TABLE nathia_experiments
      ADD CONSTRAINT check_experiment_dates
      CHECK (end_date IS NULL OR end_date > start_date);

    RAISE NOTICE 'Constraint de datas adicionada em nathia_experiments';
  END IF;
END $$;

-- ============================================
-- 7. ATUALIZAR TIMESTAMPS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================
-- VALIDAÇÃO PÓS-EXECUÇÃO
-- ============================================

-- Verificar FKs quebradas (deve retornar 0)
SELECT
  COUNT(*) as fks_quebradas,
  'Deve ser 0' as status
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 0;

-- Verificar RLS habilitado
SELECT
  COUNT(*) as tabelas_sem_rls,
  'Deve ser 0' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'nathia_%'
  AND rowsecurity = false;

-- Listar índices criados
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_nathia_%'
ORDER BY tablename, indexname;

-- ============================================
-- MENSAGEM FINAL
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CORREÇÕES APLICADAS COM SUCESSO!';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Verificar os resultados da validação acima';
  RAISE NOTICE '2. Testar queries de performance';
  RAISE NOTICE '3. Monitorar logs do Supabase';
  RAISE NOTICE '';
END $$;
