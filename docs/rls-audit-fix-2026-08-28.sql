-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
--
-- Contexto: auditoria de segurança (AppSec) de 2026-08-28 encontrou que
-- várias tabelas lidas/escritas diretamente pelo client (via
-- supabase.from(...), sem passar por nenhuma rota /api/admin/**) não têm
-- NENHUMA policy de RLS versionada neste repositório. A proteção de tela
-- em components/admin-layout.tsx é só client-side (JS) -- não impede uma
-- chamada direta ao Supabase pela mesma anon key + o próprio JWT de
-- qualquer aluno logado. RLS é a única barreira real.
--
-- IMPORTANTE antes de rodar: confira o estado atual de cada tabela com
--   select polname, cmd, qual, with_check from pg_policies where tablename = '<tabela>';
-- Se já existir alguma policy conflitante com nome diferente das daqui,
-- decida se remove ela ou ajusta este script -- não rode às cegas.
--
-- Este arquivo não foi executado automaticamente: quem está aplicando
-- isso não tem uma connection string direta ao Postgres deste projeto
-- (só a Supabase REST API via anon/service-role key, que não expõe DDL/
-- pg_policies) -- só dá pra rodar via SQL Editor do Supabase mesmo,
-- manualmente, com revisão humana antes -- como já é a convenção dos
-- outros arquivos em docs/*.sql deste repo.

-- ============================================================
-- 1) questoes -- a mais crítica: banco de questões (985 linhas hoje,
--    incluindo as 756 de Cirurgia do 5º ano recém-importadas). Alunos
--    precisam de SELECT (pra montar o pool de prática); só admin/
--    colaborador deveria poder escrever.
-- ============================================================
alter table public.questoes enable row level security;

drop policy if exists "questoes_select_autenticados" on public.questoes;
create policy "questoes_select_autenticados"
  on public.questoes for select
  to authenticated
  using (true);

drop policy if exists "questoes_admin_write" on public.questoes;
create policy "questoes_admin_write"
  on public.questoes for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = any (array['admin', 'colaborador'])
        and (profiles.access_expires_at is null or profiles.access_expires_at > now())
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = any (array['admin', 'colaborador'])
        and (profiles.access_expires_at is null or profiles.access_expires_at > now())
    )
  );

-- ============================================================
-- 2) medcoins_wallets -- aluno lê só a própria carteira
--    (components/medcoins-widget.tsx, medcoins-content.tsx,
--    medcoins-loja-content.tsx todos filtram por .eq("user_id", userId)).
--    Escrita (crédito/débito) só admin ou a RPC medcoins_resgatar_recompensa
--    (security definer, já roda com privilégio próprio).
-- ============================================================
alter table public.medcoins_wallets enable row level security;

drop policy if exists "medcoins_wallets_select_own_or_admin" on public.medcoins_wallets;
create policy "medcoins_wallets_select_own_or_admin"
  on public.medcoins_wallets for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

drop policy if exists "medcoins_wallets_admin_write" on public.medcoins_wallets;
create policy "medcoins_wallets_admin_write"
  on public.medcoins_wallets for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

-- ============================================================
-- 3) user_analytics -- qualquer usuário autenticado grava seus próprios
--    eventos (lib/analytics.ts: trackEvent sempre usa auth.getUser().id).
--    Leitura: o próprio usuário vê seu histórico (getAnalytics/
--    getResumoAnalytics), admin vê tudo (visão geral).
-- ============================================================
alter table public.user_analytics enable row level security;

drop policy if exists "user_analytics_insert_own" on public.user_analytics;
create policy "user_analytics_insert_own"
  on public.user_analytics for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_analytics_select_own_or_admin" on public.user_analytics;
create policy "user_analytics_select_own_or_admin"
  on public.user_analytics for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

-- ============================================================
-- 4) question_feedback -- aluno registra feedback sobre uma questão
--    (components/simulado-player.tsx: insert com user_id próprio).
--    O comentário no código já dizia "RLS restringe SELECT/UPDATE a
--    admins" -- este bloco garante que isso é verdade de fato.
-- ============================================================
alter table public.question_feedback enable row level security;

drop policy if exists "question_feedback_insert_own" on public.question_feedback;
create policy "question_feedback_insert_own"
  on public.question_feedback for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "question_feedback_admin_read_write" on public.question_feedback;
create policy "question_feedback_admin_read_write"
  on public.question_feedback for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

-- ============================================================
-- 5) simulado_attempts -- aluno grava/lê só seus próprios resultados
--    (components/simulado-player.tsx insere com user_id próprio;
--    home-stats/desempenho-*/ranking-minhas-estatisticas leem com
--    .eq("user_id", ...) da própria sessão). Admin lê tudo (via rota
--    server /api/admin/users/[id]/activity, que já usa service-role e
--    não depende desta policy -- mas manter select de admin aqui também
--    cobre o painel de Relatórios que lê direto).
-- ============================================================
alter table public.simulado_attempts enable row level security;

drop policy if exists "simulado_attempts_own_or_admin_select" on public.simulado_attempts;
create policy "simulado_attempts_own_or_admin_select"
  on public.simulado_attempts for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

drop policy if exists "simulado_attempts_insert_own" on public.simulado_attempts;
create policy "simulado_attempts_insert_own"
  on public.simulado_attempts for insert
  to authenticated
  with check (user_id = auth.uid());

-- ============================================================
-- 6) cronograma_trilhas_unidades / cronograma_trilhas_etapas -- todo
--    aluno autenticado pode VER a trilha (components/trilha-ativa-
--    content.tsx lê sem filtro de dono, é conteúdo compartilhado);
--    só admin/colaborador edita (components/admin-trilha-detail-
--    content.tsx).
-- ============================================================
alter table public.cronograma_trilhas_unidades enable row level security;

drop policy if exists "cronograma_trilhas_unidades_select" on public.cronograma_trilhas_unidades;
create policy "cronograma_trilhas_unidades_select"
  on public.cronograma_trilhas_unidades for select
  to authenticated
  using (true);

drop policy if exists "cronograma_trilhas_unidades_admin_write" on public.cronograma_trilhas_unidades;
create policy "cronograma_trilhas_unidades_admin_write"
  on public.cronograma_trilhas_unidades for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

alter table public.cronograma_trilhas_etapas enable row level security;

drop policy if exists "cronograma_trilhas_etapas_select" on public.cronograma_trilhas_etapas;
create policy "cronograma_trilhas_etapas_select"
  on public.cronograma_trilhas_etapas for select
  to authenticated
  using (true);

drop policy if exists "cronograma_trilhas_etapas_admin_write" on public.cronograma_trilhas_etapas;
create policy "cronograma_trilhas_etapas_admin_write"
  on public.cronograma_trilhas_etapas for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );

-- ============================================================
-- 7) metas -- NENHUM componente do app (admin ou aluno) foi encontrado
--    lendo/escrevendo esta tabela hoje, exceto o editor genérico
--    AdminDataTable (admin-dados-content.tsx), que já é admin-only na
--    tela. Política conservadora: admin/colaborador apenas. Se no
--    futuro existir uma feature de "metas pessoais" do aluno, ajuste
--    pra liberar select/insert/update com user_id = auth.uid() também.
-- ============================================================
alter table public.metas enable row level security;

drop policy if exists "metas_admin_all" on public.metas;
create policy "metas_admin_all"
  on public.metas for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = any (array['admin', 'colaborador'])
    )
  );
