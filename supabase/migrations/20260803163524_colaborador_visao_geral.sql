-- Libera para colaborador (profiles.role = 'colaborador') a leitura dos dados
-- agregados usados nos cards da Visao Geral do painel admin (Usuarios,
-- Tentativas, Simulados, depoimentos pendentes), igual ao que admin ja tem.
--
-- Tambem corrige 2 problemas pre-existentes descobertos ao investigar:
-- 1) A tabela "simulados" nao tinha NENHUMA politica admin-wide de SELECT
--    (so existiam policies escopadas a user_id = auth.uid()), entao o card
--    "Simulados" ja estava incorreto ate para admin (so contava os
--    simulados do proprio admin).
-- 2) A tabela "depoimentos" nao tinha politica alguma que permitisse ver
--    depoimentos com status != 'aprovado', entao o alerta de "depoimentos
--    aguardando moderacao" sempre mostrava 0 mesmo para admin.
--
-- ATENCAO: a policy de "profiles" nao pode usar um subquery direto em
-- "profiles" dentro da propria policy de "profiles" -- isso causa erro
-- "infinite recursion detected in policy for relation profiles" (42P17),
-- porque o subquery tambem aciona RLS na mesma tabela. Por isso essa
-- policy especifica usa a function is_admin_or_colaborador() (security
-- definer, roda sem RLS) em vez do subquery direto. As outras 3 policies
-- (em simulados/simulado_attempts/depoimentos) sao seguras com subquery
-- direto porque estao em tabelas DIFERENTES de profiles.

create or replace function public.is_admin_or_colaborador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = any (array['admin','colaborador'])
  );
$$;

-- 1) profiles: colaborador pode ver todos os perfis (contagem de usuarios)
alter policy "Admins can view all profiles" on public.profiles
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR public.is_admin_or_colaborador()
  );

-- 2) simulados: cria a policy admin-wide que faltava (corrige tambem para admin)
create policy "simulados_select_admin_colaborador" on public.simulados
  for select to authenticated
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

-- 3) simulado_attempts: adiciona colaborador na policy de admin ja existente
alter policy "Admins can view all attempts" on public.simulado_attempts
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );

-- 4) depoimentos: cria a policy admin-wide que faltava (corrige tambem para admin)
create policy "depoimentos_select_admin_colaborador" on public.depoimentos
  for select to authenticated
  using (
    ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
    OR (EXISTS ( SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ANY (ARRAY['admin'::text, 'colaborador'::text]) ))
  );
