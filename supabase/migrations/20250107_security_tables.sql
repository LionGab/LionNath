-- NAT-IA Security System - Database Schema & RLS Policies
-- LGPD Compliant - Zero Trust Architecture

-- =====================================================
-- 1. TABELA: nathia_conversations
-- Conversas do NAT-IA (isoladas por user_id)
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',

  UNIQUE(user_id, conversation_id)
);

-- Índices para performance
CREATE INDEX idx_nathia_conversations_user_id ON nathia_conversations(user_id);
CREATE INDEX idx_nathia_conversations_created_at ON nathia_conversations(created_at DESC);
CREATE INDEX idx_nathia_conversations_conversation_id ON nathia_conversations(conversation_id);

-- RLS (Row Level Security)
ALTER TABLE nathia_conversations ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só vê suas próprias conversas
CREATE POLICY "Users can view own conversations"
  ON nathia_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário só pode criar suas próprias conversas
CREATE POLICY "Users can create own conversations"
  ON nathia_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário só pode atualizar suas próprias conversas
CREATE POLICY "Users can update own conversations"
  ON nathia_conversations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário só pode deletar suas próprias conversas
CREATE POLICY "Users can delete own conversations"
  ON nathia_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. TABELA: nathia_messages
-- Mensagens das conversas (criptografadas)
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES nathia_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content_encrypted TEXT, -- Conteúdo criptografado
  content_iv TEXT, -- Initialization Vector
  content_hash TEXT, -- Hash para integridade
  key_id TEXT, -- ID da chave usada
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- Metadados SEM PII (comprimento, risk_score, etc)

  -- Validações
  CONSTRAINT valid_content CHECK (
    (content_encrypted IS NOT NULL AND content_iv IS NOT NULL)
    OR content_encrypted IS NULL
  )
);

-- Índices
CREATE INDEX idx_nathia_messages_conversation_id ON nathia_messages(conversation_id);
CREATE INDEX idx_nathia_messages_user_id ON nathia_messages(user_id);
CREATE INDEX idx_nathia_messages_created_at ON nathia_messages(created_at DESC);

-- RLS
ALTER TABLE nathia_messages ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só vê suas próprias mensagens
CREATE POLICY "Users can view own messages"
  ON nathia_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário só pode criar suas próprias mensagens
CREATE POLICY "Users can create own messages"
  ON nathia_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode atualizar suas próprias mensagens
CREATE POLICY "Users can update own messages"
  ON nathia_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuário pode deletar suas próprias mensagens
CREATE POLICY "Users can delete own messages"
  ON nathia_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. TABELA: nathia_moderation_queue
-- Fila de moderação (apenas moderadores)
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES nathia_messages(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES nathia_conversations(id) ON DELETE SET NULL,

  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  urgency TEXT NOT NULL CHECK (urgency IN ('routine', 'elevated', 'urgent', 'emergency')),

  signals JSONB DEFAULT '[]', -- Sinais de risco detectados
  recommended_action TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'escalated')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX idx_nathia_moderation_status ON nathia_moderation_queue(status);
CREATE INDEX idx_nathia_moderation_urgency ON nathia_moderation_queue(urgency);
CREATE INDEX idx_nathia_moderation_created_at ON nathia_moderation_queue(created_at DESC);

-- RLS
ALTER TABLE nathia_moderation_queue ENABLE ROW LEVEL SECURITY;

-- Política: Apenas moderadores podem ver
CREATE POLICY "Moderators can view moderation queue"
  ON nathia_moderation_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- Política: Sistema pode inserir
CREATE POLICY "System can create moderation items"
  ON nathia_moderation_queue
  FOR INSERT
  WITH CHECK (true); -- Permitir inserção (feita pelo backend)

-- Política: Moderadores podem atualizar
CREATE POLICY "Moderators can update moderation items"
  ON nathia_moderation_queue
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- =====================================================
-- 4. TABELA: nathia_analytics
-- Analytics agregados (SEM PII)
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(date, metric_type)
);

-- Índices
CREATE INDEX idx_nathia_analytics_date ON nathia_analytics(date DESC);
CREATE INDEX idx_nathia_analytics_metric_type ON nathia_analytics(metric_type);

-- RLS
ALTER TABLE nathia_analytics ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admin/moderador pode ver analytics
CREATE POLICY "Admins can view analytics"
  ON nathia_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- Política: Sistema pode inserir
