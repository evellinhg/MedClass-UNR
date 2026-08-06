-- Rodado direto no SQL Editor do Supabase (projeto MedClass UNR) em 2026-08-06,
-- poucas horas depois de docs/rls-remove-hardcoded-emails.sql.
--
-- BUG CRÍTICO introduzido pela migração anterior: as políticas
-- "Admins can view all profiles" e "Admins can update all profiles" (na
-- própria tabela public.profiles) tinham sua cláusula de e-mail hardcoded
-- trocada por um EXISTS (SELECT 1 FROM profiles WHERE ...) inline -- só que
-- essa policy está DEFINIDA na tabela profiles e faz uma subquery na PRÓPRIA
-- profiles. O Postgres precisa reavaliar as policies de profiles pra
-- resolver essa subquery, incluindo essa mesma policy de novo -> recursão
-- infinita (erro 42P17 "infinite recursion detected in policy for relation
-- profiles").
--
-- Isso não quebrava só leitura de profiles: qualquer tabela cuja policy
-- checa admin/colaborador via "EXISTS (SELECT 1 FROM profiles WHERE ...)"
-- (questoes, desafios_clinicos, materiais_flashcard_decks, materiais_
-- videoaulas, materiais_resumos, cronograma_trilhas, medcoins_*, simulados,
-- depoimentos, avisos_conteudo, bucket videoaulas-arquivos -- ou seja,
-- praticamente todo o conteúdo da plataforma) também disparava a mesma
-- recursão ao consultar profiles internamente, mesmo pra usuários comuns
-- (relatado como "treinamento livre diz que não há perguntas carregadas" e
-- "desafios clínicos/videoaulas/flashcards não aparecem" numa conta grátis
-- recém-criada).
--
-- Fix: as duas policies de profiles passam a chamar uma função
-- security definer (is_admin(), só admin -- não colaborador, mesmo escopo
-- que elas já tinham antes) em vez de uma subquery inline. Uma função
-- security definer roda com privilégios do dono (bypassa RLS internamente),
-- então sua própria SELECT em profiles não reavalia as policies de
-- profiles -- quebra o ciclo. É o mesmo padrão que public.is_admin_or_
-- colaborador() já usava em outras policies deste projeto; só não foi
-- reaproveitado aqui na migração anterior por engano.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

alter policy "Admins can view all profiles" on public.profiles
  using (public.is_admin());

alter policy "Admins can update all profiles" on public.profiles
  using (public.is_admin())
  with check (public.is_admin());

-- Verificação: nenhuma tabela deve mais retornar o erro 42P17. Testado via
-- REST direto com a anon key (select id from <tabela> limit 1) em questoes,
-- desafios_clinicos, materiais_videoaulas, materiais_flashcard_decks,
-- materiais_resumos, cronograma_trilhas, simulados, depoimentos,
-- avisos_conteudo -- todas responderam normalmente (sem erro, com ou sem
-- linhas conforme RLS esperado).
