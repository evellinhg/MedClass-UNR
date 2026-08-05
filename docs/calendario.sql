-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Calendário colaborativo de estudos: eventos oficiais (inscrições, provas,
-- eventos da comunidade) geridos pelo admin, + sugestões de atualização
-- enviadas pelos alunos, que ficam pendentes até revisão manual (nunca
-- entram automaticamente no calendário público).

create table public.calendario_eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data date not null,
  hora time,
  tipo text not null default 'comunidade' check (tipo in ('inscricao', 'prova', 'comunidade', 'cursado')),
  link text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_calendario_eventos_data on public.calendario_eventos (data);

alter table public.calendario_eventos enable row level security;

create policy "calendario_eventos_select_ativos" on public.calendario_eventos
  for select to anon, authenticated
  using (ativo = true);

create policy "calendario_eventos_admin_all" on public.calendario_eventos
  for all to authenticated
  using (public.is_admin_or_colaborador())
  with check (public.is_admin_or_colaborador());

create table public.calendario_sugestoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  mensagem text not null,
  data_sugerida date,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz not null default now(),
  moderado_em timestamptz
);

create index idx_calendario_sugestoes_status on public.calendario_sugestoes (status);

alter table public.calendario_sugestoes enable row level security;

create policy "calendario_sugestoes_insert_propria" on public.calendario_sugestoes
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pendente');

create policy "calendario_sugestoes_select_propria_ou_admin" on public.calendario_sugestoes
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin_or_colaborador());
