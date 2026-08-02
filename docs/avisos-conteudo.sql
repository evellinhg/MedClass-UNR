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

drop policy if exists "avisos_conteudo_admin_all" on public.avisos_conteudo;
create policy "avisos_conteudo_admin_all"
  on public.avisos_conteudo for all
  to authenticated
  using ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
  with check ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]));
