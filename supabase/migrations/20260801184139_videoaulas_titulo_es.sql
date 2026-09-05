-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Título e especialidade em espanhol (opcionais). Quando vazios, a
-- página usa o texto em português (titulo/especialidade) mesmo com
-- o idioma trocado para ES — por isso esses campos existem: sem eles
-- as playlists ficavam sempre em português, independente do idioma
-- selecionado pelo aluno.

alter table public.materiais_videoaulas
  add column if not exists titulo_es text,
  add column if not exists especialidade_es text;
