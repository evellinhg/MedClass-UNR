-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- A tabela public.notifications foi criada direto no Supabase (nunca
-- teve um docs/*.sql) e RLS estava ativado sem nenhuma policy de
-- select/update para o próprio usuário -- ou seja, com RLS "deny by
-- default", ninguém conseguia ler as próprias notificações nem marcar
-- como lida, mesmo com as linhas existindo na tabela. Confirmado via
-- teste com o token real de um aluno: select retornava 200 com [].
--
-- Não existe policy de insert para authenticated/anon de propósito: a
-- criação de notificações agora só acontece via
-- app/api/admin/avisos/[id]/enviar (service role, bypassa RLS).

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