CREATE POLICY "System can create analytics"
  ON nathia_analytics
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5. TABELA: nathia_audit_logs
-- Logs de auditoria (metadados, sem PII)
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action_type TEXT NOT NULL,
  endpoint TEXT NOT NULL,

  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,

  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  latency_ms INTEGER,

  flags TEXT[] DEFAULT '{}',

  -- Índice de particionamento por data (para performance)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_nathia_audit_logs_user_id ON nathia_audit_logs(user_id);
CREATE INDEX idx_nathia_audit_logs_timestamp ON nathia_audit_logs(timestamp DESC);
CREATE INDEX idx_nathia_audit_logs_action_type ON nathia_audit_logs(action_type);
CREATE INDEX idx_nathia_audit_logs_flags ON nathia_audit_logs USING gin(flags);

-- RLS
ALTER TABLE nathia_audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver seus próprios logs
CREATE POLICY "Users can view own audit logs"
  ON nathia_audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Sistema pode inserir
CREATE POLICY "System can create audit logs"
  ON nathia_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Política: Admin pode ver todos os logs
CREATE POLICY "Admins can view all audit logs"
  ON nathia_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 6. TABELA: nathia_rate_limits
-- Rate limiting storage
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,

  requests JSONB DEFAULT '[]', -- Array de timestamps
  blocked_until TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);

-- Índices
CREATE INDEX idx_nathia_rate_limits_user_endpoint ON nathia_rate_limits(user_id, endpoint);
CREATE INDEX idx_nathia_rate_limits_updated_at ON nathia_rate_limits(updated_at);

-- RLS
ALTER TABLE nathia_rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: Sistema pode gerenciar rate limits
CREATE POLICY "System can manage rate limits"
  ON nathia_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. TABELA: nathia_encryption_keys
-- Chaves de criptografia por usuária
-- =====================================================

CREATE TABLE IF NOT EXISTS nathia_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  key_id TEXT NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL, -- Chave criptografada com master key
  algorithm TEXT DEFAULT 'aes-256-gcm',

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'rotating', 'deprecated', 'revoked')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,

  UNIQUE(user_id, status) WHERE status = 'active'
);

-- Índices
CREATE INDEX idx_nathia_encryption_keys_user_id ON nathia_encryption_keys(user_id);
CREATE INDEX idx_nathia_encryption_keys_status ON nathia_encryption_keys(status);

-- RLS
ALTER TABLE nathia_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver suas próprias chaves
CREATE POLICY "Users can view own encryption keys"
  ON nathia_encryption_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Sistema pode criar chaves
CREATE POLICY "System can create encryption keys"
  ON nathia_encryption_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Sistema pode atualizar chaves
CREATE POLICY "System can update encryption keys"
  ON nathia_encryption_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. TABELA: user_roles
-- Roles de usuários (admin, moderator, user)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'moderator', 'admin')),

  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),

  UNIQUE(user_id, role)
);

-- Índices
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver seus próprios roles
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Admin pode gerenciar roles
CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 9. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para limpar logs antigos (LGPD - 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM nathia_audit_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar rate limits antigos
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM nathia_rate_limits
  WHERE updated_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
CREATE TRIGGER update_nathia_conversations_updated_at
  BEFORE UPDATE ON nathia_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nathia_rate_limits_updated_at
  BEFORE UPDATE ON nathia_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. COMENTÁRIOS (Documentação)
-- =====================================================

COMMENT ON TABLE nathia_conversations IS 'Conversas NAT-IA isoladas por usuária (LGPD compliant)';
COMMENT ON TABLE nathia_messages IS 'Mensagens criptografadas end-to-end';
COMMENT ON TABLE nathia_moderation_queue IS 'Fila de moderação para conteúdo de risco';
COMMENT ON TABLE nathia_analytics IS 'Analytics agregados sem PII';
COMMENT ON TABLE nathia_audit_logs IS 'Logs de auditoria com retenção de 90 dias';
COMMENT ON TABLE nathia_rate_limits IS 'Rate limiting por usuária e endpoint';
COMMENT ON TABLE nathia_encryption_keys IS 'Chaves de criptografia por usuária';
COMMENT ON TABLE user_roles IS 'Roles de acesso (admin, moderator, user)';

-- =====================================================
-- 11. GRANTS (Permissões)
-- =====================================================

-- Permitir acesso autenticado às tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON nathia_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nathia_messages TO authenticated;
GRANT SELECT ON nathia_moderation_queue TO authenticated;
GRANT SELECT ON nathia_analytics TO authenticated;
GRANT SELECT ON nathia_audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nathia_encryption_keys TO authenticated;
GRANT SELECT ON user_roles TO authenticated;

-- Permitir ao service_role (backend) acesso completo
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
