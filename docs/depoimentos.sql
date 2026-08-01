-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Tabela de depoimentos enviados por visitantes na landing page, com
-- moderação: só aparecem publicamente depois de aprovados pelo admin.

create table if not exists public.depoimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ano_cursado text not null,
  foto_path text,
  comentario text not null,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz not null default now(),
  moderado_em timestamptz
);

alter table public.depoimentos enable row level security;

drop policy if exists "Qualquer um pode enviar um depoimento" on public.depoimentos;
create policy "Qualquer um pode enviar um depoimento"
  on public.depoimentos for insert
  to anon, authenticated
  with check (status = 'pendente');

drop policy if exists "Depoimentos aprovados sao publicos" on public.depoimentos;
create policy "Depoimentos aprovados sao publicos"
  on public.depoimentos for select
  to anon, authenticated
  using (status = 'aprovado');

-- Bucket público para as fotos de perfil dos depoimentos (a moderação
-- controla o que fica visível, não o bucket).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('depoimentos-fotos', 'depoimentos-fotos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

drop policy if exists "Qualquer um pode enviar foto de depoimento" on storage.objects;
create policy "Qualquer um pode enviar foto de depoimento"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'depoimentos-fotos');
