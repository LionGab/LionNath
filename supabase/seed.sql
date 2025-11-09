-- =====================================================
-- SEED DATA - Nossa Maternidade
-- Dados de teste para desenvolvimento local
-- =====================================================
-- 
-- USO:
--   supabase db reset  # Reseta e aplica migrations + seed
--   OU
--   psql -h localhost -p 54322 -U postgres -d postgres -f seed.sql
--
-- ⚠️ ATENÇÃO: Este arquivo contém dados de teste.
-- NUNCA execute em produção!
-- =====================================================

-- Limpar dados existentes (opcional - apenas para reset completo)
-- TRUNCATE TABLE user_profiles CASCADE;
-- TRUNCATE TABLE chat_messages CASCADE;
-- TRUNCATE TABLE habits CASCADE;
-- TRUNCATE TABLE habit_logs CASCADE;

-- =====================================================
-- 1. USUÁRIAS DE TESTE
-- =====================================================

-- Usuária 1: Gestante (primeira gestação)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'gestante@test.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Maria Silva"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (
  id,
  email,
  name,
  type,
  pregnancy_week,
  subscription_tier,
  onboarding_data,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'gestante@test.com',
  'Maria Silva',
  'gestante',
  20,
  'free',
  '{"feeling": "ansiosa", "support_needed": ["emocional", "informação"]}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  pregnancy_week = EXCLUDED.pregnancy_week;

-- Usuária 2: Mãe estabelecida
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'mae@test.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Ana Costa"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (
  id,
  email,
  name,
  type,
  baby_name,
  subscription_tier,
  onboarding_data,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'mae@test.com',
  'Ana Costa',
  'mae_estabelecida',
  'João',
  'premium',
  '{"feeling": "confiante", "support_needed": ["comunidade"]}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  baby_name = EXCLUDED.baby_name;

