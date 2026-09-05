-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Permite que cada aluno crie seus próprios eventos no calendário
-- (ex: prova da faculdade, compromisso pessoal), visíveis apenas
-- para ele mesmo. Reaproveita a tabela calendario_eventos existente:
-- user_id nulo = evento oficial (gerido pelo admin, visível a todos);
-- user_id preenchido = evento pessoal (visível só para o dono).
-- Os lembretes (calendario_lembretes) já funcionam automaticamente
-- pra esses eventos, sem nenhuma mudança.

alter table public.calendario_eventos add column user_id uuid references auth.users(id) on delete cascade;

create index idx_calendario_eventos_user on public.calendario_eventos (user_id);

alter table public.calendario_eventos drop constraint calendario_eventos_tipo_check;
alter table public.calendario_eventos add constraint calendario_eventos_tipo_check
  check (tipo in ('inscricao', 'prova', 'comunidade', 'cursado', 'pessoal'));

drop policy "calendario_eventos_select_ativos" on public.calendario_eventos;
create policy "calendario_eventos_select_ativos" on public.calendario_eventos
  for select to anon, authenticated
  using (ativo = true and (user_id is null or user_id = auth.uid()));

create policy "calendario_eventos_insert_own" on public.calendario_eventos
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "calendario_eventos_update_own" on public.calendario_eventos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "calendario_eventos_delete_own" on public.calendario_eventos
  for delete to authenticated
  using (user_id = auth.uid());
