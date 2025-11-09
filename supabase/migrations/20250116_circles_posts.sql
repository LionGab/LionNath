-- Migration: Circles e Posts Collections
-- Cria tabelas para Círculos de Apoio e Posts (anônimos por padrão)

-- Tabela de Círculos
CREATE TABLE IF NOT EXISTS circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT, -- gestante, mae, tentante, puerperio
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Posts (anônimos por padrão)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE, -- Anônimo por padrão
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Likes em Posts
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_posts_circle_id ON posts(circle_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_anonymous ON posts(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- RLS Policies
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler círculos
CREATE POLICY "circles_read_all" ON circles FOR SELECT USING (true);

-- Policy: Usuários autenticados podem criar posts
CREATE POLICY "posts_insert_authenticated" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Todos podem ler posts (anônimos)
CREATE POLICY "posts_read_all" ON posts FOR SELECT USING (true);

-- Policy: Usuários podem atualizar seus próprios posts
CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios posts
CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Policy: Usuários autenticados podem curtir posts
CREATE POLICY "post_likes_insert_authenticated" ON post_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Usuários podem ver seus próprios likes
CREATE POLICY "post_likes_read_own" ON post_likes FOR SELECT USING (auth.uid() = user_id OR true);

-- Policy: Usuários podem remover seus próprios likes
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_circles_updated_at BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir círculos padrão
INSERT INTO circles (name, description, stage) VALUES
  ('Gestantes', 'Círculo de apoio para gestantes', 'gestante'),
  ('Mães', 'Círculo de apoio para mães', 'mae'),
  ('Tentantes', 'Círculo de apoio para tentantes', 'tentante'),
  ('Puerpério', 'Círculo de apoio para puerpério', 'puerperio')
ON CONFLICT DO NOTHING;
