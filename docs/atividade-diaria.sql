-- Atividade Diária (streak): 1 linha por usuário por dia em que completou pelo menos
-- 1 treino (simulado, desafio clínico ou deck de flashcards). O streak atual é
-- calculado na leitura (ver lib/atividade-diaria.ts), não armazenado como contador.

create table public.atividade_diaria_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dia date not null,
  created_at timestamptz not null default now(),
  unique (user_id, dia)
);

create index idx_atividade_diaria_log_user_dia on public.atividade_diaria_log (user_id, dia desc);

alter table public.atividade_diaria_log enable row level security;

create policy "atividade_diaria_select_own" on public.atividade_diaria_log
  for select to authenticated using (user_id = auth.uid());

create policy "atividade_diaria_insert_own" on public.atividade_diaria_log
  for insert to authenticated with check (user_id = auth.uid());
