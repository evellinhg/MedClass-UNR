-- Tabela de analytics de comportamento do usuário
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evento TEXT NOT NULL,
  dados JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_evento ON user_analytics(evento);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at DESC);

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Usuário só vê seus próprios dados
CREATE POLICY "Users see own analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode inserir
CREATE POLICY "Service role inserts analytics"
  ON user_analytics FOR INSERT
  WITH CHECK (true);
