-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Ano do curso ao qual a playlist pertence (chave canônica ano1..ano5,
-- igual ao resto do currículo). Usado para agrupar as playlists por
-- ano dentro de cada fonte/canal na página de Materiais > Videoaulas.
-- Pode ficar em branco quando a playlist não é específica de um ano.

alter table public.materiais_videoaulas
  add column if not exists ano text;
