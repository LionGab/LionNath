-- NAT-IA Database Schema
-- Tabelas necessárias para as Edge Functions

-- ============================================
-- 1. Chat Messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  response text,
  role text DEFAULT 'user',
  context_data jsonb DEFAULT '{}'::jsonb,
  is_urgent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. Analytics
-- ============================================
CREATE TABLE IF NOT EXISTS nathia_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_nathia_analytics_event_type ON nathia_analytics(event_type);
CREATE INDEX idx_nathia_analytics_created_at ON nathia_analytics(created_at DESC);
CREATE INDEX idx_nathia_analytics_user_id ON nathia_analytics(user_id);

-- RLS Policies (apenas service role pode acessar)
ALTER TABLE nathia_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage analytics"
  ON nathia_analytics FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 3. Curadoria Cache
-- ============================================
CREATE TABLE IF NOT EXISTS nathia_curadoria_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('resumo', '5min', 'checklist')),
  resultado jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  UNIQUE(content_id, tipo)
);

-- Indexes
CREATE INDEX idx_curadoria_cache_content_tipo ON nathia_curadoria_cache(content_id, tipo);
CREATE INDEX idx_curadoria_cache_expires ON nathia_curadoria_cache(expires_at);

-- RLS Policies
ALTER TABLE nathia_curadoria_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cache"
  ON nathia_curadoria_cache FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-delete expired cache (função + trigger)
CREATE OR REPLACE FUNCTION delete_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM nathia_curadoria_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Moderação Log
-- ============================================
CREATE TABLE IF NOT EXISTS nathia_moderacao_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  labels text[] NOT NULL,
  severity text NOT NULL CHECK (severity IN ('none', 'low', 'medium', 'high')),
  auto_approved boolean DEFAULT false,
  sugestao text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_moderacao_log_message_id ON nathia_moderacao_log(message_id);
CREATE INDEX idx_moderacao_log_created_at ON nathia_moderacao_log(created_at DESC);
CREATE INDEX idx_moderacao_log_auto_approved ON nathia_moderacao_log(auto_approved);

-- RLS Policies
ALTER TABLE nathia_moderacao_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view all logs"
  ON nathia_moderacao_log FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Service role can insert logs"
  ON nathia_moderacao_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 5. Onboarding Results
-- ============================================
CREATE TABLE IF NOT EXISTS nathia_onboarding_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  respostas jsonb NOT NULL,
  resultado jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_onboarding_results_user_id ON nathia_onboarding_results(user_id);

-- RLS Policies
ALTER TABLE nathia_onboarding_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding"
  ON nathia_onboarding_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage onboarding"
  ON nathia_onboarding_results FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 6. Storage Bucket para Rate Limits
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('rate-limits', 'rate-limits', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para rate-limits bucket
CREATE POLICY "Service role can manage rate limits"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'rate-limits' AND
    auth.role() = 'service_role'
  );

-- ============================================
-- 7. Views úteis
-- ============================================

-- View de analytics por função
CREATE OR REPLACE VIEW nathia_analytics_summary AS
SELECT
  event_type,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as unique_users,
  AVG((metadata->>'response_time_ms')::numeric) as avg_response_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (metadata->>'response_time_ms')::numeric) as p50_response_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata->>'response_time_ms')::numeric) as p95_response_time_ms
FROM nathia_analytics
WHERE created_at > now() - interval '30 days'
GROUP BY event_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC, event_type;

-- View de safety levels
CREATE OR REPLACE VIEW nathia_safety_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  metadata->>'safety_level' as safety_level,
  COUNT(*) as total
FROM nathia_analytics
WHERE event_type = 'chat'
  AND created_at > now() - interval '30 days'
GROUP BY DATE_TRUNC('day', created_at), metadata->>'safety_level'
ORDER BY date DESC;

-- View de moderação
CREATE OR REPLACE VIEW nathia_moderacao_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  severity,
  auto_approved,
  COUNT(*) as total
FROM nathia_moderacao_log
WHERE created_at > now() - interval '30 days'
GROUP BY DATE_TRUNC('day', created_at), severity, auto_approved
ORDER BY date DESC;

-- ============================================
-- 8. Funções auxiliares
-- ============================================

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep integer DEFAULT 90)
RETURNS void AS $$
BEGIN
  -- Deletar analytics antigos
  DELETE FROM nathia_analytics
  WHERE created_at < now() - (days_to_keep || ' days')::interval;

  -- Deletar cache expirado
  DELETE FROM nathia_curadoria_cache
  WHERE expires_at < now();

  -- Deletar logs de moderação antigos
  DELETE FROM nathia_moderacao_log
  WHERE created_at < now() - (days_to_keep || ' days')::interval;

  -- Notificar
  RAISE NOTICE 'Cleanup completed: deleted data older than % days', days_to_keep;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. Triggers
-- ============================================

-- Atualizar updated_at em chat_messages
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. Grants de permissões
-- ============================================

-- Permitir authenticated users acessarem suas próprias mensagens
GRANT SELECT, INSERT ON chat_messages TO authenticated;

-- Permitir service role acesso completo
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE chat_messages IS 'Histórico de conversas NAT-IA';
COMMENT ON TABLE nathia_analytics IS 'Eventos e métricas do sistema NAT-IA';
COMMENT ON TABLE nathia_curadoria_cache IS 'Cache de conteúdo curado (24h TTL)';
COMMENT ON TABLE nathia_moderacao_log IS 'Log de moderação assistida';
COMMENT ON TABLE nathia_onboarding_results IS 'Resultados de onboarding inteligente';
COMMENT ON VIEW nathia_analytics_summary IS 'Resumo diário de analytics';
COMMENT ON VIEW nathia_safety_summary IS 'Resumo diário de safety levels';
COMMENT ON VIEW nathia_moderacao_summary IS 'Resumo diário de moderação';
