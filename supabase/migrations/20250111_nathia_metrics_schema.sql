-- ============================================================
-- NAT-IA Metrics Schema
-- Sistema completo de métricas e qualidade
--
-- PRIVACIDADE: Todas as tabelas são anônimas (sem PII)
-- RETENÇÃO: 90 dias detalhado, 2 anos agregado
-- ============================================================

-- ============= QUALITY METRICS =============

-- Feedback de utilidade (thumbs up/down)
CREATE TABLE IF NOT EXISTS nathia_quality_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  thumbs TEXT NOT NULL CHECK (thumbs IN ('up', 'down')),
  feedback_text TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_quality_feedback_timestamp ON nathia_quality_feedback(timestamp DESC);
CREATE INDEX idx_nathia_quality_feedback_session ON nathia_quality_feedback(session_id);

-- Deflexão (resolvido sem humano)
CREATE TABLE IF NOT EXISTS nathia_deflection_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  resolvido_sem_humano BOOLEAN NOT NULL,
  tempo_resolucao_min INTEGER NOT NULL,
  tentativas_transferencia INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_deflection_timestamp ON nathia_deflection_metrics(timestamp DESC);

-- Acolhimento (CSAT)
CREATE TABLE IF NOT EXISTS nathia_acolhimento_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  csat INTEGER NOT NULL CHECK (csat BETWEEN 1 AND 5),
  nps INTEGER CHECK (nps BETWEEN 0 AND 10),
  comentario TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_acolhimento_timestamp ON nathia_acolhimento_metrics(timestamp DESC);

-- Conversão (ações completadas)
CREATE TABLE IF NOT EXISTS nathia_conversao_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('marcar_consulta', 'acessar_recurso', 'salvar_dica', 'compartilhar', 'download_plano')),
  completed BOOLEAN NOT NULL,
  abandono_etapa TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_conversao_timestamp ON nathia_conversao_metrics(timestamp DESC);

-- ============= PERFORMANCE METRICS =============

-- Logs de performance (latência, erros)
CREATE TABLE IF NOT EXISTS nathia_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  latency_ms INTEGER,
  status_code INTEGER,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  user_id_hash TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_performance_logs_timestamp ON nathia_performance_logs(timestamp DESC);
CREATE INDEX idx_nathia_performance_logs_endpoint ON nathia_performance_logs(endpoint);
CREATE INDEX idx_nathia_performance_logs_status ON nathia_performance_logs(status_code);

-- Uso de tokens e custos
CREATE TABLE IF NOT EXISTS nathia_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  session_id TEXT NOT NULL,
  cache_hit BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_token_usage_timestamp ON nathia_token_usage(timestamp DESC);
CREATE INDEX idx_nathia_token_usage_model ON nathia_token_usage(model);
CREATE INDEX idx_nathia_token_usage_session ON nathia_token_usage(session_id);

-- ============= SAFETY METRICS =============

