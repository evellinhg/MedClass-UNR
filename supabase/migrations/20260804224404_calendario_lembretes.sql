-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Lembretes pessoais de datas do calendário: o aluno marca um evento
-- específico (ex: "Inscripción — Nutrición") e passa a ver um aviso em
-- destaque no dashboard a partir de 2 dias antes até o dia do evento.

create table public.calendario_lembretes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  evento_id uuid not null references public.calendario_eventos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, evento_id)
);

create index idx_calendario_lembretes_user on public.calendario_lembretes (user_id);

alter table public.calendario_lembretes enable row level security;

create policy "calendario_lembretes_select_own" on public.calendario_lembretes
  for select to authenticated
  using (user_id = auth.uid());

create policy "calendario_lembretes_insert_own" on public.calendario_lembretes
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "calendario_lembretes_delete_own" on public.calendario_lembretes
  for delete to authenticated
  using (user_id = auth.uid());
