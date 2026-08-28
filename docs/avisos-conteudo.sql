-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Fila de avisos: toda vez que um material novo é criado no admin
-- (flashcards, videoaula, resumo, desafio clínico), uma linha "pendente"
-- entra aqui com um título/mensagem padrão editável. O admin decide no
-- painel /admin/avisos se envia (vira notificação pra todos os alunos,
-- via lib/notifications.ts) ou descarta -- nada é enviado sozinho.

create table if not exists public.avisos_conteudo (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  titulo text not null,
  mensagem text not null,
  link text,
  status text not null default 'pendente' check (status in ('pendente', 'enviado', 'descartado')),
  created_at timestamptz not null default now(),
  enviado_em timestamptz
);

alter table public.avisos_conteudo enable row level security;

-- Checagem por profiles.role (não por e-mail hardcoded): ver
-- docs/rls-remove-hardcoded-emails.sql, rodado em 2026-08-06, que já
-- migrou a policy live desta tabela pra este padrão. Este CREATE TABLE
-- só existia com a cláusula antiga porque era o script original de
-- criação da tabela, de antes dessa migração -- mantido desatualizado
-- em relação ao banco ao vivo até esta correção (2026-08-28).
drop policy if exists "avisos_conteudo_admin_all" on public.avisos_conteudo;
create policy "avisos_conteudo_admin_all"
  on public.avisos_conteudo for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and (profiles.access_expires_at is null or profiles.access_expires_at > now())
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and (profiles.access_expires_at is null or profiles.access_expires_at > now())
    )
  );
