-- Rode isso no SQL Editor do Supabase (projeto MedClass UNR).
-- Adiciona uma subdivisão livre dentro da matéria (ex: "UP1", "UP2") aos
-- baralhos de flashcards, para agrupar por unidade programática além da
-- matéria/disciplina_base já existentes.

alter table public.materiais_flashcard_decks
  add column if not exists subsecao text;
