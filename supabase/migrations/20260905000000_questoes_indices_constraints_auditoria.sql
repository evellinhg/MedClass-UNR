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
-- `opcoes` é JSONB mas `opcoes_comentario` é ARRAY nativo (text[]) --
-- tipos diferentes entre as duas colunas, descoberto em duas tentativas
-- falhas de rodar esta migration (array_length não existe para jsonb,
-- jsonb_array_length não existe para text[]). Confirmado via
-- information_schema.columns antes desta versão final.
ALTER TABLE questoes ADD CONSTRAINT chk_questoes_indice_correta_valido
  CHECK (indice_correta >= 0 AND indice_correta < jsonb_array_length(opcoes));

-- 2b) opcoes e opcoes_comentario têm que ter o mesmo tamanho (um dos
-- checks manuais mais repetidos nos scripts de integridade desta sessão).
ALTER TABLE questoes ADD CONSTRAINT chk_questoes_opcoes_comentario_tamanho
  CHECK (jsonb_array_length(opcoes) = array_length(opcoes_comentario, 1));

-- 2c) nenhuma opção pode começar com um rótulo de veredito vazado
-- ("Correcto."/"Incorrecta:" etc.) -- é exatamente o texto que deveria
-- aparecer só em opcoes_comentario (mostrado após responder), nunca em
-- opcoes (mostrado antes). Pega tanto o bug de vazamento de subagente
-- (feedback_distractor_rewrite_answer_leak) quanto o de limpar() do
-- pipeline de reforço (feedback_poda_sentence_split_bug).
-- Postgres não permite subquery dentro de CHECK ("cannot use subquery in
-- check constraint", erro encontrado ao tentar EXISTS(SELECT...) direto),
-- por isso a checagem vira uma função IMMUTABLE chamada pelo CHECK.
CREATE OR REPLACE FUNCTION questoes_tem_vazamento_veredito(opcoes JSONB)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(opcoes) AS o
    WHERE o ~* '^\s*(correct|incorrect)[oa][.:]'
  );
$$ LANGUAGE sql IMMUTABLE;

ALTER TABLE questoes ADD CONSTRAINT chk_questoes_sem_vazamento_veredito
  CHECK (NOT questoes_tem_vazamento_veredito(opcoes));

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

-- RLS habilitado sem nenhuma policy: nega acesso a anon/authenticated por
-- padrão, só o service_role (que ignora RLS) consegue ler -- é uma tabela
-- de auditoria interna, não deve ser exposta via API pública.
ALTER TABLE questoes_historico ENABLE ROW LEVEL SECURITY;

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