-- Eventos de segurança (riscos detectados)
CREATE TABLE IF NOT EXISTS nathia_safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  nivel_risco TEXT NOT NULL CHECK (nivel_risco IN ('baixo', 'medio', 'alto', 'critico')),
  sinais_detectados TEXT[] NOT NULL,
  falso_positivo BOOLEAN DEFAULT FALSE,
  acao_tomada TEXT NOT NULL CHECK (acao_tomada IN ('alerta', 'moderacao', 'encaminhamento_urgente')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_safety_events_timestamp ON nathia_safety_events(timestamp DESC);
CREATE INDEX idx_nathia_safety_events_nivel ON nathia_safety_events(nivel_risco);

-- Eventos de moderação manual
CREATE TABLE IF NOT EXISTS nathia_moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  decisao TEXT NOT NULL CHECK (decisao IN ('aprovado', 'bloqueado', 'escalado')),
  moderador_id TEXT,
  tempo_resposta_min INTEGER NOT NULL,
  notas TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_moderation_timestamp ON nathia_moderation_events(timestamp DESC);

-- Eventos SOS (emergências)
CREATE TABLE IF NOT EXISTS nathia_sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash TEXT NOT NULL,
  contexto_anonimizado JSONB NOT NULL,
  recurso_usado TEXT NOT NULL CHECK (recurso_usado IN ('telefone_191', 'samu', 'cvv', 'centros_apoio', 'artigo_info')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_sos_timestamp ON nathia_sos_events(timestamp DESC);
CREATE INDEX idx_nathia_sos_recurso ON nathia_sos_events(recurso_usado);

-- ============= USAGE ANALYTICS =============

-- Temas de conversas
CREATE TABLE IF NOT EXISTS nathia_temas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  tema TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('saude', 'emocional', 'pratico', 'informacao', 'emergencia')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_temas_timestamp ON nathia_temas(timestamp DESC);
CREATE INDEX idx_nathia_temas_categoria ON nathia_temas(categoria);

-- Sentimentos
CREATE TABLE IF NOT EXISTS nathia_sentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  sentimento_score DECIMAL(3, 2) NOT NULL CHECK (sentimento_score BETWEEN -1 AND 1),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_sentimentos_timestamp ON nathia_sentimentos(timestamp DESC);

-- ============= A/B TESTING =============

-- Experimentos
CREATE TABLE IF NOT EXISTS nathia_experiments (
  experiment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  variants TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  target_metric TEXT NOT NULL,
  sample_size_per_variant INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nathia_experiments_status ON nathia_experiments(status);

-- Atribuições de variantes
CREATE TABLE IF NOT EXISTS nathia_experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_hash TEXT NOT NULL,
  experiment_id UUID NOT NULL REFERENCES nathia_experiments(experiment_id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id_hash, experiment_id)
);

CREATE INDEX idx_nathia_experiment_assignments_exp ON nathia_experiment_assignments(experiment_id);
CREATE INDEX idx_nathia_experiment_assignments_user ON nathia_experiment_assignments(user_id_hash);

-- Métricas de experimentos
CREATE TABLE IF NOT EXISTS nathia_experiment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES nathia_experiments(experiment_id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10, 4) NOT NULL,
  sample_size INTEGER DEFAULT 1,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_experiment_metrics_exp ON nathia_experiment_metrics(experiment_id);
CREATE INDEX idx_nathia_experiment_metrics_timestamp ON nathia_experiment_metrics(timestamp DESC);

-- ============= ALERTS =============

-- Alertas
CREATE TABLE IF NOT EXISTS nathia_alerts (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('quality_drop', 'latency_spike', 'cost_spike', 'risk_missed', 'error_rate_high')),
  severidade TEXT NOT NULL CHECK (severidade IN ('info', 'warning', 'critical')),
  metrica TEXT NOT NULL,
  valor_atual DECIMAL(10, 4) NOT NULL,
  threshold DECIMAL(10, 4) NOT NULL,
  mensagem TEXT NOT NULL,
  acionado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolvido_em TIMESTAMPTZ,
  notificado_via TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nathia_alerts_acionado ON nathia_alerts(acionado_em DESC);
CREATE INDEX idx_nathia_alerts_resolvido ON nathia_alerts(resolvido_em);
CREATE INDEX idx_nathia_alerts_severidade ON nathia_alerts(severidade);

-- ============= MÉTRICAS AGREGADAS =============

-- Métricas agregadas diárias
CREATE TABLE IF NOT EXISTS nathia_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  quality_metrics JSONB,
  performance_metrics JSONB,
  safety_metrics JSONB,
  usage_metrics JSONB,
  cost_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nathia_metrics_date ON nathia_metrics(date DESC);

-- ============= RETENÇÃO DE DADOS =============

-- Função para limpar dados antigos (90 dias detalhado)
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  -- Manter apenas 90 dias de dados detalhados
  DELETE FROM nathia_quality_feedback WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_deflection_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_acolhimento_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_conversao_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_performance_logs WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_token_usage WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_safety_events WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_moderation_events WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_sos_events WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_temas WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_sentimentos WHERE timestamp < NOW() - INTERVAL '90 days';
  DELETE FROM nathia_experiment_metrics WHERE timestamp < NOW() - INTERVAL '90 days';

  -- Manter apenas 2 anos de dados agregados
  DELETE FROM nathia_metrics WHERE date < NOW() - INTERVAL '2 years';

  -- Manter apenas alertas dos últimos 90 dias
  DELETE FROM nathia_alerts WHERE acionado_em < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============= ROW LEVEL SECURITY (RLS) =============

-- Habilitar RLS em todas as tabelas
ALTER TABLE nathia_quality_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_deflection_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_acolhimento_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_conversao_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_sentimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_experiment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nathia_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas service_role pode escrever
CREATE POLICY "Service role can insert metrics" ON nathia_quality_feedback FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert deflection" ON nathia_deflection_metrics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert acolhimento" ON nathia_acolhimento_metrics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert conversao" ON nathia_conversao_metrics FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert performance" ON nathia_performance_logs FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert tokens" ON nathia_token_usage FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert safety" ON nathia_safety_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert moderation" ON nathia_moderation_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert sos" ON nathia_sos_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert temas" ON nathia_temas FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert sentimentos" ON nathia_sentimentos FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can manage experiments" ON nathia_experiments FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage assignments" ON nathia_experiment_assignments FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage exp metrics" ON nathia_experiment_metrics FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage alerts" ON nathia_alerts FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage aggregated" ON nathia_metrics FOR ALL TO service_role USING (true);

-- Admins podem ler todas as métricas
CREATE POLICY "Admins can read all metrics" ON nathia_quality_feedback FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read deflection" ON nathia_deflection_metrics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read acolhimento" ON nathia_acolhimento_metrics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read conversao" ON nathia_conversao_metrics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read performance" ON nathia_performance_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read tokens" ON nathia_token_usage FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read safety" ON nathia_safety_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read moderation" ON nathia_moderation_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read sos" ON nathia_sos_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read temas" ON nathia_temas FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read sentimentos" ON nathia_sentimentos FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read experiments" ON nathia_experiments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read assignments" ON nathia_experiment_assignments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read exp metrics" ON nathia_experiment_metrics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read alerts" ON nathia_alerts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can read aggregated" ON nathia_metrics FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============= COMENTÁRIOS =============

COMMENT ON TABLE nathia_quality_feedback IS 'Feedback de utilidade (thumbs up/down) - Meta: 85% thumbs up';
COMMENT ON TABLE nathia_deflection_metrics IS 'Deflexão (resolvido sem humano) - Meta: 60%';
COMMENT ON TABLE nathia_acolhimento_metrics IS 'CSAT e NPS - Meta: CSAT ≥4.5';
COMMENT ON TABLE nathia_conversao_metrics IS 'Conversão de ações - Meta: 35%';
COMMENT ON TABLE nathia_performance_logs IS 'Logs de performance (latência, erros) - SLO: p50<2.5s, p95<5s';
COMMENT ON TABLE nathia_token_usage IS 'Uso de tokens e custos por modelo';
COMMENT ON TABLE nathia_safety_events IS 'Eventos de segurança (riscos detectados)';
COMMENT ON TABLE nathia_moderation_events IS 'Eventos de moderação manual';
COMMENT ON TABLE nathia_sos_events IS 'Eventos SOS (emergências) - Dados anonimizados';
COMMENT ON TABLE nathia_temas IS 'Temas de conversas (sem PII)';
COMMENT ON TABLE nathia_sentimentos IS 'Sentimentos das conversas (-1 a 1)';
COMMENT ON TABLE nathia_experiments IS 'Experimentos A/B';
COMMENT ON TABLE nathia_experiment_assignments IS 'Atribuições de variantes (user_id hasheado)';
COMMENT ON TABLE nathia_experiment_metrics IS 'Métricas de experimentos';
COMMENT ON TABLE nathia_alerts IS 'Alertas de métricas';
COMMENT ON TABLE nathia_metrics IS 'Métricas agregadas diárias (retenção: 2 anos)';

-- ============= SUCESSO =============
DO $$
BEGIN
  RAISE NOTICE '✅ NAT-IA Metrics Schema criado com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: 16';
  RAISE NOTICE '🔒 RLS habilitado em todas as tabelas';
  RAISE NOTICE '♻️ Retenção: 90 dias detalhado, 2 anos agregado';
  RAISE NOTICE '🎯 Metas: Utilidade≥85%%, Deflexão≥60%%, CSAT≥4.5, Conversão≥35%%';
  RAISE NOTICE '⚡ SLO: p50<2.5s, p95<5s, uptime≥99.5%%';
END $$;
