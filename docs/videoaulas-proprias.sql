-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Suporte a playlists próprias: o admin cria uma "videoaula" com
-- fonte = 'propria' e sobe os arquivos de vídeo direto do computador,
-- em vez de colar um link do YouTube. Cada arquivo vira uma linha em
-- materiais_videoaulas_arquivos, exibida como um vídeo dentro da
-- mesma playlist na página de Materiais > Videoaulas.

create table if not exists public.materiais_videoaulas_arquivos (
  id uuid primary key default gen_random_uuid(),
  videoaula_id uuid not null references public.materiais_videoaulas(id) on delete cascade,
  titulo text not null,
  arquivo_path text not null,
  ordem int not null default 1,
  created_at timestamptz not null default now()
);

alter table public.materiais_videoaulas_arquivos enable row level security;

drop policy if exists "materiais_videoaulas_arquivos_select" on public.materiais_videoaulas_arquivos;
create policy "materiais_videoaulas_arquivos_select"
  on public.materiais_videoaulas_arquivos for select
  to anon, authenticated
  using (true);

drop policy if exists "materiais_videoaulas_arquivos_admin_write" on public.materiais_videoaulas_arquivos;
create policy "materiais_videoaulas_arquivos_admin_write"
  on public.materiais_videoaulas_arquivos for all
  to authenticated
  using ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]))
  with check ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text]));

-- Bucket público (os vídeos das playlists já são conteúdo aberto aos
-- alunos, igual às playlists do YouTube). Limite de 500MB por arquivo.
insert into storage.buckets (id, name, public, file_size_limit)
values ('videoaulas-arquivos', 'videoaulas-arquivos', true, 524288000)
on conflict (id) do update set public = true, file_size_limit = 524288000;

drop policy if exists "videoaulas_arquivos_admin_insert" on storage.objects;
create policy "videoaulas_arquivos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'videoaulas-arquivos'
    and (auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])
  );

drop policy if exists "videoaulas_arquivos_admin_delete" on storage.objects;
create policy "videoaulas_arquivos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'videoaulas-arquivos'
    and (auth.jwt() ->> 'email'::text) = ANY (ARRAY['leonardoac.alves@gmail.com'::text, 'leonardoac.alves2@gmail.com'::text, 'medclassunr@gmail.com'::text])
  );
