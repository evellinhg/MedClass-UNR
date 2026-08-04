-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Tabela de controle dos pagamentos via Mercado Pago (Checkout Pro).
--
-- Fluxo:
-- 1) app/api/checkout/mercadopago cria uma linha aqui com status='pendente'
--    e usa o id dela como external_reference da preferência no Mercado Pago.
-- 2) app/api/webhooks/mercadopago recebe a notificação, busca o pagamento
--    real na API do MP (nunca confia no corpo do webhook) e atualiza o
--    status pra 'aprovado' (ou 'rejeitado'/'cancelado').
-- 3) Se já existir uma conta com esse e-mail, aplica o plano na hora.
--    Se não existir (pagou antes de criar conta), fica com aplicado_em
--    nulo -- app/api/pagamentos/reivindicar aplica automaticamente na
--    primeira vez que essa pessoa logar com esse e-mail.
--
-- Só o backend (service role) mexe nessa tabela -- sem policy para
-- authenticated, é tudo via rotas de API com validação própria.

create table public.pagamentos_mercadopago (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nome_completo text,
  telefone text,
  dni text,
  plano text not null check (plano in ('mensal', 'trimestral')),
  valor numeric not null,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado', 'cancelado')),
  mp_preference_id text,
  mp_payment_id text,
  aplicado_em timestamptz,
  created_at timestamptz not null default now()
);

create index idx_pagamentos_mercadopago_email on public.pagamentos_mercadopago (email);
create index idx_pagamentos_mercadopago_mp_payment_id on public.pagamentos_mercadopago (mp_payment_id);

alter table public.pagamentos_mercadopago enable row level security;
-- Nenhuma policy criada de propósito: só o service role (usado nas rotas
-- de API abaixo) acessa essa tabela.

-- Migração incremental (rodar se a tabela acima já existir sem essas colunas):
-- alter table public.pagamentos_mercadopago
--   add column if not exists nome_completo text,
--   add column if not exists telefone text,
--   add column if not exists dni text;

-- Leitura para admin/colaborador no painel /admin/dados (Nome completo,
-- e-mail, telefone e DNI são dados sensíveis -- só quem já tem acesso amplo
-- no painel administrativo consegue ver ou exportar essa tabela).
create policy "pagamentos_mercadopago_select_admin_colaborador" on public.pagamentos_mercadopago
  for select to authenticated
  using (public.is_admin_or_colaborador());
