-- ============================================================
-- MIGRAÇÃO: Novos campos para tabela questoes
-- MedClass Teórico — REVALIDA 2024/1
-- ============================================================
-- Execute este SQL no Supabase SQL Editor antes de importar as questões

-- 1. Adicionar campo edição (ex: "2024.1", "2023.2")
ALTER TABLE questoes ADD COLUMN IF NOT EXISTS edicao text;

-- 2. Adicionar campo opcoes_comentario (comentário para CADA alternativa)
-- Formato: ["Comentário da A", "Comentário da B", "Comentário da C", "Comentário da D"]
ALTER TABLE questoes ADD COLUMN IF NOT EXISTS opcoes_comentario text[];

-- 3. Criar índice para busca por edição
CREATE INDEX IF NOT EXISTS idx_questoes_edicao ON questoes(edicao);

-- 4. Comentário nas colunas
COMMENT ON COLUMN questoes.edicao IS 'Edição da prova (ex: 2024.1 = primeira edição 2024)';
COMMENT ON COLUMN questoes.opcoes_comentario IS 'Comentário explicativo para cada alternativa (índice 0=A, 1=B, etc)';
COMMENT ON COLUMN questoes.justificativa IS 'Justificativa geral de por que a resposta correta está certa';

-- ============================================================
-- Verificação
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'questoes'
ORDER BY ordinal_position;