-- Usuária 3: Tentante
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'tentante@test.com',
  crypt('senha123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Carla Santos"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (
  id,
  email,
  name,
  type,
  subscription_tier,
  onboarding_data,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'tentante@test.com',
  'Carla Santos',
  'tentante',
  'free',
  '{"feeling": "esperançosa", "support_needed": ["informação"]}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- =====================================================
-- 2. HÁBITOS DE TESTE
-- =====================================================

-- Template de hábitos padrão
INSERT INTO public.habit_templates (
  id,
  name,
  description,
  category,
  icon,
  created_at
) VALUES
  (
    gen_random_uuid(),
    'Hidratação',
    'Beber 2L de água por dia',
    'saude',
    '💧',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Meditação',
    '5 minutos de respiração consciente',
    'bem_estar',
    '🧘',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Autocuidado',
    'Momento para você',
    'bem_estar',
    '🌸',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Diário',
    'Registrar sentimentos do dia',
    'emocional',
    '📝',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Hábitos ativos para usuária 1
INSERT INTO public.habits (
  id,
  user_id,
  name,
  description,
  category,
  icon,
  target_frequency,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Hidratação',
    'Beber 2L de água por dia',
    'saude',
    '💧',
    'daily',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Meditação',
    '5 minutos de respiração consciente',
    'bem_estar',
    '🧘',
    'daily',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Logs de hábitos (últimos 7 dias)
DO $$
DECLARE
  habit_id UUID;
  log_date DATE;
BEGIN
  -- Pegar primeiro hábito da usuária 1
  SELECT id INTO habit_id FROM public.habits 
  WHERE user_id = '11111111-1111-1111-1111-111111111111' 
  LIMIT 1;
  
  -- Criar logs para últimos 7 dias (alguns completos, outros não)
  FOR i IN 0..6 LOOP
    log_date := CURRENT_DATE - i;
    
    INSERT INTO public.habit_logs (
      id,
      habit_id,
      user_id,
      completed_at,
      notes,
      created_at
    ) VALUES (
      gen_random_uuid(),
      habit_id,
      '11111111-1111-1111-1111-111111111111',
      CASE WHEN i % 2 = 0 THEN log_date ELSE NULL END, -- Alterna completos/incompletos
      CASE WHEN i % 2 = 0 THEN 'Completado!' ELSE NULL END,
      log_date
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 3. STREAKS (Sequências)
-- =====================================================

INSERT INTO public.streaks (
  id,
  user_id,
  habit_id,
  current_streak,
  longest_streak,
  last_completed_at,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  h.id,
  3, -- Streak atual de 3 dias
  5, -- Maior streak de 5 dias
  CURRENT_DATE - 1, -- Último completado ontem
  NOW(),
  NOW()
FROM public.habits h
WHERE h.user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. GAMIFICAÇÃO
-- =====================================================

INSERT INTO public.user_gamification (
  id,
  user_id,
  total_xp,
  current_level,
  badges,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    150, -- 150 XP
    2,   -- Nível 2
    ARRAY['first_habit', 'week_streak']::TEXT[], -- Badges
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    500, -- 500 XP
    5,   -- Nível 5
    ARRAY['first_habit', 'week_streak', 'month_streak', 'community_helper']::TEXT[],
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. MENSAGENS DE CHAT (NathIA)
-- =====================================================

-- Conversa de exemplo para usuária 1
INSERT INTO public.chat_messages (
  id,
  user_id,
  role,
  content,
  created_at
) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'user',
    'Olá, estou me sentindo ansiosa hoje...',
    NOW() - INTERVAL '2 hours'
  ),
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'assistant',
    'Olá! Entendo que você está se sentindo ansiosa. Isso é completamente normal durante a gestação. Quer conversar sobre o que está te deixando ansiosa?',
    NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds'
  ),
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'user',
    'Tenho medo do parto...',
    NOW() - INTERVAL '1 hour'
  ),
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'assistant',
    'O medo do parto é muito comum e válido. Você já conversou com sua equipe médica sobre suas preocupações? Posso te ajudar a preparar algumas perguntas para fazer na próxima consulta.',
    NOW() - INTERVAL '1 hour' + INTERVAL '45 seconds'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. DICAS DIÁRIAS
-- =====================================================

INSERT INTO public.daily_insights (
  id,
  user_id,
  content,
  category,
  generated_at,
  created_at
) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Lembre-se: cada gestação é única. Confie no seu corpo e na sua equipe médica.',
    'emocional',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    'Você está fazendo um trabalho incrível! Pequenos momentos de autocuidado fazem toda a diferença.',
    'bem_estar',
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. POSTS MUNDO NATH (Feed)
-- =====================================================

INSERT INTO public.mundo_nath_posts (
  id,
  title,
  content,
  author_name,
  category,
  published_at,
  created_at
) VALUES
  (
    gen_random_uuid(),
    'A maternidade real',
    'Maternidade não é sobre perfeição. É sobre amor, dedicação e aprender todos os dias. Você não precisa ser perfeita, só precisa ser presente.',
    'Nathália Valente',
    'reflexao',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(),
    'Autocuidado não é egoísmo',
    'Cuidar de você não é egoísmo. É necessário. Você não pode cuidar de ninguém se não estiver bem. Reserve um tempo para você, mesmo que sejam apenas 5 minutos por dia.',
    'Nathália Valente',
    'autocuidado',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. CONTEÚDO CURADO (MãeValente)
-- =====================================================

INSERT INTO public.curated_content (
  id,
  title,
  description,
  url,
  source,
  category,
  published_at,
  created_at
) VALUES
  (
    gen_random_uuid(),
    'Alimentação na Gestação',
    'Guia completo sobre nutrição durante a gestação',
    'https://exemplo.com/alimentacao-gestacao',
    'MãeValente',
    'saude',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  ),
  (
    gen_random_uuid(),
    'Depressão Pós-Parto: Sinais e Ajuda',
    'Reconhecer os sinais e buscar ajuda é fundamental',
    'https://exemplo.com/depressao-pos-parto',
    'MãeValente',
    'saude_mental',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- RESUMO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Seed data criado com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Dados inseridos:';
  RAISE NOTICE '  - 3 usuárias de teste';
  RAISE NOTICE '  - Hábitos e logs';
  RAISE NOTICE '  - Streaks e gamificação';
  RAISE NOTICE '  - Mensagens de chat';
  RAISE NOTICE '  - Dicas diárias';
  RAISE NOTICE '  - Posts e conteúdo curado';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Credenciais de teste:';
  RAISE NOTICE '  gestante@test.com / senha123';
  RAISE NOTICE '  mae@test.com / senha123';
  RAISE NOTICE '  tentante@test.com / senha123';
END $$;
