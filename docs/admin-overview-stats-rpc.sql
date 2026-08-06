-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
--
-- A página /admin (Visão Geral) disparava ~16 queries separadas em
-- paralelo (uma contagem por tabela + séries + distribuições + últimas
-- questões) direto do componente client-side. Isso funcionava bem em wifi
-- de desktop, mas em conexão de celular mais instável (relatado via PWA
-- instalado) parte das requisições nunca resolvia -- e como nenhuma tinha
-- timeout/retry/erro visível, a tela ficava com os números e gráficos
-- vazios pra sempre, sem nenhum aviso.
--
-- Essa função junta tudo isso numa única query/round-trip. security
-- definer porque contamos linhas em várias tabelas de uma vez -- mais
-- simples e robusto do que depender da cadeia de policies de RLS de cada
-- tabela individualmente; a checagem de admin/colaborador é feita
-- explicitamente logo no início, então continua tão restrito quanto antes.
create or replace function public.admin_overview_stats(dias_tendencia int default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado jsonb;
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and role = any (array['admin', 'colaborador'])
  ) then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'counts', jsonb_build_object(
      'questoes', (select count(*) from questoes),
      'profiles', (select count(*) from profiles),
      'simulado_attempts', (select count(*) from simulado_attempts),
      'simulados', (select count(*) from simulados),
      'materiais_flashcard_decks', (select count(*) from materiais_flashcard_decks),
      'materiais_flashcards', (select count(*) from materiais_flashcards),
      'materiais_videoaulas', (select count(*) from materiais_videoaulas),
      'materiais_resumos', (select count(*) from materiais_resumos),
      'desafios_clinicos', (select count(*) from desafios_clinicos)
    ),
    'depoimentos_pendentes', (select count(*) from depoimentos where status = 'pendente'),
    'plano_dist', (
      select coalesce(jsonb_agg(jsonb_build_object('chave', coalesce(plan, 'gratis'), 'total', total)), '[]'::jsonb)
      from (select plan, count(*) as total from profiles group by plan) t
    ),
    'dificuldade_dist', (
      select coalesce(jsonb_agg(jsonb_build_object('chave', coalesce(dificuldade, '—'), 'total', total)), '[]'::jsonb)
      from (select dificuldade, count(*) as total from questoes group by dificuldade) t
    ),
    'serie_profiles', (
      select coalesce(jsonb_agg(jsonb_build_object('data', dia::text, 'total', total) order by dia), '[]'::jsonb)
      from (
        select d::date as dia, count(p.id) as total
        from generate_series(current_date - (dias_tendencia - 1), current_date, interval '1 day') d
        left join profiles p on p.created_at::date = d::date
        group by d
      ) t
    ),
    'serie_simulado_attempts', (
      select coalesce(jsonb_agg(jsonb_build_object('data', dia::text, 'total', total) order by dia), '[]'::jsonb)
      from (
        select d::date as dia, count(s.id) as total
        from generate_series(current_date - (dias_tendencia - 1), current_date, interval '1 day') d
        left join simulado_attempts s on s.created_at::date = d::date
        group by d
      ) t
    ),
    'serie_questoes', (
      select coalesce(jsonb_agg(jsonb_build_object('data', dia::text, 'total', total) order by dia), '[]'::jsonb)
      from (
        select d::date as dia, count(q.id) as total
        from generate_series(current_date - (dias_tendencia - 1), current_date, interval '1 day') d
        left join questoes q on q.created_at::date = d::date
        group by d
      ) t
    ),
    'serie_simulados', (
      select coalesce(jsonb_agg(jsonb_build_object('data', dia::text, 'total', total) order by dia), '[]'::jsonb)
      from (
        select d::date as dia, count(sm.id) as total
        from generate_series(current_date - (dias_tendencia - 1), current_date, interval '1 day') d
        left join simulados sm on sm.created_at::date = d::date
        group by d
      ) t
    ),
    'recent_questoes', (
      select coalesce(jsonb_agg(row_to_json(q)), '[]'::jsonb)
      from (
        select id, enunciado, materia, dificuldade, created_at
        from questoes order by created_at desc limit 5
      ) q
    )
  ) into resultado;

  return resultado;
end;
$$;

grant execute on function public.admin_overview_stats(int) to authenticated;
