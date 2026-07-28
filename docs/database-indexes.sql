-- Índices para otimização de performance - MedClass Teórico
-- Execute no Supabase SQL Editor
--
-- Nomes de tabela/coluna verificados contra o código real (grep em .from(...))
-- e confirmados ao vivo via information_schema.tables antes de rodar (as 17
-- tabelas abaixo existem). `leaderboard` é uma VIEW (não materializada), por
-- isso não está indexada aqui — o índice teria que ir na tabela base.

CREATE INDEX IF NOT EXISTS idx_questoes_ativo ON questoes(ativo);
CREATE INDEX IF NOT EXISTS idx_questoes_area ON questoes(area);
CREATE INDEX IF NOT EXISTS idx_questoes_dificuldade ON questoes(dificuldade);
CREATE INDEX IF NOT EXISTS idx_questoes_prova ON questoes(prova);
CREATE INDEX IF NOT EXISTS idx_questoes_edicao ON questoes(edicao);
CREATE INDEX IF NOT EXISTS idx_questoes_created_at ON questoes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulados_user_id ON simulados(user_id);
CREATE INDEX IF NOT EXISTS idx_simulados_created_at ON simulados(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulado_attempts_user_created ON simulado_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON notifications(lida);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_created ON user_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_evento ON user_analytics(evento);

CREATE INDEX IF NOT EXISTS idx_medcoins_ledger_user_created ON medcoins_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medcoins_wallets_user_id ON medcoins_wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_desafios_clinicos_ativo ON desafios_clinicos(ativo);
CREATE INDEX IF NOT EXISTS idx_desafios_clinicos_created_at ON desafios_clinicos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_desafios_clinicos_perguntas_desafio_ordem ON desafios_clinicos_perguntas(desafio_id, ordem);
CREATE INDEX IF NOT EXISTS idx_desafios_clinicos_historico_user_created ON desafios_clinicos_historico(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_materiais_flashcards_deck_ordem ON materiais_flashcards(deck_id, ordem);
CREATE INDEX IF NOT EXISTS idx_materiais_resumos_ativo ON materiais_resumos(ativo);
CREATE INDEX IF NOT EXISTS idx_materiais_resumos_ordem ON materiais_resumos(ordem);

CREATE INDEX IF NOT EXISTS idx_cronograma_trilhas_ativo ON cronograma_trilhas(ativo);
CREATE INDEX IF NOT EXISTS idx_cronograma_trilhas_created_at ON cronograma_trilhas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cronograma_rotinas_user_created ON cronograma_rotinas(user_id, created_at DESC);
