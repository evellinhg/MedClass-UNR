-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Dá ao próprio aluno controle sobre aparecer ou não no Ranking, em vez de
-- depender só da lista fixa de e-mails de admin/teste excluídos em
-- ranking-por-materia.sql (que não cobre contas de teste "normais" nem dá
-- opção de privacidade pra alunos de verdade).

alter table public.profiles
  add column if not exists ranking_visivel boolean not null default true;

-- A policy "Users can update their own profile" já existente cobre esse
-- update (não é um campo sensível tipo role/plan que precisa de checagem
-- extra) -- nenhuma policy nova necessária.

-- Filtra por ranking_visivel nas duas funções do ranking. Recriadas por
-- inteiro aqui (não dá pra "alter function" só a cláusula where de dentro
-- de um SQL function body).
create or replace function public.get_ranking_por_materia(materia_filtro text default null, limite int default 5)
returns table (
  posicao bigint,
  user_id uuid,
  display_name text,
  correct bigint,
  total bigint,
  points bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with expandido as (
    select
      s.user_id,
      u.qid as questao_id,
      (r.val #>> '{}')::int as resposta
    from simulados s
    join lateral unnest(s.questao_ids) with ordinality as u(qid, idx) on true
    join lateral jsonb_array_elements(coalesce(s.respostas, '[]'::jsonb)) with ordinality as r(val, idx2) on true
    where s.finished_at is not null
      and u.idx = r.idx2
  ),
  respondidas as (
    select
      e.user_id,
      (e.resposta = q.indice_correta) as acertou
    from expandido e
    join questoes q on q.id = e.questao_id
    where e.resposta is not null
      and (materia_filtro is null or q.materia = materia_filtro)
  ),
  agregado as (
    select
      user_id,
      count(*) filter (where acertou) as correct,
      count(*) as total
    from respondidas
    group by user_id
  ),
  pontuado as (
    select
      a.user_id,
      coalesce(p.full_name, split_part(p.email, '@', 1)) as display_name,
      a.correct,
      a.total,
      (a.correct * 10 - (a.total - a.correct) * 3 + a.total * 1)::bigint as points
    from agregado a
    join profiles p on p.id = a.user_id
    where a.total > 0
      and p.email not in ('leonardoac.alves@gmail.com', 'leonardoac.alves2@gmail.com', 'medclassunr@gmail.com', 'teste.desempenho@medclassunr.dev')
      and coalesce(p.role, 'aluno') <> 'admin'
      and coalesce(p.plan, 'gratis') <> 'gratis'
      and p.ranking_visivel
  )
  select
    row_number() over (order by points desc, correct desc, total desc, display_name asc) as posicao,
    user_id, display_name, correct, total, points
  from pontuado
  order by points desc, correct desc, total desc, display_name asc
  limit limite;
$$;

create or replace function public.get_minha_posicao_ranking(materia_filtro text default null, alvo_user_id uuid default auth.uid())
returns table (
  posicao bigint,
  correct bigint,
  total bigint,
  points bigint,
  total_participantes bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with expandido as (
    select
      s.user_id,
      u.qid as questao_id,
      (r.val #>> '{}')::int as resposta
    from simulados s
    join lateral unnest(s.questao_ids) with ordinality as u(qid, idx) on true
    join lateral jsonb_array_elements(coalesce(s.respostas, '[]'::jsonb)) with ordinality as r(val, idx2) on true
    where s.finished_at is not null
      and u.idx = r.idx2
  ),
  respondidas as (
    select
      e.user_id,
      (e.resposta = q.indice_correta) as acertou
    from expandido e
    join questoes q on q.id = e.questao_id
    where e.resposta is not null
      and (materia_filtro is null or q.materia = materia_filtro)
  ),
  agregado as (
    select
      user_id,
      count(*) filter (where acertou) as correct,
      count(*) as total
    from respondidas
    group by user_id
    having count(*) > 0
  ),
  pontuado as (
    select
      a.user_id,
      coalesce(p.full_name, split_part(p.email, '@', 1)) as display_name,
      a.correct,
      a.total,
      (a.correct * 10 - (a.total - a.correct) * 3 + a.total * 1)::bigint as points
    from agregado a
    join profiles p on p.id = a.user_id
    where p.email not in ('leonardoac.alves@gmail.com', 'leonardoac.alves2@gmail.com', 'medclassunr@gmail.com', 'teste.desempenho@medclassunr.dev')
      and coalesce(p.role, 'aluno') <> 'admin'
      and coalesce(p.plan, 'gratis') <> 'gratis'
      and p.ranking_visivel
  ),
  posicionado as (
    select
      user_id,
      correct,
      total,
      points,
      row_number() over (order by points desc, correct desc, total desc, display_name asc) as posicao
    from pontuado
  )
  select posicao, correct, total, points, (select count(*) from posicionado) as total_participantes
  from posicionado
  where user_id = alvo_user_id;
$$;

grant execute on function public.get_ranking_por_materia(text, int) to authenticated;
grant execute on function public.get_minha_posicao_ranking(text, uuid) to authenticated;
