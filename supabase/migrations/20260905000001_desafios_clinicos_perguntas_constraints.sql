-- Constraints de integridade para `desafios_clinicos_perguntas`, equivalentes
-- às adicionadas em `questoes` (20260905000000_...). Modelo de dados
-- diferente: `alternativas` é um array JSONB de objetos
-- {id, texto, correta, feedback} em vez de opcoes[]/indice_correta/
-- opcoes_comentario[] separados -- por isso as regras abaixo checam
-- "correta" e "texto" dentro de cada elemento do array.
--
-- Verificado ao vivo antes de escrever este arquivo (825 linhas): as 3
-- constraints abaixo passam em 100% dos dados atuais (0 sem alternativas
-- válidas, 0 sem exatamente uma alternativa correta, 0 com vazamento de
-- veredito no texto).

-- 1) tem que haver pelo menos 2 alternativas.
ALTER TABLE desafios_clinicos_perguntas ADD CONSTRAINT chk_desafios_perguntas_min_alternativas
  CHECK (jsonb_array_length(alternativas) >= 2);

-- 2) exatamente uma alternativa marcada como correta -- nem zero (pergunta
-- sem resposta certa) nem mais de uma (ambíguo). CHECK não aceita subquery
-- direto (mesma limitação encontrada na migration de questoes), por isso
-- vira uma função IMMUTABLE.
CREATE OR REPLACE FUNCTION desafios_perguntas_contar_corretas(alternativas JSONB)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::integer FROM jsonb_array_elements(alternativas) AS a
  WHERE (a->>'correta')::boolean IS TRUE;
$$ LANGUAGE sql IMMUTABLE;

ALTER TABLE desafios_clinicos_perguntas ADD CONSTRAINT chk_desafios_perguntas_uma_correta
  CHECK (desafios_perguntas_contar_corretas(alternativas) = 1);

-- 3) nenhum "texto" de alternativa pode começar com um rótulo de veredito
-- vazado ("Correcto."/"Incorrecta:" etc.) -- deveria aparecer só em
-- "feedback", nunca em "texto" (mostrado antes de responder).
CREATE OR REPLACE FUNCTION desafios_perguntas_tem_vazamento_veredito(alternativas JSONB)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(alternativas) AS a
    WHERE (a->>'texto') ~* '^\s*(correct|incorrect)[oa][.:]'
  );
$$ LANGUAGE sql IMMUTABLE;

ALTER TABLE desafios_clinicos_perguntas ADD CONSTRAINT chk_desafios_perguntas_sem_vazamento_veredito
  CHECK (NOT desafios_perguntas_tem_vazamento_veredito(alternativas));
