-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Adiciona o link do YouTube (playlist ou vídeo) que cada videoaula
-- deve incorporar (embed) na página de Materiais > Videoaulas.

alter table public.materiais_videoaulas
  add column if not exists youtube_url text;
