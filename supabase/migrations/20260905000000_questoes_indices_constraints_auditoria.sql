-- Melhorias estruturais na tabela `questoes`, a partir da auditoria de
-- viés/corrupção de banco de questões feita em 2026-09-04/05.
-- Execute no Supabase SQL Editor (não há CLI/link do projeto configurado
-- neste repo ainda -- ver seção final deste arquivo).
--
-- Verificado ao vivo antes de escrever este arquivo (scripts-tmp-verifica-
-- constraints-propostas.mjs, 10924 linhas ativas+inativas): as 3 constraints
-- abaixo passam em 100% dos dados atuais. Uma violação real foi encontrada
-- e corrigida antes disso (opção com "Incorrecto." vazado no início, ver
-- scripts-tmp-fix-leak-inicial-oftalmologia.mjs).

-- ============================================================
-- 1) Índice na coluna mais consultada, remoção de índices mortos
-- ============================================================
-- `materia` é filtrada em praticamente toda query de questões (scripts de
-- correção, painel admin, treino) e não tinha índice. `area`, `prova` e
-- `edicao` estão 100% NULL em amostra de 1000 linhas e sem nenhuma
-- referência a `questoes.area/prova/edicao` no código (grep em app/
-- components/ lib/) -- índices mantidos à toa em toda escrita.

CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes(materia);

DROP INDEX IF EXISTS idx_questoes_area;
DROP INDEX IF EXISTS idx_questoes_prova;
DROP INDEX IF EXISTS idx_questoes_edicao;

-- ============================================================
-- 2) Constraints de integridade de dados
-- ============================================================
-- Sem essas 3 regras, os bugs abaixo (todos encontrados manualmente nesta
-- sessão, matéria por matéria) só são detectáveis rodando um script de
-- varredura depois do fato:

-- 2a) indice_correta tem que apontar para uma posição real em opcoes.
ALTER TABLE questoes ADD CONSTRAINT chk_questoes_indice_correta_valido
  CHECK (indice_correta >= 0 AND indice_correta < array_length(opcoes, 1));

-- 2b) opcoes e opcoes_comentario têm que ter o mesmo tamanho (um dos
-- checks manuais mais repetidos nos scripts de integridade desta sessão).
ALTER TABLE questoes ADD CONSTRAINT chk_questoes_opcoes_comentario_tamanho
  CHECK (array_length(opcoes, 1) = array_length(opcoes_comentario, 1));

-- 2c) nenhuma opção pode começar com um rótulo de veredito vazado
-- ("Correcto."/"Incorrecta:" etc.) -- é exatamente o texto que deveria
-- aparecer só em opcoes_comentario (mostrado após responder), nunca em
-- opcoes (mostrado antes). Pega tanto o bug de vazamento de subagente
-- (feedback_distractor_rewrite_answer_leak) quanto o de limpar() do
-- pipeline de reforço (feedback_poda_sentence_split_bug).
ALTER TABLE questoes ADD CONSTRAINT chk_questoes_sem_vazamento_veredito
  CHECK (NOT EXISTS (
    SELECT 1 FROM unnest(opcoes) AS o
    WHERE o ~* '^\s*(correct|incorrect)[oa][.:]'
  ));

-- ============================================================
-- 3) Trilha de auditoria para UPDATE/DELETE em questoes
-- ============================================================
-- Até agora, toda correção em massa dependia de eu mesmo salvar um
-- snapshot em JSON antes de mutar, manualmente. Isso torna qualquer
-- edição futura reversível por padrão, sem depender de disciplina manual.

CREATE TABLE IF NOT EXISTS questoes_historico (
  id BIGSERIAL PRIMARY KEY,
  questao_id UUID NOT NULL,
  operacao TEXT NOT NULL CHECK (operacao IN ('UPDATE', 'DELETE')),
  dados_anteriores JSONB NOT NULL,
  alterado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questoes_historico_questao_id
  ON questoes_historico(questao_id, alterado_em DESC);

CREATE OR REPLACE FUNCTION questoes_registrar_historico()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO questoes_historico (questao_id, operacao, dados_anteriores)
  VALUES (OLD.id, TG_OP, to_jsonb(OLD));
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_questoes_historico ON questoes;
CREATE TRIGGER trg_questoes_historico
  AFTER UPDATE OR DELETE ON questoes
  FOR EACH ROW
  EXECUTE FUNCTION questoes_registrar_historico();

-- ============================================================
-- Nota sobre migrations
-- ============================================================
-- Este é o primeiro arquivo em supabase/migrations/ -- antes, mudanças de
-- schema viviam soltas em docs/*.sql sem ordem/data clara. Os arquivos em
-- docs/ continuam como estão (histórico), mas daqui pra frente, novas
-- mudanças de schema devem virar um novo arquivo aqui, numerado por data
-- (YYYYMMDDHHMMSS_descricao.sql), mesmo sem o Supabase CLI linkado ainda
-- -- se algum dia rodar `supabase link` + `supabase db push`, este
-- histórico já vai estar no formato certo.
