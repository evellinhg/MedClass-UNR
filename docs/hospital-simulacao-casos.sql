-- Seção "Hospital Simulação" (casos clínicos interativos, motor próprio em
-- HTML/JS auto-contido, embutido via iframe -- não é o modelo de flashcard
-- de pergunta/resposta, é um simulador com física/pontuação embutida).
--
-- hospital_simulacao_casos: metadados do caso + caminho do arquivo estático
-- (public/simuladores/*.html) que contém o simulador completo.
--
-- hospital_simulacao_tentativas: histórico de desempenho por aluno, no
-- formato do objeto de resultado que o simulador emite ao finalizar
-- (ver README-INTEGRACION.md do pacote do caso).

create table public.hospital_simulacao_casos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  arquivo_html text not null,
  ordem integer not null default 1,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_hospital_simulacao_casos_ordem on public.hospital_simulacao_casos (ordem);

alter table public.hospital_simulacao_casos enable row level security;

create policy "hospital_simulacao_casos_select" on public.hospital_simulacao_casos
  for select
  using (
    (ativo = true)
    or ((auth.jwt() ->> 'email') = any (array['leonardoac.alves@gmail.com','leonardoac.alves2@gmail.com','medclassunr@gmail.com']))
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = any (array['admin','colaborador'])))
  );

create policy "hospital_simulacao_casos_admin_write" on public.hospital_simulacao_casos
  for all
  using (
    ((auth.jwt() ->> 'email') = any (array['leonardoac.alves@gmail.com','leonardoac.alves2@gmail.com','medclassunr@gmail.com']))
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = any (array['admin','colaborador']) and (profiles.access_expires_at is null or profiles.access_expires_at > now())))
  )
  with check (
    ((auth.jwt() ->> 'email') = any (array['leonardoac.alves@gmail.com','leonardoac.alves2@gmail.com','medclassunr@gmail.com']))
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = any (array['admin','colaborador']) and (profiles.access_expires_at is null or profiles.access_expires_at > now())))
  );

create table public.hospital_simulacao_tentativas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  caso_id uuid not null references public.hospital_simulacao_casos(id) on delete cascade,
  desenlace text,
  camino integer,
  bp_final integer,
  reserva_excelencia integer,
  omissoes integer,
  iatrogenias integer,
  isquemia_total_min integer,
  porta_balao_min integer,
  miocardio_salvavel integer,
  vd_identificado boolean,
  reperfundido boolean,
  suporte_ventilatorio text,
  tempo_perdido_min integer,
  falecido boolean,
  dificuldade numeric,
  registro jsonb,
  finalizado_em timestamptz,
  created_at timestamptz not null default now()
);

create index idx_hospital_simulacao_tentativas_user on public.hospital_simulacao_tentativas (user_id, caso_id);

alter table public.hospital_simulacao_tentativas enable row level security;

create policy "hospital_simulacao_tentativas_select" on public.hospital_simulacao_tentativas
  for select
  using (
    (user_id = auth.uid())
    or ((auth.jwt() ->> 'email') = any (array['leonardoac.alves@gmail.com','leonardoac.alves2@gmail.com','medclassunr@gmail.com']))
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = any (array['admin','colaborador'])))
  );

create policy "hospital_simulacao_tentativas_insert" on public.hospital_simulacao_tentativas
  for insert
  with check (user_id = auth.uid());
